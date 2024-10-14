import jwt from 'jsonwebtoken';

import envConfig from '../configs/env.config';
import loggerUtils from './logger.utils';

const generate = async (payload: any, exp?: any) => {
  try {
    delete payload?.password;
    const token = jwt.sign(payload, envConfig.JWT_SECRET, {
      expiresIn: exp ?? '30d'
    });

    // const refresh_token = jwt.sign(payload, envConfig.JWT_SECRET, {expiresIn: '1y'})
    return {
      token: `${token}`
      // refresh_token: `Bearer ${refresh_token}`
    };
  } catch (error: any) {
    loggerUtils.error(error, error?.message);
    throw new Error(error?.message);
  }
};

const validateToken = async (token: any): Promise<any> => {
  try {
    const verify = jwt.verify(token, envConfig.JWT_SECRET);
    return verify;
  } catch (error: any) {
    throw new Error(error?.message);
  }
};

const generateH256Token = async (
  payload: any,
  options?: { algorithm?: jwt.Algorithm; expiresIn?: string }
) => {
  try {
    delete payload?.password; // Remove password if it exists

    // Default to 'HS256' if no algorithm is provided
    const token = jwt.sign(payload, envConfig.JWT_SECRET, {
      algorithm: options?.algorithm || 'HS256', // Correct placement of algorithm
      expiresIn: options?.expiresIn || '3600s' // Correct placement of expiresIn
    });

    return token;
  } catch (error: any) {
    loggerUtils.error(error, error?.message);
    throw new Error(error?.message);
  }
};

export default {
  generate: generate,
  validateToken: validateToken,
  generateH256Token: generateH256Token
};
