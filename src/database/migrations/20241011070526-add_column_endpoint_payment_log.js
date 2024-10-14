'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add a new column named 'endpoint'
    await queryInterface.addColumn('payment_log', 'endpoint', {
      type: Sequelize.STRING, // Change this to the appropriate data type
      allowNull: true, // Set this according to your requirements
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the 'endpoint' column on rollback
    await queryInterface.removeColumn('payment_log', 'endpoint');
  }
};
