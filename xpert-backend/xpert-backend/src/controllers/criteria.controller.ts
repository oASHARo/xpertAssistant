import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Mediator } from '../mediator/mediator.js';
import { successResponse } from '../shared/helpers/response.helper.js';
import type { AiService } from '../modules/ai/ai.service.js';

interface CriterionBody { title?: string; description?: string; status?: 'active' | 'inactive'; metadata?: Record<string, unknown> }
interface UserRequest { user: { sub: string }; tenantDb: NonNullable<FastifyRequest['tenantDb']> }
function criterionView(item: Record<string, unknown>) {
  const metadata = (item.metadata && typeof item.metadata === 'object' ? item.metadata : {}) as Record<string, unknown>;
  return { id: item.id, title: item.title, description: item.description, status: item.status, metadata, ratingCalculationExplanation: metadata.ratingCalculationExplanation ?? '', idealAnswer: metadata.idealAnswer ?? '', createdAt: item.createdAt, updatedAt: item.updatedAt };
}

export class CriteriaController {
  constructor(private readonly mediator: Mediator, private readonly ai: AiService) {}
  async generate(request: FastifyRequest<{ Body: { jobTitle: string; description: string; skills: string[]; numberOfCriteria: number } }>, reply: FastifyReply) {
    return reply.send(successResponse(await this.ai.generateCriteria(request.body)));
  }
  async list(request: FastifyRequest, reply: FastifyReply) {
    const req = request as FastifyRequest & UserRequest;
    const data = await this.mediator.send({ type: 'criteria.list', userId: req.user.sub, tenantDb: req.tenantDb }) as Record<string, unknown>[];
    return reply.send(successResponse(data.map(criterionView)));
  }
  async create(request: FastifyRequest<{ Body: Required<Pick<CriterionBody, 'title' | 'description'>> & CriterionBody }>, reply: FastifyReply) {
    const req = request as FastifyRequest<{ Body: CriterionBody }> & UserRequest;
    const data = await this.mediator.send({ type: 'criteria.create', ...req.body, userId: req.user.sub, tenantDb: req.tenantDb }) as Record<string, unknown>;
    return reply.code(201).send(successResponse(criterionView(data)));
  }
  async update(request: FastifyRequest<{ Params: { id: string }; Body: CriterionBody }>, reply: FastifyReply) {
    const req = request as FastifyRequest<{ Params: { id: string }; Body: CriterionBody }> & UserRequest;
    const data = await this.mediator.send({ type: 'criteria.update', ...req.body, id: req.params.id, userId: req.user.sub, tenantDb: req.tenantDb }) as Record<string, unknown>;
    return reply.send(successResponse(criterionView(data)));
  }
  async remove(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const req = request as FastifyRequest<{ Params: { id: string } }> & UserRequest;
    await this.mediator.send({ type: 'criteria.delete', id: req.params.id, userId: req.user.sub, tenantDb: req.tenantDb });
    return reply.send(successResponse(null));
  }
}
