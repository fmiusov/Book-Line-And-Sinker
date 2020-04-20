// *********************************************************************************
// api-routes.js - this file offers a set of routes for displaying and saving data to the db
// *********************************************************************************

// Dependencies
// =============================================================

// Requiring our Todo model
const db = require("../models");
const { Op } = db.Sequelize;
const passport = require("../config/passport");
const moment = require("moment");

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
  app.get("/books/title/search/:title", async (req, res) => {
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
      // res.json(results);
      res.render("search-results", { books: results });
    } catch (err) {
      console.log(err);
    }
  });

  app.get("/books/author/search/:author", async (req, res) => {
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
      res.render("search-results", { books: results });
      // res.json(results);
    } catch (err) {
      console.log(err);
    }
  });

  app.post("/search-results", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).redirect("/login");
      }
      let results;
      if (req.body["search-type"] === "author") {
        let author = authorRegexp(req.body["search-query"]);
        results = await db.Book.findAll({
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
      } else {
        results = await db.Book.findAll({
          where: {
            title: {
              [Op.like]: `%${req.body["search-query"]}%`,
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
      }
      if (results.length === 0) {
        return res.render("search-results", { books: [] });
      }
      let output = results.map((r) => ({
        bookId: r.id,
        title: r.title,
        author: r.authors,
        averageRating: r.averageRating,
        isbn: r.isbn,
        isbn13: r.isbn13,
        languageCode: r.languageCode,
        numPages: r.numPages,
        publicationDate: moment(r.publicationDate).utc().format("MMM Do, YYYY"),
        publisher: r.publisher,
      }));
      console.log(results[0].publicationDate, output[0].publicationDate);
      res.render("search-results", { books: output });
    } catch (err) {
      console.log(err);
    }
  });
  // accepts { "bookId": <book.id> }
  app.post("/new/review/", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).redirect("/login");
      }
      let bookId = req.body.bookId;
      let userBook = await db.UserBooks.findOne({
        where: {
          userId: req.user.id,
          bookId: bookId,
        },
        include: {
          model: db.Book,
          where: {
            id: bookId,
          },
        },
      });
      // console.log(userBook);
      res.render("make-review", {
        book: {
          bookId: userBook.Book.id,
          title: userBook.Book.title,
          author: userBook.Book.author,
          averageRatin: userBook.Book.averageRating,
          isbn: userBook.Book.isbn,
          isbn13: userBook.Book.isbn13,
          languageCode: userBook.Book.languageCode,
          numPages: userBook.Book.numPages,
          publicationDate: moment(userBook.Book.publicationDate)
            .utc()
            .format("MMM Do, YYYY"),
          publisher: userBook.Book.publisher,
          rating: userBook.rating,
        },
        user: {
          email: req.user.email,
          id: req.user.id,
        },
      });
    } catch (err) {
      console.log(err);
    }
  });

  // Using the passport.authenticate middleware with our local strategy.
  // If the user has valid login credentials, send them to the members page.
  // Otherwise the user will be sent an error
  app.post("/api/login", passport.authenticate("local"), function (req, res) {
    res.json(req.user);
  });

  // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
  // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
  // otherwise send back an error
  app.post("/api/signup", function (req, res) {
    db.User.create({
      email: req.body.email,
      password: req.body.password,
    })
      .then(function () {
        res.redirect(307, "/api/login");
      })
      .catch(function (err) {
        res.status(401).json(err);
      });
  });

  // Route for logging user out
  app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
  });

  // Route for getting some data about our user to be used client side
  app.get("/api/user_data", function (req, res) {
    if (!req.user) {
      // The user is not logged in, send back an empty object
      res.json({});
    } else {
      // Otherwise send back the user's email and id
      // Sending back a password, even a hashed password, isn't a good idea
      res.json({
        email: req.user.email,
        id: req.user.id,
      });
    }
  });

  // must be authenticated to add a book to your bookshelf
  // accepts: JSON object {"bookId": <book.id>}
  app.post("/api/bookshelf/add", async (req, res) => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          msg: "You must be signed in to access this resource.",
        });
      } else {
        console.log(req.user);
        let { bookId } = req.body;
        let book = await db.Book.findOne({
          where: {
            id: bookId,
          },
        });
        let result = await book.addUser(req.user.id, {
          through: {
            rating: 0,
            isRead: false,
            review: null,
          },
        });
        if (result[0]) {
          res.json({
            success: true,
            msg: "Book added",
            data: {
              book: book,
              userBook: result[0],
            },
          });
        } else {
          res.json({
            success: false,
            msg: "Book not added",
            data: result,
          });
        }
      }
    } catch (err) {
      console.log("error", err);
      res
        .status(500)
        .json({
          success: false,
          msg: err.toString(),
          data: err,
        })
        .end();
    }
  });

  app.get("/api/review/:bookId", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).redirect("/login");
      }
      let bookId = req.params.bookId;
      let result = await db.UserBooks.findOne({
        where: {
          userId: req.user.id,
          bookId: bookId,
        },
      });
      if (result) {
        res.json({
          success: true,
          msg: "Review found",
          data: result,
        });
      } else {
        res.status(401).json({
          success: false,
          msg: "No reviews",
          data: result,
        });
      }
    } catch (err) {
      console.log("error", err);
      res
        .status(500)
        .json({
          success: false,
          msg: err.toString(),
          data: err,
        })
        .end();
    }
  });

  // acceps JSON object { "bookId": <book.id>, "rating": <1 - 5>}
  app.post("/api/rating", async (req, res) => {
    try {
      if (!req.user) {
        res.status(401).redirect("/login");
      } else {
        let userBook = await db.UserBooks.update(
          {
            rating: req.body.rating,
          },
          {
            where: {
              bookId: req.body.bookId,
              userId: req.user.id,
            },
          }
        );
        if (userBook) {
          res.json({
            succes: true,
            msg: `Rating set to ${userBook.rating}`,
            data: userBook,
          });
        } else {
          res.status(204).end();
        }
      }
    } catch (err) {
      console.log("error", err);
      res
        .status(500)
        .json({
          success: false,
          msg: err.toString(),
          data: err,
        })
        .end();
    }
  });

  // acceps JSON object { "bookId": <book.id>, "rating": <1 - 5>, review: <text>}
  app.post("/post/review", async (req, res) => {
    try {
      if (!req.user) {
        res.status(401).redirect("/login");
      } else {
        let userBook = await db.UserBooks.update(
          {
            rating: req.body.rating,
            review: req.body.review,
          },
          {
            where: {
              bookId: req.body.bookId,
              userId: req.user.id,
            },
          }
        );
        if (userBook) {
          // res.json({
          //   succes: true,
          //   msg: "Review added",
          //   data: userBook,
          // });
          res.redirect("/reviews");
        } else {
          res.status(204).end();
        }
      }
    } catch (err) {
      console.log("error", err);
      res
        .status(500)
        .json({
          success: false,
          msg: err.toString(),
          data: err,
        })
        .end();
    }
  });

  // get all rewviews for a user
  app.get("/reviews", async (req, res) => {
    try {
      if (!req.user) {
        res.status(401).redirect("/login");
      } else {
        let reviews = await db.UserBooks.findAll({
          where: {
            userId: req.user.id,
            review: {
              [Op.ne]: null,
            },
          },
          include: db.Book,
        });
        let output = reviews.map((r) => ({
          reviewId: r.id,
          rating: r.rating,
          review: r.review,
          isRead: r.isRead,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          user: req.user,
          book: {
            bookId: r.Book.id,
            title: r.Book.title,
            author: r.Book.authors,
            averageRating: r.Book.averageRating,
            isbn: r.Book.isbn,
            isbn13: r.Book.isbn13,
            numPages: r.Book.numPages,
            publicationDate: moment(r.Book.publicationDate)
              .utc()
              .format("MMM Do, YYYY"),
            publisher: r.Book.publisher,
          },
        }));
        // res.json(output);
        res.render("reviews", { reviews: output, heading: "My reviews" });
      }
    } catch (err) {
      console.log("error", err);
      res
        .status(500)
        .json({
          success: false,
          msg: err.toString(),
          data: err,
        })
        .end();
    }
  });

  app.get("/reviews/book/:bookId", async (req, res) => {
    try {
      if (!req.user) {
        res.status(401).redirect("/login");
      } else {
        let heading = "No Reviews found";
        let bookId = req.params.bookId;
        let reviews = await db.UserBooks.findAll({
          where: {
            bookId: bookId,
            review: {
              [Op.ne]: null,
            },
          },
          include: [db.Book, db.User]
        });
        let output = reviews.map((r) => ({
          reviewId: r.id,
          rating: r.rating,
          review: r.review,
          isRead: r.isRead,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          user: {
            id: r.User.id,
            email: r.User.email
          },
          book: {
            bookId: r.Book.id,
            title: r.Book.title,
            author: r.Book.authors,
            averageRating: r.Book.averageRating,
            isbn: r.Book.isbn,
            isbn13: r.Book.isbn13,
            numPages: r.Book.numPages,
            publicationDate: moment(r.Book.publicationDate)
              .utc()
              .format("MMM Do, YYYY"),
            publisher: r.Book.publisher,
          },
        }));
        // res.json(output);
        if (output.length > 0){
          heading = `Reviews for ${output[0].book.title}`;
        }
        res.render("reviews", { reviews: output, heading: heading});
      }
    } catch (err) {
      console.log("error", err);
      res
        .status(500)
        .json({
          success: false,
          msg: err.toString(),
          data: err,
        })
        .end();
    }
  });

  app.get("/reviews/all", async (req, res) => {
    try {
      if (!req.user) {
        res.status(401).redirect("/login");
      } else {
        let reviews = await db.UserBooks.findAll({
          where: {
            review: {
              [Op.ne]: null,
            },
          },
          include: [db.Book, db.User]
        });
        // console.log(reviews);
        let output = reviews.map((r) => ({
          reviewId: r.id,
          rating: r.rating,
          review: r.review,
          isRead: r.isRead,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          user: {
            id: r.User.id,
            email: r.User.email
          },
          book: {
            bookId: r.Book.id,
            title: r.Book.title,
            author: r.Book.authors,
            averageRating: r.Book.averageRating,
            isbn: r.Book.isbn,
            isbn13: r.Book.isbn13,
            numPages: r.Book.numPages,
            publicationDate: moment(r.Book.publicationDate)
              .utc()
              .format("MMM Do, YYYY"),
            publisher: r.Book.publisher,
          },
        }));
        console.log(output);
        res.render("reviews", { reviews: output, heading: "All Reviews" });
      }
    } catch (err) {
      console.log("error", err);
      res
        .status(500)
        .json({
          success: false,
          msg: err.toString(),
          data: err,
        })
        .end();
    }
  });

  app.get("/library", async (req, res) => {
    try {
      if (!req.user) {
        res.status(401).redirect("/login");
      } else {
        let result = await db.User.findOne({
          where: {
            id: req.user.id,
          },
          include: db.Book,
        });
        console.log(result);
        let output = result.Books.map((r) => ({
          bookId: r.id,
          title: r.title,
          author: r.authors,
          averageRating: r.averageRating,
          isbn: r.isbn,
          isbn13: r.isbn13,
          languageCode: r.languageCode,
          numPages: r.numPages,
          publicationDate: moment(r.publicationDate)
            .utc()
            .format("MMM Do, YYYY"),
          publisher: r.publisher,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          isRead: r.UserBooks.isRead,
          review: {
            id: r.UserBooks.id,
            rating: r.UserBooks.rating,
            review: r.UserBooks.review,
          },
        }));
        console.log(result);
        // res.json(output);
        res.render("library", { books: output });
      }
    } catch (err) {
      console.log("error", err);
      res
        .status(500)
        .json({
          success: false,
          msg: err.toString(),
          data: err,
        })
        .end();
    }
  });

  app.get("/zack", async (req, res) => {
    try {
      if (!req.user) {
        res.status(401).redirect("/login");
      } else {
        let result = await db.User.findOne({
          where: {
            id: req.user.id,
          },
          include: db.Book,
        });
        // console.log(result);
        let output = result.Books.map((r) => ({
          bookId: r.id,
          title: r.title,
          author: r.authors,
          averageRating: r.averageRating,
          isbn: r.isbn,
          isbn13: r.isbn13,
          languageCode: r.languageCode,
          numPages: r.numPages,
          publicationDate: moment(r.publicationDate)
            .utc()
            .format("MMM Do, YYYY"),
          publisher: r.publisher,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          isRead: r.UserBooks.isRead,
          review: {
            id: r.UserBooks.id,
            rating: r.UserBooks.rating,
            review: r.UserBooks.review,
          },
        }));
        console.log(result.Books[0].publicationDate, output[0].publicationDate);
        // res.json(output);
        res.render("library", {
          books: output,
        });
      }
    } catch (err) {
      console.log("error", err);
      res
        .status(500)
        .json({
          success: false,
          msg: err.toString(),
          data: err,
        })
        .end();
    }
  });
};
