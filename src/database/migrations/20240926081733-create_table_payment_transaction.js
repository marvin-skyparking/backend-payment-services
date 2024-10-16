'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payment_transactions', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      expired_date:{
        type: Sequelize.STRING,
        allowNull: false
      },
      trx_id: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      invoice_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      virtual_account_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      virtual_account_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      virtual_account_email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      payment_using: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      module_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status_transaction: {
        type: Sequelize.ENUM('PENDING', 'COMPLETED', 'FAILED'),
        allowNull: false,
      },
      paid_amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      app_module: {
        type: Sequelize.ENUM('APP_MEMBERSHIP', 'APP_VOUCHER', 'APP_OTHERS'),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payment_transactions');
  },
};
