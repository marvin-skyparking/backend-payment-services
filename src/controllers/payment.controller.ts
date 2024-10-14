import { Request, Response } from 'express';
import {
  Inqury_Status_VA,
  PAYMENT_VA,
  SNAP_BCA_VA,
  SNAP_NOBU_VA
} from '../services/payment.service';
import {
  completedPaymentServiceByTrxId,
  findPaymentServiceById
} from '../services/partner_data.service';
import {
  BadRequest,
  NotFound,
  ServerError
} from '../utils/response/common.response';
import { InquryStatus, StatusTransaction } from '../models/payment.model';
import {
  createPaymentTransaction,
  getPaymentTransactionByTrxId
} from '../services/transaction.service';
import { PaymentRequest } from '../ThirdParty/BAYARIND_DATA_VA/BayarINDPaymentGateway';
import { BayarIND_Message } from '../constant/bayarind_message';
import axios from 'axios';
import {
  generateStringToSign,
  signAsymmetricSignatureString,
  verifyAsymmetricSignatureNobu
} from '../ThirdParty/NOBU_DATA_VA/Nobu_open_bank_gateway';
import https from 'https';
import { NOBU_Message } from '../constant/nobu_message';
import {
  generateRandomNumber,
  isValidTimestampFormat
} from '../utils/helper.utils';
import { createPaymentLog } from '../services/payment_log.service';
import jwtUtils from '../utils/jwt.utils';

// Create Virtual Account
export async function createVAController(req: Request, res: Response) {
  try {
    const VA_ID = req.params.id;
    const data_VA = await findPaymentServiceById(VA_ID);

    if (!data_VA) {
      return NotFound(res, 'Virtual Account Pembayaran Tidak Ada');
    }
    //Extract payload data from request body
    const {
      customerNo,
      AppModule,
      Invoice,
      ExpiredDate,
      Payment_using,
      virtualAccountName,
      virtualAccountEmail,
      totalAmount
    } = req.body;

    // Validate that required fields are present
    if (
      !customerNo ||
      !AppModule ||
      !Invoice ||
      !ExpiredDate ||
      !Payment_using ||
      !virtualAccountName ||
      !virtualAccountEmail ||
      !totalAmount
    ) {
      return res.status(400).json({
        message:
          'Missing required fields:  virtualAccountNo, virtualAccountName, virtualAccountEmail, totalAmount, ExpiredDate'
      });
    }

    // Prepare payload
    const payload = {
      partnerServiceId: data_VA.partner_key ?? '',
      partnerBank: data_VA.bank_id ?? '',
      AppModule,
      customerNo,
      ExpiredDate,
      virtualAccountName,
      virtualAccountEmail,
      totalAmount,
      channelId: data_VA.channel_id ?? '',
      ClientId: data_VA.client_secret
    };

    if (data_VA.code_bank === 'BCA') {
      const paymentData = await SNAP_BCA_VA({
        ...payload,
        ClientId: payload.ClientId || 'none' // Provide a default value when undefined
      });

      if (paymentData.responseCode === '2002700') {
        const data = {
          trx_id: paymentData.virtualAccountData.trxId,
          expired_date: paymentData.virtualAccountData.expiredDate,
          invoice_number: req.body.Invoice,
          virtual_account_number:
            paymentData.virtualAccountData.virtualAccountNo.trim(),
          virtual_account_name:
            paymentData.virtualAccountData.virtualAccountName,
          virtual_account_email:
            paymentData.virtualAccountData.virtualAccountEmail,
          payment_using: req.body.Payment_using,
          module_name: 'BAYARIND' + '_BCA_' + req.body.Payment_using,
          status_transaction: StatusTransaction.PENDING,
          paid_amount: paymentData.virtualAccountData.totalAmount.value,
          app_module: req.body.AppModule
        };

        const insert_transaction = await createPaymentTransaction(data);

        const success_data = {
          status_module: 'SUCCESS',
          endpoint: 'create-va',
          module_name: data.module_name,
          virtual_account_name: data.virtual_account_name,
          virtual_account_number: data.virtual_account_number,
          request_payload: payload,
          response_payload: paymentData
        };
        const final_data = {
          ...success_data,
          ClientId: payload.ClientId || 'none'
        };
        const insert_log = await createPaymentLog(final_data);

        if (!insert_log) {
          return ServerError(req, res, 'Failed To Insert Log');
        }
        console.log(insert_transaction);

        return res.status(201).json({
          paymentData
        });
      } else {
        const data_error = {
          status_module: 'FAILED',
          endpoint: 'create-va',
          module_name: 'BAYARIND_BCA_VIRTUAL_ACCOUNT',
          virtual_account_name: payload.virtualAccountName,
          virtual_account_number: payload.partnerBank + payload.customerNo,
          request_payload: payload,
          response_payload: paymentData
        };
        const final_data = {
          ...data_error,
          ClientId: payload.ClientId || 'none'
        };
        const insert_log = await createPaymentLog(final_data);

        if (!insert_log) {
          return ServerError(req, res, 'Failed To Insert Log');
        }

        return res.status(400).json({
          paymentData
        });
      }
    } else if (data_VA.code_bank === 'NATIONALNOBU') {
      const ClientId = payload.ClientId;

      if (!ClientId) {
        return BadRequest(res, 'failed Not Found');
      }
      const trx_id = generateRandomNumber(16);

      const paymentData = {
        responseCode: '200700',
        responseMessage: 'Successful',
        virtualAccountData: {
          trx_id: trx_id,
          expired_date: req.body.ExpiredDate,
          invoice_number: req.body.Invoice,
          virtual_account_number:
            `${payload.partnerBank}` + `${payload.customerNo}`.padStart(8, '0'),
          virtual_account_name: payload.virtualAccountName,
          virtual_account_email: payload.virtualAccountEmail,
          payment_using: req.body.Payment_using,
          module_name: 'BANK_NATIONAL' + '_NOBU_' + req.body.Payment_using,
          status_transaction: StatusTransaction.PENDING,
          paid_amount: payload.totalAmount,
          app_module: req.body.AppModule
        }
      };

      const insert_transaction = await createPaymentTransaction({
        ...paymentData.virtualAccountData,
        virtual_account_number:
          paymentData.virtualAccountData.virtual_account_number.trim()
      });

      if (!insert_transaction) {
        return res.status(500).json({ message: 'Failed Create History' });
      }

      return res.status(201).json({ paymentData });
    }
  } catch (error: any) {
    console.error('Error creating virtual account:', error);

    // Return error response
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
}

export async function inquiryStatusVAController(req: Request, res: Response) {
  try {
    const VA_ID = req.params.id;

    // Find the virtual account payment service by ID
    const data_VA = await findPaymentServiceById(VA_ID);

    // If no virtual account is found, return a 404 error
    if (!data_VA) {
      return NotFound(res, 'Virtual Account Pembayaran Tidak Ada');
    }

    // Extract payload data from request body
    const {
      customerNo,
      additionalInfo // Extract the additionalInfo array from the request body
    } = req.body;

    // Validate that required fields are present
    if (
      !customerNo ||
      !additionalInfo ||
      !additionalInfo[0]?.trxId ||
      !additionalInfo[0]?.trxDateInit
    ) {
      return res.status(400).json({
        message: 'Missing required fields: customerNo, trxId, trxDateInit'
      });
    }

    const trxId = additionalInfo[0].trxId;
    const trxDateInit = additionalInfo[0].trxDateInit;

    // Prepare the payload for the VA service
    const payload: InquryStatus = {
      partnerServiceId: data_VA.partner_key ?? '',
      partnerBank: data_VA.bank_id ?? '',
      customerNo,
      channelId: data_VA.channel_id ?? '',
      trxId, // Now passing trxId directly
      trxDateInit, // Now passing trxDateInit directly
      additionalInfo: [
        {
          trxId,
          trxDateInit
        }
      ]
    };

    // Call the SNAP_BCA_VA service with the prepared payload
    const paymentData = await Inqury_Status_VA(payload);

    if (paymentData.responseCode === '2002600') {
      return res.status(200).json({
        message: 'Virtual Account inquiry completed successfully',
        data: paymentData
      });
    }

    if (paymentData.responseCode === '4012600')
      return res.status(401).json({
        responseCode: '4012600',
        responseMessage: 'Unauthorized. [verify sign failed]'
      });
  } catch (error: any) {
    console.error('Error processing virtual account inquiry:', error);

    // Return error response
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
}

export const createPaymentVA = async (req: Request, res: Response) => {
  try {
    // Extract payload from request body
    const payload: PaymentRequest = req.body;

    const validate_transaction = await getPaymentTransactionByTrxId(
      payload.trxId
    );

    if (!payload.partnerServiceId || payload.partnerServiceId.trim() === '') {
      return res.status(400).send(BayarIND_Message.MissingPartnerId);
    }

    if (!validate_transaction) {
      return res.status(404).send(BayarIND_Message.BillNotFound);
    }

    if (validate_transaction.dataValues.status_transaction === 'COMPLETED') {
      return res.status(400).send(BayarIND_Message.BillAlreadyPay);
    }

    if (Number(payload.paidAmount.value) !== validate_transaction.paid_amount) {
      // Your logic here
      return res.status(400).send(BayarIND_Message.InvalidAmount);
    }

    // Validate expired Date
    const currentDate = new Date();
    const expirationDate = new Date(validate_transaction.expired_date);

    if (currentDate > expirationDate) {
      return res.status(400).send(BayarIND_Message.ExpiredDate);
    }

    const update_payment_transaction = await completedPaymentServiceByTrxId(
      payload.trxId
    );

    if (
      update_payment_transaction?.dataValues.status_transaction !== 'COMPLETED'
    ) {
      return res.status(500).json({ error: 'Failed to Update Payment' });
    }

    // Call the PAYMENT_VA function
    const result = await PAYMENT_VA(payload);

    //Return to the APP
    if (
      update_payment_transaction?.dataValues.app_module === 'APP_MEMBERSHIP'
    ) {
      const requestBody = update_payment_transaction?.dataValues;

      const response = await axios.post(
        `https://apimembershipservice.skyparking.online/v1/productPurchase/receivePayment`,
        requestBody
      );

      console.log(response);
    }
    // Return the result to the client
    return res.status(200).json(result);
  } catch (error: any) {
    // Handle any errors
    res.status(500).json({ error: error.message });
  }
};

export async function generate_b2b_token_VA(req: Request, res: Response) {
  const content_type = req.headers['content-type'] as string;
  const timestamp = req.headers['x-timestamp'] as string;
  const clientKey = req.headers['x-client-key'] as string;
  const signature = req.headers['x-signature'] as string;

  if (content_type !== 'application/json') {
    return res.status(400).send(NOBU_Message.Invalid_Format_Content_Type);
  }

  if (!timestamp) {
    return res.status(400).send(NOBU_Message.Null_Format_XSTAMP);
  }

  if (!isValidTimestampFormat(timestamp)) {
    return res.status(400).send(NOBU_Message.Invalid_Format_XSTAMP);
  }

  const id_bank = 'b1ea702f-ddbc-44ea-ac80-44542365b3c5';

  const validate_key = await findPaymentServiceById(id_bank);

  const client_key = validate_key?.dataValues.client_secret;

  if (clientKey != client_key) {
    return res.status(401).send(NOBU_Message.Invalid_Client_Key);
  }

  const validate_token = verifyAsymmetricSignatureNobu(
    signature,
    client_key,
    timestamp
  );

  if (!validate_token) {
    return res.status(401).send(NOBU_Message.Invalid_Signature);
  }

  const tokenResponse = await jwtUtils.generateH256Token({
    clientKey,
    signature,
    timestamp
  });

  return res.status(200).json({
    responseCode: '2007300',
    responseMessage: 'Request has been processed successfully',
    accessToken: tokenResponse, // Return the generated token
    expiresIn: '3600', //hours
    additionalInfo: {}
  });
}

export async function simulateSignatureController(req: Request, res: Response) {
  try {
    // Extract clientKey and timestamp from the request body
    const { clientKey, timestamp } = req.body;

    if (!clientKey || !timestamp) {
      return res
        .status(400)
        .json({ error: 'clientKey and timestamp are required.' });
    }

    // Generate the string to sign
    const stringToSign = generateStringToSign(clientKey, timestamp);

    // Sign the string using RSA-SHA256
    const signature = signAsymmetricSignatureString(stringToSign);

    // Return the signed string (signature)
    return res.status(200).json({
      message: 'Signature generated successfully',
      stringToSign,
      signature
    });
  } catch (error) {
    console.error('Error generating signature:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// export async function generateB2BTokenVA(req: Request, res: Response) {
//   try {
//     // Extract headers and ensure they exist
//     const contentType = req.headers['content-type'] as string;
//     const timestamp = req.headers['x-timestamp'] as string;
//     const clientKey = req.headers['x-client-key'] as string;
//     const signature = req.headers['x-signature'] as string;

//     // Check if headers are missing
//     if (!contentType || contentType !== 'application/json') {
//       return res.status(400).send('Invalid Content-Type, expected application/json.');
//     }

//     if (!timestamp) {
//       return res.status(400).send('X-TIMESTAMP header is missing.');
//     }

//     if (!clientKey) {
//       return res.status(400).send('X-CLIENT-KEY header is missing.');
//     }

//     if (!signature) {
//       return res.status(400).send('X-SIGNATURE header is missing.');
//     }

//     const verifysignature = await verifyAsymmetricSignatureNobu(signature, clientKey,timestamp)
//     console.log(verifysignature)
//     // Proceed with additional validation and logic
//     // For example, validating timestamp and signature

//   } catch (error) {
//     console.error('Error:', error);
//     return res.status(500).send('An internal server error occurred.');
//   }
// }
