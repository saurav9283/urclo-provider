const mysql = require('mysql');
require('dotenv').config();

const pool = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

pool.connect((err) => {
    if(err) {
        console.log(err);
        return;
    } else {
        console.log("Database connected successfully");
    }
});

module.exports = pool;