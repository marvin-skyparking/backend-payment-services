import express from 'express';
import {
  generate_b2b_token_nobu,
  GetBankStatementController
} from '../controllers/nobu_open_bank.controller';

const nobuRouter = express.Router();

// Parter Services
nobuRouter.post('/v1.0/getToken', generate_b2b_token_nobu);
nobuRouter.post('/v1.0/getBankStatement', GetBankStatementController);

export default nobuRouter;
