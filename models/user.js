'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // User as an Admin creates Sports
      User.hasMany(models.Sport, {
        foreignKey: 'admin_id',
        as: 'CreatedSports'
      });
      // User as a Player creates Sessions
      User.hasMany(models.Session, {
        foreignKey: 'creator_id',
        as: 'CreatedSessions'
      });
      // User as a Player joins many Sessions
      User.belongsToMany(models.Session, {
        through: 'SessionParticipant',
        foreignKey: 'player_id',
        as: 'JoinedSessions'
      });
    }
  }
  User.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password_digest: DataTypes.STRING,
    role: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};