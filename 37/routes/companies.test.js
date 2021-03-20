"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    userToken,
    adminToken,
    jobIdMap
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

// == POST /companies =========================================================================== //

describe("POST /companies", () => {
    const newCompany = {
        handle: "new",
        name: "New",
        logoUrl: "http://new.img",
        description: "DescNew",
        numEmployees: 10,
    };

    test("ok for admins", async () => {
        const resp = await request(app).post("/companies").send(newCompany).set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            company: newCompany,
        });
    });

    test("unauthed for regular users", async () => {
        const resp = await request(app).post("/companies").send(newCompany).set(
            "authorization",
            `Bearer ${userToken}`
        );

        expect(resp.statusCode).toEqual(401);
    });

    test("bad request with missing data", async () => {
        const resp = await request(app).post("/companies").send({
            handle: "new",
            numEmployees: 10,
        }).set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.statusCode).toEqual(400);
    });

    test("bad request with invalid data", async () => {
        const resp = await request(app).post("/companies").send({
            ...newCompany,
            logoUrl: "not-a-url",
        }).set(
            "authorization",
            `Bearer ${adminToken}`
        );
        expect(resp.statusCode).toEqual(400);
    });
});

// == GET /companies ============================================================================ //

describe("GET /companies", () => {
    test("ok for anon", async () => {
        const resp = await request(app).get("/companies");

        expect(resp.body).toEqual({
            companies: [
                {
                    handle: "c1",
                    name: "C1",
                    description: "Desc1",
                    numEmployees: 1,
                    logoUrl: "http://c1.img",
                },
                {
                    handle: "c2",
                    name: "C2",
                    description: "Desc2",
                    numEmployees: 2,
                    logoUrl: "http://c2.img",
                },
                {
                    handle: "c3",
                    name: "C3",
                    description: "Desc3",
                    numEmployees: 3,
                    logoUrl: "http://c3.img",
                },
            ],
        });
    });

    test("fails: test next() handler", async () => {
        // there's no normal failure event which will cause this route to fail ---
        // thus making it hard to test that the error-handler works with it. This
        // should cause an error, all right :)
        await db.query("DROP TABLE companies CASCADE");

        const resp = await request(app).get("/companies").set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.statusCode).toEqual(500);
    });

    test("single filter works", async () => {
        const resp = await request(app).get("/companies").query({
            minEmployees: 2
        });

        expect(resp.body).toEqual({
            companies: [
                {
                    handle: "c2",
                    name: "C2",
                    description: "Desc2",
                    numEmployees: 2,
                    logoUrl: "http://c2.img",
                },
                {
                    handle: "c3",
                    name: "C3",
                    description: "Desc3",
                    numEmployees: 3,
                    logoUrl: "http://c3.img",
                },
            ]
        });
    });

    test("multiple filters work", async () => {
        const resp = await request(app).get("/companies").query({
            minEmployees: 2,
            maxEmployees: 5,
            name: '3'
        });

        expect(resp.body).toEqual({
            companies: [
                {
                    handle: "c3",
                    name: "C3",
                    description: "Desc3",
                    numEmployees: 3,
                    logoUrl: "http://c3.img",
                },
            ]
        });
    });

    test("bad request on invalid filter", async () => {
        const resp = await request(app).get("/companies").query({
            minEmployees: 2,
            nope: 500
        });

        expect(resp.statusCode).toBe(400);
    });
});

// == GET /companies/:handle ==================================================================== //

describe("GET /companies/:handle", () => {
    test("works for anon", async () => {
        const resp = await request(app).get(`/companies/c1`);

        expect(resp.body).toEqual({
            company: {
                handle: "c1",
                name: "C1",
                description: "Desc1",
                numEmployees: 1,
                logoUrl: "http://c1.img",
                jobs: [
                    {
                        id: jobIdMap.get("J1"),
                        title: "J1",
                        salary: 100000,
                        equity: "0.25"
                    },
                    {
                        id: jobIdMap.get("J2"),
                        title: "J2",
                        salary: 200000,
                        equity: "0.125"
                    },
                ],
            },
        });
    });

    test("works for anon: company w/o jobs", async () => {
        const resp = await request(app).get(`/companies/c3`);

        expect(resp.body).toEqual({
            company: {
                handle: "c3",
                name: "C3",
                description: "Desc3",
                numEmployees: 3,
                logoUrl: "http://c3.img",
                jobs: [],
            },
        });
    });

    test("not found for no such company", async () => {
        const resp = await request(app).get(`/companies/nope`);

        expect(resp.statusCode).toEqual(404);
    });
});

// == PATCH /companies/:handle ================================================================== //

describe("PATCH /companies/:handle", () => {
    test("works for admins", async () => {
        const resp = await request(app).patch(`/companies/c1`).send({
            name: "C1-new",
        }).set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.body).toEqual({
            company: {
                handle: "c1",
                name: "C1-new",
                description: "Desc1",
                numEmployees: 1,
                logoUrl: "http://c1.img",
            },
        });
    });
    
    test("unauth for regular users", async () => {
        const resp = await request(app).patch(`/companies/c1`).send({
            name: "C1-new",
        }).set(
            "authorization",
            `Bearer ${userToken}`
        );

        expect(resp.statusCode).toEqual(401);
    });

    test("unauth for anon", async () => {
        const resp = await request(app).patch(`/companies/c1`).send({
            name: "C1-new",
        });

        expect(resp.statusCode).toEqual(401);
    });

    test("not found on no such company", async () => {
        const resp = await request(app).patch(`/companies/nope`).send({
            name: "new nope",
        }).set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.statusCode).toEqual(404);
    });

    test("bad request on handle change attempt", async () => {
        const resp = await request(app).patch(`/companies/c1`).send({
            handle: "c1-new",
        }).set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.statusCode).toEqual(400);
    });

    test("bad request on invalid data", async () => {
        const resp = await request(app).patch(`/companies/c1`).send({
            logoUrl: "not-a-url",
        }).set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.statusCode).toEqual(400);
    });
});

// == DELETE /companies/:handle ================================================================= //

describe("DELETE /companies/:handle", () => {
    test("works for admins", async () => {
        let resp = await request(app).delete(`/companies/c1`).set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.body).toEqual({ deleted: "c1" });

        resp = await request(app).get(`/companies/c1`).set(
            "authorization",
            `Bearer ${adminToken}`
        );
        
        expect(resp.statusCode).toBe(404);
    });

    test("unauth for regular users", async () => {
        const resp = await request(app).delete(`/companies/c1`).set(
            "authorization",
            `Bearer ${userToken}`
        );

        expect(resp.statusCode).toEqual(401);
    });

    test("unauth for anon", async () => {
        const resp = await request(app).delete(`/companies/c1`);

        expect(resp.statusCode).toEqual(401);
    });

    test("not found for no such company", async () => {
        const resp = await request(app).delete(`/companies/nope`).set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.statusCode).toEqual(404);
    });
});
