/** Database setup for BizTime. */

const { Client } = require("pg");
const { env } = require("process");

let DB_URI = env.DATABASE_URL || "postgresql:///biztime";
if (env.NODE_ENV === "test")
    DB_URI += "_test";

const db = new Client({ connectionString: DB_URI });
db.connect();

module.exports = db;
