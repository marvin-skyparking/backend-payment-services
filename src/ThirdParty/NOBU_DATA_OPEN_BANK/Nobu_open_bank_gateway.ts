import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface Headers {
  'Content-type': string;
  'X-TIMESTAMP': string;
  'X-SIGNATURE': string;
  'X-PARTNER-ID': string;
  'X-EXTERNAL-ID': string;
  'CHANNEL-ID': string;
  'X-IP-ADDRESS': string;
}

export interface RequestSinglePage {
  partnerReferenceNo: string;
  bankCardToken: string;
  accountNo: string;
  fromDateTime: string;
  toDateTime: string;
  additionalInfo: object;
}

export interface RequestMultiplePage {
  partnerReferenceNo: string;
  bankCardToken: string;
  accountNo: string;
  fromDateTime: string;
  toDateTime: string;
  additionalInfo: object;
}

interface additionalInfos {
  partnerId: string;
}

export interface RequestAccessToken {
  grantType: string;
  additionalInfo: additionalInfos;
}

// Define the path to your public key file
const publicKeyPath = path.join(__dirname, 'sky-nobu-public.pem');
const privateKeyPath = path.join(__dirname, 'sky-nobu-private.pem');

// Read the public key file
const PUBLIC_KEY = fs.readFileSync(publicKeyPath, 'utf8');
const PRIVATE_KEY = fs.readFileSync(privateKeyPath, 'utf8');

// Utility function to generate SHA-256 hash of a string
export function hashSHA256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function generateHMACSignature(
  stringToSign: string,
  secretKey: string
): string {
  return crypto
    .createHmac('sha512', secretKey)
    .update(stringToSign)
    .digest('hex');
}
/**
 * Generate asymmetric signature using the private key
 */
export function signAsymmetricSignature(stringToSign: string): string {
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(stringToSign);
  sign.end();
  const signature = sign.sign(PRIVATE_KEY, 'base64'); // Use the private key to sign
  return signature;
}

/**
 * Verify the asymmetric signature using the public key
 */
export function verifyAsymmetricSignature(
  signature: string,
  stringToSign: string
): boolean {
  try {
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(stringToSign);
    verifier.end();
    const isValid = verifier.verify(
      PUBLIC_KEY,
      Buffer.from(signature, 'base64')
    );
    return isValid;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

export function generateStringToSign(
  clientKey: string,
  timestamp: string
): string {
  return `${clientKey}|${timestamp}`;
}

// Function to sign the string using SHA256withRSA (RSA-SHA256)
export function signWithRSA(stringToSign: string): string {
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(stringToSign);
  sign.end();
  return sign.sign(PRIVATE_KEY, 'base64'); // Generate RSA signature and encode in base64
}

export function generateStringToSignTransactional(
  httpMethod: string,
  relativePath: string,
  accessToken: string,
  requestBody: object,
  timestamp: string
): string {
  // Minify the request body (no extra whitespace)
  const minifiedRequestBody = JSON.stringify(requestBody).replace(/\s+/g, '');

  // Hash the request body using SHA-256
  const hashedRequestBody = hashSHA256(minifiedRequestBody);

  // Convert the hash to lowercase
  const lowercaseHashBody = hashedRequestBody.toLowerCase();

  // Return the constructed string to sign
  return `${httpMethod}:${relativePath}:${accessToken}:${lowercaseHashBody}:${timestamp}`;
}
