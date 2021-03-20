"use strict";

const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const User = require("./user.js");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

// == AUTHENTICATE ============================================================================== //

describe("authenticate", () => {
    test("works", async () => {
        const user = await User.authenticate("u1", "password1");

        expect(user).toEqual({
            username: "u1",
            firstName: "U1F",
            lastName: "U1L",
            email: "u1@email.com",
            isAdmin: false,
        });
    });

    test("unauth if no such user", async () => {
        try {
            await User.authenticate("nope", "password");
            fail();
        } catch (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    });

    test("unauth if wrong password", async () => {
        try {
            await User.authenticate("c1", "wrong");
            fail();
        } catch (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    });
});

// == REGISTER ================================================================================== //

describe("register", () => {
    const newUser = {
        username: "new",
        firstName: "Test",
        lastName: "Tester",
        email: "test@test.com",
        isAdmin: false,
    };

    test("works", async () => {
        const user = await User.register({ ...newUser, password: "password" });

        expect(user).toEqual(newUser);

        const { rows: found } = await db.query("SELECT * FROM users WHERE username = 'new'");

        expect(found.length).toEqual(1);
        expect(found[0].is_admin).toEqual(false);
        expect(found[0].password.startsWith("$2b$")).toEqual(true);
    });

    test("works: adds admin", async () => {
        const user = await User.register({
            ...newUser,
            password: 'password',
            isAdmin: true
        });

        expect(user).toEqual({ ...newUser, isAdmin: true });

        const { rows: found } = await db.query("SELECT * FROM users WHERE username = 'new'");
        expect(found.length).toEqual(1);
        expect(found[0].is_admin).toEqual(true);
        expect(found[0].password.startsWith("$2b$")).toEqual(true);
    });

    test("bad request with dup data", async () => {
        try {
            await User.register({ ...newUser, password: "password" });
            await User.register({ ...newUser, password: "password" });
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

// == FIND ALL ================================================================================== //

describe("findAll", () => {
    test("works", async () => {
        const users = await User.findAll();

        expect(users).toEqual([
            {
                username: "u1",
                firstName: "U1F",
                lastName: "U1L",
                email: "u1@email.com",
                isAdmin: false,
            },
            {
                username: "u2",
                firstName: "U2F",
                lastName: "U2L",
                email: "u2@email.com",
                isAdmin: false,
            },
        ]);
    });
});

// == GET ======================================================================================= //

describe("get", () => {
    test("works", async () => {
        let user = await User.get("u1");

        expect(user).toEqual({
            username: "u1",
            firstName: "U1F",
            lastName: "U1L",
            email: "u1@email.com",
            isAdmin: false,
        });
    });

    test("not found if no such user", async () => {
        try {
            await User.get("nope");
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

// == UPDATE ==================================================================================== //

describe("update", () => {
    const updateData = {
        firstName: "NewF",
        lastName: "NewF",
        email: "new@email.com",
        isAdmin: true,
    };

    test("works", async () => {
        let job = await User.update("u1", updateData);
        
        expect(job).toEqual({
            username: "u1",
            ...updateData,
        });
    });

    test("works: set password", async () => {
        let job = await User.update("u1", {
            password: "new",
        });

        expect(job).toEqual({
            username: "u1",
            firstName: "U1F",
            lastName: "U1L",
            email: "u1@email.com",
            isAdmin: false,
        });

        const { rows: found } = await db.query("SELECT * FROM users WHERE username = 'u1'");
        expect(found.length).toEqual(1);
        expect(found[0].password.startsWith("$2b$")).toEqual(true);
    });

    test("not found if no such user", async () => {
        try {
            await User.update("nope", {
                firstName: "test",
            });
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test("bad request if no data", async () => {
        expect.assertions(1);
        try {
            await User.update("c1", {});
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

// == REMOVE ==================================================================================== //

describe("remove", () => {
    test("works", async () => {
        await User.remove("u1");
        const res = await db.query(
            "SELECT * FROM users WHERE username='u1'"
        );

        expect(res.rows.length).toEqual(0);
    });

    test("not found if no such user", async () => {
        try {
            await User.remove("nope");
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});
