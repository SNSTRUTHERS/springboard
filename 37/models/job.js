"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs */
class Job {
    /** Create a job (from data), update db, return new job data.
     *
     *  data should be { title, salary, equity, companyHandle }
     *
     *  Returns { id, title, salary, equity, companyHandle }
     */
    static async create({ title, salary, equity, companyHandle }) {
        const { rows: [ job ] } = await db.query(`
            INSERT INTO jobs (
                title, salary, equity, company_handle
            ) VALUES ($1, $2, $3, $4)
            RETURNING id, title, salary, equity, company_handle AS "companyHandle"
        `, [ title, salary, equity, companyHandle ]);

        return job;
    }

    /** Find all companies.
     * 
     * data should be {
     *      minSalary: number | undefined,
     *      title:     string | undefined,
     *      hasEquity: boolean | undefined
     * }
     * 
     * Returns [{ id, title, salary, equity, companyHandle, companyName }, ...]
     * */
    static async findAll({ minSalary, title, hasEquity } = {}) {
        // base query string
        let queryString = `
            SELECT jobs.id,
                   jobs.title,
                   jobs.salary,
                   jobs.equity,
                   jobs.company_handle AS "companyHandle",
                   companies.name      AS "companyName"
            FROM jobs
            LEFT JOIN companies ON companies.handle = jobs.company_handle
        `;

        const wheres = [], values = [];

        // collate all possible properties into where clause list & value list
        if (minSalary !== undefined) {
            values.push(minSalary);
            wheres.push(`jobs.salary >= $${values.length}`);
        }
        if (title !== undefined) {
            values.push(`%${title}%`);
            wheres.push(`jobs.title ILIKE $${values.length}`);
        }
        if (hasEquity)
            wheres.push(`jobs.equity > 0`);
        
        // assemble final query string
        if (wheres.length)
            queryString += " WHERE ";
        queryString += wheres.join(' AND ') + " ORDER BY title";
        
        const { rows: jobs } = await db.query(queryString, values);
        return jobs;
    }

    /** Given a job ID, return data about given job.
     *
     * Returns { id, title, salary, equity, company }
     * where company = { handle, description, numEmployees, logoUrl }
     *
     * Throws NotFoundError if not found.
     **/
    static async get(jobId) {
        const { rows: jobRes } = await db.query(`
            SELECT jobs.id,
                   jobs.title,
                   jobs.salary,
                   jobs.equity,
                   jobs.company_handle     AS "handle",
                   companies.name          AS "name",
                   companies.description   AS "description",
                   companies.num_employees AS "numEmployees",
                   companies.logo_url      AS "logoUrl"
            FROM jobs
            LEFT JOIN companies ON companies.handle = jobs.company_handle
            WHERE jobs.id = $1
        `, [ jobId ]);

        if (!jobRes.length)
            throw new NotFoundError(`No job: ${jobId}`);

        const { id, title, salary, equity, ...company } = jobRes[0];
        return { id, title, salary, equity, company };
    }
    
    /** Update job data with `data`.
     *
     * This is a "partial update" --- it's fine if data doesn't contain all the
     * fields; this only changes provided ones.
     *
     * Data can include: { title, salary, equity }
     *
     * Returns { id, title, salary, equity, companyHandle }
     *
     * Throws NotFoundError if not found.
     */
    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(data, {
            title:  "title",
            salary: "salary",
            equity: "equity"
        });
        const idVarIdx = "$" + (values.length + 1);

        const querySql = `
            UPDATE jobs 
            SET ${setCols} 
            WHERE id = ${idVarIdx} 
            RETURNING id, title, salary, equity, company_handle AS "companyHandle"
        `;
        const { rows: jobRes } = await db.query(querySql, [...values, id]);

        if (!jobRes.length)
            throw new NotFoundError(`No job: ${id}`);

        return jobRes[0];
    }

    /** Delete given job from database; returns undefined.
     *
     * Throws NotFoundError if not found.
     **/
    static async remove(id) {
        const { rows: { length } } = await db.query(`
            DELETE FROM jobs
            WHERE id = $1
            RETURNING id
        `, [ id ]);

        if (!length)
            throw new NotFoundError(`No job: ${id}`);
    }
}

module.exports = Job;
