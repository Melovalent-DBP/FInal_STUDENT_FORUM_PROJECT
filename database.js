var mysql = require("mysql");
require('dotenv').config();
//console.log(process.env);  //It shows the environment variables

var connection = mysql.createConnection({
    host: process.env.DATABASE_HOST,  
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

connection.connect(function(error){
    if(error) throw error;
    console.log("connected to the MySQL database");
});

//DBP_NOTES This means exporting the connection object so that it can be used in other files
module.exports = connection;


// var mysql = require("mysql2/promise");
// require('dotenv').config();
// //console.log(process.env);

// var connection = mysql.createConnection({
//     host: process.env.DATABASE_HOST,  
//     user: process.env.DATABASE_USER,
//     password: process.env.DATABASE_PASSWORD,
//     database: process.env.DATABASE
// });

// connection.connect(function(error){
//     .then
//     console.log("connected to the MySQL database");
// });

// //DBP_NOTES This means exporting the connection object so that it can be used in other files
// module.exports = connection;