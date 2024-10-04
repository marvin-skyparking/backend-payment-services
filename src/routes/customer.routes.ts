// import express from 'express';
// import { registerUser, BuyProducts } from '../controllers/customer.controller';

// const customerRouter = express.Router();

// /**
//  * @swagger
//  * /v1/customer/registerMember:
//  *   post:
//  *     summary: Register a new user
//  *     description: Creates a new user with the provided details
//  *     tags:
//  *       - Users
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               name:
//  *                 type: string
//  *               username:
//  *                 type: string
//  *               password:
//  *                 type: string
//  *               address:
//  *                 type: string
//  *               email:
//  *                 type: string
//  *               phoneNumber:
//  *                 type: string
//  *     responses:
//  *       '201':
//  *         description: User registered successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                 user:
//  *                   type: object
//  *                   properties:
//  *                     id:
//  *                       type: string
//  *                     name:
//  *                       type: string
//  *                     email:
//  *                       type: string
//  *                     createdAt:
//  *                       type: string
//  *                     updatedAt:
//  *                       type: string
//  *       '500':
//  *         description: Failed to register user
//  */
// customerRouter.post('/registerMember', registerUser);
// customerRouter.post('/buyProducts', BuyProducts);

// export default customerRouter;
