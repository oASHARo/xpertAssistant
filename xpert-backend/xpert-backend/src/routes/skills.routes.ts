import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { Mediator } from '../mediator/mediator.js';
import { SkillsController } from '../controllers/skills.controller.js';
import { CreateSkillHandler } from '../mediator/commands/skills/create-skill.command.js';
import { ListSkillsHandler } from '../mediator/queries/skills/list-skills.query.js';

export default fp(async (fastify: FastifyInstance) => {
  const mediator = new Mediator();
  mediator.register('skills.create', new CreateSkillHandler());
  mediator.register('skills.list', new ListSkillsHandler());
  const controller = new SkillsController(mediator);
  await fastify.register(async (scope) => {
    scope.get('/', controller.list.bind(controller));
    scope.post('/', { schema: { body: { type: 'object', required: ['name'], additionalProperties: false, properties: { name: { type: 'string', minLength: 1, maxLength: 50 } } } } }, controller.create.bind(controller));
  }, { prefix: '/api/skills' });
});
