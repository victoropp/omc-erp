import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
export declare class CompressionMiddleware implements NestMiddleware {
    private compressionMiddleware;
    use(req: Request, res: Response, next: NextFunction): void;
}
//# sourceMappingURL=compression.middleware.d.ts.map