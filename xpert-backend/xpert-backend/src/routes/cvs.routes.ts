import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { Mediator } from '../mediator/mediator.js';
import { CvsController } from '../controllers/cvs.controller.js';
import { LocalDiskAdapter } from '../modules/storage/local-disk.adapter.js';
import { ResumeService } from '../services/resume.service.js';
import { UploadResumeHandler } from '../mediator/commands/cvs/upload-resume.command.js';
import { CreateFolderHandler } from '../mediator/commands/cvs/create-folder.command.js';
import { ListFoldersHandler } from '../mediator/queries/cvs/list-folders.query.js';
import { GetFolderFilesHandler } from '../mediator/queries/cvs/get-folder-files.query.js';
import { ListRecentFilesHandler } from '../mediator/queries/cvs/list-recent-files.query.js';
import { GetFolderHandler } from '../mediator/queries/cvs/get-folder.query.js';

export default fp(async (fastify: FastifyInstance) => {
  const service = new ResumeService(new LocalDiskAdapter());
  const mediator = new Mediator();
  mediator.register('cvs.upload', new UploadResumeHandler(service));
  mediator.register('cvs.folder.create', new CreateFolderHandler());
  mediator.register('cvs.folders.list', new ListFoldersHandler());
  mediator.register('cvs.folder.get', new GetFolderHandler(service));
  mediator.register('cvs.files.list', new GetFolderFilesHandler());
  mediator.register('cvs.recent.list', new ListRecentFilesHandler());
  const controller = new CvsController(mediator, service);
  await fastify.register(async (scope) => {
    scope.post('/upload', controller.upload.bind(controller));
    scope.get('/folders', controller.folders.bind(controller));
    scope.get('/folders/:folderId', { schema: { params: { type: 'object', required: ['folderId'], properties: { folderId: { type: 'string', format: 'uuid' } } } } }, controller.folder.bind(controller));
    scope.get('/folders/:folderId/files', { schema: { params: { type: 'object', required: ['folderId'], properties: { folderId: { type: 'string', format: 'uuid' } } } } }, controller.files.bind(controller));
    scope.get('/recent', controller.recent.bind(controller));
    scope.post('/folders', { schema: { body: { type: 'object', required: ['name'], additionalProperties: false, properties: { name: { type: 'string', minLength: 1, maxLength: 255 } } } } }, controller.createFolder.bind(controller));
    scope.get('/download/:resumeId', { schema: { params: { type: 'object', required: ['resumeId'], properties: { resumeId: { type: 'string', format: 'uuid' } } } } }, controller.download.bind(controller));
  }, { prefix: '/api/cvs' });
});
