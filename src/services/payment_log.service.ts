import PaymentLog from '../models/payment_log.model'; // Adjust path as needed

// Create a new payment log entry
export async function createPaymentLog(success_data: {
  endpoint: string;
  status_module: string;
  module_name: string;
  virtual_account_name: string;
  virtual_account_number: string;
  request_payload: object;
  response_payload: object;
}): Promise<any> {
  try {
    const newPaymentLog = await PaymentLog.create({
      endpoint: success_data.endpoint,
      status_module: success_data.status_module,
      module_name: success_data.module_name,
      virtual_account_name: success_data.virtual_account_name,
      virtual_account_number: success_data.virtual_account_number,
      request_payload: JSON.stringify(success_data.request_payload),
      response_payload: JSON.stringify(success_data.response_payload)
    });

    return newPaymentLog;
  } catch (error) {
    console.error('Error creating payment log:', error);
    throw error;
  }
}

// Fetch a payment log entry by id
export async function getPaymentLogById(
  id: number
): Promise<PaymentLog | null> {
  try {
    const paymentLog = await PaymentLog.findByPk(id);
    return paymentLog;
  } catch (error) {
    console.error('Error fetching payment log by id:', error);
    throw error;
  }
}

// Update an existing payment log entry
export async function updatePaymentLog(
  id: number,
  module_name: string,
  status_module: string,
  virtualAccountName: string,
  virtualAccountNumber: string,
  requestPayload: string,
  responsePayload: string
): Promise<PaymentLog | null> {
  try {
    const paymentLog = await PaymentLog.findByPk(id);

    if (!paymentLog) {
      throw new Error(`Payment log with id ${id} not found.`);
    }

    paymentLog.status_module = status_module;
    paymentLog.module_name = module_name;
    paymentLog.virtual_account_name = virtualAccountName;
    paymentLog.virtual_account_number = virtualAccountNumber;
    paymentLog.request_payload = requestPayload;
    paymentLog.response_payload = responsePayload;

    await paymentLog.save();
    return paymentLog;
  } catch (error) {
    console.error('Error updating payment log:', error);
    throw error;
  }
}

// Delete a payment log entry by id
export async function deletePaymentLog(id: number): Promise<void> {
  try {
    const paymentLog = await PaymentLog.findByPk(id);

    if (!paymentLog) {
      throw new Error(`Payment log with id ${id} not found.`);
    }

    await paymentLog.destroy();
  } catch (error) {
    console.error('Error deleting payment log:', error);
    throw error;
  }
}
