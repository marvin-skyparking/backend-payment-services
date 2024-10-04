import express from 'express';
import {
  createPaymentVA,
  createVAController,
  generate_b2b_token_VA,
  inquiryStatusVAController
} from '../controllers/payment.controller';

const paymentRouter = express.Router();

//create VA-PAYMENT
paymentRouter.post('/v1.0/transfer-va/create-va/:id', createVAController);
paymentRouter.post(
  '/v1.0/transfer-va/status-va/:id',
  inquiryStatusVAController
);
paymentRouter.post('/v1.0/transfer-va/payment', createPaymentVA);
paymentRouter.post('/v1.0/nobu/generate-token', generate_b2b_token_VA);

// //Virtual Account Payment
// paymentRouter.post('/v1.0/transfer-va/payment', PaymentRequest);
// paymentRouter.post('/v1.0/transfer-va/create-va', createVirtualAccount);

export default paymentRouter;
