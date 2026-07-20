import type { FastifyInstance } from 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    userId?: string;
  }
}

export type { FastifyInstance };
