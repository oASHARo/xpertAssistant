import type { DomainEvent } from '../event-bus.js';
export interface AnalysisJobsEnqueuedEvent extends DomainEvent { type: 'analysis.enqueued'; jobId: string; count: number; tenantId: string }
