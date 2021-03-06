

// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
// Requiring our Note and Article models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");

const PORT = process.env.PORT || 8000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraper";

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));
var connect = mongoose.connect(MONGODB_URI, { useMongoClient: true });

connect.then(function(db) {
  // Show any mongoose errors
  db.on("error", function(error) {
    console.log("Mongoose Error: ", error);
  });

  // Once logged in to the db through mongoose, log a success message
  db.once("open", function() {
    console.log("Mongoose connection successful.");
  });
})

// Routes
// ======

// A GET request to scrape the echojs website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("http://www.echojs.com/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:
    $("article h2").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");

      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Article(result);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          console.log(doc);
        }
      });
    });
  });
  // Tell the browser that we finished scraping the text
  res.send("Scrape Complete");
});

// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
  Article.find({}, function(err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
      res.json(data);
    }
  })
});

// This will grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
  var item = req.params.id;
  Article.findOne({"_id": item}).populate("notes").exec( function(err, data) {
    if (err) {
      console.log(err);
      res.end();
    } else {
      console.log(data);
      res.json(data);
    }
  })
});

// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {
  var id = req.params.id;
  var note = req.body
  Note.create(req.body, function(err, data) {
    if (err) console.log(err)
    Article.update({_id:id}, {$push: {notes: data._id} }, function(err) {
      if (err) console.log(err)
      res.end();
    });
  });
});

app.delete("/notes/:id", function(req, res) {
  console.log(req.params.id);
  var id = req.params.id;
  Note.findByIdAndRemove(id, function(err){
    if (err) console.log(err);
    res.end();
  });
})

  // save the new note that gets posted to the Notes collection

  // then find an article from the req.params.id

  // and update it's "note" property with the _id of the new note




// Listen on port 3000
app.listen(PORT, function() {
  console.log("App running on port 3000!");
});
