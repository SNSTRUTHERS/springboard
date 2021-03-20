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

// == POST /jobs ================================================================================ //

describe("POST /jobs", () => {
    const newJob = {
        title: "New Job",
        salary: 400000,
        equity: "0.02",
        companyHandle: 'c1'
    };

    test("ok for admins", async () => {
        const resp = await request(app).post("/jobs").send(newJob).set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            job: { ...newJob, id: resp.body.job.id },
        });
    });

    test("unauthed for regular users", async () => {
        const resp = await request(app).post("/jobs").send(newJob).set(
            "authorization",
            `Bearer ${userToken}`
        );

        expect(resp.statusCode).toEqual(401);
    });

    test("bad request with missing data", async () => {
        const resp = await request(app).post("/jobs").send({
            title: "hello world"
        }).set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.statusCode).toEqual(400);
    });

    test("bad request with invalid data", async () => {
        const resp = await request(app).post("/jobs").send({
            ...newJob,
            salary: "not-an-integer",
        }).set(
            "authorization",
            `Bearer ${adminToken}`
        );
        expect(resp.statusCode).toEqual(400);
    });
});

// == GET /jobs ================================================================================= //

describe("GET /companies", () => {
    test("ok for anon", async () => {
        const resp = await request(app).get("/jobs");

        expect(resp.body).toEqual({
            jobs: [
                {
                    id: jobIdMap.get("J1"),
                    title: "J1",
                    salary: 100000,
                    equity: "0.25",
                    companyHandle: 'c1',
                    companyName: "C1",
                },
                {
                    id: jobIdMap.get("J2"),
                    title: "J2",
                    salary: 200000,
                    equity: "0.125",
                    companyHandle: 'c1',
                    companyName: "C1",
                },
                {
                    id: jobIdMap.get("J3"),
                    title: "J3",
                    salary: 300000,
                    equity: "0",
                    companyHandle: 'c2',
                    companyName: "C2",
                },
            ],
        });
    });

    test("fails: test next() handler", async () => {
        // there's no normal failure event which will cause this route to fail ---
        // thus making it hard to test that the error-handler works with it. This
        // should cause an error, all right :)
        await db.query("DROP TABLE jobs CASCADE");

        const resp = await request(app).get("/jobs").set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.statusCode).toEqual(500);
    });

    test("single filter works", async () => {
        const resp = await request(app).get("/jobs").query({
            minSalary: 200000
        });

        expect(resp.body).toEqual({
            jobs: [
                {
                    id: jobIdMap.get("J2"),
                    title: "J2",
                    salary: 200000,
                    equity: "0.125",
                    companyHandle: 'c1',
                    companyName: "C1",
                },
                {
                    id: jobIdMap.get("J3"),
                    title: "J3",
                    salary: 300000,
                    equity: "0",
                    companyHandle: 'c2',
                    companyName: "C2",
                },
            ]
        });
    });

    test("multiple filters work", async () => {
        const resp = await request(app).get("/jobs").query({
            hasEquity: true,
            title: "J"
        });

        expect(resp.body).toEqual({
            jobs: [
                {
                    id: jobIdMap.get("J1"),
                    title: "J1",
                    salary: 100000,
                    equity: "0.25",
                    companyHandle: 'c1',
                    companyName: "C1",
                },
                {
                    id: jobIdMap.get("J2"),
                    title: "J2",
                    salary: 200000,
                    equity: "0.125",
                    companyHandle: 'c1',
                    companyName: "C1",
                },
            ]
        });
    });

    test("bad request on invalid filter", async () => {
        const resp = await request(app).get("/jobs").query({ nope: 500 });

        expect(resp.statusCode).toBe(400);
    });
});

// == GET /jobs/:id ============================================================================= //

describe("GET /jobs/:id", () => {
    test("works for anon", async () => {
        const resp = await request(app).get(`/jobs/${jobIdMap.get("J1")}`);

        expect(resp.body).toEqual({
            job: {
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
            },
        });
    });

    test("not found for no such job", async () => {
        const resp = await request(app).get(`/jobs/999999`);

        expect(resp.statusCode).toEqual(404);
    });
});

// == PATCH /jobs/:id =========================================================================== //

describe("PATCH /jobs/:id", () => {
    test("works for admins", async () => {
        const resp = await request(app).patch(`/jobs/${jobIdMap.get("J1")}`).send({
            title: "J1-new",
            salary: 150000,
        }).set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.body).toEqual({
            job: {
                id: jobIdMap.get("J1"),
                title: "J1-new",
                salary: 150000,
                equity: '0.25',
                companyHandle: 'c1'
            },
        });
    });
    
    test("unauth for regular users", async () => {
        const resp = await request(app).patch(`/jobs/${jobIdMap.get("J1")}`).send({
            title: "J1-new",
        }).set(
            "authorization",
            `Bearer ${userToken}`
        );

        expect(resp.statusCode).toEqual(401);
    });

    test("unauth for anon", async () => {
        const resp = await request(app).patch(`/jobs/${jobIdMap.get("J1")}`).send({
            title: "J1-new",
        });

        expect(resp.statusCode).toEqual(401);
    });

    test("not found on no such job", async () => {
        const resp = await request(app).patch(`/jobs/999999`).send({
            title: "new nope",
        }).set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.statusCode).toEqual(404);
    });

    test("bad request on ID change attempt", async () => {
        const resp = await request(app).patch(`/jobs/${jobIdMap.get("J1")}`).send({
            id: 333,
        }).set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.statusCode).toEqual(400);
    });

    test("bad request on company handle change attempt", async () => {
        const resp = await request(app).patch(`/jobs/${jobIdMap.get("J1")}`).send({
            companyHandle: "c2",
        }).set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.statusCode).toEqual(400);
    });

    test("bad request on invalid data", async () => {
        const resp = await request(app).patch(`/jobs/999999`).send({
            invalidParam: 12345
        }).set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.statusCode).toEqual(400);
    });
});

// == DELETE /jobs/:id ========================================================================== //

describe("DELETE /jobs/:id", () => {
    test("works for admins", async () => {
        let resp = await request(app).delete(`/jobs/${jobIdMap.get("J1")}`).set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.body).toEqual({ deleted: jobIdMap.get("J1") });

        resp = await request(app).get(`/jobs/${jobIdMap.get("J1")}`).set(
            "authorization",
            `Bearer ${adminToken}`
        );
        
        expect(resp.statusCode).toBe(404);
    });

    test("unauth for regular users", async () => {
        const resp = await request(app).delete(`/jobs/${jobIdMap.get("J1")}`).set(
            "authorization",
            `Bearer ${userToken}`
        );

        expect(resp.statusCode).toEqual(401);
    });

    test("unauth for anon", async () => {
        const resp = await request(app).delete(`/jobs/${jobIdMap.get("J1")}`);

        expect(resp.statusCode).toEqual(401);
    });

    test("not found for no such job", async () => {
        const resp = await request(app).delete(`/jobs/999999`).set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.statusCode).toEqual(404);
    });
});
