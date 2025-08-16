"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestTraceMiddleware = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
let RequestTraceMiddleware = class RequestTraceMiddleware {
    use(req, res, next) {
        const traceId = req.headers['x-trace-id'] || (0, uuid_1.v4)();
        const spanId = (0, uuid_1.v4)();
        // Add trace headers to request
        req['traceId'] = traceId;
        req['spanId'] = spanId;
        req['parentSpanId'] = req.headers['x-parent-span-id'] || null;
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
};
exports.RequestTraceMiddleware = RequestTraceMiddleware;
exports.RequestTraceMiddleware = RequestTraceMiddleware = __decorate([
    (0, common_1.Injectable)()
], RequestTraceMiddleware);
//# sourceMappingURL=request-trace.middleware.js.map