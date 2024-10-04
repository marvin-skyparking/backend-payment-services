import PaymentServiceData, {
  PaymentServiceDataCreationAttributes
} from '../models/partner_service_data.model';
import { Op } from 'sequelize';
import { PaymentTransaction, StatusTransaction } from '../models/payment.model';

/**
 * Create a new payment service data record
 * @param data The data to create a new payment service data record
 * @returns The newly created payment service data record
 */
export async function createPaymentService(
  data: PaymentServiceDataCreationAttributes
): Promise<PaymentServiceData> {
  const newPaymentService = await PaymentServiceData.create(data);
  return newPaymentService;
}

/**
 * Find payment service data by ID
 * @param id The ID of the payment service data
 * @returns The payment service data record, if found, or null if not
 */
export async function findPaymentServiceById(
  id: string
): Promise<PaymentServiceData | null> {
  const paymentServiceData = await PaymentServiceData.findByPk(id);
  return paymentServiceData;
}

export async function findPaymentServiceByPartnerId(
  partner: string
): Promise<PaymentServiceData | null> {
  const paymentServiceData = await PaymentServiceData.findOne({
    where: {
      bank_id: partner // Find by the partner_key column
    }
  });
  return paymentServiceData;
}

/**
 * Get all payment service data
 * @returns A list of payment service data records
 */
export async function getAllPaymentServices(): Promise<PaymentServiceData[]> {
  const paymentServices = await PaymentServiceData.findAll();
  return paymentServices;
}

/**
 * Update payment service data by ID
 * @param id The ID of the payment service data
 * @param updateData The data to update in the payment service data record
 * @returns The updated payment service data record, if successful, or null if not
 */
export async function updatePaymentServiceById(
  id: string,
  updateData: Partial<PaymentServiceData>
): Promise<PaymentServiceData | null> {
  const paymentServiceData = await PaymentServiceData.findByPk(id);

  if (!paymentServiceData) {
    return null; // If the record is not found
  }

  await paymentServiceData.update(updateData);
  return paymentServiceData;
}

export async function findPaymentServiceByTrxId(
  trxId: string
): Promise<PaymentTransaction | null> {
  const paymentServiceData = await PaymentTransaction.findOne({
    where: {
      trx_id: trxId // Find by the trx_id column
    }
  });
  return paymentServiceData;
}

export async function completedPaymentServiceByTrxId(
  trxId: string
): Promise<PaymentTransaction | null> {
  // Find the payment transaction by trx_id
  const paymentTransaction = await PaymentTransaction.findOne({
    where: {
      trx_id: trxId // Find by the trx_id column
    }
  });

  if (!paymentTransaction) {
    // If no transaction is found, return null or handle the error
    return null;
  }

  // Update the status to COMPLETED using the enum
  paymentTransaction.status_transaction = StatusTransaction.COMPLETED;

  // Save the updated transaction
  await paymentTransaction.save();

  // Return the updated transaction
  return paymentTransaction;
}
