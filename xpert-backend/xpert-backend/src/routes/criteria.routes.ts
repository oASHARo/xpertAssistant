import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { Mediator } from '../mediator/mediator.js';
import { CriteriaController } from '../controllers/criteria.controller.js';
import { CreateCriterionHandler } from '../mediator/commands/criteria/create-criterion.command.js';
import { UpdateCriterionHandler } from '../mediator/commands/criteria/update-criterion.command.js';
import { DeleteCriterionHandler } from '../mediator/commands/criteria/delete-criterion.command.js';
import { ListCriteriaHandler } from '../mediator/queries/criteria/list-criteria.query.js';
import { aiService } from '../modules/ai/ai.service.js';

const idParams = { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } };
const metadata = { type: 'object', additionalProperties: true };
const createBody = { type: 'object', required: ['title', 'description'], additionalProperties: false, properties: { title: { type: 'string', minLength: 1, maxLength: 255 }, description: { type: 'string', minLength: 1 }, metadata } };
const updateBody = { type: 'object', minProperties: 1, additionalProperties: false, properties: { title: { type: 'string', minLength: 1, maxLength: 255 }, description: { type: 'string', minLength: 1 }, status: { type: 'string', enum: ['active', 'inactive'] }, metadata } };

export default fp(async (fastify: FastifyInstance) => {
  const mediator = new Mediator();
  mediator.register('criteria.create', new CreateCriterionHandler());
  mediator.register('criteria.update', new UpdateCriterionHandler());
  mediator.register('criteria.delete', new DeleteCriterionHandler());
  mediator.register('criteria.list', new ListCriteriaHandler());
  const controller = new CriteriaController(mediator, aiService);
  await fastify.register(async (scope) => {
    scope.get('/', controller.list.bind(controller));
    scope.post('/generate', { schema: { body: { type: 'object', required: ['jobTitle', 'description', 'skills', 'numberOfCriteria'], additionalProperties: false, properties: { jobTitle: { type: 'string', minLength: 1 }, description: { type: 'string', minLength: 1 }, skills: { type: 'array', items: { type: 'string' } }, numberOfCriteria: { type: 'integer', minimum: 1, maximum: 20 } } } } }, controller.generate.bind(controller));
    scope.post('/', { schema: { body: createBody } }, controller.create.bind(controller));
    scope.patch('/:id', { schema: { params: idParams, body: updateBody } }, controller.update.bind(controller));
    scope.delete('/:id', { schema: { params: idParams } }, controller.remove.bind(controller));
  }, { prefix: '/api/criteria' });
});
