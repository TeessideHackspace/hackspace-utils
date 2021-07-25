import { Request, Response } from 'express';
import { json } from 'body-parser';
import { Injectable, NestMiddleware } from '@nestjs/common';

export interface RequestWithRawBody extends Request {
  rawBody: Buffer;
}

@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  public constructor() {}

  public use(req: Request, res: Response<any>, next: () => any): any {
    json({
      verify: (req: RequestWithRawBody, _res, buffer) => {
        if (req.originalUrl.startsWith('/webhook') && Buffer.isBuffer(buffer)) {
          req.rawBody = Buffer.from(buffer);
        }
        return true;
      },
    })(req, res as any, next);
  }
}
