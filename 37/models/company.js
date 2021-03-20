"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */
class Company {
    /** Create a company (from data), update db, return new company data.
     *
     *  data should be { handle, name, description, numEmployees, logoUrl }
     *
     *  Returns { handle, name, description, numEmployees, logoUrl }
     *
     *  Throws BadRequestError if company already in database.
     * */
    static async create({ handle, name, description, numEmployees, logoUrl }) {
        const { rows: { length: duplicateCheck } } = await db.query(`
            SELECT handle FROM companies
            WHERE handle = $1
        `, [ handle ]);

        if (duplicateCheck)
            throw new BadRequestError(`Duplicate company: ${handle}`);

        const { rows: [ company ] } = await db.query(`
            INSERT INTO companies (
                handle, name, description, num_employees, logo_url
            ) VALUES ($1, $2, $3, $4, $5)
            RETURNING
                handle, name, description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
        `, [
            handle,
            name,
            description,
            numEmployees,
            logoUrl,
        ]);

        return company;
    }

    /** Find all companies.
     * 
     * data should be {
     *      minEmployees: number | undefined,
     *      maxEmployees: number | undefined,
     *      name: string | undefined
     * }
     * 
     * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
     * */
    static async findAll({ minEmployees, maxEmployees, name } = {}) {
        // base query string
        let queryString = `
            SELECT handle,
                   name,
                   description,
                   num_employees AS "numEmployees",
                   logo_url AS "logoUrl"
            FROM companies
        `;

        const wheres = [], values = [];

        // JSONschema doesn't allow one to set min/max based on other properties, so we
        // have to do it manually. UGH!
        if (minEmployees > maxEmployees)
            throw new BadRequestError("Min employees must be greater than or equal max employees.");
        
        // collate all possible properties into where clause list & value list
        if (minEmployees !== undefined) {
            values.push(minEmployees);
            wheres.push(`num_employees >= $${values.length}`);
        }
        if (maxEmployees !== undefined) {
            values.push(maxEmployees);
            wheres.push(`num_employees <= $${values.length}`);
        }
        if (name) {
            values.push(`%${name}%`);
            wheres.push(`name ILIKE $${values.length}`);
        }
        
        // assemble final query string
        if (wheres.length)
            queryString += " WHERE ";
        queryString += wheres.join(' AND ') + " ORDER BY name";
        
        const { rows: companies } = await db.query(queryString, values);
        return companies;
    }

    /** Given a company handle, return data about company.
     *
     * Returns { handle, name, description, numEmployees, logoUrl, jobs }
     *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
     *
     * Throws NotFoundError if not found.
     **/
    static async get(handle) {
        const { rows: companyRes } = await db.query(`
            SELECT handle,
                   name,
                   description,
                   num_employees AS "numEmployees",
                   logo_url AS "logoUrl"
            FROM companies
            WHERE handle = $1
        `, [ handle ]);

        if (!companyRes.length)
            throw new NotFoundError(`No company: ${handle}`);

        return companyRes[0];
    }

    /** Update company data with `data`.
     *
     * This is a "partial update" --- it's fine if data doesn't contain all the
     * fields; this only changes provided ones.
     *
     * Data can include: { name, description, numEmployees, logoUrl }
     *
     * Returns { handle, name, description, numEmployees, logoUrl }
     *
     * Throws NotFoundError if not found.
     */
    static async update(handle, data) {
        const { setCols, values } = sqlForPartialUpdate(data, {
            numEmployees: "num_employees",
            logoUrl:      "logo_url",
        });
        const handleVarIdx = "$" + (values.length + 1);

        const querySql = `
            UPDATE companies 
            SET ${setCols} 
            WHERE handle = ${handleVarIdx} 
            RETURNING handle, 
                      name, 
                      description, 
                      num_employees AS "numEmployees", 
                      logo_url AS "logoUrl"
        `;
        const { rows: company } = await db.query(querySql, [...values, handle]);

        if (!company.length)
            throw new NotFoundError(`No company: ${handle}`);

        return company[0];
    }

    /** Delete given company from database; returns undefined.
     *
     * Throws NotFoundError if not found.
     **/
    static async remove(handle) {
        const { rows: { length } } = await db.query(`
            DELETE FROM companies
            WHERE handle = $1
            RETURNING handle
        `, [ handle ]);

        if (!length)
            throw new NotFoundError(`No company: ${handle}`);
    }
}

module.exports = Company;
