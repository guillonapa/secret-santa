const Pool = require('pg').Pool;
const ENV = process.env;
const pool = new Pool({
    user: ENV.DB_USER,
    host: ENV.DB_HOST,
    database: ENV.DB_DB,
    password: ENV.DB_PW,
    port: ENV.DB_PORT
});

console.log("in db/index.js");


module.exports = {
    query: (text, params) => pool.query(text, params)
};