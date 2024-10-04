'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Read the JSON file
    const locations = require('../../data/location_member_data.json');

    // Insert data into the table
    await queryInterface.bulkInsert('location_member', locations.map(location => ({
      id: location.Id,
      code: location.Code,
      name: location.Name,
      createdAt: new Date(),
      updatedAt: new Date()
    })), {});
  },

  async down (queryInterface, Sequelize) {
    // Optionally, you can add logic to revert this seed
    await queryInterface.bulkDelete('location_member', null, {});
  }
};
