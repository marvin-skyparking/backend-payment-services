import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../configs/databaseConnection'; // Ensure this path is correct

interface AdditionalInfo {
  insertId: string;
  tagId: string;
  flagType: string;
}

export interface Amount {
  value: string;
  currency: string;
}

interface additionalInfoDetails {
  trxId: string;
  trxDateInit: string;
}

export interface PayloadVA {
  customerNo: string;
  partnerBank: string;
  ExpiredDate: string;
  partnerServiceId: string;
  virtualAccountName: string;
  virtualAccountEmail: string;
  totalAmount: Amount;
  channelId: string;
  ClientId: string;
}

export interface InquryStatus {
  customerNo: string;
  trxId: string;
  trxDateInit: string;
  partnerBank: string;
  channelId: string;
  partnerServiceId: string;
  additionalInfo: additionalInfoDetails[];
}

// Enum types for status_transaction and app_module
export enum StatusTransaction {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum AppModule {
  APP_MEMBERSHIP = 'APP_MEMBERSHIP',
  APP_VOUCHER = 'APP_VOUCHER',
  APP_OTHERS = 'APP_OTHERS'
}

export class PaymentTransaction extends Model {
  public id!: string;
  public trx_id!: string;
  public expired_date!: string;
  public invoice_number!: string;
  public virtual_account_number!: string;
  public virtual_account_name!: string;
  public virtual_account_email!: string;
  public payment_using!: string;
  public module_name!: string;
  public status_transaction!: StatusTransaction;
  public paid_amount!: number;
  public app_module!: AppModule;
  public created_at!: Date;
  public updated_at!: Date;

  // Optional: timestamps can be auto-handled by Sequelize if configured
  // public readonly createdAt!: Date;
  // public readonly updatedAt!: Date;
}

PaymentTransaction.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    trx_id: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true
    },
    expired_date: {
      type: DataTypes.STRING,
      allowNull: false
    },
    invoice_number: {
      type: DataTypes.STRING,
      allowNull: true
    },
    virtual_account_number: {
      type: DataTypes.STRING,
      allowNull: true
    },
    virtual_account_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    virtual_account_email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    payment_using: {
      type: DataTypes.STRING,
      allowNull: false
    },
    module_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status_transaction: {
      type: DataTypes.ENUM('PENDING', 'COMPLETED', 'FAILED'),
      allowNull: false
    },
    paid_amount: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    app_module: {
      type: DataTypes.ENUM('APP_MEMBERSHIP', 'APP_VOUCHER', 'APP_OTHERS'),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: 'payment_transactions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);
