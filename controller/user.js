//const fs =  require("fs");
//const data = JSON.parse(fs.readFileSync("data.json", "utf-8"));
//const users = data.users;



exports.login = (req, res) => {
  res.render("login");
};

exports.register = (req, res) => {
  res.render("register");
};

//DBP_NOTES Create [Post]

// exports.addUser = (req, res) => {
//     console.log(req.body); //DBP_HIGHLIGHTES This will show the post data in the console
//     users.push(req.body);
//     res.status(201).json(req.body); 
//   }



// //DBP_NOTES Read [Get]
// exports.getAllUser =  (req, res) => {
//     //DBP_NOTES
//     console.log(req.params);
//     res.json(users);
//     }




// exports.getSpecificUser = (req,res) => {
//     const id = +req.params.id ; //DBP_NOTES This is how we get the parameter
//     const Specific_User = users.find(p=> p.id === id ) ;
//     console.log(Specific_User.id);
//     res.json(Specific_User);
//  }





// //DBP_NOTES Update [Put] , OVERWRITING THE WHOLE OBJECT

// exports.updateUser = (req, res) => {
//     const id = +req.params.id; 
//     const Specific_ProductIndex = users.findIndex((p) => p.id === id);
    
//     //DBP_NOTES fomat : array.splice(index, howmany, item1, ....., itemX)
//     users.splice(Specific_ProductIndex, 1, {...req.body, id: id});  //the format means that we are replacing the product at the index with the new product
//       res.status(201).json({product: 'updated'});
//   }




// //DBP_NOTES Patch [Patch] , Just updating the specific fields , not the whole object

// exports.ReplaceUser = (req, res) => {
//   const id = +req.params.id; 
//   const Specific_ProductIndex = users.findIndex((p) => p.id === id);
  
//   //DBP_NOTES fomat : array.splice(index, howmany, item1, ....., itemX)
//   const OldProduct = users[Specific_ProductIndex];
//   users.splice(Specific_ProductIndex, 1, {...OldProduct,...req.body});  //the format means that we are replacing the product at the index with the new product
//     res.status(201).json({product: 'updated'});
// }




// //DBP_NOTES delete DELETE
// exports.DeleteUser = (req, res) => {
//   const id = +req.params.id; 
//   const Specific_ProductIndex = users.findIndex((p) => p.id === id);

//   //DBP_NOTES fomat : array.splice(index, howmany, item1, ....., itemX)
//   const OldProduct = users[Specific_ProductIndex];
//   users.splice(Specific_ProductIndex, 1);  //the format means that we are replacing the product at the index with the new product
//     res.status(204).json({product: 'deleted'});
// }