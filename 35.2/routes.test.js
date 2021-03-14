process.env.NODE_ENV = "test";

const request = require("supertest");

const db  = require("./db");
const app = require("./app");

// == SET UP ==================================================================================== //

/** @type {any[]} */
let testCompanies;

/** @type {any[]} */
let testIndustries;

/** @type {any[]} */
let testInvoices;

beforeAll(async () => await db.query(`
    DROP TABLE IF EXISTS company_industries;
    DROP TABLE IF EXISTS invoices;
    DROP TABLE IF EXISTS companies;
    DROP TABLE IF EXISTS industries;

    CREATE TABLE companies (
        code text PRIMARY KEY,
        name text NOT NULL UNIQUE,
        description text
    );

    CREATE TABLE invoices (
        id serial PRIMARY KEY,
        comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
        amt float NOT NULL,
        paid boolean DEFAULT false NOT NULL,
        add_date date DEFAULT CURRENT_DATE NOT NULL,
        paid_date date,
        CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
    );

    CREATE TABLE industries (
        code text PRIMARY KEY,
        industry text NOT NULL
    );

    CREATE TABLE company_industries (
        comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
        ind_code  text NOT NULL REFERENCES industries ON DELETE CASCADE,
        PRIMARY KEY (comp_code, ind_code)
    );
`));

beforeEach(async () => {
    const { rows: companies } = await db.query(`
        INSERT INTO companies
        VALUES
            ('apple', 'Apple Inc',   'Maker of macOS.'),
            ('ibm',   'IBM',         'Big blue.'),
            ('wb',    'Warner Bros', 'Trash movie studio.')
        RETURNING code, name, description
    `);

    const { rows: invoices } = await db.query(`
        INSERT INTO invoices (comp_code, amt, paid, paid_date)
        VALUES
            ('apple', 100, false, null),
            ('apple', 200, false, null),
            ('apple', 300, true, '2018-01-01'),
            ('ibm',   400, false, null)
        RETURNING id, comp_code, amt, paid, add_date, paid_date
    `); 

    const { rows: industries } = await db.query(`
        INSERT INTO industries
        VALUES
            ('cse', 'Computer Science'),
            ('web', 'Web Services'),
            ('mov', 'Motion Pictures/Film'),
            ('acc', 'Accounting')
        RETURNING code, industry    
    `);

    const { rows: companyIndustryData } = await db.query(`
        INSERT INTO company_industries
        VALUES
            ('apple', 'cse'),
            ('ibm',   'cse'),
            ('wb',    'mov')
        RETURNING comp_code, ind_code
    `);

    const companyIndexMap = new Map();
    const industryIndexMap = new Map();

    testCompanies = companies.map((company, index) => {
        companyIndexMap.set(company.code, index);
        return { ...company, invoices: [], industries: [] };
    });
    testIndustries = industries.sort(
        ({ code: code1 }, { code: code2 }) => code1 > code2
    ).map((industry, index) => {
        industryIndexMap.set(industry.code, index);
        return { ...industry, companies: [] };
    });
    testInvoices = invoices;

    for (const { comp_code: compCode, ind_code: indCode } of companyIndustryData) {
        testCompanies[companyIndexMap.get(compCode)].industries.push(indCode);
        testIndustries[industryIndexMap.get(indCode)].companies.push(compCode);
    }

    let i = 0;
    for (const { comp_code: compCode, id } of testInvoices) {
        const company = testCompanies[companyIndexMap.get(compCode)];
        company.invoices.push(id);

        testInvoices[i].company = {
            code: company.code,
            description: company.description,
            name: company.name
        };
        testInvoices[i].paid_date = testInvoices[i].paid_date ?
            testInvoices[i].paid_date.toISOString() :
            testInvoices[i].paid_date
        ;
        testInvoices[i].add_date = testInvoices[i].add_date ?
            testInvoices[i].add_date.toISOString() :
            testInvoices[i].add_date
        ;
        delete testInvoices[i++].comp_code;
    }
});

afterEach(async() => await db.query(`
    DELETE FROM company_industries;
    DELETE FROM industries;
    DELETE FROM invoices;
    DELETE FROM companies
`));

afterAll(async () => await db.end());

// == TEST CASES ================================================================================ //

describe("Company routes", () => {
    describe("GET /companies", () => {
        test("Retrieves all companies.", async () => {
            const res = await request(app).get("/companies");
            
            expect(res.status).toBe(200);
            expect(res.body.companies).toEqual(testCompanies.map(
                ({ name, code }) => ({ name, code })
            ));
        });
    });

    describe("POST /companies", () => {
        test("Creates a new company.", async () => {
            const testCompany = {
                code: 'test-company',
                name: "Test Company",
                description: "Hello world",
                invoices: [],
                industries: []
            };

            let res = await request(app).post("/companies").send({
                name: testCompany.name,
                description: testCompany.description
            });

            expect(res.status).toBe(201);
            expect(res.body.company).toEqual(testCompany);

            res = await request(app).get(`/companies/${res.body.company.code}`);
            
            expect(res.status).toBe(200);
            expect(res.body.company).toEqual(testCompany);
        });
    });

    describe("GET /companies/:code", () => {
        test("Doesn't retrieve a company that doesn't exist.", async () => {
            const res = await request(app).get("/companies/abcdef");
            
            expect(res.status).toBe(404);
            expect(res.body.message).toEqual('No such company: "abcdef".');
        });

        test("Retrieve a single company.", async () => {
            const requests = testCompanies.map(
                ({ code }) => request(app).get(`/companies/${code}`)
            );
            const responses = await Promise.all(requests);

            for (let i = 0; i < responses.length; i++) {
                expect(responses[i].status).toBe(200);
                expect(responses[i].body.company).toEqual(testCompanies[i]);
            }
        });
    });

    describe("PUT /companies/:code", () => {
        test("Accepts only if required arguments are provided.", async () => {
            const requests = [
                request(app).put(`/companies/${testCompanies[0].code}`),
                request(app).put(`/companies/${testCompanies[1].code}`).send({ name: "abc" }),
                request(app).put(`/companies/${testCompanies[2].code}`).send({ description: "abc" })
            ];
            const responses = await Promise.all(requests);

            expect(responses.every(({ status }) => status === 400)).toBe(true);
            expect(responses[0].body.message).toEqual(
                'Missing required argument(s): "name", "description".'
            );
            expect(responses[1].body.message).toEqual(
                'Missing required argument(s): "description".'
            );
            expect(responses[2].body.message).toEqual(
                'Missing required argument(s): "name".'
            );
        });

        test("Doesn't update a company that doesn't exist.", async () => {
            const res = await request(app).put("/companies/abcdef").send({
                name: testCompanies[0].name,
                description: testCompanies[0].description
            });
            
            expect(res.status).toBe(404);
            expect(res.body.message).toEqual('No such company: "abcdef".');
        });

        test("Updates a story.", async () => {
            testCompanies[0].name = 'Apple Computer';
            testCompanies[0].description = 'Invented the ancestor of the modern PC.'
            
            const res = await request(app).put(`/companies/${testCompanies[0].code}`).send({
                name: testCompanies[0].name,
                description: testCompanies[0].description
            });

            expect(res.status).toBe(200);
            expect(res.body.company).toEqual({
                code: testCompanies[0].code,
                name: testCompanies[0].name,
                description: testCompanies[0].description
            });
        });
    });

    describe("DELETE /companies/:code", () => {
        test("Doesn't delete a company that doesn't exist.", async () => {
            const res = await request(app).delete("/companies/abcdef");
            
            expect(res.status).toBe(404);
            expect(res.body.message).toEqual('No such company: "abcdef".');
        });

        test("Deletes an existing company.", async () => {
            const code = testCompanies[0].code;
            let res = await request(app).delete(`/companies/${code}`);

            expect(res.status).toBe(200);
            expect(res.body.status).toEqual("deleted");

            res = await request(app).get(`/companies/${code}`);
            
            expect(res.status).toBe(404);
            expect(res.body.message).toEqual(`No such company: "${code}".`);
        });
    });
});

describe("Invoice routes", () => {
    describe("GET /invoices", () => {
        test("Retrieves all invoice records.", async () => {
            const res = await request(app).get("/invoices");
            
            expect(res.status).toBe(200);
            expect(res.body.invoices).toEqual(testInvoices.map(
                ({ id, company: { code: comp_code } }) => ({ id, comp_code })
            ));
        });
    });

    describe("POST /invoices", () => {
        test("Creates a new invoice.", async () => {
            let testInvoice = {
                comp_code: testCompanies[0].code,
                amt: 8
            };

            let res = await request(app).post("/invoices").send(testInvoice);

            expect(res.status).toBe(201);
            expect({
                comp_code: res.body.invoice.comp_code,
                amt: res.body.invoice.amt,
                paid: res.body.invoice.paid,
                paid_date: res.body.invoice.paid_date
            }).toEqual({
                ...testInvoice,
                paid: false,
                paid_date: null
            });

            testInvoice = res.body.invoice;
            testInvoice.company = {
                code: testCompanies[0].code,
                description: testCompanies[0].description,
                name: testCompanies[0].name
            };
            delete testInvoice.comp_code;

            res = await request(app).get(`/invoices/${testInvoice.id}`);
            
            expect(res.status).toBe(200);
            expect(res.body.invoice).toEqual(testInvoice);
        });
    });

    describe("GET /invoices/:id", () => {
        test("Doesn't retrieve an invoice that doesn't exist.", async () => {
            const res = await request(app).get("/invoices/199919");
            
            expect(res.status).toBe(404);
            expect(res.body.message).toEqual('No such invoice: 199919.');
        });

        test("Retrieve a single invoice.", async () => {
            const requests = testInvoices.map(({ id }) => request(app).get(`/invoices/${id}`));
            const responses = await Promise.all(requests);

            for (let i = 0; i < responses.length; i++) {
                expect(responses[i].status).toBe(200);
                expect(responses[i].body.invoice).toEqual(testInvoices[i]);
            }
        });
    });

    describe("PUT /invoices/:id", () => {
        test("Accepts only if required arguments are provided.", async () => {
            const requests = [
                request(app).put(`/invoices/${testInvoices[0].code}`),
                request(app).put(`/invoices/${testInvoices[1].code}`).send({ paid: true }),
                request(app).put(`/invoices/${testInvoices[2].code}`).send({ amt: 11 })
            ];
            const responses = await Promise.all(requests);

            expect(responses.every(({ status }) => status === 400)).toBe(true);
            expect(responses[0].body.message).toEqual(
                'Missing required argument(s): "amt", "paid".'
            );
            expect(responses[1].body.message).toEqual(
                'Missing required argument(s): "amt".'
            );
            expect(responses[2].body.message).toEqual(
                'Missing required argument(s): "paid".'
            );
        });
        
        test("Doesn't update an invoice that doesn't exist.", async () => {
            const res = await request(app).put("/invoices/199919").send({
                amt: 32,
                paid: false
            });
            
            expect(res.status).toBe(404);
            expect(res.body.message).toEqual('No such invoice: 199919.');
        });

        test("Updates an invoice's amount without updating payment date when payment isn't made.",
        async () => {
            const {
                id, add_date,
                company: { code: comp_code }
            } = testInvoices[0];
            const res = await request(app).put(`/invoices/${id}`).send({
                amt: 15,
                paid: false
            });

            expect(res.status).toBe(200);
            expect(res.body.invoice).toEqual({
                id, add_date, comp_code,
                amt: 15,
                paid: false,
                paid_date: null
            });
        });

        test("Updates an invoice's payment date when payment is made.", async () => {
            const {
                id, add_date,
                company: { code: comp_code }
            } = testInvoices[0];
            const res = await request(app).put(`/invoices/${id}`).send({
                amt: 15,
                paid: true
            });

            expect(res.status).toBe(200);
            expect(res.body.invoice.paid_date).not.toBeNull();
            expect(res.body.invoice).toEqual({
                id, add_date, comp_code,
                amt: 15,
                paid: true,
                paid_date: res.body.invoice.paid_date
            });
        });
    });

    describe("DELETE /invoices/:id", () => {
        test("Doesn't delete an invoice that doesn't exist.", async () => {
            const res = await request(app).delete("/invoices/199919");
            
            expect(res.status).toBe(404);
            expect(res.body.message).toEqual('No such invoice: 199919.');
        });

        test("Deletes an existing invoice.", async () => {
            const id = testInvoices[0].id;
            let res = await request(app).delete(`/invoices/${id}`);

            expect(res.status).toBe(200);
            expect(res.body.status).toEqual("deleted");

            res = await request(app).get(`/invoices/${id}`);
            
            expect(res.status).toBe(404);
            expect(res.body.message).toEqual(`No such invoice: ${id}.`);
        });
    });
});

describe("Industry routes", () => {
    describe("GET /industries", () => {
        test("Retrieves all industries.", async () => {
            const res = await request(app).get("/industries");
            
            expect(res.status).toBe(200);
            expect(res.body.industries).toEqual(testIndustries.map(
                ({ code, industry }) => ({ code, industry })
            ));
        });
    });

    describe("POST /industries", () => {
        test("Creates a new industry.", async () => {
            let res = await request(app).post("/industries").send({
                industry: "Test"
            });

            expect(res.status).toBe(201);
            expect(res.body.industry).toEqual({
                code: 'test',
                industry: "Test",
                companies: []
            });

            const testIndustry = res.body.industry;

            res = await request(app).get("/industries/test");
            expect(res.status).toBe(200);
            expect(res.body.industry).toEqual(testIndustry);
        });
    });

    describe("GET /industries/:code", () => {
        test("Doesn't retrieve an industry that doesn't exist.", async () => {
            const res = await request(app).get("/industries/fndama");

            expect(res.status).toBe(404);
            expect(res.body.message).toEqual(`No such industry: "fndama".`);
        });

        test("Retrieves an industry with associated company codes.", async () => {
            const requests = testIndustries.map(
                ({ code }) => request(app).get(`/industries/${code}`)
            );
            const responses = await Promise.all(requests);

            expect(responses.every(({ status }) => status === 200)).toBe(true);

            let i = 0;
            for (const { body: { industry } } of responses)
                expect(industry).toEqual(testIndustries[i++]);
        });
    });

    describe("DELETE /industries/:code", () => {
        test("Doesn't delete an industry that doesn't exist.", async () => {
            const res = await request(app).delete("/industries/fndama");

            expect(res.status).toBe(404);
            expect(res.body.message).toEqual(`No such industry: "fndama".`);
        });

        test("Deletes an existing industry.", async () => {
            const { code, companies } = testIndustries[0];

            const res = await request(app).delete(`/industries/${code}`);

            expect(res.status).toBe(200);
            expect(res.body.status).toEqual("deleted");

            const requests = companies.map((code) => request(app).get(`/companies/${code}`));
            requests.push(request(app).get(`/industries/${code}`));

            const responses = await Promise.all(requests);

            expect(responses[responses.length - 1].status).toBe(404);
            expect(responses[responses.length - 1].body.message).toEqual(
                `No such industry: "${code}".`
            );
            responses.length--;

            expect(responses.every(({ status }) => status === 200)).toBe(true);
            for (const { body: { industries } } of responses)
                expect(industries).not.toContain(code);
        });
    });

    describe("PUT /companies/:code/industries", () => {
        test("Doesn't add to company industries for a company that doesn't exist.", async () => {
            const res = await request(app).put("/companies/abcdef/industries").send({
                code: testIndustries[3].code
            });

            expect(res.status).not.toBe(200);
        });
        
        test("Doesn't add to company industries an industry that doesn't exist.", async () => {
            const res = await request(app).put(
                `/companies/${testCompanies[0].code}/industries`
            ).send({
                code: "abcdef"
            });

            expect(res.status).not.toBe(200);
        });

        test("Associates an industry with a company.", async () => {
            const res = await request(app).put(
                `/companies/${testCompanies[0].code}/industries`
            ).send({
                code: testIndustries[3].code
            });

            expect(res.status).toBe(200);
            expect(res.body.industries).toEqual([
                ...testCompanies[0].industries,
                testIndustries[3].code
            ]);
        });
    });

    describe("DELETE /companies/:code/industries", () => {
        test("Doesn't delete from company industries for a company that doesn't exist.",
        async () => {
            const res = await request(app).delete("/companies/abcdef/industries").send({
                code: testIndustries[1].code
            });
    
            expect(res.status).not.toBe(200);
        });
    
        test("Disassociates an industry from a company.", async () => {
            const indCode = testCompanies[0].industries[0];
            const res = await request(app).delete(
                `/companies/${testCompanies[0].code}/industries`
            ).send({
                code: indCode
            });
    
            expect(res.status).toBe(200);
            expect(res.body.industries).toEqual(testCompanies[0].industries.filter(
                (code) => code !== indCode
            ));
        });
    });
});
