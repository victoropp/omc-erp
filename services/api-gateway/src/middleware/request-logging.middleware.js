"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestLoggingMiddleware = void 0;
const common_1 = require("@nestjs/common");
let RequestLoggingMiddleware = class RequestLoggingMiddleware {
    logger = new common_1.Logger('RequestLogger');
    use(req, res, next) {
        const { method, originalUrl, ip, headers } = req;
        const userAgent = headers['user-agent'] || '';
        const startTime = Date.now();
        // Generate unique request ID
        req['requestId'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.logger.log(`[${req['requestId']}] ${method} ${originalUrl} from ${ip} - ${userAgent}`);
        // Override res.end to log response details
        const originalEnd = res.end;
        res.end = function (...args) {
            const responseTime = Date.now() - startTime;
            const contentLength = res.get('content-length') || 0;
            common_1.Logger.prototype.log.call({ context: 'RequestLogger' }, `[${req['requestId']}] Response: ${res.statusCode} ${res.statusMessage} - ${contentLength} bytes - ${responseTime}ms`);
            return originalEnd.apply(res, args);
        };
        next();
    }
};
exports.RequestLoggingMiddleware = RequestLoggingMiddleware;
exports.RequestLoggingMiddleware = RequestLoggingMiddleware = __decorate([
    (0, common_1.Injectable)()
], RequestLoggingMiddleware);
//# sourceMappingURL=request-logging.middleware.js.map