import pino from 'pino';

const isProd = process.env.NODE_ENV === 'production';

let transport;
if (!isProd) {
  try {
    await import('pino-pretty');
    transport = { target: 'pino-pretty', options: { colorize: true } };
  } catch {
    // pino-pretty not installed (production), use default JSON
  }
}

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport,
});

export default logger;
