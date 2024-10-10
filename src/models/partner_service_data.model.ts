import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../configs/databaseConnection'; // Ensure this path is correct

// Define the attributes for the PaymentServiceData model
export interface PaymentServiceDataAttributes {
  id: string; // UUID
  partner_key?: string;
  channel_id?: string;
  bank_id?: string;
  code_bank?: string;
  type_payment:
    | 'E_WALLET'
    | 'VIRTUAL_ACCOUNT'
    | 'QRIS'
    | 'PAYLATER'
    | 'CREDIT_CARD'
    | 'DEBIT_CARD'
    | 'POINT';
  gateway_partner?: string;
  client_secret?: string;
  secret_key?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Define the type for creation (id is optional)
export interface PaymentServiceDataCreationAttributes
  extends Optional<
    PaymentServiceDataAttributes,
    'id' | 'created_at' | 'updated_at'
  > {}

// Create the PaymentServiceData model
class PaymentServiceData
  extends Model<
    PaymentServiceDataAttributes,
    PaymentServiceDataCreationAttributes
  >
  implements PaymentServiceDataAttributes
{
  public id!: string; // UUID
  public partner_key?: string;
  public channel_id?: string;
  public code_bank?: string;
  public bank_id?: string;
  public type_payment!:
    | 'E_WALLET'
    | 'VIRTUAL_ACCOUNT'
    | 'QRIS'
    | 'PAYLATER'
    | 'CREDIT_CARD'
    | 'DEBIT_CARD'
    | 'POINT';
  public gateway_partner?: string;
  public client_secret?: string;
  public secret_key?: string;
  public created_at!: Date;
  public updated_at!: Date;
}

// Initialize the model
PaymentServiceData.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // Automatically generate UUID
      primaryKey: true
    },
    partner_key: {
      type: DataTypes.STRING,
      allowNull: true
    },
    channel_id: {
      type: DataTypes.STRING, // Add channel_id field
      allowNull: true
    },
    code_bank: {
      // Add the code_bank field
      type: DataTypes.STRING,
      allowNull: true
    },
    bank_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    type_payment: {
      type: DataTypes.ENUM(
        'E_WALLET',
        'VIRTUAL_ACCOUNT',
        'QRIS',
        'PAYLATER',
        'CREDIT_CARD',
        'DEBIT_CARD',
        'POINT'
      ),
      allowNull: false
    },
    gateway_partner: {
      type: DataTypes.STRING,
      allowNull: true
    },
    client_secret: {
      type: DataTypes.STRING,
      allowNull: true
    },
    secret_key: {
      type: DataTypes.STRING,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: 'PaymentServiceData',
    tableName: 'payment_service_data',
    timestamps: false // Not using Sequelize timestamps, so manage manually if needed
  }
);

export default PaymentServiceData;
