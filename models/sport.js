'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Sport extends Model {
    static associate(models) {
      // A sport belongs to one Admin
      Sport.belongsTo(models.User, {
        foreignKey: 'admin_id',
        as: 'Admin'
      });
      // A sport can have many sessions
      Sport.hasMany(models.Session, {
        foreignKey: 'sport_id'
      });
    }
  }
  Sport.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Sport',
  });
  return Sport;
};