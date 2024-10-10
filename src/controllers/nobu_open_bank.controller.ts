import { Request, Response } from 'express';
import {
  generate_b2b_token,
  GetBankStatement
} from '../services/nobu_data.service';
import { OK } from '../utils/response/common.response';
import { RequestSinglePage } from '../ThirdParty/NOBU_DATA_OPEN_BANK/Nobu_open_bank_gateway';

export async function generate_b2b_token_nobu(req: Request, res: Response) {
  try {
    const { grantType } = req.body;

    const token = await generate_b2b_token(grantType);

    return OK(res, 'Success', token);
  } catch (error: any) {
    if (error.response) {
      // API responded with an error, return that error message
      return res.status(error.response.status).json({
        responseCode: error.response.data.responseCode || 'Unknown code',
        responseMessage: error.response.data.responseMessage || 'Unknown error'
      });
    } else {
      // Some other error (e.g., network error or unexpected error)
      return res.status(500).json({
        message: 'Internal server error',
        error: error.message || 'An unknown error occurred'
      });
    }
  }
}

export async function GetBankStatementController(req: Request, res: Response) {
  try {
    // Extract necessary data from the request body
    const {
      partnerReferenceNo,
      bankCardToken,
      accountNo,
      fromDateTime,
      toDateTime,
      additionalInfo
    } = req.body;

    // Construct the payload for GetBankStatement
    const payload: RequestSinglePage = {
      partnerReferenceNo,
      bankCardToken,
      accountNo,
      fromDateTime,
      toDateTime,
      additionalInfo
    };

    // Call GetBankStatement with the constructed payload
    const token = await GetBankStatement(payload);

    // Return successful response
    return OK(res, 'Success', token);
  } catch (error: any) {
    if (error.response) {
      // API responded with an error, return that error message
      return res.status(error.response.status).json({
        responseCode: error.response.data.responseCode || 'Unknown code',
        responseMessage: error.response.data.responseMessage || 'Unknown error'
      });
    } else {
      // Some other error (e.g., network error or unexpected error)
      return res.status(500).json({
        message: 'Internal server error',
        error: error.message || 'An unknown error occurred'
      });
    }
  }
}
