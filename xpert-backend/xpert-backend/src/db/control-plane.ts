import { PrismaClient } from '../generated/control-plane/index.js';

export const controlPlanePrisma = new PrismaClient();

export async function connectControlPlane(
  logger: { info(message: string): void },
): Promise<void> {
  await controlPlanePrisma.$connect();
  logger.info('Control-plane DB connected');
}
