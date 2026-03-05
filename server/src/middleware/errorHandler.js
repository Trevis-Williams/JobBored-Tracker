import logger from '../config/logger.js';

const errorHandler = (err, _req, res, _next) => {
  logger.error({ err, statusCode: err.statusCode }, err.message);

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate entry' });
  }

  const status = err.statusCode || 500;
  const message =
    status === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';

  res.status(status).json({ message });
};

export default errorHandler;
