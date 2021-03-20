"use strict";

const request = require("supertest");

const db = require("../db.js");
const app = require("../app");
const User = require("../models/user");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    userToken,
    otherUserToken,
    adminToken,
    jobIdMap,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

// == POST /users =============================================================================== //

describe("POST /users", () => {
    test("works for admins: create non-admin", async () => {
        const resp = await request(app).post("/users").send({
            username: "u-new",
            firstName: "First-new",
            lastName: "Last-newL",
            email: "new@email.com",
            isAdmin: false,
        }).set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            user: {
                username: "u-new",
                firstName: "First-new",
                lastName: "Last-newL",
                email: "new@email.com",
                isAdmin: false,
            },
            token: expect.any(String),
        });
    });

    test("works for admins: create admin", async () => {
        const resp = await request(app).post("/users").send({
            username: "u-new",
            firstName: "First-new",
            lastName: "Last-newL",
            email: "new@email.com",
            isAdmin: true,
        }).set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            user: {
                username: "u-new",
                firstName: "First-new",
                lastName: "Last-newL",
                email: "new@email.com",
                isAdmin: true,
            },
            token: expect.any(String),
        });
    });

    test("unauth for anon", async () => {
        const resp = await request(app).post("/users").send({
            username: "u-new",
            firstName: "First-new",
            lastName: "Last-newL",
            email: "new@email.com",
            isAdmin: true,
        });

        expect(resp.statusCode).toEqual(401);
    });

    test("unauth for regular users", async () => {
        const resp = await request(app).post("/users").send({
            username: "u-new",
            firstName: "First-new",
            lastName: "Last-newL",
            email: "new@email.com",
            isAdmin: true,
        }).set(
            "authorization",
            `Bearer ${userToken}`
        );

        expect(resp.statusCode).toEqual(401);
    });

    test("bad request if missing data", async () => {
        const resp = await request(app).post("/users").send({
            username: "u-new",
        }).set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.statusCode).toEqual(400);
    });

    test("bad request if invalid data", async () => {
        const resp = await request(app).post("/users").send({
            username: "u-new",
            password: "password-new",
            firstName: "First-new",
            lastName: "Last-newL",
            email: "not-an-email",
            isAdmin: true,
        }).set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.statusCode).toEqual(400);
    });
});

// == GET /users ================================================================================ //

describe("GET /users", () => {
    test("works for admins", async () => {
        const resp = await request(app).get("/users").set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.body).toEqual({
            users: [
                {
                    username: "u1",
                    firstName: "U1F",
                    lastName: "U1L",
                    email: "user1@user.com",
                    isAdmin: false,
                },
                {
                    username: "u2",
                    firstName: "U2F",
                    lastName: "U2L",
                    email: "user2@user.com",
                    isAdmin: false,
                },
                {
                    username: "u3",
                    firstName: "U3F",
                    lastName: "U3L",
                    email: "user3@user.com",
                    isAdmin: true,
                },
            ],
        });
    });

    test("unauth for anon", async () => {
        const resp = await request(app).get("/users");

        expect(resp.statusCode).toEqual(401);
    });

    test("unauth for regular users", async () => {
        const resp = await request(app).get("/users").set(
            "authorization",
            `Bearer ${userToken}`
        );

        expect(resp.statusCode).toEqual(401);
    });

    test("fails: test next() handler", async () => {
        // there's no normal failure event which will cause this route to fail ---
        // thus making it hard to test that the error-handler works with it. This
        // should cause an error, all right :)
        await db.query("DROP TABLE users CASCADE");
        const resp = await request(app).get("/users").set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.statusCode).toEqual(500);
    });
});

// == GET /users/:username ====================================================================== //

describe("GET /users/:username", () => {
    test("works for admins", async () => {
        const resp = await request(app).get(`/users/u1`).set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.body).toEqual({
            user: {
                username: "u1",
                firstName: "U1F",
                lastName: "U1L",
                email: "user1@user.com",
                isAdmin: false,
                jobs: [
                    {
                        id: jobIdMap.get("J1"),
                        title: "J1",
                        companyHandle: 'c1',
                        status: "interested"
                    },
                    {
                        id: jobIdMap.get("J2"),
                        title: "J2",
                        companyHandle: 'c1',
                        status: "interested"
                    },
                    {
                        id: jobIdMap.get("J3"),
                        title: "J3",
                        companyHandle: 'c2',
                        status: "applied"
                    },
                ],
            },
        });
    });
    
    test("works for given user", async () => {
        const resp = await request(app).get(`/users/u1`).set(
            "authorization",
            `Bearer ${userToken}`
        );

        expect(resp.body).toEqual({
            user: {
                username: "u1",
                firstName: "U1F",
                lastName: "U1L",
                email: "user1@user.com",
                isAdmin: false,
                jobs: [
                    {
                        id: jobIdMap.get("J1"),
                        title: "J1",
                        companyHandle: 'c1',
                        status: "interested"
                    },
                    {
                        id: jobIdMap.get("J2"),
                        title: "J2",
                        companyHandle: 'c1',
                        status: "interested"
                    },
                    {
                        id: jobIdMap.get("J3"),
                        title: "J3",
                        companyHandle: 'c2',
                        status: "applied"
                    },
                ],
            },
        });
    });

    test("works for user with no job applications/interests", async () => {
        const resp = await request(app).get(`/users/u3`).set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.body).toEqual({
            user: {
                username: "u3",
                firstName: "U3F",
                lastName: "U3L",
                email: "user3@user.com",
                isAdmin: true,
                jobs: [],
            },
        });
    });

    test("unauth for anon", async () => {
        const resp = await request(app).get(`/users/u1`);
        
        expect(resp.statusCode).toEqual(401);
    });

    test("unauth for non-given user", async () => {
        const resp = await request(app).get(`/users/u1`).set(
            "authorization",
            `Bearer ${otherUserToken}`
        );
        
        expect(resp.statusCode).toEqual(401);
    });

    test("not found if no such user", async () => {
        const resp = await request(app).get(`/users/nope`).set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.statusCode).toEqual(404);
    });
});

// == PATCH /users/:username ==================================================================== //

describe("PATCH /users/:username", () => {
    test("works for admins", async () => {
        const resp = await request(app).patch(`/users/u1`).send({
            firstName: "New",
        }).set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.body).toEqual({
            user: {
                username: "u1",
                firstName: "New",
                lastName: "U1L",
                email: "user1@user.com",
                isAdmin: false,
            },
        });
    });
    
    test("works for given user", async () => {
        const resp = await request(app).patch(`/users/u1`).send({
            firstName: "New",
        }).set(
            "authorization",
            `Bearer ${userToken}`
        );

        expect(resp.body).toEqual({
            user: {
                username: "u1",
                firstName: "New",
                lastName: "U1L",
                email: "user1@user.com",
                isAdmin: false,
            },
        });
    });

    test("unauth for anon", async () => {
        const resp = await request(app).patch(`/users/u1`).send({
            firstName: "New",
        });

        expect(resp.statusCode).toEqual(401);
    });

    test("unauth for non-given user", async () => {
        const resp = await request(app).patch(`/users/u1`).send({
            firstName: "New",
        }).set(
            "authorization",
            `Bearer ${otherUserToken}`
        );

        expect(resp.statusCode).toEqual(401);
    });

    test("not found if no such user", async () => {
        const resp = await request(app).patch(`/users/nope`).send({
            firstName: "Nope",
        }).set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.statusCode).toEqual(404);
    });

    test("bad request if invalid data", async () => {
        const resp = await request(app).patch(`/users/u1`).send({
            firstName: 42,
        }).set(
            "authorization",
            `Bearer ${userToken}`
        );
        
        expect(resp.statusCode).toEqual(400);
    });

    test("works: set new password", async () => {
        const resp = await request(app).patch(`/users/u1`).send({
            password: "new-password",
        }).set(
            "authorization",
            `Bearer ${userToken}`
        );

        expect(resp.body).toEqual({
            user: {
                username: "u1",
                firstName: "U1F",
                lastName: "U1L",
                email: "user1@user.com",
                isAdmin: false,
            },
        });
        const isSuccessful = await User.authenticate("u1", "new-password");
        expect(isSuccessful).toBeTruthy();
    });
});

// == DELETE /users/:username =================================================================== //

describe("DELETE /users/:username", () => {
    test("works for admins", async () => {
        let resp = await request(app).delete(`/users/u1`).set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.body).toEqual({ deleted: "u1" });

        resp = await request(app).get(`/users/u1`).set(
            "authorization",
            `Bearer ${adminToken}`
        );
        
        expect(resp.statusCode).toBe(404);
    });
    
    test("works for given user", async () => {
        const resp = await request(app).delete(`/users/u1`).set(
            "authorization",
            `Bearer ${userToken}`
        );

        expect(resp.body).toEqual({ deleted: "u1" });
    });

    test("unauth for anon", async () => {
        const resp = await request(app).delete(`/users/u1`);

        expect(resp.statusCode).toEqual(401);
    });

    test("unauth for non-given user", async () => {
        const resp = await request(app).delete(`/users/u1`).set(
            "authorization",
            `Bearer ${otherUserToken}`
        );

        expect(resp.statusCode).toEqual(401);
    });

    test("not found if user missing", async () => {
        const resp = await request(app).delete(`/users/nope`).set(
            "authorization",
            `Bearer ${adminToken}`
        );
        
        expect(resp.statusCode).toEqual(404);
    });
});

// == POST /users/:username/jobs/:id ============================================================ //

describe("POST /users/:username/jobs/:id", () => {
    test("works for admins", async () => {
        let resp = await request(app).post(`/users/u3/jobs/${jobIdMap.get("J1")}`).set(
            "authorization",
            `Bearer ${adminToken}`
        ).send({
            status: "applied"
        });

        expect(resp.body).toEqual({ applied: jobIdMap.get("J1") });

        resp = await request(app).get(`/users/u3`).set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.body.user.jobs).toContainEqual({
            id: jobIdMap.get("J1"),
            title: "J1",
            companyHandle: 'c1',
            status: "applied",
        });
    });

    test("works for given user", async () => {
        let resp = await request(app).post(`/users/u2/jobs/${jobIdMap.get("J3")}`).set(
            "authorization",
            `Bearer ${otherUserToken}`
        ).send({
            status: "interested"
        });

        expect(resp.body).toEqual({ interested: jobIdMap.get("J3") });

        resp = await request(app).get(`/users/u2`).set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.body.user.jobs).toContainEqual({
            id: jobIdMap.get("J3"),
            title: "J3",
            companyHandle: 'c2',
            status: "interested",
        });
    });

    test("unauth for anon", async () => {
        const resp = await request(app).post(`/users/u3/jobs/${jobIdMap.get("J3")}`).send({
            status: "interested"
        });

        expect(resp.statusCode).toEqual(401);
    });

    test("unauth for non-given user", async () => {
        const resp = await request(app).post(`/users/u3/jobs/${jobIdMap.get("J3")}`).send({
            status: "interested"
        }).set(
            "authorization",
            `Bearer ${userToken}`
        );

        expect(resp.statusCode).toEqual(401);
    });

    test("bad request if missing data", async () => {
        const resp = await request(app).post(`/users/u3/jobs/${jobIdMap.get("J1")}`).set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.statusCode).toEqual(400);
    });

    test("bad request if invalid data", async () => {
        const resp = await request(app).post(`/users/u3/jobs/${jobIdMap.get("J1")}`).set(
            "authorization",
            `Bearer ${adminToken}`
        ).send({
            status: "heck yeah"
        });

        expect(resp.statusCode).toEqual(400);
    });

    test("bad request if dupe", async () => {
        const resp = await request(app).post(`/users/u1/jobs/${jobIdMap.get("J1")}`).set(
            "authorization",
            `Bearer ${adminToken}`
        ).send({
            status: "interested"
        });

        expect(resp.statusCode).toEqual(400);
    });

    test("not found if user not found", async () => {
        const resp = await request(app).post(`/users/none/jobs/${jobIdMap.get("J1")}`).set(
            "authorization",
            `Bearer ${adminToken}`
        ).send({
            status: "interested"
        });

        expect(resp.statusCode).toEqual(404);
    });

    test("not found if job not found", async () => {
        const resp = await request(app).post(`/users/none/u1/999999`).set(
            "authorization",
            `Bearer ${adminToken}`
        ).send({
            status: "interested"
        });

        expect(resp.statusCode).toEqual(404);
    });
});

// == DELETE /users/:username/jobs/:id ========================================================== //

describe("DELETE /users/:username/jobs/:id", () => {
    test("works for admins", async () => {
        let resp = await request(app).delete(`/users/u1/jobs/${jobIdMap.get("J1")}`).set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.body).toEqual({ deleted: jobIdMap.get("J1") });

        resp = await request(app).get(`/users/u1`).set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.body.user.jobs).not.toContainEqual({
            id: jobIdMap.get("J1"),
            title: "J1",
            companyHandle: 'c1',
            status: "interested",
        });
    });

    test("works for admins regardless of application status", async () => {
        let resp = await request(app).delete(`/users/u1/jobs/${jobIdMap.get("J3")}`).set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.body).toEqual({ deleted: jobIdMap.get("J3") });

        resp = await request(app).get(`/users/u1`).set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.body.user.jobs).not.toContainEqual({
            id: jobIdMap.get("J3"),
            title: "J3",
            companyHandle: 'c2',
            status: "applied",
        });
    });
    
    test("works for given user", async () => {
        let resp = await request(app).delete(`/users/u1/jobs/${jobIdMap.get("J1")}`).set(
            "authorization",
            `Bearer ${userToken}`
        );

        expect(resp.body).toEqual({ deleted: jobIdMap.get("J1") });

        resp = await request(app).get(`/users/u1`).set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.body.user.jobs).not.toContainEqual({
            id: jobIdMap.get("J1"),
            title: "J1",
            companyHandle: 'c1',
            status: "interested",
        });
    });

    test("unauth for given user if application status isn't \"interested\"", async () => {
        const resp = await request(app).delete(`/users/u1/jobs/${jobIdMap.get("J3")}`).set(
            "authorization",
            `Bearer ${userToken}`
        );

        expect(resp.statusCode).toEqual(401);
    });

    test("unauth for anon", async () => {
        const resp = await request(app).delete(`/users/u1/jobs/${jobIdMap.get("J3")}`);

        expect(resp.statusCode).toEqual(401);
    });

    test("unauth for non-given user", async () => {
        const resp = await request(app).post(`/users/u1/jobs/${jobIdMap.get("J3")}`).set(
            "authorization",
            `Bearer ${otherUserToken}`
        );

        expect(resp.statusCode).toEqual(401);
    });

    test("not found if user not found", async () => {
        const resp = await request(app).delete(`/users/none/jobs/${jobIdMap.get("J1")}`).set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.statusCode).toEqual(404);
    });

    test("not found if job not found", async () => {
        const resp = await request(app).delete(`/users/none/u1/999999`).set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.statusCode).toEqual(404);
    });

    test("not found if no application", async () => {
        const resp = await request(app).delete(`/users/u3/jobs/${jobIdMap.get("J1")}`).set(
            "authorization",
            `Bearer ${adminToken}`
        );

        expect(resp.statusCode).toEqual(404);
    });
});
