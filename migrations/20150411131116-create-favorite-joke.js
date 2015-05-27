"use strict";
module.exports = {
  up: function(migration, DataTypes, done) {
    return migration.createTable("favoriteJokes", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      category: {
        type: DataTypes.STRING
      },
      joke: {
        type: DataTypes.STRING
      },
      rating: {
        type: DataTypes.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    });
  },
  down: function(migration, DataTypes, done) {
    return migration.dropTable("favoriteJokes");
  }
};