import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Mediator } from '../mediator/mediator.js';
import { successResponse } from '../shared/helpers/response.helper.js';

interface SkillBody { name: string }
interface UserRequest { user: { sub: string }; tenantDb: NonNullable<FastifyRequest['tenantDb']> }

export class SkillsController {
  constructor(private readonly mediator: Mediator) {}
  async list(request: FastifyRequest, reply: FastifyReply) {
    const req = request as FastifyRequest & UserRequest;
    const data = await this.mediator.send({ type: 'skills.list', userId: req.user.sub, tenantDb: req.tenantDb });
    return reply.send(successResponse(data));
  }
  async create(request: FastifyRequest<{ Body: SkillBody }>, reply: FastifyReply) {
    const req = request as FastifyRequest<{ Body: SkillBody }> & UserRequest;
    const data = await this.mediator.send({ type: 'skills.create', ...req.body, userId: req.user.sub, tenantDb: req.tenantDb });
    return reply.code(201).send(successResponse(data));
  }
}
