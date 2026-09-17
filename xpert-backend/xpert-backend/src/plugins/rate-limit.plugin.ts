import rateLimit from '@fastify/rate-limit';
import fp from 'fastify-plugin';

export default fp(async (fastify) => {
  await fastify.register(rateLimit, {
    max: 100, // Default global limit
    timeWindow: '1 minute',
    // Documenting the per-route override pattern:
    // To override this default on a specific route, add the following to the route options:
    // config: { rateLimit: { max: 5, timeWindow: '1 minute' } }
  });
});
