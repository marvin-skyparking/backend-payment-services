'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PartnerChannel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PartnerChannel.init({
    id: DataTypes.UUID,
    ProviderName: DataTypes.STRING,
    Description: DataTypes.STRING,
    ChannelId: DataTypes.STRING,
    BankId: DataTypes.STRING,
    PartnerServiceId: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'PartnerChannel',
  });
  return PartnerChannel;
};