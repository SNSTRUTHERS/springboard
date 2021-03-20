"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    jobIdMap
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

// == CREATE ==================================================================================== //

describe("create", () => {
    test("works", async () => {
        const newJob = {
            title: "New",
            salary: 400000,
            equity: '0.02',
            companyHandle: 'c1'
        };

        const job = await Job.create(newJob);

        const id = job.id;
        delete job.id;
        expect(job).toEqual(newJob);

        const result = await db.query(`
            SELECT title, salary, equity, company_handle AS "companyHandle"
            FROM jobs WHERE id = $1
        `, [ id ]);

        expect(result.rows).toEqual([ newJob ]);
    });
});

// == FIND ALL ================================================================================== //

describe("findAll", () => {
    test("works: no filter", async () => {
        let companies = await Job.findAll();

        expect(companies).toEqual([
            {
                id: jobIdMap.get("J1"),
                title: "J1",
                salary: 100000,
                equity: '0.25',
                companyHandle: 'c1',
                companyName: "C1"
            },
            {
                id: jobIdMap.get("J2"),
                title: "J2",
                salary: 200000,
                equity: '0.125',
                companyHandle: 'c2',
                companyName: "C2"
            },
            {
                id: jobIdMap.get("J3"),
                title: "J3",
                salary: 300000,
                equity: '0',
                companyHandle: 'c3',
                companyName: "C3"
            },
        ]);
    });
    
    test("works: filter by minSalary", async () => {
        let companies = await Job.findAll({
            minSalary: 175000
        });

        expect(companies).toEqual([
            {
                id: jobIdMap.get("J2"),
                title: "J2",
                salary: 200000,
                equity: '0.125',
                companyHandle: 'c2',
                companyName: "C2"
            },
            {
                id: jobIdMap.get("J3"),
                title: "J3",
                salary: 300000,
                equity: '0',
                companyHandle: 'c3',
                companyName: "C3"
            },
        ]);
    });
    
    test("works: filter by title", async () => {
        let companies = await Job.findAll({
            title: '3'
        });

        expect(companies).toEqual([
            {
                id: jobIdMap.get("J3"),
                title: "J3",
                salary: 300000,
                equity: '0',
                companyHandle: 'c3',
                companyName: "C3"
            },
        ]);
    });
    
    test("works: filter by hasEquity", async () => {
        let companies = await Job.findAll({
            hasEquity: true
        });

        expect(companies).toEqual([
            {
                id: jobIdMap.get("J1"),
                title: "J1",
                salary: 100000,
                equity: '0.25',
                companyHandle: 'c1',
                companyName: "C1"
            },
            {
                id: jobIdMap.get("J2"),
                title: "J2",
                salary: 200000,
                equity: '0.125',
                companyHandle: 'c2',
                companyName: "C2"
            },
        ]);
    });
    
    test("works: empty list on zero matching entries", async () => {
        let companies = await Job.findAll({
            minSalary: 600000
        });

        expect(companies).toEqual([]);
    });
});

// == GET ======================================================================================= //

describe("get", () => {
    test("works", async () => {
        const job = await Job.get(jobIdMap.get("J1"));

        expect(job).toEqual({
            id: jobIdMap.get("J1"),
            title: "J1",
            salary: 100000,
            equity: '0.25',
            company: {
                handle: 'c1',
                name: "C1",
                description: "Desc1",
                numEmployees: 1,
                logoUrl: "http://c1.img",
            }
        });
    });

    test("not found if no such company", async () => {
        try {
            await Job.get(999999);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

// == UPDATE ==================================================================================== //

describe("update", () => {
    const updateData = {
        title: "New",
        salary: 500000,
        equity: '0'
    };

    test("works", async () => {
        let company = await Job.update(jobIdMap.get("J1"), updateData);

        expect(company).toEqual({
            id: jobIdMap.get("J1"),
            companyHandle: 'c1',
            ...updateData,
        });

        const { rows } = await db.query(`
            SELECT title, salary, equity, company_handle AS "companyHandle"
            FROM jobs WHERE id = $1
        `, [ jobIdMap.get("J1") ]);
        
        expect(rows).toEqual([{
            title: "New",
            salary: 500000,
            equity: '0',
            companyHandle: 'c1'
        }]);
    });

    test("works: null fields", async () => {
        const updateDataSetNulls = {
            title: "New",
            salary: null,
            equity: null,
        };

        let company = await Job.update(jobIdMap.get("J1"), updateDataSetNulls);

        expect(company).toEqual({
            id: jobIdMap.get("J1"),
            companyHandle: 'c1',
            ...updateDataSetNulls,
        });

        const { rows } = await db.query(`
            SELECT title, salary, equity, company_handle AS "companyHandle"
            FROM jobs WHERE id = $1
        `, [ jobIdMap.get("J1") ]);

        expect(rows).toEqual([{
            title: "New",
            salary: null,
            equity: null,
            companyHandle: 'c1'
        }]);
    });

    test("not found if no such company", async () => {
        try {
            await Job.update(9999999, updateData);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test("bad request with no data", async () => {
        try {
            await Job.update(jobIdMap.get("J1"), {});
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

// == REMOVE ==================================================================================== //

describe("remove", () => {
    test("works", async () => {
        await Job.remove(jobIdMap.get("J1"));
        const res = await db.query("SELECT id FROM jobs WHERE title='J1'");
        
        expect(res.rows.length).toEqual(0);
    });

    test("not found if no such company", async () => {
        try {
            await Job.remove(9999999);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});
