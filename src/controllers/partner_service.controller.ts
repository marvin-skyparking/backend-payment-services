import { Request, Response } from 'express';
import {
  createPaymentService,
  findPaymentServiceById,
  getAllPaymentServices,
  updatePaymentServiceById
} from '../services/partner_data.service';
import { validTypePayments } from '../constant/payment_type';
import { Bank } from '../constant/indonesian_bank';

//Validate Bank Code
function isValidBankCode(code_bank: string): boolean {
  return Bank.some((bank) => bank.code === code_bank);
}

export async function createPaymentServiceController(
  req: Request,
  res: Response
) {
  try {
    const {
      partner_key,
      bank_id,
      channel_id,
      code_bank,
      type_payment,
      gateway_partner,
      client_secret,
      secret_key
    } = req.body;

    if (!type_payment) {
      return res.status(400).json({ message: 'type_payment is required' });
    }

    if (!validTypePayments.includes(type_payment)) {
      return res.status(400).json({
        message: `type_payment must be one of the following: ${validTypePayments.join(', ')}`
      });
    }

    // Validate code_bank against the available Bank codes
    if (!code_bank) {
      return res.status(400).json({ message: 'code_bank is required' });
    }

    if (!isValidBankCode(code_bank)) {
      return res.status(400).json({
        message: `Invalid code_bank. Available codes are: ${Bank.map((b) => b.code).join(', ')}`
      });
    }

    const newPaymentService = await createPaymentService({
      partner_key,
      bank_id,
      channel_id,
      code_bank,
      type_payment,
      gateway_partner,
      client_secret,
      secret_key
    });

    return res.status(201).json(newPaymentService);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Controller to get payment service data by ID
 * @param req The request object (expects id as a route param)
 * @param res The response object
 */
export async function getPaymentServiceById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const paymentServiceData = await findPaymentServiceById(id);

    if (!paymentServiceData) {
      return res.status(404).json({ message: 'Payment service not found' });
    }

    return res.status(200).json(paymentServiceData);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Controller to get all payment service data
 * @param req The request object
 * @param res The response object
 */
export async function getAllPaymentServicesController(
  req: Request,
  res: Response
) {
  try {
    const paymentServices = await getAllPaymentServices();
    return res.status(200).json(paymentServices);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Controller to update payment service data by ID
 * @param req The request object (expects id as a route param, and update data in the body)
 * @param res The response object
 */
export async function updatePaymentServiceByIdController(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedPaymentService = await updatePaymentServiceById(
      id,
      updateData
    );

    if (!updatedPaymentService) {
      return res.status(404).json({ message: 'Payment service not found' });
    }

    return res.status(200).json(updatedPaymentService);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
