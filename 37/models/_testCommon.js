const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

/** @type {Map<string, number>} */
const jobIdMap = new Map();

async function commonBeforeAll() {
    // noinspection SqlWithoutWhere
    await db.query("DELETE FROM applications");
    // noinspection SqlWithoutWhere
    await db.query("DELETE FROM jobs");
    // noinspection SqlWithoutWhere
    await db.query("DELETE FROM companies");
    // noinspection SqlWithoutWhere
    await db.query("DELETE FROM users");

    await Promise.all([
        db.query(`
            INSERT INTO companies (
                handle, name, num_employees, description, logo_url
            ) VALUES ('c1', 'C1', 1, 'Desc1', 'http://c1.img'),
                     ('c2', 'C2', 2, 'Desc2', 'http://c2.img'),
                     ('c3', 'C3', 3, 'Desc3', 'http://c3.img')
        `),
        db.query(`
            INSERT INTO users (
                username, password, first_name, last_name, email
            )
            VALUES ('u1', $1, 'U1F', 'U1L', 'u1@email.com'),
                   ('u2', $2, 'U2F', 'U2L', 'u2@email.com')
            RETURNING username
        `, [
            await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
            await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
        ])
    ]);

    const { rows: ids } = await db.query(`
        INSERT INTO jobs (
            title, salary, equity, company_handle
        ) VALUES ('J1', 100000, 0.25,  'c1'),
                 ('J2', 200000, 0.125, 'c1'),
                 ('J3', 300000, 0,     'c2')
        RETURNING id, title
    `);

    for (const { id, title } of ids)
        jobIdMap.set(title, id);

    await db.query(`
        INSERT INTO applications (username, job_id, status)
        VALUES ('u1', $1, 'interested'), ('u1', $2, 'applied'), ('u1', $3, 'rejected')
    `, [ jobIdMap.get("J1"), jobIdMap.get("J2"), jobIdMap.get("J3"), ]);
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


module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    jobIdMap
};