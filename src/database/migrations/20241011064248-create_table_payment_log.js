'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('payment_log', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      status_module: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      module_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      virtual_account_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      virtual_account_number: {
        type: Sequelize.STRING,
        allowNull: true, // Adjust as necessary
      },
      request_payload: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      response_payload: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('payment_log');
  }
};
