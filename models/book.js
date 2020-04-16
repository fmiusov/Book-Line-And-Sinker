module.exports = function (sequelize, DataTypes) {
  const Book = sequelize.define("Book", {
    // bookId: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    // },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1]
      }
    },
    authors: {
      type: DataTypes.STRING,
      allowNull: false
    },
    averageRating: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    isbn: {
      type: DataTypes.STRING,
      validate: {
        len: [10]
      }
    },
    isbn13: {
      type: DataTypes.STRING,
      validate: {
        len: [13]
      }
    },
    languageCode: {
      type: DataTypes.STRING
    },
    numPages: {
      type: DataTypes.INTEGER
    },
    ratingsCount: {
      type: DataTypes.INTEGER
    },
    textReviewsCount: {
      type: DataTypes.INTEGER
    },
    publicationDate: {
      type: DataTypes.DATE
    },
    publisher: {
      type: DataTypes.STRING
    },
  });

  Book.associate = (models) => {
    Book.belongsToMany(models.User, {
      through: models.UserBooks,
      foreignKey: "bookId"
    });
  };

  return Book;
};