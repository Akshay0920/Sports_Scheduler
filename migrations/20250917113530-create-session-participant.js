'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SessionParticipants', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      session_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Sessions',
          key: 'id'
        }
      },
      player_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add a unique constraint to prevent a player from joining the same session multiple times
    await queryInterface.addConstraint('SessionParticipants', {
      fields: ['session_id', 'player_id'],
      type: 'unique',
      name: 'unique_session_player'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('SessionParticipants');
  }
};