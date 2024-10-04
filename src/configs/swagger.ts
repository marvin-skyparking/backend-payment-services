import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'SKY PAYMENT SERVICES',
    version: '1.0.0',
    description: 'Description of your API'
  }
};

const options = {
  swaggerDefinition,
  // Path to the API routes
  apis: ['./src/routes/*.ts'] // Adjust this based on your project structure
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
