'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SessionParticipant extends Model {
    static associate(models) {
      // Defines that a record belongs to a Session
      SessionParticipant.belongsTo(models.Session, {
        foreignKey: 'session_id'
      });
      // Defines that a record belongs to a User (player)
      SessionParticipant.belongsTo(models.User, {
        foreignKey: 'player_id'
      });
    }
  }
  SessionParticipant.init({
    session_id: DataTypes.INTEGER,
    player_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'SessionParticipant',
  });
  return SessionParticipant;
};