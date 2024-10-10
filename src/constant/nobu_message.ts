export const NOBU_Message = {
  Invalid_Signature: {
    responseCode: '4002501',
    responseMessage: 'Unauthorized Signature'
  },
  Invalid_Format_Content_Type: {
    responseCode: '4002501',
    responseMessage: 'Invalid Field Format Content-Type Should application/json'
  },
  Invalid_Format_XSTAMP: {
    responseCode: '4002501',
    responseMessage: 'Invalid Field Format X-TIMESTAMP'
  },
  Invalid_Client_Key: {
    responseCode: '4002500',
    responseMessage: 'Unauthorized Client Key'
  },
  Null_Format_XSTAMP: {
    responseCode: '4002502',
    responseMessage: 'Invalid Mandatory Field X-TIMESTAMP'
  },
  BillNotFound: {
    responseCode: '4042512',
    responseMessage: 'Bill Not Found',
    virtualAccountData: {}
  },
  InvalidAmount: {
    responseCode: '4042513',
    responseMessage: 'Invalid Amount',
    virtualAccountData: {}
  },
  MissingPartnerId: {
    responseCode: '4002502',
    responseMessage: 'Missing Mandatory Field partnerServiceId',
    virtualAccountData: {}
  },
  InvalidBill: {
    responseCode: '4042512',
    responseMessage: 'Bill Not Found',
    virtualAccountData: {}
  },
  BillAlreadyPay: {
    responseCode: '4042414',
    responseMessage: 'Bill has been Paid',
    virtualAccountData: {}
  },
  OPEN_BANK_INVALID_TOKEN: {
    responseCode: '4011401',
    responseMessage: 'Access Token Invalid'
  }
};
