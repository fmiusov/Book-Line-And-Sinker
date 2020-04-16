module.exports = (sequelize, DataTypes) => {
  const UserBooks = sequelize.define("UserBooks", {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
        max: 5,
      },
      allowNull: false,
    },
    comment: DataTypes.TEXT,
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  });
  return UserBooks;
};
