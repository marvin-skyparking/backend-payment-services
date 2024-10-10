import axios from 'axios';
import {
  generateStringToSign,
  RequestSinglePage,
  RequestAccessToken,
  signWithRSA,
  generateStringToSignTransactional,
  generateHMACSignature
} from '../ThirdParty/NOBU_DATA_OPEN_BANK/Nobu_open_bank_gateway';
import {
  generateRandomNumber,
  getCurrentTimestamp
} from '../utils/helper.utils';
import https from 'https';

export async function generate_b2b_token(grantType: string) {
  const timestamp = getCurrentTimestamp();
  const clientKey = '6b722b86-57b7-4a44-b3de-46e23b2bf75b';

  const stringToSign = generateStringToSign(clientKey, timestamp);

  const signature = signWithRSA(stringToSign);

  const headers = {
    'Content-Type': 'application/json',
    'X-TIMESTAMP': timestamp,
    'X-SIGNATURE': signature,
    'X-CLIENT-KEY': clientKey
  };

  const requestBody: RequestAccessToken = {
    grantType: grantType,
    additionalInfo: {
      partnerId: '6b722b8657b74a44b3de46e23b2bf75b'
    }
  };

  //REJECT SSL
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false // Disable SSL verification (for self-signed certificates)
  });

  try {
    const response = await axios.post(
      'https://sandbox.nobubank.com:8065/v2.0/access-token/b2b/',
      requestBody,
      {
        headers,
        httpsAgent
      }
    );

    console.log('Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      'Error making request:',
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}

export async function GetBankStatement(
  payload: RequestSinglePage
): Promise<any> {
  //REJECT SSL
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false // Disable SSL verification (for self-signed certificates)
  });

  const timestamp = getCurrentTimestamp();
  const partner_id = '6b722b8657b74a44b3de46e23b2bf75b';
  const httpMethod = 'POST';
  const relativePath = '/v1.0/bank-statement/';
  const requestBody = payload;
  const accessToken = 'WPCD2UlSbHv2pUXTnYk9vHoUyAmq8LL3LACBLC7kCyqL8XyZdrC1Dh';

  const stringToSign = generateStringToSignTransactional(
    httpMethod,
    relativePath,
    accessToken,
    requestBody,
    timestamp
  );

  // Generate the HMAC signature (you may need to replace 'your_secret_key' with the actual secret key)
  const secretKey = 'ed2af514-1e15-4fdc-a0f0-a7168aa3393f'; // Replace with your actual secret key used for HMAC
  const signature = generateHMACSignature(stringToSign, secretKey);

  const IPADDRESS = await axios.get('https://api.ipify.org?format=json');

  const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + accessToken,
    'X-TIMESTAMP': timestamp,
    'X-PARTNER-ID': partner_id,
    'X-EXTERNAL-ID': generateRandomNumber(16),
    'X-SIGNATURE': signature,
    'X-IP-ADDRESS': IPADDRESS.data.ip
  };

  const response = await axios.post(
    'https://sandbox.nobubank.com:8065/v1.0/bank-statement/',
    requestBody,
    { headers, httpsAgent }
  );

  return response.data;
}
