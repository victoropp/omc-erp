import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequestTraceMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const traceId = req.headers['x-trace-id'] as string || uuidv4();
    const spanId = uuidv4();
    
    // Add trace headers to request
    req['traceId'] = traceId;
    req['spanId'] = spanId;
    req['parentSpanId'] = req.headers['x-parent-span-id'] as string || null;

    // Add trace headers to response
    res.setHeader('x-trace-id', traceId);
    res.setHeader('x-span-id', spanId);

    // Forward trace headers to downstream services
    req.headers['x-trace-id'] = traceId;
    req.headers['x-span-id'] = spanId;
    req.headers['x-parent-span-id'] = spanId;

    // Add correlation ID for logging
    req['correlationId'] = `${traceId.substr(0, 8)}-${spanId.substr(0, 8)}`;

    next();
  }
}