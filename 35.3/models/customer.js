/** Customer for Lunchly */

const db = require("../db");
const ExpressError = require("../expressError");

const Reservation = require("./reservation");

/** Customer of the restaurant. */

class Customer {
    constructor({ id, firstName, lastName, phone, notes }) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.notes = notes;
    }

    set notes(value) {
        this._notes = value || "";
    }
    get notes() {
        return this._notes;
    }

    set phone(value) {
        this._phone = value || null;
    }
    get phone() {
        return this._phone;
    }

    /**
     * Retrives the last name as a string.
     */
    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }

    /** find all customers. */

    static async all() {
        const { rows: data } = await db.query(
            `SELECT id, 
                    first_name AS "firstName",  
                    last_name AS "lastName", 
                    phone, 
                    notes
            FROM customers
            ORDER BY last_name, first_name`
        );
        return data.map(c => new Customer(c));
    }

    /** get a customer by ID. */

    static async get(id) {
        const { rows: data } = await db.query(
           `SELECT id, 
                   first_name AS "firstName",
                   last_name AS "lastName",
                   phone,
                   notes
            FROM customers
            WHERE id = $1
            `,
            [ id ]
        );

        const customer = data[0];
        if (!customer)
            throw new ExpressError(`No such customer: ${id}.`, 404);
        else
            return new Customer(customer);
    }

    /** get all reservations for this customer. */

    async getReservations() {
        return await Reservation.getReservationsForCustomer(this.id);
    }

    /** save this customer. */

    async save() {
        if (this.id === undefined) {
            const result = await db.query(
                `INSERT INTO customers (first_name, last_name, phone, notes)
                    VALUES ($1, $2, $3, $4)
                    RETURNING id`,
                [this.firstName, this.lastName, this.phone, this.notes]
            );
        this.id = result.rows[0].id;
        } else {
            await db.query(
                `UPDATE customers SET first_name=$1, last_name=$2, phone=$3, notes=$4
                    WHERE id=$5`,
                [this.firstName, this.lastName, this.phone, this.notes, this.id]
            );
        }
    }
}

module.exports = Customer;
