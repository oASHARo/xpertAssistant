import Fastify, { type FastifyInstance } from 'fastify';
import { connectControlPlane, controlPlanePrisma } from './db/control-plane.js';
import { tenantConnectionManager } from './db/tenant-resolver/tenant-connection-manager.js';
import corsPlugin from './plugins/cors.plugin.js';
import jwtPlugin from './plugins/jwt.plugin.js';
import multipartPlugin from './plugins/multipart.plugin.js';
import rateLimitPlugin from './plugins/rate-limit.plugin.js';
import swaggerPlugin from './plugins/swagger.plugin.js';
import errorHandlerPlugin from './plugins/error-handler.plugin.js';
import tenantPlugin from './plugins/tenant.plugin.js';
import authRoutes from './routes/auth.routes.js';
import skillsRoutes from './routes/skills.routes.js';
import criteriaRoutes from './routes/criteria.routes.js';
import jobsRoutes from './routes/jobs.routes.js';
import cvsRoutes from './routes/cvs.routes.js';
import { verifyMailer } from './modules/mailer/mailer.service.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  await app.register(corsPlugin);
  await app.register(jwtPlugin);
  await app.register(tenantPlugin);
  await app.register(multipartPlugin);
  await app.register(rateLimitPlugin);
  await app.register(swaggerPlugin);
  await app.register(errorHandlerPlugin);
  await app.register(authRoutes);
  await app.register(skillsRoutes);
  await app.register(criteriaRoutes);
  await app.register(jobsRoutes);
  await app.register(cvsRoutes);

  app.addHook('onReady', async () => {
    await connectControlPlane(app.log);
    await verifyMailer();
  });

  app.addHook('onClose', async () => {
    await tenantConnectionManager.disconnectAll();
    await controlPlanePrisma.$disconnect();
  });

  // Route registration will be added in Steps 7-10 and 14.

  return app;
}
