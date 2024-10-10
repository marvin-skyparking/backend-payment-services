export const BayarIND_Message = {
  Sign_In_Failed: {
    responseCode: '4012600',
    responseMessage: 'Unauthorized. [verify sign failed]'
  },

  ExpiredDate: {
    responseCode: '4042419',
    responseMessage: 'Bill expired',
    virtualAccountData: {}
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
  }
};
