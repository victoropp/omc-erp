"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatExportResponse = exports.formatBulkOperationResponse = exports.formatAnalyticsResponse = exports.formatServerErrorResponse = exports.formatForbiddenResponse = exports.formatUnauthorizedResponse = exports.formatNotFoundResponse = exports.formatValidationErrorResponse = exports.formatDeletedResponse = exports.formatUpdatedResponse = exports.formatCreatedResponse = exports.formatSingleResponse = exports.formatListResponse = exports.createPaginationMeta = exports.ApiResponseBuilder = void 0;
const common_1 = require("@nestjs/common");
class ApiResponseBuilder {
    response = {
        timestamp: new Date().toISOString(),
    };
    static success(data, message = 'Operation successful') {
        return new ApiResponseBuilder()
            .setSuccess(true)
            .setMessage(message)
            .setData(data);
    }
    static error(message, code, details, httpStatus = common_1.HttpStatus.BAD_REQUEST) {
        return new ApiResponseBuilder()
            .setSuccess(false)
            .setMessage(message)
            .setError({
            code: code || httpStatus.toString(),
            message,
            details,
        });
    }
    static validationError(message, validationErrors) {
        return new ApiResponseBuilder()
            .setSuccess(false)
            .setMessage(message)
            .setError({
            code: 'VALIDATION_ERROR',
            message,
            validation: validationErrors,
        });
    }
    static notFound(message = 'Resource not found') {
        return new ApiResponseBuilder()
            .setSuccess(false)
            .setMessage(message)
            .setError({
            code: 'NOT_FOUND',
            message,
        });
    }
    static unauthorized(message = 'Unauthorized access') {
        return new ApiResponseBuilder()
            .setSuccess(false)
            .setMessage(message)
            .setError({
            code: 'UNAUTHORIZED',
            message,
        });
    }
    static forbidden(message = 'Access forbidden') {
        return new ApiResponseBuilder()
            .setSuccess(false)
            .setMessage(message)
            .setError({
            code: 'FORBIDDEN',
            message,
        });
    }
    static serverError(message = 'Internal server error') {
        return new ApiResponseBuilder()
            .setSuccess(false)
            .setMessage(message)
            .setError({
            code: 'INTERNAL_SERVER_ERROR',
            message,
        });
    }
    setSuccess(success) {
        this.response.success = success;
        return this;
    }
    setMessage(message) {
        this.response.message = message;
        return this;
    }
    setData(data) {
        this.response.data = data;
        return this;
    }
    setError(error) {
        this.response.error = error;
        return this;
    }
    setMeta(meta) {
        this.response.meta = meta;
        return this;
    }
    setPagination(pagination) {
        if (!this.response.meta) {
            this.response.meta = {};
        }
        this.response.meta.pagination = pagination;
        return this;
    }
    setRequestId(requestId) {
        this.response.requestId = requestId;
        return this;
    }
    setProcessingTime(startTime) {
        const processingTime = Date.now() - startTime;
        if (!this.response.meta) {
            this.response.meta = {};
        }
        this.response.meta.processingTime = processingTime;
        return this;
    }
    build() {
        return this.response;
    }
}
exports.ApiResponseBuilder = ApiResponseBuilder;
/**
 * Pagination Helper Functions
 */
const createPaginationMeta = (page, limit, total) => {
    const totalPages = Math.ceil(total / limit);
    return {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
    };
};
exports.createPaginationMeta = createPaginationMeta;
/**
 * Common Response Formatters
 */
const formatListResponse = (data, total, page, limit, message = 'Data retrieved successfully') => {
    return ApiResponseBuilder.success(data, message)
        .setPagination((0, exports.createPaginationMeta)(page, limit, total))
        .build();
};
exports.formatListResponse = formatListResponse;
const formatSingleResponse = (data, message = 'Data retrieved successfully') => {
    return ApiResponseBuilder.success(data, message).build();
};
exports.formatSingleResponse = formatSingleResponse;
const formatCreatedResponse = (data, message = 'Resource created successfully') => {
    return ApiResponseBuilder.success(data, message).build();
};
exports.formatCreatedResponse = formatCreatedResponse;
const formatUpdatedResponse = (data, message = 'Resource updated successfully') => {
    return ApiResponseBuilder.success(data, message).build();
};
exports.formatUpdatedResponse = formatUpdatedResponse;
const formatDeletedResponse = (message = 'Resource deleted successfully') => {
    return ApiResponseBuilder.success(null, message).build();
};
exports.formatDeletedResponse = formatDeletedResponse;
/**
 * Error Response Formatters
 */
const formatValidationErrorResponse = (validationErrors, message = 'Validation failed') => {
    return ApiResponseBuilder.validationError(message, validationErrors).build();
};
exports.formatValidationErrorResponse = formatValidationErrorResponse;
const formatNotFoundResponse = (resource = 'Resource', id) => {
    const message = id
        ? `${resource} with ID ${id} not found`
        : `${resource} not found`;
    return ApiResponseBuilder.notFound(message).build();
};
exports.formatNotFoundResponse = formatNotFoundResponse;
const formatUnauthorizedResponse = (message = 'Authentication required') => {
    return ApiResponseBuilder.unauthorized(message).build();
};
exports.formatUnauthorizedResponse = formatUnauthorizedResponse;
const formatForbiddenResponse = (message = 'Insufficient permissions') => {
    return ApiResponseBuilder.forbidden(message).build();
};
exports.formatForbiddenResponse = formatForbiddenResponse;
const formatServerErrorResponse = (message = 'An unexpected error occurred') => {
    return ApiResponseBuilder.serverError(message).build();
};
exports.formatServerErrorResponse = formatServerErrorResponse;
/**
 * Business Logic Specific Formatters
 */
const formatAnalyticsResponse = (data, lastUpdated, message = 'Analytics data retrieved successfully') => {
    const meta = {};
    if (lastUpdated) {
        meta.version = lastUpdated.toISOString();
    }
    return ApiResponseBuilder.success(data, message)
        .setMeta(meta)
        .build();
};
exports.formatAnalyticsResponse = formatAnalyticsResponse;
const formatBulkOperationResponse = (successCount, failureCount, errors, message) => {
    const isSuccess = failureCount === 0;
    const defaultMessage = isSuccess
        ? `Successfully processed ${successCount} items`
        : `Processed ${successCount} items successfully, ${failureCount} failed`;
    const responseData = {
        successCount,
        failureCount,
        totalProcessed: successCount + failureCount,
        errors: errors || [],
    };
    if (isSuccess) {
        return ApiResponseBuilder.success(responseData, message || defaultMessage).build();
    }
    else {
        return ApiResponseBuilder.error(message || defaultMessage, 'PARTIAL_SUCCESS', responseData).build();
    }
};
exports.formatBulkOperationResponse = formatBulkOperationResponse;
const formatExportResponse = (filename, downloadUrl, format, recordCount, message = 'Export completed successfully') => {
    const data = {
        filename,
        downloadUrl,
        format,
        recordCount,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    };
    return ApiResponseBuilder.success(data, message).build();
};
exports.formatExportResponse = formatExportResponse;
exports.default = ApiResponseBuilder;
//# sourceMappingURL=apiResponse.js.map