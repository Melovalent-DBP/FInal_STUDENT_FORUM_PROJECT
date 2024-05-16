exports.addUser =  (req, res) => {
    
    //DBP_NOTES It is used to get the parameters of the form data
    console.log(req.params);

    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;
    var avatar = req.body.avatar;
    var about = req.body.about;

    //DBP_NOTES Now pass this data to the database
     
      var data = {
        "name": name,
        "email": email,
        "username": username,
        "password": password,
        "password2": password2,
        "avatar": avatar,
        "about": about
      }

      db.collection('users').insertOne(data,(err, collection) =>{ 
          if(err) {
            throw err;
          }
          console.log("Record inserted Successfully");
      });

      res.redirect('signup_success.html');
}