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
  signWithRSA,
  verifyAsymmetricSignature,
  verifyAsymmetricSignatureNobu
} from '../ThirdParty/NOBU_DATA_VA/Nobu_open_bank_gateway';
import https from 'https';
import { NOBU_Message } from '../constant/nobu_message';
import { isValidTimestampFormat } from '../utils/helper.utils';

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
      !Payment_using ||
      !virtualAccountName ||
      !virtualAccountEmail ||
      !totalAmount
    ) {
      return res.status(400).json({
        message:
          'Missing required fields:  virtualAccountNo, virtualAccountName, virtualAccountEmail, totalAmount'
      });
    }

    // Prepare payload
    const payload = {
      partnerServiceId: data_VA.partner_key ?? '',
      partnerBank: data_VA.bank_id ?? '',
      AppModule,
      customerNo,
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
          invoice_number: req.body.Invoice,
          virtual_account_number:
            paymentData.virtualAccountData.virtualAccountNo,
          virtual_account_name:
            paymentData.virtualAccountData.virtualAccountName,
          virtual_account_email:
            paymentData.virtualAccountData.virtualAccountEmail,
          payment_using: req.body.Payment_using,
          module_name: 'BAYARIND' + 'BCA' + req.body.Payment_using,
          status_transaction: StatusTransaction.PENDING,
          paid_amount: paymentData.virtualAccountData.totalAmount.value,
          app_module: req.body.AppModule
        };

        const insert_transaction = await createPaymentTransaction(data);
        console.log(insert_transaction);
        return res.status(201).json({
          message: 'Virtual Account created successfully',
          data: paymentData
        });
      }
    } else if (data_VA.code_bank === 'NATIONALNOBU') {
      const ClientId = payload.ClientId;

      if (!ClientId) {
        return BadRequest(res, 'failed Not Found');
      }

      //const token = await generate_b2b_token_VA(ClientId)

      // const paymentData = await SNAP_NOBU_VA({
      //   ...payload,
      //   ClientId: payload.ClientId || 'default-client-id',  // Provide a default value when undefined
      // });
    }
    // // Return success response
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
        `http://localhost:9000/v1/productPurchase/receivePayment`,
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

  const id_bank = 'b1ea702f-ddbc-44ea-ac80-44542365b3c5'

  const validate_key = await findPaymentServiceById(id_bank)

  const client_key = validate_key?.dataValues.client_secret

  if(clientKey!=client_key){
    return res.status(401).send(NOBU_Message.Invalid_Client_Key);
  }

  const validate_token = verifyAsymmetricSignatureNobu(signature,clientKey,timestamp)

 console.log(validate_token)

}
