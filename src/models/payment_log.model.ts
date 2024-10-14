import { Model, DataTypes } from 'sequelize';
import sequelize from '../configs/databaseConnection'; // Adjust the path to your database configuration

class PaymentLog extends Model {
  public id!: number;
  public status_module!: string;
  public endpoint!: string;
  public module_name!: string;
  public virtual_account_name!: string;
  public virtual_account_number!: string;
  public request_payload!: string;
  public response_payload!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PaymentLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    status_module: {
      type: DataTypes.STRING,
      allowNull: true
    },
    endpoint: {
      type: DataTypes.STRING,
      allowNull: true
    },
    module_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    virtual_account_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    virtual_account_number: {
      type: DataTypes.STRING,
      allowNull: true // Add validation as per requirement
    },
    request_payload: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    response_payload: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'PaymentLog',
    tableName: 'payment_log'
  }
);

export default PaymentLog;
