import { NotFoundError } from '../shared/errors/not-found.error.js';
import { ValidationError } from '../shared/errors/validation.error.js';
import type { TenantPrismaClient } from '../db/tenant-resolver/tenant-connection-factory.js';
import { JobRepository } from '../repositories/job.repository.js';
import { JobSkillRepository } from '../repositories/job-skill.repository.js';
import { JobCriteriaRepository } from '../repositories/job-criteria.repository.js';
import { JobResumeRepository } from '../repositories/job-resume.repository.js';
import { AnalysisJobRepository } from '../repositories/analysis-job.repository.js';
import { SkillRepository } from '../repositories/skill.repository.js';
import { CriteriaRepository } from '../repositories/criteria.repository.js';
import type { Prisma } from '../generated/tenant/index.js';

export interface JobCriterionInput { title: string; ratingCalculationExplanation: string; idealAnswer: string }
export interface CreateJobInput { title: string; description: string; category: string; jobCode?: string; embeddedEmail?: string; skills: string[]; criteria: JobCriterionInput[]; resumeFileIds: string[] }

export class JobService {
  async create(db: TenantPrismaClient, userId: string, input: CreateJobInput) {
    if (!input.title.trim()) throw new ValidationError('Job title is required');
    if (!input.criteria.length) throw new ValidationError('At least one criterion is required');
    return db.$transaction(async (tx) => {
      const resumes = await tx.resume.findMany({ where: { id: { in: input.resumeFileIds }, createdBy: userId }, select: { id: true } });
      if (resumes.length !== new Set(input.resumeFileIds).size) {
        throw new ValidationError('One or more resumes are missing or not owned by the current user');
      }
      const job = await new JobRepository(tx).create({ ...input, createdBy: userId });
      const skillIds = await Promise.all(input.skills.map(name => new SkillRepository(tx).findOrCreateByName(name.trim(), userId)));
      await new JobSkillRepository(tx).linkMany(job.id, skillIds.map(s => s.id));
      const criteria = await Promise.all(input.criteria.map(c => new CriteriaRepository(tx).create({ title: c.title, description: c.idealAnswer, createdBy: userId, metadata: { ratingCalculationExplanation: c.ratingCalculationExplanation, idealAnswer: c.idealAnswer } })));
      await new JobCriteriaRepository(tx).linkMany(job.id, criteria.map(c => c.id));
      await new JobResumeRepository(tx).linkMany(job.id, input.resumeFileIds, userId);
      await new AnalysisJobRepository(tx).createMany(job.id, input.resumeFileIds);
      return job.id;
    });
  }

  async update(db: TenantPrismaClient, userId: string, id: string, data: { title?: string; description?: string; category?: string; jobCode?: string; embeddedEmail?: string }) {
    if (data.title !== undefined && !data.title.trim()) throw new ValidationError('Job title is required');
    const job = await new JobRepository(db).update(id, userId, data);
    if (!job) throw new NotFoundError('Job not found');
    return job.id;
  }
  async delete(db: TenantPrismaClient, userId: string, id: string) {
    const result = await new JobRepository(db).deleteById(id, userId);
    if (!result.count) throw new NotFoundError('Job not found');
  }
}
