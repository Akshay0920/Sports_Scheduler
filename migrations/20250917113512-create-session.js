'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Sessions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      venue: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      scheduled_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      players_needed: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'active'
      },
      cancellation_reason: {
        type: Sequelize.TEXT
      },
      sport_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Sports',
          key: 'id'
        }
      },
      creator_id: {
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Sessions');
  }
};