import { UserAttributes } from '../models/customer.model';
import { PaymentAttributes } from '../models/payment.model';

// Example sanitize function for user data
export async function sanitizeUser(
  user: UserAttributes
): Promise<Partial<UserAttributes>> {
  // Define fields you want to include in sanitized output
  const { id, name, username, email, phoneNumber } = user;
  return {
    id,
    name,
    username,
    email,
    phoneNumber
  };
}

export async function sanitizeVirtualAccountResponse(
  response: any
): Promise<Partial<PaymentAttributes>> {
  const {
    price,
    customerNo,
    virtualAccountNo,
    name,
    username,
    status_payment
  } = response;
  return {
    price,
    customerNo,
    virtualAccountNo: virtualAccountNo.trim(), // Trimming if necessary
    name,
    username,
    status_payment
  };
}
