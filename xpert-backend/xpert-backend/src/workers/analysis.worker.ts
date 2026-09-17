import { controlPlanePrisma } from '../db/control-plane.js';
import { tenantConnectionManager } from '../db/tenant-resolver/tenant-connection-manager.js';
import { LocalDiskAdapter } from '../modules/storage/local-disk.adapter.js';
import { aiService } from '../modules/ai/ai.service.js';
import { AnalysisJobRepository } from '../repositories/analysis-job.repository.js';
import { JobResponseRepository } from '../repositories/job-response.repository.js';
import { eventBus } from '../events/event-bus.js';
import type { AnalysisCompletedEvent } from '../events/events/analysis-completed.event.js';

export async function processAnalysisJobs(): Promise<void> {
  const tenants = await controlPlanePrisma.tenant.findMany({ where: { isActive: true }, select: { id: true } });
  for (const tenant of tenants) {
    const db = await tenantConnectionManager.getClient(tenant.id);
    const jobs = await new AnalysisJobRepository(db).findPending();
    for (const job of jobs.slice(0, 5)) {
      try {
        await new AnalysisJobRepository(db).updateStatus(job.id, 'processing');
        const resume = await db.resume.findUniqueOrThrow({ where: { id: job.resumeId } });
        const criteria = await db.jobCriterion.findMany({ where: { jobId: job.jobId }, include: { criterion: true } });
        const scored = await aiService.scoreCandidate(await new LocalDiskAdapter().getBuffer(resume.storageKey ?? ''), resume.fileExtension ?? '', criteria.map(item => ({ title: item.criterion.title, description: item.criterion.description, idealAnswer: String((item.criterion.metadata as Record<string, unknown>).idealAnswer ?? '') })));
        const { tags, ...candidate } = scored;
        const response = await new JobResponseRepository(db).create({ jobId: job.jobId, resumeId: job.resumeId, createdBy: resume.createdBy, ...candidate });
        await new JobResponseRepository(db).createTags(response.id, scored.tags);
        await new AnalysisJobRepository(db).updateStatus(job.id, 'completed');
        eventBus.publish<AnalysisCompletedEvent>({ type: 'analysis.completed', jobId: job.jobId, resumeId: job.resumeId, userId: resume.createdBy, tenantId: tenant.id });
      } catch (error) {
        await new AnalysisJobRepository(db).updateStatus(job.id, 'failed', error instanceof Error ? error.message : 'Analysis failed');
      }
    }
  }
}

let processing = false;

async function runWorkerTick(): Promise<void> {
  if (processing) return;
  processing = true;
  try {
    await processAnalysisJobs();
  } finally {
    processing = false;
  }
}

export function startAnalysisWorker(): NodeJS.Timeout {
  void runWorkerTick().catch((error) => console.error('Analysis worker tick failed', error));
  return setInterval(() => {
    void runWorkerTick().catch((error) => console.error('Analysis worker tick failed', error));
  }, 5000);
}
