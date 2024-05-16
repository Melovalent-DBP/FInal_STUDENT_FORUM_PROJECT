// exports.register = (req, res) => {
//     console.log(req.body);
//     res.send("Form Submitted Successfully");
// }


const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

exports.register = (req, res) => {
    upload.single('avatar')(req, res, function(err) {
        if (err) {
            // An error occurred when uploading
            console.error(err);
            res.status(500).send("Error uploading file");
        } else {
            // Everything went fine
            console.log(req.file); // Information about the uploaded file
            console.log(req.body); // The text fields from the form
            res.send("Form Submitted Successfully");
        }
    });
}