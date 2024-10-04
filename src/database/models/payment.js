'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Payment.init({
    id: DataTypes.UUID,
    name: DataTypes.STRING,
    customerNo: DataTypes.STRING,
    signToString: DataTypes.STRING,
    xtimestamp: DataTypes.DATE,
    xexternalid: DataTypes.STRING,
    AsymetricSignature: DataTypes.STRING,
    channelId: DataTypes.STRING,
    username: DataTypes.STRING,
    price: DataTypes.STRING,
    refernceNo: DataTypes.STRING,
    status_payment: DataTypes.STRING,
    tagID: DataTypes.STRING,
    flagType: DataTypes.STRING,
    trxDateTime: DataTypes.DATE,
    flagAdvise: DataTypes.STRING,
    billDetails: DataTypes.JSON,
    additionalInfo: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'Payment',
  });
  return Payment;
};