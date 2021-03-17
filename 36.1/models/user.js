/** User class for message.ly */

const { compare: hashCmp, hash } = require("bcrypt");

const db = require('../db');
const { BCRYPT_WORK_FACTOR } = require('../config');

const ExpressError = require("../expressError");

/** User of the site. */
class User {
    /**
     * Constructs a new User.
     * 
     * @param {{
     *      username: string,
     *      password: string?,
     *      firstName: string,
     *      lastName: string,
     *      phone: string,
     *      joinAt: Date,
     *      lastLoginAt: Date?
     * }} data Data to initialize this user with.
     */
    constructor({
        username,
        password = null,
        firstName,
        lastName,
        phone,
        joinAt = new Date(),
        lastLoginAt = null
    }) {
        this.username    = username;
        this.password    = password;
        this.firstName   = firstName;
        this.lastName    = lastName;
        this.phone       = phone;
        
        this._joinAt = joinAt;
        this._lastLoginAt = lastLoginAt;
        
        this._saved = false;
        this.__username = username;
    }

    get username() {
        return this._username;
    }
    set username(value) {
        if (this._password === null)
            throw new ExpressError("Insufficient credentials.", 401);
        else if (typeof(value) !== 'string')
            throw new Error(`Expected string; got ${typeof(value)}.`);
        else
            this._username = value;
    }

    get password() {
        return this._password;
    }
    set password(value) {
        if (this._password === null) {
            throw new ExpressError("Insufficient credentials.", 401);
        } else if (typeof(value) !== 'string') {
            throw new Error(`Expected string; got ${typeof(value)}.`);
        } else if (value !== this._password) {
            this._password = value;

            hash(value, BCRYPT_WORK_FACTOR).then((hash) => {
                if (this._password === value)
                    this._passwordHash = hash;
            });
        }
    }

    get firstName() {
        return this._firstName;
    }
    set firstName(value) {
        if (this._password === null)
            throw new ExpressError("Insufficient credentials.", 401);
        else if (typeof(value) !== 'string')
            throw new Error(`Expected string; got ${typeof(value)}.`);
        else
            this._firstName = value;
    }

    get lastName() {
        return this._lastName;
    }
    set lastName(value) {
        if (this._password === null)
            throw new ExpressError("Insufficient credentials.", 401);
        else if (typeof(value) !== 'string')
            throw new Error(`Expected string; got ${typeof(value)}.`);
        else
            this._lastName = value;
    }

    get phone() {
        return this._phone;
    }
    set phone(value) {
        if (this._password === null)
            throw new ExpressError("Insufficient credentials.", 401);
        else if (typeof(value) !== 'string')
            throw new Error(`Expected string; got ${typeof(value)}.`);
        else if (!value.match(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/))
            throw new Error("phone must match phone number format.");
        else
            this._phone = value;
    }

    get joinAt() {
        return this._joinAt;
    }

    get lastLoginAt() {
        return this._lastLoginAt;
    }
    
    /** Updates this user's log in timestamp. */
    async updateLoginTimestamp() {
        this._lastLoginAt = new Date();

        if (!this._saved) {
            await this.save();
        } else {
            await db.query(`
                UPDATE users
                SET last_login_at = $2
                WHERE username    = $1
            `, [
                this.__username,
                this.lastLoginAt
            ]);
        }
    }

    /** Return messages from this user.
     *
     * [{id, to_user, body, sent_at, read_at}]
     *
     * where to_user is
     *   {username, first_name, last_name, phone}
     */
    async getSentMessages() {
        if (this._password === null)
            throw new ExpressError("Insufficient credentials.", 401);

        const { rows: [ messages ] } = await db.query(`
            SELECT messages.id,
                   messages.to_username AS username,
                   messages.body,
                   messages.sent_at,
                   messages.read_at,
                   users.first_name     AS firstName,
                   users.last_name      AS lastName,
                   users.phone          AS phone,
                   users.join_at        AS joinAt,
                   users.last_login_at  AS lastLoginAt,
            JOIN users ON (users.username = messages.to_username)
            FROM messages
            WHERE messages.from_username = $1
        `, [ this.username ]);
        
        return messages.map(({
            id,
            body,
            sent_at,
            read_at,
            ...to_user
        }) => ({
            id, body, sent_at, read_at, to_user
        }));
    }

    /** Return messages to this user.
     *
     * [{id, from_user, body, sent_at, read_at}]
     *
     * where from_user is
     *   {id, first_name, last_name, phone}
     */
    async getReceivedMessages() {
        if (this._password === null)
            throw new ExpressError("Insufficient credentials.", 401);
        
        const { rows: [ messages ] } = await db.query(`
            SELECT messages.id,
                   messages.from_username AS username,
                   messages.body,
                   messages.sent_at,
                   messages.read_at,
                   users.first_name,
                   users.last_name,
                   users.phone,
                   users.join_at,
                   users.last_login_at,
            JOIN users ON (users.username = messages.from_username)
            FROM messages
            WHERE messages.to_username = $1
        `, [ this.username ]);
        
        return messages.map(({
            id,
            body,
            sent_at,
            read_at,
            ...from_user
        }) => ({
            id, body, sent_at, read_at, from_user
        }));
    }

    /** First/last full name separated by space. */
    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }

    /** Commits this user's data to the database. */
    async save() {
        if (this._password === null)
            throw new ExpressError("Insufficient credentials.", 401);
        
        if (this._saved) {
            await db.query(`
                UPDATE users
                SET username   = $2,
                    password   = $3,
                    first_name = $4,
                    last_name  = $5,
                    phone      = $6
                WHERE username = $1
            `, [
                this.__username,
                this.username,
                this._passwordHash,
                this.firstName,
                this.lastName,
                this.phone
            ]);
        } else {
            await db.query(`
                INSERT INTO users
                VALUES (
                    $1, $2, $3, $4, $5, $6, $7
                )
                RETURNING username
            `, [
                this.username,
                this._passwordHash,
                this.firstName,
                this.lastName,
                this.phone,
                this.joinAt,
                this.lastLoginAt
            ]);
            this._saved = true;
        }

        this.__username = this.username;
    }

    /** register new user -- returns
     *    {username, password, first_name, last_name, phone}
     */
    static async register({
        username,
        password,
        first_name: firstName,
        last_name: lastName,
        phone
    }) {
        const newUser = new User({ username, password, firstName, lastName, phone });
        await newUser.save();

        return {
            username: newUser.username,
            password: newUser.password
        };
    }

    /** Authenticate: is this username/password valid? Returns authenticated User on success. */
    static async authenticate(username, password) {
        const { rows: data } = await db.query(
            "SELECT * FROM users WHERE username = $1",
            [ username ]
        );

        if (!data.length)
            throw new ExpressError(`No such user: "${username}."`, 404);
        
        if (!await hashCmp(password, data.password))
            throw new ExpressError("Insufficient credentials.", 401);

        const uData = data[0];
        const newUser = new User({
            username:  uData.username,
            password:  password,
            firstName: uData.first_name,
            lastName:  uData.last_name,
            phone:     uData.phone,
            joinAt:    uData.join_at,
            lastLoginAt: uData.last_log_in
        });
        newUser._saved = true;

        return newUser;
    }

    /** All: basic info on all users:
     * [{username, first_name, last_name, phone}, ...] */
    static async all() {
        const { rows: users } = await db.query(`
            SELECT username,
                   first_name,
                   last_name,
                   phone
            FROM users
        `);
        return users;
    }

    /** Get: get user by username
     *
     * returns {username,
     *          first_name,
     *          last_name,
     *          phone,
     *          join_at,
     *          last_login_at } */
    static async get(username) {
        const { rows: data } = await db.query(`
            SELECT username,
                   first_name    AS firstName,
                   last_name     AS lastName,
                   phone,
                   join_at       AS joinAt,
                   last_login_at AS lastLoginAtAt
            FROM users
            WHERE username = $1
        `, [ username ]);

        if (!data.length)
            throw new ExpressError(`No such user: "${username}."`, 404);
        
        const newUser = new User(data[0]);
        newUser._saved = true;
        return newUser;
    }
}


module.exports = User;
