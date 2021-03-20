"use strict";

const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../expressError");
const {
    authenticateJWT,
    ensureLoggedIn,
    ensureIsAdmin,
    ensureCorrectUserOrAdmin
} = require("./auth");

const { SECRET_KEY } = require("../config");
const testJwt = jwt.sign({ username: "test", isAdmin: false }, SECRET_KEY);
const badJwt = jwt.sign({ username: "test", isAdmin: false }, "wrong");

describe("authenticateJWT", () => {
    test("works: via header", () => {
        expect.assertions(2);

        // there are multiple ways to pass an authorization token, this is how you pass it in the
        // header. this has been provided to show you another way to pass the token. you are only
        // expected to read this code for this project.
        const req = { headers: { authorization: `Bearer ${testJwt}` } };
        const res = { locals: {} };
        const next = function (err) {
            expect(err).toBeFalsy();
        };

        authenticateJWT(req, res, next);
        expect(res.locals).toEqual({
            user: {
                iat: expect.any(Number),
                username: "test",
                isAdmin: false,
            },
        });
    });

    test("works: no header", () => {
        expect.assertions(2);

        const req = {};
        const res = { locals: {} };
        const next = function (err) {
            expect(err).toBeFalsy();
        };

        authenticateJWT(req, res, next);
        expect(res.locals).toEqual({});
    });

    test("works: invalid token", () => {
        expect.assertions(2);

        const req = { headers: { authorization: `Bearer ${badJwt}` } };
        const res = { locals: {} };
        const next = function (err) {
            expect(err).toBeFalsy();
        };

        authenticateJWT(req, res, next);
        expect(res.locals).toEqual({});
    });
});

describe("ensureLoggedIn", () => {
    test("works", () => {
        expect.assertions(1);

        const req = {};
        const res = { locals: { user: { username: "test", isAdmin: false } } };
        const next = function (err) {
            expect(err).toBeFalsy();
        };
        
        ensureLoggedIn(req, res, next);
    });

    test("unauth if no login", () => {
        expect.assertions(1);
        
        const req = {};
        const res = { locals: {} };
        const next = function (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        };
        
        ensureLoggedIn(req, res, next);
    });
});

describe("ensureIsAdmin", () => {
    const req = {};

    test("works", () => {
        expect.assertions(1);

        const res = { locals: { user: { username: "test", isAdmin: true } } };
        
        ensureIsAdmin(req, res, (err) => expect(err).toBeFalsy());
    });

    test("unauth if no login", () => {
        expect.assertions(1);

        const res = { locals: {} };

        ensureIsAdmin(req, res, (err) =>
            expect(err instanceof UnauthorizedError).toBeTruthy()
        );
    });

    test("unauth if regular user", () => {
        expect.assertions(1);

        const res = { locals: { user: { username: "test", isAdmin: false } } };

        ensureIsAdmin(req, res, (err) =>
            expect(err instanceof UnauthorizedError).toBeTruthy()
        );
    });
});

describe("ensureCorrectUserOrAdmin", () => {
    const req = { params: { username: "test" } };

    test("works if correct user", () => {
        expect.assertions(1);

        const res = { locals: { user: { username: "test", isAdmin: false } } };
        
        ensureCorrectUserOrAdmin(req, res, (err) => expect(err).toBeFalsy());
    });

    test("works if admin", () => {
        expect.assertions(1);

        const res = { locals: { user: { username: "abc", isAdmin: true } } };
        
        ensureCorrectUserOrAdmin(req, res, (err) => expect(err).toBeFalsy());
    });

    test("unauth if no login", () => {
        expect.assertions(1);

        const res = { locals: {} };
        
        ensureCorrectUserOrAdmin(req, res, (err) =>
            expect(err instanceof UnauthorizedError).toBeTruthy()
        );
    });

    test("unauth if wrong user", () => {
        expect.assertions(1);

        const res = { locals: { user: { username: "abc", isAdmin: false } } };
        
        ensureCorrectUserOrAdmin(req, res, (err) =>
            expect(err instanceof UnauthorizedError).toBeTruthy()
        );
    });
});
