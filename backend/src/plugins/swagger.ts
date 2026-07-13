import type { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

export async function registerSwagger(app: FastifyInstance) {
  await app.register(swagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'Grace API',
        description:
          'Backend for the Grace Bible companion app — scripture, profile, library, stories, and LLM-powered reminders/support.',
        version: '0.1.0',
        contact: { name: 'Grace' },
      },
      servers: [
        { url: 'http://localhost:3000', description: 'Local development' },
        { url: 'https://grace-api-production.up.railway.app', description: 'Staging (Railway)' },
      ],
      tags: [
        { name: 'Health', description: 'Service health' },
        { name: 'Auth', description: 'Guest sessions and token refresh' },
        { name: 'Scripture', description: 'Bible text, search, and daily verses' },
        { name: 'Profile', description: 'User profile and onboarding state' },
        { name: 'Library', description: 'Saved verses, reflections, reading progress' },
        { name: 'Beta', description: 'Beta subscription redemption' },
        { name: 'Stories', description: 'Audio Bible story catalog' },
        { name: 'AI', description: 'LLM narratives, reminders, and support replies' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Access token from POST /auth/guest or POST /auth/refresh',
          },
        },
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
      displayRequestDuration: true,
    },
    staticCSP: true,
  });
}
