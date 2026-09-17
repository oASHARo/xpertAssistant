import fp from 'fastify-plugin';
import type { FastifyError } from 'fastify';
import { AppError } from '../shared/errors/app-error.js';

function isValidationError(error: unknown): error is FastifyError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'validation' in error &&
    Array.isArray(error.validation)
  );
}

function validationMessage(error: FastifyError): string {
  const details = error.validation
    ?.map((item) => item.message ?? 'Invalid request')
    .join(', ');
  return details ? `Validation failed: ${details}` : 'Validation failed';
}

export default fp(async (fastify) => {
  fastify.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      return reply
        .code(error.statusCode)
        .send({ status: error.statusCode, message: error.message });
    }

    const fastifyError = error as FastifyError;
    if (fastifyError.statusCode === 429) {
      return reply
        .code(429)
        .send({ status: 429, message: fastifyError.message });
    }

    if (isValidationError(error)) {
      return reply.code(400).send({
        status: 400,
        message: validationMessage(error),
      });
    }

    request.log.error(error);
    return reply.code(500).send({
      status: 500,
      message: 'Internal Server Error',
    });
  });
});
