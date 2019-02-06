// Require all necessary packages and exports
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");

// Initialize Express
var app = express();

// Set to run Handlebars view engine
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

// Set port
var PORT = process.env.PORT || 3000;

// Middleware
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Public folder -> static
app.use(express.static("public"));

// Connect to database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI);



// -----Routes----- //

//GET Route to display the 20 latest articles on the landing page
app.get("/", function (req, res) {

  // Grab the 20 latest entries in the Articles collection
  db.Article.find({})
    .limit(20)
    .sort({ '_id': -1 })
    .then(function (dbArticle) {

      // Send them back
      var hbObj = { articles: dbArticle };
      res.render("index", hbObj);
    })
    .catch(function (err) {
      // If error, throw up
      res.json(err);
    });
});

// GET route to scrape Real Clear Politics
app.get("/scrape", function (req, res) {
  axios.get("https://www.realclearpolitics.com/").then(function (response) {
    var $ = cheerio.load(response.data);

    // Use each div with "post" class
    $(".post").each(function (i, element) {
      var result = {};

      // Find the title, byline and link inside each of these divs, and save them as title, source and link
      result.title = $(this)
        .find(".title")
        .text().trim();
      result.source = $(this)
        .find(".byline")
        .text();
      result.link = $(this)
        .find("a")
        .attr("href");

      // push the result to the Articles model
      db.Article.create(result)
        .then(function (dbArticle) {
          // Show in the console
          console.log(dbArticle);
        })
        .catch(function (err) {
          // If error, throw up
          console.log(err);
        });
    });

    // When all done, tell the user on the page
    res.send("Scrape Complete");
  });
});


// GET route to show all articles that have been scraped
app.get("/articles", function (req, res) {

  // Grab every entry from Articles, and sort so newest is on top
  db.Article.find({})
    .sort({ '_id': -1 })
    .then(function (dbArticle) {

      // Send them back
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If error, throw up
      res.json(err);
    });
});

// GET Route to show the note for an article
app.get("/articles/:id", function (req, res) {

  // Go get the article with a matching ID
  db.Article.findOne({ _id: req.params.id })

    // Go get its note and pull it over
    .populate("note")
    .then(function (dbArticle) {

      // Send it back
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If error, throw up
      res.json(err);
    });
});

// POST Route for saving/updating a note
app.post("/articles/:id", function (req, res) {
  // Create a new note with the req.body
  db.Note.create(req.body)
    .then(function (dbNote) {

      // Go get the article with a matching ID and associate the note to it.
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function (dbArticle) {
      // Send it back
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If error, throw
      res.json(err);
    });
});

// POST Route for deleting a note
app.post("/articles/:id", function (req, res) {

  // Create a new note and pass the req.body to the entry
  db.Note.update(req.body)
    .then(function (dbNote) {

      // Go get the article with a matching ID and associate the note to it. The title and body should be empty strings.
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id });
    })
    .then(function (dbArticle) {

      // Send it back
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If error, throw up
      res.json(err);
    });
});

// Start up the server
app.listen(PORT, function () {
  console.log("Listening on port " + PORT);
});
