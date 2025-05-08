import { Request, Response, NextFunction, RequestHandler } from 'express'

// profoill
export const asyncWrapper =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next)
  }