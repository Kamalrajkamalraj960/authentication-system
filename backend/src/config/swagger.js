import swaggerJSDoc from 'swagger-jsdoc';
import config from './index.js';

/**
 * OpenAPI 3 spec generated from JSDoc annotations on the route files.
 * Served at /api/docs by swagger-ui-express.
 */
const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'MERN Auth Platform API',
      version: '1.0.0',
      description:
        'Production-grade authentication & authorization API featuring JWT access/refresh ' +
        'tokens, refresh-token rotation, Google OAuth 2.0, email verification, password ' +
        'reset, and role-based access control.',
      contact: { name: 'API Support', email: 'support@mern-auth.dev' },
      license: { name: 'MIT' },
    },
    servers: [{ url: `http://localhost:${config.port}${config.apiPrefix}`, description: 'Local' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        cookieAuth: { type: 'apiKey', in: 'cookie', name: 'accessToken' },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'user'] },
            provider: { type: 'string', enum: ['local', 'google'] },
            profilePicture: { type: 'string' },
            isEmailVerified: { type: 'boolean' },
            lastLogin: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ApiSuccess: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object', nullable: true },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Access denied' },
            data: { type: 'object', nullable: true },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
});

export default swaggerSpec;
