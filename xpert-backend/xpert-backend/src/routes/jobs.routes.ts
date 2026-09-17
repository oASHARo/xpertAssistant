import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { Mediator } from '../mediator/mediator.js';
import { JobsController } from '../controllers/jobs.controller.js';
import { CreateJobHandler } from '../mediator/commands/jobs/create-job.command.js';
import { UpdateJobHandler } from '../mediator/commands/jobs/update-job.command.js';
import { DeleteJobHandler } from '../mediator/commands/jobs/delete-job.command.js';
import { ListJobsHandler } from '../mediator/queries/jobs/list-jobs.query.js';
import { GetJobDetailHandler } from '../mediator/queries/jobs/get-job-detail.query.js';
import { GetJobCandidatesHandler } from '../mediator/queries/jobs/get-job-candidates.query.js';
const id = { type: 'string', format: 'uuid' };
const criteria = { type: 'array', minItems: 1, items: { type: 'object', required: ['title', 'ratingCalculationExplanation', 'idealAnswer'], additionalProperties: false, properties: { title: { type: 'string', minLength: 1 }, ratingCalculationExplanation: { type: 'string' }, idealAnswer: { type: 'string' } } } };
const createBody = { type: 'object', required: ['title', 'description', 'category', 'skills', 'criteria', 'resumeFileIds'], additionalProperties: false, properties: { title: { type: 'string', minLength: 1, maxLength: 255 }, description: { type: 'string' }, category: { type: 'string' }, jobCode: { type: 'string' }, embeddedEmail: { type: 'string', format: 'email' }, skills: { type: 'array', items: { type: 'string' } }, criteria, resumeFileIds: { type: 'array', items: id } } };
const updateBody = { type: 'object', minProperties: 1, additionalProperties: false, properties: { title: { type: 'string', minLength: 1, maxLength: 255 }, description: { type: 'string' }, category: { type: 'string' }, jobCode: { type: 'string' }, embeddedEmail: { type: 'string', format: 'email' } } };
export default fp(async (fastify: FastifyInstance) => {
  const mediator = new Mediator(); mediator.register('jobs.create', new CreateJobHandler()); mediator.register('jobs.update', new UpdateJobHandler()); mediator.register('jobs.delete', new DeleteJobHandler()); mediator.register('jobs.list', new ListJobsHandler()); mediator.register('jobs.detail', new GetJobDetailHandler()); mediator.register('jobs.candidates', new GetJobCandidatesHandler());
  const controller = new JobsController(mediator);
  await fastify.register(async scope => {
    scope.get('/', { schema: { querystring: { type: 'object', properties: { search: { type: 'string' }, category: { type: 'string' }, page: { type: 'string' }, pageSize: { type: 'string' } } } } }, controller.list.bind(controller));
    scope.get('/:jobId', { schema: { params: { type: 'object', required: ['jobId'], properties: { jobId: id } } } }, controller.detail.bind(controller));
    scope.get('/:jobId/candidates', { schema: { params: { type: 'object', required: ['jobId'], properties: { jobId: id } } } }, controller.candidates.bind(controller));
    scope.post('/', { schema: { body: createBody } }, controller.create.bind(controller));
    scope.patch('/:jobId', { schema: { params: { type: 'object', required: ['jobId'], properties: { jobId: id } }, body: updateBody } }, controller.update.bind(controller));
    scope.delete('/:jobId', { schema: { params: { type: 'object', required: ['jobId'], properties: { jobId: id } } } }, controller.remove.bind(controller));
  }, { prefix: '/api/jobs' });
});
