import fastifyJwt from '@fastify/jwt';
import fp from 'fastify-plugin';
import type { FastifyRequest } from 'fastify';
import { config } from '../config/env.js';

declare module 'fastify' {
  interface FastifyRequest {
    authenticate: () => Promise<void>;
  }

  interface FastifyJWT {
    user: {
      sub: string;
      email: string;
      tenantId: string;
      role: string;
    };
  }
}

export default fp(async (fastify) => {
  await fastify.register(fastifyJwt, {
    secret: config.JWT_SECRET,
  });

  fastify.decorateRequest('authenticate', async function (this: FastifyRequest) {
    await this.jwtVerify();
  });
});
