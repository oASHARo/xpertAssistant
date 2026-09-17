import type { TenantPrismaClient } from '../../db/tenant-resolver/tenant-connection-factory.js';
import { eventBus } from '../event-bus.js';
import type { AnalysisCompletedEvent } from '../events/analysis-completed.event.js';
import { controlPlanePrisma } from '../../db/control-plane.js';
import { tenantConnectionManager } from '../../db/tenant-resolver/tenant-connection-manager.js';

eventBus.subscribe<AnalysisCompletedEvent>('analysis.completed', async (event) => {
  const db: TenantPrismaClient = await tenantConnectionManager.getClient(event.tenantId);
  const remaining = await db.analysisJob.count({ where: { jobId: event.jobId, status: { not: 'completed' } } });
  if (remaining === 0) console.info(`All analyses completed for job ${event.jobId}`);
});
