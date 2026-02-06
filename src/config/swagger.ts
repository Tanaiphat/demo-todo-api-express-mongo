import swaggerJSDoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'To-Do API (Express + MongoDB)',
      version: '1.1.0',
      description:
        'A robust REST API for managing tasks and users, built with Node.js, Express, and MongoDB.',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api`,
        description: 'Development Server',
      },
    ],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Stats', description: 'User statistics' },
      { name: 'Tasks', description: 'Task management endpoints' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Task: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60d0fe4f5311236168a109ca' },
            userId: { type: 'string', example: '60d0fe4f5311236168a109cb' },
            title: { type: 'string', example: 'Finish documentation' },
            status: {
              type: 'string',
              enum: ['pending', 'in_progress', 'completed'],
              example: 'in_progress',
            },
            priority: { type: 'string', enum: ['low', 'medium', 'high'], example: 'high' },
            dueDate: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60d0fe4f5311236168a109cb' },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            name: { type: 'string', example: 'John Doe' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['src/docs/*.ts'], // Relative to project root when running
};

export const swaggerSpec = swaggerJSDoc(options);
