import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/http.js';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: { code: error.code, message: error.message },
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'validation_error',
        message: 'Datos invalidos',
        details: error.flatten(),
      },
    });
    return;
  }

  console.error('Error no controlado:', error);
  res.status(500).json({
    error: { code: 'internal_error', message: 'Error interno del servidor' },
  });
};
