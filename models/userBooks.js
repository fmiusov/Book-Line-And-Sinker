module.exports = (sequelize, DataTypes) => {
  const UserBooks = sequelize.define("UserBooks", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
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
        min: 0,
        max: 5,
      },
    },
    review: {
      type: DataTypes.TEXT,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  });
  UserBooks.associate = (models) => {
    UserBooks.belongsTo(models.Book, {foreignKey: "bookId", targetKey: "id"});
    UserBooks.belongsTo(models.User, {foreignKey: "userId", targetKey: "id"});
  };
  return UserBooks;
};
