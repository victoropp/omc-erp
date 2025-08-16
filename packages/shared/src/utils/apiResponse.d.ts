/**
 * Shared API Response Utilities
 * Eliminates duplicate response formatting across all microservices
 */
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: ApiError;
    meta?: ResponseMeta;
    timestamp: string;
    requestId?: string;
}
export interface ApiError {
    code: string;
    message: string;
    details?: any;
    validation?: ValidationError[];
}
export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}
export interface ResponseMeta {
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
    filters?: Record<string, any>;
    sort?: {
        field: string;
        direction: 'ASC' | 'DESC';
    };
    processingTime?: number;
    version?: string;
}
export declare class ApiResponseBuilder<T = any> {
    private response;
    static success<T>(data?: T, message?: string): ApiResponseBuilder<T>;
    static error(message: string, code?: string, details?: any, httpStatus?: any): ApiResponseBuilder<null>;
    static validationError(message: string, validationErrors: ValidationError[]): ApiResponseBuilder<null>;
    static notFound(message?: string): ApiResponseBuilder<null>;
    static unauthorized(message?: string): ApiResponseBuilder<null>;
    static forbidden(message?: string): ApiResponseBuilder<null>;
    static serverError(message?: string): ApiResponseBuilder<null>;
    setSuccess(success: boolean): ApiResponseBuilder<T>;
    setMessage(message: string): ApiResponseBuilder<T>;
    setData(data?: T): ApiResponseBuilder<T>;
    setError(error: ApiError): ApiResponseBuilder<T>;
    setMeta(meta: ResponseMeta): ApiResponseBuilder<T>;
    setPagination(pagination: ResponseMeta['pagination']): ApiResponseBuilder<T>;
    setRequestId(requestId: string): ApiResponseBuilder<T>;
    setProcessingTime(startTime: number): ApiResponseBuilder<T>;
    build(): ApiResponse<T>;
}
/**
 * Pagination Helper Functions
 */
export declare const createPaginationMeta: (page: number, limit: number, total: number) => ResponseMeta["pagination"];
/**
 * Common Response Formatters
 */
export declare const formatListResponse: <T>(data: T[], total: number, page: number, limit: number, message?: string) => ApiResponse<T[]>;
export declare const formatSingleResponse: <T>(data: T, message?: string) => ApiResponse<T>;
export declare const formatCreatedResponse: <T>(data: T, message?: string) => ApiResponse<T>;
export declare const formatUpdatedResponse: <T>(data: T, message?: string) => ApiResponse<T>;
export declare const formatDeletedResponse: (message?: string) => ApiResponse<null>;
/**
 * Error Response Formatters
 */
export declare const formatValidationErrorResponse: (validationErrors: ValidationError[], message?: string) => ApiResponse<null>;
export declare const formatNotFoundResponse: (resource?: string, id?: string) => ApiResponse<null>;
export declare const formatUnauthorizedResponse: (message?: string) => ApiResponse<null>;
export declare const formatForbiddenResponse: (message?: string) => ApiResponse<null>;
export declare const formatServerErrorResponse: (message?: string) => ApiResponse<null>;
/**
 * Business Logic Specific Formatters
 */
export declare const formatAnalyticsResponse: <T>(data: T, lastUpdated?: Date, message?: string) => ApiResponse<T>;
export declare const formatBulkOperationResponse: (successCount: number, failureCount: number, errors?: any[], message?: string) => ApiResponse<any>;
export declare const formatExportResponse: (filename: string, downloadUrl: string, format: string, recordCount: number, message?: string) => ApiResponse<any>;
export default ApiResponseBuilder;
//# sourceMappingURL=apiResponse.d.ts.map