import { buildApp } from './app.js';
import { config } from './config/env.js';
import { startAnalysisWorker } from './workers/analysis.worker.js';
import './events/listeners/job-completion-checker.listener.js';

const app = await buildApp();

const shutdown = async (signal: string): Promise<void> => {
  app.log.info({ signal }, 'Shutting down server');
  await app.close();
  process.exit(0);
};

process.once('SIGTERM', () => {
  void shutdown('SIGTERM');
});
process.once('SIGINT', () => {
  void shutdown('SIGINT');
});

let analysisWorker: NodeJS.Timeout | undefined;
app.addHook('onClose', async () => {
  if (analysisWorker) clearInterval(analysisWorker);
});

try {
  await app.listen({ port: config.PORT, host: config.HOST });
  analysisWorker = startAnalysisWorker();
} catch (error) {
  app.log.error(error, 'Failed to start server');
  process.exit(1);
}
