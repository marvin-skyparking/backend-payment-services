import express from 'express';
import partnerRouter from './partner_services.routes';
import paymentRouter from './payment.routes';
import nobuRouter from './nobu_bank.routes';
//import customerRouter from './customer.routes';

const router = express.Router();

router.use('/partner', partnerRouter);
router.use('/payment', paymentRouter);
router.use('/nobu', nobuRouter);
//router.use('/customer', customerRouter);

export default router;
