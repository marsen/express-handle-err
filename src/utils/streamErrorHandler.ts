import { Readable } from 'stream';
import { NextFunction, Response } from 'express';

export function pipeWithErrorHandler(stream: Readable, res: Response, next: NextFunction) {
  stream.on('error', next);
  stream.pipe(res);
}