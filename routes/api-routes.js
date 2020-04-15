// *********************************************************************************
// api-routes.js - this file offers a set of routes for displaying and saving data to the db
// *********************************************************************************

// Dependencies
// =============================================================

// Requiring our Todo model
var db = require("../models");
const {Op} = db.Sequelize;

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
            [Op.like]: nameLike
          },
          languageCode: {
            [Op.like]: "en%"
          }
        },
        order: [["ratingsCount", "DESC"], ["averageRating", "DESC"]]
      });
      res.json(results);
    } catch (err) {
      console.log(err);
    }
  });

};