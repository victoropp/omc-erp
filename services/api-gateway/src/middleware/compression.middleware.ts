import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as compression from 'compression';

@Injectable()
export class CompressionMiddleware implements NestMiddleware {
  private compressionMiddleware = compression({
    filter: (req, res) => {
      // Don't compress if the client doesn't support it
      if (req.headers['x-no-compression']) {
        return false;
      }
      
      // Use compression default filter function
      return compression.filter(req, res);
    },
    level: 6, // Default compression level
    threshold: 1024, // Only compress if response is > 1KB
    windowBits: 15,
    memLevel: 8,
  });

  use(req: Request, res: Response, next: NextFunction) {
    this.compressionMiddleware(req, res, next);
  }
}