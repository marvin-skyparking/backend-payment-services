import express from 'express';
import {
  createPaymentServiceController,
  getAllPaymentServicesController,
  getPaymentServiceById
} from '../controllers/partner_service.controller';

const partnerRouter = express.Router();

// Parter Services
partnerRouter.post('/v1.0/create', createPaymentServiceController);
partnerRouter.get('/v1.0/get', getAllPaymentServicesController);
partnerRouter.get('/v1.0/get/:id', getPaymentServiceById);
// paymentRouter.post('/v1.0/transfer-va/payment', PaymentRequest);
// paymentRouter.post('/v1.0/transfer-va/create-va', createVirtualAccount);

export default partnerRouter;
