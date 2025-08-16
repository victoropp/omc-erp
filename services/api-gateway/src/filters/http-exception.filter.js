"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HttpExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    logger = new common_1.Logger(HttpExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let error = 'Unknown error';
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            }
            else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                message = exceptionResponse.message || exception.message;
                error = exceptionResponse.error || exception.name;
            }
        }
        else if (exception.statusCode) {
            // Handle proxy service errors
            status = exception.statusCode;
            message = exception.message || 'Service error';
            error = exception.error || 'Service error';
        }
        else {
            // Handle unexpected errors
            message = exception.message || 'Internal server error';
            error = exception.name || 'UnknownError';
        }
        const errorResponse = {
            statusCode: status,
            message,
            error,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            requestId: request.headers['x-request-id'] || 'unknown',
            service: exception.service || 'api-gateway',
        };
        // Log the error
        this.logger.error(`${request.method} ${request.url} ${status} - ${message}`, {
            ...errorResponse,
            stack: exception.stack,
        });
        response.status(status).json(errorResponse);
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map