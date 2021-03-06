'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Bets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      match: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      owner: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      stakes: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      bet_status: {
        type: Sequelize.STRING,
      },
      game: {
        type: Sequelize.STRING,
        allowNull: false
      },
      start_time: {
        type: Sequelize.DATE,
        allowNull: false
      },
      team1: {
        type: Sequelize.STRING,
        allowNull: false
      },
      team2: {
        type: Sequelize.STRING,
        allowNull: false
      },
      team1FullName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      team2FullName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      team1logo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      team2logo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      participants: {
        type: Sequelize.STRING,
        allowNull: false
      },
      inviteCount: {
        type: Sequelize.STRING,
        allowNull: false
      },
      matchId: {
        type: Sequelize.INTEGER,
        allowNull: false
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
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Bets');
  }
};