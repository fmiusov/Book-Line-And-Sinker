// *********************************************************************************
// html-routes.js - this file offers a set of routes for sending users to the various html pages
// *********************************************************************************

// Dependencies
// =============================================================
var path = require("path");
var isAuthenticated = require("../config/middleware/isAuthenticated");

// Routes
// =============================================================
module.exports = function (app) {
  // Each of the below routes just handles the HTML page that the user gets sent to.

  app.get("/", function (req, res) {
    if (!req.user) {
      return res.status(401).redirect("/login");
    }
    // res.sendFile(path.join(__dirname, "../public/index.html"));
    res.redirect("/library");
  });
  app.get("/explore", function (req, res) {
    res.sendFile(path.join(__dirname, "../public/explore.html"));
  });
  app.get("/reviews", function (req, res) {
    res.sendFile(path.join(__dirname, "../public/reviews.html"));
  });
  app.get("/login", function (req, res) {
    if (req.user) {
      res.redirect("/");
    }
    res.sendFile(path.join(__dirname, "../public/login.html"));
  });
  app.get("/signup", function (req, res) {
    if (req.user) {
      res.redirect("/");
    }
    res.sendFile(path.join(__dirname, "../public/signup.html"));
  });
  app.get("/explore", isAuthenticated, function (req, res) {
    res.sendFile(path.join(__dirname, "../public/explore.html"));
  });
  app.get("/reviews", isAuthenticated, function (req, res) {
    res.sendFile(path.join(__dirname, "../public/reviews.html"));
  });
};
