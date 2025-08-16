import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
export declare class RequestTraceMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): void;
}
//# sourceMappingURL=request-trace.middleware.d.ts.map