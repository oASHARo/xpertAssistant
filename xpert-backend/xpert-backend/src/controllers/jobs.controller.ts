import type { FastifyReply, FastifyRequest } from 'fastify';
import { successResponse, paginatedResponse } from '../shared/helpers/response.helper.js';
import type { Mediator } from '../mediator/mediator.js';
interface Body { title: string; description: string; category: string; jobCode?: string; embeddedEmail?: string; skills: string[]; criteria: { title: string; ratingCalculationExplanation: string; idealAnswer: string }[]; resumeFileIds: string[] }
interface UserRequest { user: { sub: string; tenantId: string }; tenantDb: NonNullable<FastifyRequest['tenantDb']> }
export class JobsController {
  constructor(private readonly mediator: Mediator) {}
  async list(request: FastifyRequest<{ Querystring: { search?: string; category?: string; page?: string; pageSize?: string } }>, reply: FastifyReply) {
    const req = request as FastifyRequest<{ Querystring: { search?: string; category?: string; page?: string; pageSize?: string } }> & UserRequest;
    const result = await this.mediator.send({ type: 'jobs.list', ...req.query, page: Number(req.query.page ?? 1), pageSize: Number(req.query.pageSize ?? 20), userId: req.user.sub, tenantDb: req.tenantDb }) as { jobs: unknown[]; total: number };
    return reply.send(paginatedResponse(result.jobs, result.total, Number(req.query.page ?? 1), Number(req.query.pageSize ?? 20)));
  }
  async detail(request: FastifyRequest<{ Params: { jobId: string } }>, reply: FastifyReply) { const req = request as FastifyRequest<{ Params: { jobId: string } }> & UserRequest; return reply.send(successResponse(await this.mediator.send({ type: 'jobs.detail', id: req.params.jobId, userId: req.user.sub, tenantDb: req.tenantDb }))); }
  async candidates(request: FastifyRequest<{ Params: { jobId: string } }>, reply: FastifyReply) { const req = request as FastifyRequest<{ Params: { jobId: string } }> & UserRequest; return reply.send(successResponse(await this.mediator.send({ type: 'jobs.candidates', id: req.params.jobId, tenantDb: req.tenantDb }))); }
  async create(request: FastifyRequest<{ Body: Body }>, reply: FastifyReply) { const req = request as FastifyRequest<{ Body: Body }> & UserRequest; return reply.code(201).send(successResponse(await this.mediator.send({ type: 'jobs.create', ...req.body, userId: req.user.sub, tenantId: req.user.tenantId, tenantDb: req.tenantDb }))); }
  async update(request: FastifyRequest<{ Params: { jobId: string }; Body: Partial<Body> }>, reply: FastifyReply) { const req = request as FastifyRequest<{ Params: { jobId: string }; Body: Partial<Body> }> & UserRequest; return reply.send(successResponse(await this.mediator.send({ type: 'jobs.update', ...req.body, id: req.params.jobId, userId: req.user.sub, tenantDb: req.tenantDb }))); }
  async remove(request: FastifyRequest<{ Params: { jobId: string } }>, reply: FastifyReply) { const req = request as FastifyRequest<{ Params: { jobId: string } }> & UserRequest; await this.mediator.send({ type: 'jobs.delete', id: req.params.jobId, userId: req.user.sub, tenantDb: req.tenantDb }); return reply.code(204).send(); }
}
