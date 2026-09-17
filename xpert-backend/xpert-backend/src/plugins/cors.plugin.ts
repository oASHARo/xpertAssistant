import cors from '@fastify/cors';
import fp from 'fastify-plugin';
import { config } from '../config/env.js';

export default fp(async (fastify) => {
  await fastify.register(cors, {
    origin: config.CORS_ORIGIN.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });
});
