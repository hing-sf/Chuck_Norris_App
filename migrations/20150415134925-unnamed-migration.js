"use strict";

module.exports = {
  up: function(migration, DataTypes, done) {
    // add altering commands here, calling 'done' when finished
    return migration
      .addColumn('favoriteJokes','UserId',DataTypes.INTEGER);
  },

  down: function(migration, DataTypes, done) {
    // add reverting commands here, calling 'done' when finished
    return migration.removeColumn('favoriteJokes', 'UserId');
  }
};
