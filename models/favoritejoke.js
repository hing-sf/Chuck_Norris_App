"use strict";
module.exports = function(sequelize, DataTypes) {
  var favoriteJoke = sequelize.define("favoriteJoke", {
    category: DataTypes.STRING,
    joke: DataTypes.STRING,
    rating: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        this.belongsTo(models.User); //this table connect to User table 
      }
    }
  });
  return favoriteJoke;
};