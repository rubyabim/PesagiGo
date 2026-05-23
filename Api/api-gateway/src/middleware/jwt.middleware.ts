import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (Array.isArray(authHeader)) {
      req.headers.authorization = authHeader[0];
    }

    next();
  }
}
