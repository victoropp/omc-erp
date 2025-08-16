import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
export declare class RequestLoggingMiddleware implements NestMiddleware {
    private logger;
    use(req: Request, res: Response, next: NextFunction): void;
}
//# sourceMappingURL=request-logging.middleware.d.ts.map