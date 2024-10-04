import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import indexRoutes from './routes';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './configs/swagger';
import cors from 'cors';

// CORS configuration for localhost:9000
const corsOptions = {
  origin: 'http://localhost:9000', // Allow this origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  credentials: true // Allow credentials like cookies or auth headers
};

// Initialize express app
const app = express().disable('x-powered-by');

app.use(cookieParser());
app.use(express.json());

// Apply CORS with specific options
app.use(cors(corsOptions));

// Initialize Swagger (if enabled)
const enableSwagger = process.env.ENABLE_SWAGGER === 'true';

if (enableSwagger) {
  // Serve Swagger API documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// User routes (Example)
app.use('/v1', indexRoutes);

export default app;
