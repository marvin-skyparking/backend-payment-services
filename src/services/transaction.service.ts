import {
  IPaginatePayload,
  IPaginateResult,
  IPaginateSkipTake
} from '../interfaces/pagination.interface';
import { PaymentTransaction } from '../models/payment.model'; // Adjust the import path as needed
import * as PaymentTransaction_1 from '../models/payment.model'; // Import enums if needed
import { Op } from 'sequelize';

// Create a new payment transaction
export const createPaymentTransaction = async (data: {
  trx_id: string;
  invoice_number?: string;
  virtual_account_number?: string;
  virtual_account_name?: string;
  virtual_account_email?: string;
  payment_using: string;
  module_name: string;
  status_transaction: PaymentTransaction_1.StatusTransaction;
  paid_amount: number;
  app_module: PaymentTransaction_1.AppModule;
}): Promise<PaymentTransaction> => {
  try {
    const transaction = await PaymentTransaction.create(data);
    return transaction;
  } catch (error: any) {
    throw new Error('Error creating payment transaction: ' + error.message);
  }
};

// Get all payment transactions
const calculatePagination = (
  page: number,
  limit: number
): IPaginateSkipTake => {
  const skip = (page - 1) * limit;
  const take = limit;
  return { skip, take };
};

export const getAllPaymentTransactions = async (
  payload: IPaginatePayload
): Promise<IPaginateResult> => {
  try {
    const { page = 1, limit = 10, search = '', isDropdown } = payload;

    // Calculate pagination skip and take
    const { skip, take } = calculatePagination(page, limit);

    // Define search filter if search term is provided
    let searchCondition = {};
    if (search) {
      searchCondition = {
        [Op.or]: [
          { virtual_account_name: { [Op.like]: `%${search}%` } },
          { payment_using: { [Op.like]: `%${search}%` } },
          { status_transaction: { [Op.like]: `%${search}%` } },
          { app_module: { [Op.like]: `%${search}%` } }
        ]
      };
    }

    // Fetch total number of payment transactions
    const totalData = await PaymentTransaction.count();

    // Fetch total filtered records based on search condition
    const totalFiltered = await PaymentTransaction.count({
      where: searchCondition
    });

    // Fetch the payment transactions with pagination and search condition
    const transactions = await PaymentTransaction.findAll({
      where: searchCondition,
      offset: skip, // Skipping rows based on the page
      limit: take, // Limiting the number of rows fetched
      order: [['created_at', 'DESC']] // Optional: order by creation date
    });

    // Return paginated result
    return {
      totalData,
      totalFiltered,
      transactions, // The paginated list of transactions
      currentPage: page,
      pageSize: limit
    };
  } catch (error: any) {
    throw new Error('Error fetching payment transactions: ' + error.message);
  }
};

// Get a payment transaction by ID
export const getPaymentTransactionById = async (
  id: string
): Promise<PaymentTransaction | null> => {
  try {
    const transaction = await PaymentTransaction.findOne({ where: { id } });
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    return transaction;
  } catch (error: any) {
    throw new Error('Error fetching payment transaction: ' + error.message);
  }
};

// Update a payment transaction by ID
export const updatePaymentTransactionById = async (
  id: string,
  data: Partial<{
    trx_id: string;
    invoice_number?: string;
    virtual_account_number?: string;
    virtual_account_name?: string;
    virtual_account_email?: string;
    payment_using: string;
    module_name: string;
    status_transaction: PaymentTransaction_1.StatusTransaction;
    paid_amount: number;
    app_module: PaymentTransaction_1.AppModule;
  }>
): Promise<[number, PaymentTransaction[]]> => {
  try {
    const [affectedCount, updatedTransactions] =
      await PaymentTransaction.update(data, {
        where: { id },
        returning: true
      });
    if (affectedCount === 0) {
      throw new Error('Transaction not found or no changes made');
    }
    return [affectedCount, updatedTransactions];
  } catch (error: any) {
    throw new Error('Error updating payment transaction: ' + error.message);
  }
};

// Delete a payment transaction by ID
export const deletePaymentTransactionById = async (
  id: string
): Promise<number> => {
  try {
    const affectedCount = await PaymentTransaction.destroy({ where: { id } });
    if (affectedCount === 0) {
      throw new Error('Transaction not found');
    }
    return affectedCount;
  } catch (error: any) {
    throw new Error('Error deleting payment transaction: ' + error.message);
  }
};

export const getPaymentTransactionByTrxId = async (
  trxId: string
): Promise<PaymentTransaction | null> => {
  try {
    const transaction = await PaymentTransaction.findOne({
      where: { trx_id: trxId } // Search by trx_id instead of id
    });

    // Return the transaction if found; otherwise, return null
    return transaction;
  } catch (error: any) {
    // Optionally log the error for debugging purposes
    console.error('Error fetching payment transaction:', error.message);
    return null; // Return null in case of an error
  }
};
