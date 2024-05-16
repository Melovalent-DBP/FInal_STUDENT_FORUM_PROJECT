const express = require("express");

//DBP_HIGHLIGHTES here ../ because routes foldern is one level down from the controller folder
const userController = require("../controller/user"); 
const router = express.Router();
//const verify = require('../index.js');

//DBP_NOTES Making independent routes

router //DBP_NOTES exporting the router object twice 
  .post('/', verify, userController.addUser)
  .get('/', verify , userController.getAllUser)
  .get('/:id', verify , userController.getSpecificUser) //DBP_HIGHLIGHTES Here route is dependent on product id
  .put('/:id', verify, userController.updateUser)
  .patch('/:id', verify , userController.ReplaceUser)
  .delete('/:id', verify , userController.DeleteUser);  

exports.router = router; //DBP_HIGHLIGHTES it means export the router object