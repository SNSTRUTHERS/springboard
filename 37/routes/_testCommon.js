"use strict";

const db = require("../db.js");

const User    = require("../models/user");
const Company = require("../models/company");
const Job     = require("../models/job.js");

const { createToken } = require("../helpers/tokens");

/** @type {Map<string, number>} */
const jobIdMap = new Map();

async function commonBeforeAll() {
    // noinspection SqlWithoutWhere
    await db.query("DELETE FROM applications");
    // noinspection SqlWithoutWhere
    await db.query("DELETE FROM jobs");
    // noinspection SqlWithoutWhere
    await db.query("DELETE FROM users");
    // noinspection SqlWithoutWhere
    await db.query("DELETE FROM companies");

    // create test companies
    await Company.create({
        handle: "c1",
        name: "C1",
        numEmployees: 1,
        description: "Desc1",
        logoUrl: "http://c1.img",
    });
    await Company.create({
        handle: "c2",
        name: "C2",
        numEmployees: 2,
        description: "Desc2",
        logoUrl: "http://c2.img",
    });
    await Company.create({
        handle: "c3",
        name: "C3",
        numEmployees: 3,
        description: "Desc3",
        logoUrl: "http://c3.img",
    });

    // register test users
    await User.register({
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@user.com",
        password: "password1",
        isAdmin: false,
    });
    await User.register({
        username: "u2",
        firstName: "U2F",
        lastName: "U2L",
        email: "user2@user.com",
        password: "password2",
        isAdmin: false,
    });
    await User.register({
        username: "u3",
        firstName: "U3F",
        lastName: "U3L",
        email: "user3@user.com",
        password: "password3",
        isAdmin: true,
    });

    const [ { id: id1 }, { id: id2 }, { id: id3 } ] = await Promise.all([
        Job.create({
            title: "J1",
            salary: 100000,
            equity: "0.25",
            companyHandle: "c1"
        }),
        Job.create({
            title: "J2",
            salary: 200000,
            equity: "0.125",
            companyHandle: "c1"
        }),
        Job.create({
            title: "J3",
            salary: 300000,
            equity: "0",
            companyHandle: "c2"
        })
    ]);
    jobIdMap.set("J1", id1);
    jobIdMap.set("J2", id2);
    jobIdMap.set("J3", id3);

    await Promise.all([
        User.applyForJob("u1", id1, "interested"),
        User.applyForJob("u1", id2, "interested"),
        User.applyForJob("u1", id3, "applied"),
        User.applyForJob("u2", id1, "applied"),
        User.applyForJob("u2", id2, "rejected")
    ]);
}

async function commonBeforeEach() {
    await db.query("BEGIN");
}

async function commonAfterEach() {
    await db.query("ROLLBACK");
}

async function commonAfterAll() {
    await db.end();
}


const userToken = createToken({ username: "u1", isAdmin: false });
const otherUserToken = createToken({ username: "u2", isAdmin: false });
const adminToken = createToken({ username: "u3", isAdmin: true });


module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    userToken,
    adminToken,
    otherUserToken,
    jobIdMap
};
