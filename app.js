const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");
const flash = require("connect-flash");
const session = require("express-session");

mongoose.connect("mongodb://localhost/nodekb");
let db = mongoose.connection;

//check connection
db.once("open", function() {
  console.log("Connected to MongoDB");
});

//check for db errors
db.on("error", function(err) {
  console.log(err);
});

//init app
const app = express();

//bring in models
let Article = require("./models/article");

//load view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// body parser middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extend: false }));

// parse application/json
app.use(bodyParser.json());

//set public folder
app.use(express.static(path.join(__dirname, "public")));

// Express session middleware
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true
  })
);

// Express messages middleware
app.use(require("connect-flash")());
app.use(function(req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

//express validator middleware
app.use(
  expressValidator({
    errorFormatter: function(param, msg, value) {
      var namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }
      return {
        param: formParam,
        msg: msg,
        value: value
      };
    }
  })
);

//home route
/*app.get("/", function(req, res) {
  let articles = [
    {
      id: 1,
      title: "Article one",
      author: "Daniel Apps",
      body: "This is article one"
    },

    {
      id: 2,
      title: "Article two",
      author: "Vladimir Putin",
      body: "This is article two"
    },

    {
      id: 3,
      title: "Article three",
      author: "Daniel Apps",
      body: "This is article three"
    }
  ];
  res.render("index", {
    title: "Articles",
    articles: articles
  });
});*/

app.get("/", function(req, res) {
  Article.find({}, function(err, articles) {
    if (err) {
      console.log(err);
    } else {
      res.render("index", {
        title: "Articles",
        articles: articles
      });
    }
  });
});

// route files
let articles = require("./routes/articles");
app.use("/articles", articles);

let users = require("./routes/users");
app.use("/users", users);

//start server
app.listen(3000, function() {
  console.log("sever started on port 3000");
});
