import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private logger = new Logger('RequestLogger');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip, headers } = req;
    const userAgent = headers['user-agent'] || '';
    const startTime = Date.now();

    // Generate unique request ID
    req['requestId'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.logger.log(`[${req['requestId']}] ${method} ${originalUrl} from ${ip} - ${userAgent}`);

    // Override res.end to log response details
    const originalEnd = res.end;
    (res.end as any) = function(...args: any[]) {
      const responseTime = Date.now() - startTime;
      const contentLength = res.get('content-length') || 0;
      
      Logger.prototype.log.call(
        { context: 'RequestLogger' },
        `[${req['requestId']}] Response: ${res.statusCode} ${res.statusMessage} - ${contentLength} bytes - ${responseTime}ms`
      );
      
      return originalEnd.apply(res, args);
    };

    next();
  }
}