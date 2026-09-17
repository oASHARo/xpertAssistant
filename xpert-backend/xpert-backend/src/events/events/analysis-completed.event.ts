import type { DomainEvent } from '../event-bus.js';
export interface AnalysisCompletedEvent extends DomainEvent { type: 'analysis.completed'; jobId: string; resumeId: string; userId: string; tenantId: string }
