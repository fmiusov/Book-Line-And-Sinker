// *********************************************************************************
// api-routes.js - this file offers a set of routes for displaying and saving data to the db
// *********************************************************************************

// Dependencies
// =============================================================

// Requiring our Todo model
var db = require("../models");
const { Op } = db.Sequelize;

// helper functions
const authorRegexp = (author) => {
  let temp;
  let splitString = author.trim().split(/[\s\.]+/);
  console.log(splitString);
  temp = splitString.map((s) => {
    if (s.length <= 3) {
      // return `${s[0]}\.? *${s[1]}`;
      return s.split(/\B/).join("\\.? *");
    } else {
      return s;
    }
  });
  console.log(temp);
  return temp.join("\\.? *");
};

// Routes
// =============================================================
module.exports = function (app) {
  // GET route for getting all of the posts
  app.get("/api/books/title/search/:title", async (req, res) => {
    try {
      let nameLike = `%${req.params.title}%`;
      let results = await db.Book.findAll({
        where: {
          title: {
            [Op.like]: nameLike,
          },
          languageCode: {
            [Op.like]: "en%",
          },
        },
        order: [
          ["ratingsCount", "DESC"],
          ["averageRating", "DESC"],
        ],
      });
      res.json(results);
    } catch (err) {
      console.log(err);
    }
  });

  app.get("/api/books/author/search/:author", async (req, res) => {
    try {
      let author = authorRegexp(req.params.author);
      let results = await db.Book.findAll({
        where: {
          authors: {
            [Op.regexp]: author,
          },
        },
        order: [
          ["ratingsCount", "DESC"],
          ["averageRating", "DESC"],
        ],
      });
      res.json(results);
    } catch (err) {
      console.log(err);
    }
  });
};
