'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Session extends Model {
    static associate(models) {
      // A session belongs to one creator
      Session.belongsTo(models.User, {
        foreignKey: 'creator_id',
        as: 'Creator'
      });
      // A session belongs to one sport
      Session.belongsTo(models.Sport, {
        foreignKey: 'sport_id'
      });
      // A session can have many participants (Users)
      Session.belongsToMany(models.User, {
        through: 'SessionParticipant',
        foreignKey: 'session_id',
        as: 'Participants'
      });
    }
  }
  Session.init({
    venue: DataTypes.STRING,
    scheduled_at: DataTypes.DATE,
    players_needed: DataTypes.INTEGER,
    status: DataTypes.STRING,
    cancellation_reason: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Session',
  });
  return Session;
};