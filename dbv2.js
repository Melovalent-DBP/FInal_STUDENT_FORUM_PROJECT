var mysql = require("mysql2/promise");
require('dotenv').config();

var db = () => mysql.createConnection({
    host: process.env.DATABASE_HOST,  
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
})
.then((connection) => {
    console.log("connected to the MySQL2 database");
    return connection;
})
.catch((error) => {
    throw error;
});

module.exports = db ;