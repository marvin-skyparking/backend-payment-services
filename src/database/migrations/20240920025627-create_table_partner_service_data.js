'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payment_service_data', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      partner_key: {
        type: Sequelize.STRING,
        allowNull: true, // Optional field
      },
      channel_id: { // Add the channel_id column
        type: Sequelize.STRING,
        allowNull: true,
      },
      code_bank: { // Add the code_bank column
        type: Sequelize.STRING,
        allowNull: true,
      },
      bank_id: {
        type: Sequelize.STRING,
        allowNull: true, // Optional field
      },
      type_payment: {
        type: Sequelize.ENUM('E_WALLET', 'VIRTUAL_ACCOUNT', 'QRIS', 'PAYLATER', 'CREDIT_CARD', 'DEBIT_CARD','POINT'),
        allowNull: false, // Required field
      },
      gateway_partner: {
        type: Sequelize.STRING,
        allowNull: true, // Optional field
      },
      client_secret: {
        type: Sequelize.STRING,
        allowNull: true, // Optional field
      },
      secret_key: {
        type: Sequelize.STRING,
        allowNull: true, // Optional field
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payment_service_data');
  },
};
