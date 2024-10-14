import {
  CreateVARequest,
  generateStringToSigns,
  InquiryStatusRequest,
  signAsymmetricSignature,
  verifySymmetricSignature,
  PaymentRequest
} from '../ThirdParty/BAYARIND_DATA_VA/BayarINDPaymentGateway';
import {
  generateRandomNumber,
  getCurrentTimestamp
} from '../utils/helper.utils';
import axios from 'axios';
import { BayarIND } from '../ThirdParty/BAYARIND_DATA_VA/bayarind_endpoint';
import EnvConfig from '../configs/env.config';
import { InquryStatus, PayloadVA } from '../models/payment.model';
import { findPaymentServiceByPartnerId } from './partner_data.service';
import {
  generateStringToSign,
  RequestAccessToken,
  signWithRSA
} from '../ThirdParty/NOBU_DATA_VA/Nobu_open_bank_gateway';
import https from 'https';
import { Unauthorized } from '../utils/response/common.response';

//SNAP BCA
export async function SNAP_BCA_VA(payload: PayloadVA): Promise<any> {
  const timestamp = getCurrentTimestamp();

  // Padding partnerServiceId and virtualAccountNo
  const paddedPartnerServiceId = payload.partnerBank.padStart(8, ' ');
  const paddedVirtualAccountNo = (
    paddedPartnerServiceId + payload.customerNo
  ).padStart(8, ' ');
  // Generate a unique external ID
  const externalID = generateRandomNumber(16);

  // const expiredDate = new Date();

  // // Add 1 day (24 hours)
  // expiredDate.setDate(expiredDate.getDate() + 1);

  // // Format the date string without milliseconds and with Jakarta timezone
  // const formattedExpiredDate =
  //   expiredDate.toISOString().slice(0, 19) + '+07:00';

  // Prepare the request body
  const requestBody: CreateVARequest = {
    partnerServiceId: paddedPartnerServiceId,
    customerNo: payload.customerNo,
    virtualAccountNo: paddedVirtualAccountNo,
    virtualAccountName: payload.virtualAccountName,
    virtualAccountEmail: payload.virtualAccountEmail,
    trxId: externalID,
    totalAmount: {
      value: `${payload.totalAmount}.00`, // Ensure this is a string representing the amount
      currency: 'IDR' // Currency in IDR (Indonesian Rupiah)
    },
    expiredDate: payload.ExpiredDate, // Assuming an expiration date is required
    billDetails: [
      {
        billDescription: {
          english: 'Payment #3428',
          indonesia: 'Pembayaran #3428'
        }
      }
    ], // Add more bill details here as necessary
    additionalInfo: []
  };

  // Prepare signing and headers
  const httpMethod = 'POST';
  const endpoint = BayarIND.create_va;
  const stringToSign = generateStringToSigns(
    httpMethod,
    endpoint,
    requestBody,
    timestamp
  );
  const signature = signAsymmetricSignature(stringToSign);

  if (!verifySymmetricSignature(signature, stringToSign)) {
    throw new Error('Invalid signature');
  }

  const headers = {
    Accept: '*/*',
    'Content-Type': 'application/json',
    'X-TIMESTAMP': timestamp,
    'X-SIGNATURE': signature,
    'X-PARTNER-ID': payload.partnerServiceId,
    'X-EXTERNAL-ID': externalID,
    'CHANNEL-ID': payload.channelId
  };

  // Make the request to BayarIND
  const response = await axios.post(
    `${EnvConfig.BAYARIND_DEV_URL}${BayarIND.create_va}`,
    requestBody,
    { headers }
  );

  console.log(timestamp);
  console.log(requestBody);
  console.log(headers);
  console.log(response.data);
  // Process the response and return relevant data
  const paymentData = response.data;

  return paymentData; // Adjust the return type as necessary
}

export async function SNAP_NOBU_VA(payload: PayloadVA): Promise<any> {
  const timestamp = getCurrentTimestamp();
  // // Padding partnerServiceId and virtualAccountNo
  const paddedPartnerServiceId = payload.partnerBank.padStart(8, ' ');
  // const paddedVirtualAccountNo = (
  //   paddedPartnerServiceId + payload.customerNo
  // ).padStart(8, ' ');
  // // Generate a unique external ID
  // const externalID = generateRandomNumber(16);

  // const expiredDate = new Date();

  // // Add 1 day (24 hours)
  // expiredDate.setDate(expiredDate.getDate() + 1);
}

//Inqury Status VA
export async function Inqury_Status_VA(payload: InquryStatus): Promise<any> {
  const timestamp = getCurrentTimestamp();

  // Padding partnerServiceId and virtualAccountNo
  const paddedPartnerServiceId = payload.partnerBank.padStart(8, ' ');
  const paddedVirtualAccountNo = (
    paddedPartnerServiceId + payload.customerNo
  ).padStart(8, ' ');

  // Generate a unique external ID and InquiryRequest
  const inquiryRequestId = generateRandomNumber(20);
  const externalID = generateRandomNumber(20);

  // Prepare the request body
  const requestBody: InquiryStatusRequest = {
    partnerServiceId: paddedPartnerServiceId,
    customerNo: payload.customerNo,
    virtualAccountNo: paddedVirtualAccountNo,
    inquiryRequestId: inquiryRequestId,

    // Add additional info as an array of objects or key-value pairs
    additionalInfo: {
      trxId: payload.trxId,
      trxDateInit: payload.trxDateInit
    }
  };

  // Prepare signing and headers
  const httpMethod = 'POST';
  const endpoint = BayarIND.status_va;
  const stringToSign = generateStringToSigns(
    httpMethod,
    endpoint,
    requestBody,
    timestamp
  );
  const signature = signAsymmetricSignature(stringToSign);

  if (!verifySymmetricSignature(signature, stringToSign)) {
    throw new Error('Invalid signature');
  }

  const headers = {
    Accept: '*/*',
    'Content-Type': 'application/json',
    'X-TIMESTAMP': timestamp,
    'X-SIGNATURE': signature,
    'X-PARTNER-ID': payload.partnerServiceId,
    'X-EXTERNAL-ID': externalID,
    'CHANNEL-ID': payload.channelId
  };

  // Make the request to BayarIND
  const response = await axios.post(
    `${EnvConfig.BAYARIND_DEV_URL}${BayarIND.status_va}`,
    requestBody,
    { headers }
  );

  return response.data;
}

export async function PAYMENT_VA(payload: PaymentRequest): Promise<any> {
  const timestamp = getCurrentTimestamp();

  // Padding partnerServiceId and virtualAccountNo
  const paddedPartnerServiceId = payload.partnerServiceId.padStart(8, ' ');
  const paddedVirtualAccountNo = (
    paddedPartnerServiceId + payload.customerNo
  ).padStart(8, ' ');
  // Generate a unique external ID
  const externalID = generateRandomNumber(16);

  const expiredDate = new Date();

  // Add 1 day (24 hours)
  expiredDate.setDate(expiredDate.getDate() + 1);

  // Format the date string without milliseconds and with Jakarta timezone
  const formattedExpiredDate =
    expiredDate.toISOString().slice(0, 19) + '+07:00';

  // Prepare the request body
  const requestBody: PaymentRequest = {
    partnerServiceId: paddedPartnerServiceId,
    customerNo: payload.customerNo,
    virtualAccountNo: paddedVirtualAccountNo,
    virtualAccountName: payload.virtualAccountName,
    trxDateTime: payload.trxDateTime,
    channelCode: payload.channelCode,
    paymentRequestId: payload.paymentRequestId,
    paidAmount: {
      value: payload.paidAmount.value + `.00`, // Ensure this is a string representing the amount
      currency: 'IDR' // Currency in IDR (Indonesian Rupiah)
    },
    trxId: payload.trxId,
    journalNum: payload.journalNum,
    referenceNo: payload.referenceNo,
    flagAdvise: payload.flagAdvise,
    additionalInfo: {
      insertId: payload.additionalInfo.insertId,
      tagId: payload.additionalInfo.tagId,
      flagType: payload.additionalInfo.flagType
    }
  };

  // Prepare signing and headers
  const httpMethod = 'POST';
  const endpoint = `${EnvConfig.APP_URL}/v1/payment/v1.0/transfer-va/payment`;
  const stringToSign = generateStringToSigns(
    httpMethod,
    endpoint,
    requestBody,
    timestamp
  );
  const signature = signAsymmetricSignature(stringToSign);

  if (!verifySymmetricSignature(signature, stringToSign)) {
    throw new Error('Invalid signature');
  }

  const data_bank = await findPaymentServiceByPartnerId(
    paddedPartnerServiceId.trim()
  );

  if (!data_bank) {
    throw new Error('Payment Service Invalid');
  }

  const payload_success = {
    responseCode: '2002500',
    responseMessage: 'Success',
    virtualAccountData: {
      partnerServiceId: paddedPartnerServiceId,
      customerNo: payload.customerNo,
      virtualAccountNo: paddedVirtualAccountNo,
      virtualAccountName: payload.virtualAccountName,
      paymentRequestId: payload.paymentRequestId,
      paidAmount: {
        value: payload.paidAmount.value,
        currency: 'IDR'
      },
      paymentFlagReason: {
        english: 'Success',
        indonesia: 'Sukses'
      },
      additionalInfo: {
        insertId: payload.additionalInfo.insertId,
        tagId: payload.additionalInfo.tagId
      }
    }
  };
  return payload_success; // Adjust the return type as necessary
}
