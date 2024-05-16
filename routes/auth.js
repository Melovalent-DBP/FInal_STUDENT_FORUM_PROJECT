/** @format */

require("dotenv").config();

var express = require("express"),
  server = express(), // Create an instance of Express
  Connection = require("./database"),
  passwordHash = require("password-hash");



//Handling Routes
const authRouter = require("./routes/auth");

const db = require('./dbv2.js');

const path = require("path"); //DBP_HIGHLIGHTES This is used to get the path of the file

const morgan = require("morgan"); //DBP_HIGHLIGHTES This is used to log the request in the console

const multer = require("multer"); //DBP_HIGHLIGHTES This is used to upload the files

const session = require("express-session"); //DBP_HIGHLIGHTES This is used to create the session

const methodOverride = require('method-override');   //DBP_HIGHLIGHTES This is used to override the method of the form , like put , delete , patch etc .

const fs = require("fs");
const { title } = require("process");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/data/uploads/");
  },
  filename: function (req, file, cb) {
    //DBP_HIGHLIGHTES This is used to give the name to the file
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

// //Third-Pary Middleware
// //req -> middleware -> res
// //DBP_NOTES This is how middleware works

// const bodyParser = require('body-parser'); //DBP_HIGHLIGHTES This is used to parse the body of the request
// server.use(bodyParser.urlencoded({ extended: true })); //DBP_NOTES This is used to parse the form data that is sent from the client side
// server.use(express.static('public'));

Connection.ping(function (error, results) {
  if (error) throw error;
  console.log(results);
});

//server.use(morgan("dev"));
// const auth = (req , res , next) => {
//     console.log(req.query);
//     if(req.query.password == '625'){
//         next();
//     }
//     else{
//         res.sendStatus('401');
//     }
// }

//const publicDirectory = path.join(__dirname, './public');

//server.use(morgan("dev"));
server.use(express.static("./public"));
server.use(express.static("./public/data/uploads"));
server.use(express.static(path.join(__dirname, "public")));
server.use(methodOverride('_method'));

//DBP_HIGHLIGHTES Parsing URL-encoded bodies (as sent by HTML forms)
server.set("view engine", "ejs");
server.set("views", path.join(__dirname, "views"));

server.use(express.urlencoded({ extended: true }));
server.use(express.json());

//const userRouter = require("./routes/pages");
// const authRouter = require("./routes/auth");

//server.use(fileupload());

//server.use('/', userRouter);
//server.use('/', authRouter);

server.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false, // resave false means that the session will not be saved on every request but only when the session data is modified
    saveUninitialized: false,
    //DBP_NOTES saveUninitialized false means that the session will not be saved on every request but only when the session data is modified
  })
);



module.exports = authRouter ;