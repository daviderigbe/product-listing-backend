import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const status = err.status && Number.isInteger(err.status) ? err.status : 500;
  const message = err.message || 'Server error';
  // Log server errors
  if (status === 500) console.error(err);
  return res.status(status).json({ message });
}

