"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { generate: generatePassword } = require("generate-password");

const { sqlForPartialUpdate } = require("../helpers/sql");
const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for users. */
class User {
    /** authenticate user with username, password.
     *
     * Returns { username, first_name, last_name, email, is_admin }
     *
     * Throws UnauthorizedError is user not found or wrong password.
     **/
    static async authenticate(username, password) {
        // try to find the user first
        const { rows: userRows } = await db.query(`
            SELECT username,
                   password,
                   first_name AS "firstName",
                   last_name AS "lastName",
                   email,
                   is_admin AS "isAdmin"
            FROM users
            WHERE username = $1
        `, [ username ]);

        if (userRows.length) {
            const user = userRows[0];

            // compare hashed password to a new hash from password
            const isValid = await bcrypt.compare(password, user.password);
            if (isValid === true) {
                delete user.password;
                return user;
            }
        }

        throw new UnauthorizedError("Invalid username/password");
    }

    /** Register user with data.
     *
     * Returns { username, firstName, lastName, email, isAdmin }
     *
     * Throws BadRequestError on duplicates.
     **/
    static async register({ username, password, firstName, lastName, email, isAdmin }) {
        const { rows: { length: duplicateCheck } } = await db.query(`
            SELECT username FROM users
            WHERE username = $1
        `, [ username ]);

        if (duplicateCheck)
            throw new BadRequestError(`Duplicate username: ${username}`);

        const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

        const { rows: [ user ] } = await db.query(`
            INSERT INTO users (
                username,
                password,
                first_name,
                last_name,
                email,
                is_admin
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING
                username,
                first_name AS "firstName",
                last_name  AS "lastName",
                email,
                is_admin   AS "isAdmin"
        `, [
            username,
            hashedPassword,
            firstName,
            lastName,
            email,
            isAdmin,
        ]);

        return user;
    }

    /** Find all users.
     *
     * Returns [{ username, first_name, last_name, email, is_admin }, ...]
     **/
    static async findAll() {
        const { rows } = await db.query(`
            SELECT username,
                   first_name AS "firstName",
                   last_name AS "lastName",
                   email,
                   is_admin AS "isAdmin"
            FROM users
            ORDER BY username
        `);

        return rows;
    }

    /** Given a username, return data about user.
     *
     * Returns { username, first_name, last_name, is_admin, jobs }
     *   where jobs is { id, title, companyHandle, status }
     *
     * Throws NotFoundError if user not found.
     **/
    static async get(username) {
        const [ { rows: user }, { rows: jobs } ] = await Promise.all([
            db.query(`
                SELECT username,
                       first_name AS "firstName",
                       last_name  AS "lastName",
                       email,
                       is_admin   AS "isAdmin"
                FROM users WHERE username = $1
            `, [ username ]),
            db.query(`
                SELECT applications.job_id AS "id",
                       applications.status,
                       jobs.title,
                       jobs.company_handle AS "companyHandle"
                FROM applications
                LEFT JOIN jobs ON applications.job_id = jobs.id
                WHERE username = $1
            `, [ username ])
        ]);

        if (!user.length)
            throw new NotFoundError(`No user: ${username}`);
        
        return { ...user[0], jobs };
    }

    /** Makes user apply for a given job.
     * 
     * Throws NotFoundError if user or job not found.
     **/
    static async applyForJob(username, jobId, status = 'interested') {
        const [
            { rows: { length: userCheck } },
            { rows: { length: jobCheck } }
        ] = await Promise.all([
            db.query("SELECT username FROM users WHERE username = $1", [ username ]),
            db.query("SELECT id FROM jobs WHERE id = $1", [ jobId ])
        ]);

        if (!userCheck)
            throw new NotFoundError(`No user: ${username}`);
        if (!jobCheck)
            throw new NotFoundError(`No job: ${jobId}`);

        try {
            await db.query(`
                INSERT INTO applications (username, job_id, status)
                VALUES ($1, $2, $3)
            `, [ username, jobId, status ]);
        } catch (err) {
            switch (err.code) {
            case '23505':
                throw new BadRequestError("Already have an application for this job");

            case '22P02':
                throw new BadRequestError("Invalid application status");

            default:
                throw err;
            }
        }
    }

    /** Removes interest in a given job.
     * 
     * If isAdmin is true, can remove an application regardless of status. Otherwise, only
     * applications with status "interested" can be removed.
     * 
     * Throws NotFoundError if user or job not found.
     **/
    static async removeJob(username, jobId, isAdmin = false) {
        const [
            { rows: { length: userCheck } },
            { rows: { length: jobCheck } },
            { rows: application }
        ] = await Promise.all([
            db.query("SELECT username FROM users WHERE username = $1", [ username ]),
            db.query("SELECT id FROM jobs WHERE id = $1", [ jobId ]),
            db.query(
                "SELECT status FROM applications WHERE username = $1 AND job_id = $2",
                [ username, jobId ]
            )
        ]);

        if (!userCheck)
            throw new NotFoundError(`No user: ${username}`);
        if (!jobCheck)
            throw new NotFoundError(`No job: ${jobId}`);
        if (!application.length)
            throw new NotFoundError(`No application for ${jobId}`);
        
        let queryString = "DELETE FROM applications WHERE username = $1 AND job_id = $2";
        if (!isAdmin)
            queryString += " AND status = 'interested'";
        
        const { rows: { length: deleteCheck } } = await db.query(
            queryString + " RETURNING job_id",
            [ username, jobId ]
        );

        if (!deleteCheck)
            throw new UnauthorizedError(`Cannot remove job with status "${application[0].status}"`);
    }

    /** Update user data with `data`.
     *
     * This is a "partial update" --- it's fine if data doesn't contain
     * all the fields; this only changes provided ones.
     *
     * Data can include:
     *   { firstName, lastName, password, email, isAdmin }
     *
     * Returns { username, firstName, lastName, email, isAdmin }
     *
     * Throws NotFoundError if not found.
     *
     * WARNING: this function can set a new password or make a user an admin.
     * Callers of this function must be certain they have validated inputs to this
     * or a serious security risks are opened.
     */
    static async update(username, data) {
        if (data.password)
            data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);

        const { setCols, values } = sqlForPartialUpdate(data, {
            firstName: "first_name",
            lastName:  "last_name",
            isAdmin:   "is_admin",
        });
        const usernameVarIdx = "$" + (values.length + 1);

        const querySql = `
            UPDATE users 
            SET ${setCols} 
            WHERE username = ${usernameVarIdx} 
            RETURNING username,
                      first_name AS "firstName",
                      last_name  AS "lastName",
                      email,
                      is_admin   AS "isAdmin"
        `;
        const { rows: userRows } = await db.query(querySql, [...values, username]);

        if (!userRows.length)
            throw new NotFoundError(`No user: ${username}`);

        const user = userRows[0];
        delete user.password;
        return user;
    }

    /** Delete given user from database; returns undefined. */
    static async remove(username) {
        const { rows: { length } } = await db.query(`
            DELETE FROM users
            WHERE username = $1
            RETURNING username
        `, [ username ]);
        
        if (!length)
            throw new NotFoundError(`No user: ${username}`);
    }
}

module.exports = User;
