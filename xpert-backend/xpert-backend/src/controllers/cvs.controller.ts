import type { FastifyReply, FastifyRequest } from 'fastify';
import { successResponse, paginatedResponse } from '../shared/helpers/response.helper.js';
import type { Mediator } from '../mediator/mediator.js';
import type { ResumeService } from '../services/resume.service.js';
interface UserRequest { user: { sub: string }; tenantDb: NonNullable<FastifyRequest['tenantDb']> }
function fileView(item: Record<string, unknown>) {
  return { id: item.id, candidateName: item.fileName, fileType: item.fileType, fileSizeMb: Number(item.fileSize ?? 0) / 1024 / 1024, folderId: item.folderId, uploadedAt: item.createdAt, downloadUrl: item.fileUrl };
}
export class CvsController {
  constructor(private readonly mediator: Mediator, private readonly resumeService: ResumeService) {}
  async upload(request: FastifyRequest, reply: FastifyReply) {
    const req = request as FastifyRequest & UserRequest;
    const part = await req.file();
    if (!part) return reply.code(400).send({ status: 400, message: 'A file is required' });
    const buffer = await part.toBuffer();
    const folder = part.fields.folderId;
    const folderId = folder && 'value' in folder && typeof folder.value === 'string' ? folder.value : undefined;
    const data = await this.mediator.send({ type: 'cvs.upload', tenantDb: req.tenantDb, userId: req.user.sub, buffer, filename: part.filename, folderId }) as Record<string, unknown>;
    return reply.code(201).send(successResponse(fileView(data)));
  }
  async createFolder(request: FastifyRequest<{ Body: { name: string } }>, reply: FastifyReply) { const req = request as FastifyRequest<{ Body: { name: string } }> & UserRequest; return reply.code(201).send(successResponse(await this.mediator.send({ type: 'cvs.folder.create', tenantDb: req.tenantDb, userId: req.user.sub, name: req.body.name }))); }
  async folders(request: FastifyRequest, reply: FastifyReply) { const req = request as FastifyRequest & UserRequest; const data = await this.mediator.send({ type: 'cvs.folders.list', tenantDb: req.tenantDb, userId: req.user.sub }) as unknown[]; return reply.send(paginatedResponse(data, data.length, 1, data.length)); }
  async folder(request: FastifyRequest<{ Params: { folderId: string } }>, reply: FastifyReply) { const req = request as FastifyRequest<{ Params: { folderId: string } }> & UserRequest; return reply.send(successResponse(await this.mediator.send({ type: 'cvs.folder.get', tenantDb: req.tenantDb, userId: req.user.sub, folderId: req.params.folderId }))); }
  async files(request: FastifyRequest<{ Params: { folderId: string } }>, reply: FastifyReply) { const req = request as FastifyRequest<{ Params: { folderId: string } }> & UserRequest; const data = await this.mediator.send({ type: 'cvs.files.list', tenantDb: req.tenantDb, userId: req.user.sub, folderId: req.params.folderId }) as Record<string, unknown>[]; return reply.send(paginatedResponse(data.map(fileView), data.length, 1, data.length)); }
  async recent(request: FastifyRequest, reply: FastifyReply) { const req = request as FastifyRequest & UserRequest; const data = await this.mediator.send({ type: 'cvs.recent.list', tenantDb: req.tenantDb, userId: req.user.sub }) as Record<string, unknown>[]; return reply.send(paginatedResponse(data.map(fileView), data.length, 1, data.length)); }
  async download(request: FastifyRequest<{ Params: { resumeId: string } }>, reply: FastifyReply) { const req = request as FastifyRequest<{ Params: { resumeId: string } }> & UserRequest; const result = await this.resumeService.download(req.tenantDb, req.user.sub, req.params.resumeId); return reply.type(String(result.resume.fileType) === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document').header('Content-Disposition', `attachment; filename="${String(result.resume.fileName).replace(/"/g, '')}"`).send(result.buffer); }
}
