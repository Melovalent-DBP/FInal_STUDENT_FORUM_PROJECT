/** @format */

require("dotenv").config();

var express = require("express"),
  server = express(), // Create an instance of Express
  Connection = require("./database"),
  passwordHash = require("password-hash");



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

server.use(morgan("dev"));
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

//const promisePool = pool.promise();
//DBP_NOTES
//The promise() function is used to get a Promise-based interface from the MySQL connection pool. This allows you to use async/await syntax with your database queries, which can make your code easier to read and write.

//DBP_NOTES This is how we can use the middleware of express to serve the static files
/*

DBP_HIGHLIGHTES Old approach of by using mysql , problem is callback hell error

server.get("/", (req, res) => {
  // Execute the query
  Connection.query(
    `
        SELECT topics.id AS id, topics.title AS title,
        topics.category AS category, topics.user_name AS user_name,
        topics.user_image AS user_image, topics.created_at AS created_at,
        COUNT(replies.topic_id) AS count_replies
        FROM topics LEFT JOIN replies ON topics.id = replies.topic_id GROUP BY(topics.id)
      `,
    (err, rows) => {
      if (err) {
        console.error(err.message);
        res.status(500).send("An error occurred while fetching topics");
        return;
      }
      console.log(rows);
      // Render the EJS template with the topics data and the username from the session
      res.render("Auth/index", {
        username: req.session.username,
        topics: rows,
        name: req.session.name,
        avatar: req.session.avatar,
      });
    }
  );

  //DBP_NOTES username: req.session.username means that we are passing the username to the index.ejs file from the session
});
*/

server.get("/" , async(req,res) => {
  try{
    const sql = `SELECT topics.id AS id, topics.title AS title,
    topics.category AS category, topics.user_name AS user_name,
    topics.user_image AS user_image, topics.created_at AS created_at,
    COUNT(replies.topic_id) AS count_replies
    FROM topics LEFT JOIN replies ON topics.id = replies.topic_id GROUP BY(topics.id)`;


    const connection = await db() ;
    const [rows] = await connection.query(sql);


    const sql2 = "SELECT COUNT(*) AS count_all_topic FROM topics" ;
    const [countAllTopics] = await connection.query(sql2);


    const sql3 = `SELECT categories.id AS id, categories.name AS name,
    COUNT(topics.category) AS count_category FROM categories LEFT JOIN topics ON
    categories.name = topics.category GROUP BY name`;
    const [categories] = await connection.query(sql3) ;

    const sql_usercnt = "SELECT COUNT(*) AS user_cnt FROM users";
    const [user_cnt] = await connection.query(sql_usercnt);

    const categorycntsql = "SELECT COUNT(*) AS categorycnt FROM categories";
    const [cat_cnt] = await connection.query(categorycntsql);


    res.render("Auth/index", {
      username: req.session.username,
      topics: rows,
      name: req.session.name,
      avatar: req.session.avatar,
      count_all_topic: countAllTopics[0].count_all_topic,
      categories: categories,
      user_cnt: user_cnt[0].user_cnt,
      category_cnt: cat_cnt[0].categorycnt
    });
  } catch(err) {
    console.error(err.message) ;
    res.status(500).send("An error occurred while fetching topics");
  }
});



server.get("/category/:title" , async(req,res) => {
  try{
    const title = req.params.title ;
    const sql = `SELECT topics.id AS id, topics.title AS title, topics.user_name AS user_name,
    topics.user_image AS user_image, topics.created_at AS created_at, COUNT(replies.topic_id) AS count_replies
    FROM topics LEFT JOIN replies ON topics.id = replies.topic_id
    WHERE topics.category = ?
    GROUP BY topics.id`;

    const connection = await db();
    const [rows] = await connection.query(sql , [title]);


    const sql2 = "SELECT COUNT(*) AS count_all_topic FROM topics" ;
    const [countAllTopics] = await connection.query(sql2);


    
  const sql3 = `SELECT categories.id AS id, categories.name AS name,
  COUNT(topics.category) AS count_category FROM categories LEFT JOIN topics ON
  categories.name = topics.category GROUP BY name`;
  const [categories] = await connection.query(sql3) ;


  const sql_usercnt = "SELECT COUNT(*) AS user_cnt FROM users";
  const [user_cnt] = await connection.query(sql_usercnt);

  const categorycntsql = "SELECT COUNT(*) AS categorycnt FROM categories";
  const [cat_cnt] = await connection.query(categorycntsql);


    res.render("categories/showcategory", {
      username: req.session.username,
      topics: rows,
      name: req.session.name,
      avatar: req.session.avatar,
      count_all_topic: countAllTopics[0].count_all_topic,
      categories: categories,
      title: title,
      user_cnt: user_cnt[0].user_cnt,
      category_cnt: cat_cnt[0].categorycnt

    });
  }
    catch(err) {
      console.error(err.message) ;
      res.status(500).send("An error occurred while fetching topics");
    }
});




// server.get("/login", (req, res) => {
//   res.render("Auth/login",{
//     name: req.session.name,
//     username: req.session.username,
//     avatar: req.session.avatar,
//   });
// });


server.get("/login" , async(req,res) => {

  try{


    const sql = `SELECT topics.id AS id, topics.title AS title,
    topics.category AS category, topics.user_name AS user_name,
    topics.user_image AS user_image, topics.created_at AS created_at,
    COUNT(replies.topic_id) AS count_replies
    FROM topics LEFT JOIN replies ON topics.id = replies.topic_id GROUP BY(topics.id)`;


    const connection = await db() ;
    const [rows] = await connection.query(sql);

    const sql2 = "SELECT COUNT(*) AS count_all_topic FROM topics" ;

    const [countAllTopics] = await connection.query(sql2);


    const sql3 = `SELECT categories.id AS id, categories.name AS name,
    COUNT(topics.category) AS count_category FROM categories LEFT JOIN topics ON
    categories.name = topics.category GROUP BY name`;
    const [categories] = await connection.query(sql3) ;

    const sql_usercnt = "SELECT COUNT(*) AS user_cnt FROM users";
    const [user_cnt] = await connection.query(sql_usercnt);

    const categorycntsql = "SELECT COUNT(*) AS categorycnt FROM categories";
    const [cat_cnt] = await connection.query(categorycntsql);

    res.render("Auth/login", {
      username: req.session.username,
      topics: rows,
      name: req.session.name,
      avatar: req.session.avatar,
      count_all_topic: countAllTopics[0].count_all_topic,
      categories: categories,
      user_cnt: user_cnt[0].user_cnt,
      category_cnt: cat_cnt[0].categorycnt
    });
  } catch(err) {
    console.error(err.message) ;
    res.status(500).send("An error occurred while fetching topics");
  }
});

server.post("/login", (req, res) => {
  const { email, password } = req.body; //DBP_NOTES
  /*const user = {
  email: 'user@example.com',
  username: 'user123'
}
// is similar to storing the user data in const { email, username } = user where email will be 'user@example.com' and username will be 'user123'.
*/
  if (!email || !password) {
    return res.send(
      "<script>alert('Email or password cannot be empty');window.location.href = '/login';</script>"
    );
  } //DBP_NOTES This is how we can check if the email or password is empty

  const sql = "SELECT * FROM users WHERE email = ?";
  
  //DBP_NOTES
  //SELECT * FROM users WHERE email = ?
  //  results should be an array of objects
  //like :
  /*
[
  {
    id: 1,
    email: 'user@example.com',
    password: 'hashedpassword'
  }
]
*/

  Connection.query(sql, [email], (err, results) => {
    if (err) throw err;

    if (results.length > 0) {
      if (passwordHash.verify(password, results[0].password)) {
        req.session.username = results[0].username;
        req.session.user_id = results[0].id;
        req.session.email = results[0].email;
        req.session.name = results[0].name;
        req.session.avatar = results[0].avatar;
        //DBP_NOTES
        //req.session.user = results[0];
        //If the password is correct,
        //it stores the user's data in the session.
        //This will keep the user logged in across multiple requests.
        res.send(
          "<script>alert('Logged in Successfully');window.location.href = '/';</script>"
        );
      } else {
        res.send(
          "<script>alert('Incorrect email or password');window.location.href = '/login';</script>"
        );
      }
    }
  });
});



server.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.send(
      "<script>alert('Logged Out Successfully');window.location.href = '/';</script>"
    );
  });
});


// server.get("/updateuser" , (req,res) => {

//   try{
//     const sql = `UPDATE categories `
//   }

//   res.render("user/UpdateUser", {
//     name: req.session.name,
//     username: req.session.username,
//     avatar: req.session.avatar,
//   });
// });



// server.get("/register", (req, res) => {
//   //let messages = req.flash("success");
//   // res.render("register", { message: messages.length > 0 ? messages[0] : null });

//   const formData = req.session.formData ;
//   req.session.formData = null; //DBP_NOTES  Clear the session data
//   res.render("Auth/register",{
//     name: req.session.name,
//     username: req.session.username,
//     avatar: req.session.avatar,
//     formData: formData, //DBP_HIGHLIGHTES This is how we can pass the data from the session to the register.ejs file
//   });
// });



server.get("/register", async(req,res) => {
  try{
    
    const sql = `SELECT topics.id AS id, topics.title AS title,
    topics.category AS category, topics.user_name AS user_name,
    topics.user_image AS user_image, topics.created_at AS created_at,
    COUNT(replies.topic_id) AS count_replies
    FROM topics LEFT JOIN replies ON topics.id = replies.topic_id GROUP BY(topics.id)`;


    const connection = await db() ;
    const [rows] = await connection.query(sql);


    const sql2 = "SELECT COUNT(*) AS count_all_topic FROM topics" ;
    const [countAllTopics] = await connection.query(sql2);


    const sql3 = `SELECT categories.id AS id, categories.name AS name,
    COUNT(topics.category) AS count_category FROM categories LEFT JOIN topics ON
    categories.name = topics.category GROUP BY name`;
    const [categories] = await connection.query(sql3) ;

    const sql_usercnt = "SELECT COUNT(*) AS user_cnt FROM users";
    const [user_cnt] = await connection.query(sql_usercnt);

    const categorycntsql = "SELECT COUNT(*) AS categorycnt FROM categories";
    const [cat_cnt] = await connection.query(categorycntsql);








   const formData = req.session.formData ;
   req.session.formData = null; //DBP_NOTES  Clear the session data


   res.render("Auth/register", {
    username: req.session.username,
    topics: rows,
    name: req.session.name,
    avatar: req.session.avatar,
    count_all_topic: countAllTopics[0].count_all_topic,
    categories: categories,
    user_cnt: user_cnt[0].user_cnt,
    category_cnt: cat_cnt[0].categorycnt,
    formData: formData, //DBP_HIGHLIGHTES This is how we can pass the data from the session to the register.ejs file
  });
} catch(err) {
  console.error(err.message) ;
  res.status(500).send("An error occurred while fetching topics");
}
});





server.post("/register", upload.single("avatar"), function (req, res) {
  // req.file is the name of your file in the form above, here 'uploaded_file'
  // req.body will hold the text fields, if there were any
  if (req.body.password !== req.body.confirm_password) {
    req.session.formData = req.body; //DBP_NOTES This is how we can store the data in the session so that we can redeclare the data in the register.ejs file
    
    
    
    /*
      
    DBP_HIGHLIGHTES


    The error "Cannot set headers after they are sent to the client" 
    typically occurs when you're trying to send a response more than once. 
    In your case, it's possible that after sending the response 
    when the passwords do not match, 
    your code is still continuing to execute and trying to send another response.

    To fix this, 
    you should return after sending the response 
    when the passwords do not match. 
    This will stop the execution of the rest of the code 
    in your route handler. Here's how you can do it:


     return res.send(
      "<script>alert('Password...................

    */
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    return res.send(
      "<script>alert('Password does not match');window.location.href = '/register';</script>"
    );
  }
  const image = fs.readFileSync(req.file.path);
  //const encode_image = image.toString("base64");
  const imageType = req.file.mimetype;
  const imagePath = req.file.path;
  const imageName = req.file.originalname;


  const modifiedimage = imagePath.replace('public\\', '').replace(/\\/g, '/');

  console.log(req.file, req.body.name);

  var hashedPassword = passwordHash.generate(req.body.password);


  const checkSql = "SELECT * FROM users WHERE email = ? OR username = ?";
  Connection.query(checkSql, [req.body.email, req.body.username], (err, results) => {
    if(err) throw err;

    if(results.length > 0) {
      //DBP_NOTES If the email or username already exists

      let message = "Username already taken";

      if(results[0].email === req.body.email) {
        message = "Email already taken";
      }
      return res.send(
        `<script>alert('${message}');window.location.href = '/register';</script>`
      );
    } else {
  
  const sql =
    "INSERT INTO users (name, email, username, password, about, avatar, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)";
  const values = [
    req.body.name,
    req.body.email,
    req.body.username,
    // req.body.password,
    hashedPassword,
    req.body.about,
    modifiedimage,
    new Date(),
  ];

  Connection.query(sql, values, (err, result) => {
    if (err) throw err;
    console.log("Record inserted:", result);
  });
  res.send(
    "<script>alert('Registered Successfully');window.location.href = '/login';</script>"
  );
}
  });
});







server.get("/topic", (req, res) => {

  const sql = "SELECT * FROM username = ?";
  
  res.render("topics/topic", {
    name: req.session.name,
    username: req.session.username,
    avatar: req.session.avatar,
  });
});

//topictitle comes from index.ejs
// server.get("/showtopic/:title", (req, res) => {
//   //DBP_NOTES /showtopic/:title is a route parameter which means that we can access the title from the URL

//   const sql = "SELECT * FROM topics WHERE title = ?";

//   //DBP_NOTES now our goal is to fetch the title from index,ejs ,  we can do it by using req.params.title
//   const title = req.params.title;
//   Connection.query(sql, [title], (err, results) => {
//     if (err) {
//       console.error(err);
//       return res.send(
//         '<script>alert("An error occurred");window.location.href = "/";</script>'
//       );
//     }

//     console.log(results);
//     if (results.length > 0) {
//       // Store the values in separate variables
//       const topic = {
//         id: results[0].id,
//         title: results[0].title,
//         category: results[0].category,
//         body: results[0].body,
//         created_at: results[0].created_at,
//         user_name: results[0].user_name,
//       };

//       const sql2 =
//         "SELECT COUNT(*) AS count_topics FROM topics WHERE user_name = ?";
//       Connection.query(sql2, topic.user_name, (err, results) => {
//         if (err) {
//           console.error(err);
//           return res.send(
//             '<script>alert("An error occurred");window.location.href = "/";</script>'
//           );
//         }



//         // Render the EJS template with the topics data and the username from the session
//         res.render("showtopic", {
//           topic: topic,
//           name: req.session.name,
//           avatar: req.session.avatar,
//           count_topics: results[0].count_topics,
//         });
//       });
//     }
//   });
// });




server.post("/topic", (req, res) => {
  if (
    !req.session.name ||
    !req.session.avatar ||
    (!req.session.username && !req.session.email)
  ) {
    return res.send(
      "<script>alert('Please Login Before creating a topic');window.location.href = '/';</script>"
    );
  }
  if (!req.body.title || !req.body.category || !req.body.body) {
    return res.send(
      "<script>alert('Please fill all the fields');window.location.href = '/topic';</script>"
    );
  }
  const sql =
    "INSERT INTO topics(title , category , body , user_name , user_image , created_at) VALUES (?, ?, ?, ?, ?, ?)";
  const values = [
    req.body.title,
    req.body.category,
    req.body.body,
    req.session.username,
    req.session.avatar,
    new Date(),
  ];
  Connection.query(sql, values, (err, result) => {
    if (err) throw err;

    //DBP_NOTES Storing the topic parameters in the session
    (req.session.title = req.body.title),
      (req.session.catergory = req.body.category),
      (req.session.body = req.body.body),
      res.send(
        "<script>alert('Topic Created Successfully');window.location.href = '/';</script>"
      );
  });
});




//DBP_HIGHLIGHTES here /:title is the route parameter which means that we can access the title from the URL , or by clicking the title , it will go to the url.
//DBP_NOTES here showtopic handles the data fetch from reply and topic table.
server.get("/showtopic/:id", async (req, res) => {
  try {
    const id = req.params.id; 
    const sql = "SELECT * FROM topics WHERE id = ?";
    

    //DBP_HIGHLIGHTES here await is used to pause the exectution of the async funtion.
    const connection = await db();  // Get the connection 
    const [results] = await connection.query(sql, [id]);

    if (results.length > 0) {
      const topic = {
        id: results[0].id,   //DBP_NOTES it is the id of the topic
        title: results[0].title,
        category: results[0].category,
        body: results[0].body,
        created_at: results[0].created_at,
        user_name: results[0].user_name,  //the username fetched from topic
        image: results[0].user_image,
      };

      //Counting the number of topics of a user
      const sql2 = "SELECT COUNT(*) AS count_topics FROM topics WHERE user_name = ?";
      const [countResults] = await connection.query(sql2, [topic.user_name]);

      //Showing the replies of a particular topic
      const sql3 = "SELECT * FROM replies WHERE topic_id = ?";
      const [replies] =await connection.query(sql3 , [topic.id]);

      const sql4 = "SELECT COUNT(*) AS count_all_topic FROM topics";
      const [countAllTopics] = await connection.query(sql4);


      res.render("topics/showtopic", {
        topic: topic,
        name: req.session.name,
        avatar: req.session.avatar,
        count_topics: countResults[0].count_topics,
        replies: replies , 
        username: req.session.username, //THe username of the session.
        count_all_topic: countAllTopics[0].count_all_topic,
      });
    }
  } catch (err) {
    console.error(err);
    return res.send(
      '<script>alert("An error occurred while executing the SQL query");window.location.href = "/";</script>'
    );
  }
});





//DBP_HIGHLIGHTES Keep it mind , /:id , here id comes from the text you press to get the url.

server.get("/update/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const sql = "SELECT * FROM topics WHERE id = ?";
    

    //DBP_HIGHLIGHTES here await is used to pause the exectution of the async funtion.
    const connection = await db();  // Get the connection 
    const [results] = await connection.query(sql, [id]);

    if (results.length > 0) {
      const topic = {
        id: results[0].id,
        title: results[0].title,
        category: results[0].category,
        body: results[0].body,
        created_at: results[0].created_at,
        user_name: results[0].user_name,
        avatar: results[0].avatar,
      };

      res.render("topics/update", {
          topic: topic,
          name: req.session.name,
          avatar: req.session.avatar,
         username: req.session.username

      });
    }
  } catch (err) {
    console.error(err.message);
    return res.send(
      '<script>alert("An error occurred while executing the SQL query");window.location.href = "/";</script>'
    );
  }
});

server.post("/update/:id", async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const sql = "UPDATE topics SET title = ? , category = ? , body = ? , user_name = ? , user_image = ? , created_at = ? WHERE id = ?";
    const values = [
      req.body.title,
      req.body.category,
      req.body.body,
      req.session.username,
      req.session.avatar,
      new Date(),
      id,
    ];

    const connection = await db();  // Get the connection 
    await connection.query(sql, values);  // Execute the query
    res.send('<script>alert("Topic Updated Successfully");window.location.href = "/";</script>');
  }
  catch (err) {
    console.error(err.message);
    return res.send(
      '<script>alert("An error occurred while Updating the topic");window.location.href = "/";</script>'
    );
  }
});


server.delete("/delete-topic/:id" , async (req , res) => {
  try{
    const id = req.params.id ;
    const sql = "DELETE FROM topics WHERE id = ?";

    const connection = await db();
    await connection.query(sql , [id]); //DBP_NOTES the [title] is the value that we are passing to the sql query from the showtopic.ejs file , delete section

    res.redirect('/');
  } catch(err) {
    console.error(err.message);
    return res.send(
      '<script>alert("An error occurred while executing the SQL query");window.location.href = "/";</script>'
    );
  }
});



server.post("/reply/:id" , async(req,res) => {
     try{
      const id = req.params.id ; //DBP_NOTES id is the id of the topic  
      const sql = "INSERT INTO replies (reply , user_id , user_image , topic_id , user_name , created_at) VALUES (? , ? , ? , ? , ? , ?)";
      const values = [
        req.body.reply,
        req.session.user_id,
        req.session.avatar,
        id,
        req.session.username,
        new Date()
      ];

      const connection = await db();  // Get the connection 
      await connection.query(sql, values);  // Execute the query
      res.redirect(`/showtopic/${id}`); //DBP_NOTES here if we use +id , it can conflict with the string , so we use ${id}


    }

    catch (err) {
      console.error(err.message);
      return res.send(
        '<script>alert("An error occurred while Replying the topic");window.location.href = "/";</script>'
      );
    }
  }); 


  server.delete("/delete-reply/:id" , async (req , res) => {
    try{

      const connection = await db();

      const id = req.params.id ;

       //DBP_NOTES First, get the topic_id for the reply
      const sql1 = "SELECT topic_id FROM replies WHERE id = ?" ;
      const [results] = await connection.query(sql1 , [id]);
      const Topic_id = results[0].topic_id ;




      const sql2 = "DELETE FROM replies WHERE id = ?";

      await connection.query(sql2 , [id]); //DBP_NOTES the [id] is the value that we are passing to the sql query from the showtopic.ejs file , delete section


      //DBP_NOTES now we need topic id to redirect to the topic page


      res.redirect(`/showtopic/${Topic_id}`);
    } catch(err) {
      console.error(err.message);
      return res.send(
        '<script>alert("An error occurred while executing the SQL query of Reply Deletion");window.location.href = "/";</script>'
      );
    }
  });

  


  server.get("/profile/:user_name", async(req, res) => {

    //DBP_NOTES here the user_name should be same of topic.DBP_NOTESuser_nameDBP_NOTES


    try{

      
    const connection = await db() ;

    const userName = req.params.user_name;
    const sql = "SELECT * FROM users WHERE username = ?";

    const sql2 = "SELECT * FROM topics WHERE user_name = ?" ;

    const sql3 = "SELECT * FROM replies WHERE user_name = ?" ;




    const sql4 = `SELECT categories.id AS id, categories.name AS name,
    COUNT(topics.category) AS count_category FROM categories LEFT JOIN topics ON
    categories.name = topics.category GROUP BY name`;

    const [categories] = await connection.query(sql4) ;

    const sql_usercnt = "SELECT COUNT(*) AS user_cnt FROM users WHERE username = ?";
    const sql_topiccnt = "SELECT COUNT(*) AS topic_cnt FROM topics WHERE user_name = ?";
    const sql_replycnt = "SELECT COUNT(*) AS reply_cnt FROM replies WHERE user_name = ?";


    const categorycntsql = "SELECT COUNT(*) AS categorycnt FROM categories";
    const [cat_cnt] = await connection.query(categorycntsql);




    const [user] = await connection.query(sql , [userName]);
    const [user_topics] = await connection.query(sql2 , [userName]);
    const [user_replies] = await connection.query(sql3 , [userName]);




    res.render("user/profile", {
      username: req.session.username ,
      user: user[0],
      topic: user_topics,
      replies: user_replies,
      count_all_topic: user_topics.length,
      count_all_replies: user_replies.length,
      category_cnt: cat_cnt[0].categorycnt,
      categories: categories
      

    });
  } catch(err) {
    console.error(err.message) ;
  }
});


server.get("/update-profile/:user_name", async(req,res) => {
  try{
    const userName = req.params.user_name ;
    const sql = "SELECT * FROM users WHERE username = ?" ;

    const connection = await db() ;

    const [users] = await connection.query(sql , [userName]);


  } catch(err) {
    console.error(err.message) ;
  }
});


server.delete("/delete-profile/:user_name" , async (req , res) => {
  try{
    const connection = await db();
    const userName = req.params.user_name ;
    const sql = "DELETE FROM users WHERE username = ?";


    const sql2 = "DELETE FROM topics WHERE user_name = ?" ;


    const sql3 = "DELETE FROM replies WHERE user_name = ?" ;


    await connection.query(sql , [userName]); //DBP_NOTES the [userName] is the value that we are passing to the sql query from the showtopic.ejs file , delete section
    await connection.query(sql2 , [userName]);
    await connection.query(sql3 , [userName]);
    

    res.redirect('/');
  } catch(err) {
    console.error(err.message);
    return res.send(
      '<script>alert("An error occurred while executing the SQL query");window.location.href = "/";</script>'
    );
  }
});



// app.get('/logout', (req, res) => {
//   req.session.destroy(err => {
//     if(err) {
//       return res.redirect('/dashboard');
//     }

//     res.clearCookie('sid');
//     res.redirect('/login');
//   });
// });
















server.use((req, res, next) => {
 console.log(req.session);
  next();
});



server.listen(8080, () => {
  console.log("Server Started");
});
