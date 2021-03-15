/** Reservation for Lunchly */

const moment = require("moment");

const db = require("../db");
const ExpressError = require("../expressError");

/** A reservation for a party */

class Reservation {
    constructor({id, customerId, numGuests, startAt, notes}) {
        this.id = id;
        this.customerId = customerId;
        this.numGuests = numGuests;
        this.startAt = startAt;
        this.notes = notes;
    }

    set numGuests(count) {
        if (count < 1)
            throw new Error("Cannot have less than 1 guest.");
        
        this._numGuests = val;
    }
    get numGuests() {
        return this._numGuests;
    }

    set startAt(date) {
        if (date instanceof Date && !isNaN(date))
            this._startAt = date;
        else
            throw new Error("Not a valid startAt date.");
    }
    get startAt() {
        return this._startAt;
    }

    formattedStartAt() {
        return moment(this.startAt).format('MMMM Do YYYY, h:mm a');
    }

    /**
     * Finds reservations for a given customer ID.
     * 
     * @param {Number} customerId ID of the customer to find reservations for.
     * 
     * @returns List of reservations.
     */
    static async getReservationsForCustomer(customerId) {
        const { rows: data } = await db.query(
           `SELECT id, 
                   customer_id AS "customerId", 
                   num_guests AS "numGuests", 
                   start_at AS "startAt", 
                   notes
            FROM reservations 
            WHERE customer_id = $1
            `,
            [ customerId ]
        );

        return data.map((reservation) => new Reservation(reservation));
    }

    /**
     * Gets a reservation from an ID.
     * 
     * @param {Number} id Reservation ID.
     */
    static async get(id) {
        const { rows: data } = await db.query(
           `SELECT id,
                   customer_id AS "customerId", 
                   num_guests AS "numGuests", 
                   start_at AS "startAt", 
                   notes
            FROM reservations
            WHERE id = $1
            ` ,
            [ id ]
        );

        const reservation = data[0];
        if (!reservation)
            throw new ExpressError(404, `No such reservation: ${id}.`);
        else
            return new Reservation(reservation);
    }

    /**
     * Synchronizes this object's data to the database.
     */
    async save() {
        if (this.id === undefined) /* insert */ {
            const { rows: [ { id } ] } = await db.query(
               `INSERT INTO reservations VALUES
                    ($1, $2, $3, $4)
                RETURNING id
                `,
                [ this.customerId, this.numGuests, this.startAt, this.notes ]
            );
            this.id = id;
        } else /* update */ {
            await db.query(
                `UPDATE reservations
                 SET
                    num_guests = $1,
                    start_at   = $2,
                    notes      = $3
                 WHERE id = $4
                 `,
                 [ this.numGuests, this.startAt, this.notes, this.id ]
             );
        }
    }
}

module.exports = Reservation;
