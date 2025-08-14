import { HttpStatus } from '@nestjs/common';

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

export class ApiResponseBuilder<T = any> {
  private response: Partial<ApiResponse<T>> = {
    timestamp: new Date().toISOString(),
  };

  static success<T>(data?: T, message = 'Operation successful'): ApiResponseBuilder<T> {
    return new ApiResponseBuilder<T>()
      .setSuccess(true)
      .setMessage(message)
      .setData(data);
  }

  static error(
    message: string,
    code?: string,
    details?: any,
    httpStatus = HttpStatus.BAD_REQUEST
  ): ApiResponseBuilder<null> {
    return new ApiResponseBuilder<null>()
      .setSuccess(false)
      .setMessage(message)
      .setError({
        code: code || httpStatus.toString(),
        message,
        details,
      });
  }

  static validationError(
    message: string,
    validationErrors: ValidationError[]
  ): ApiResponseBuilder<null> {
    return new ApiResponseBuilder<null>()
      .setSuccess(false)
      .setMessage(message)
      .setError({
        code: 'VALIDATION_ERROR',
        message,
        validation: validationErrors,
      });
  }

  static notFound(message = 'Resource not found'): ApiResponseBuilder<null> {
    return new ApiResponseBuilder<null>()
      .setSuccess(false)
      .setMessage(message)
      .setError({
        code: 'NOT_FOUND',
        message,
      });
  }

  static unauthorized(message = 'Unauthorized access'): ApiResponseBuilder<null> {
    return new ApiResponseBuilder<null>()
      .setSuccess(false)
      .setMessage(message)
      .setError({
        code: 'UNAUTHORIZED',
        message,
      });
  }

  static forbidden(message = 'Access forbidden'): ApiResponseBuilder<null> {
    return new ApiResponseBuilder<null>()
      .setSuccess(false)
      .setMessage(message)
      .setError({
        code: 'FORBIDDEN',
        message,
      });
  }

  static serverError(message = 'Internal server error'): ApiResponseBuilder<null> {
    return new ApiResponseBuilder<null>()
      .setSuccess(false)
      .setMessage(message)
      .setError({
        code: 'INTERNAL_SERVER_ERROR',
        message,
      });
  }

  setSuccess(success: boolean): ApiResponseBuilder<T> {
    this.response.success = success;
    return this;
  }

  setMessage(message: string): ApiResponseBuilder<T> {
    this.response.message = message;
    return this;
  }

  setData(data?: T): ApiResponseBuilder<T> {
    this.response.data = data;
    return this;
  }

  setError(error: ApiError): ApiResponseBuilder<T> {
    this.response.error = error;
    return this;
  }

  setMeta(meta: ResponseMeta): ApiResponseBuilder<T> {
    this.response.meta = meta;
    return this;
  }

  setPagination(pagination: ResponseMeta['pagination']): ApiResponseBuilder<T> {
    if (!this.response.meta) {
      this.response.meta = {};
    }
    this.response.meta.pagination = pagination;
    return this;
  }

  setRequestId(requestId: string): ApiResponseBuilder<T> {
    this.response.requestId = requestId;
    return this;
  }

  setProcessingTime(startTime: number): ApiResponseBuilder<T> {
    const processingTime = Date.now() - startTime;
    if (!this.response.meta) {
      this.response.meta = {};
    }
    this.response.meta.processingTime = processingTime;
    return this;
  }

  build(): ApiResponse<T> {
    return this.response as ApiResponse<T>;
  }
}

/**
 * Pagination Helper Functions
 */
export const createPaginationMeta = (
  page: number,
  limit: number,
  total: number
): ResponseMeta['pagination'] => {
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

/**
 * Common Response Formatters
 */
export const formatListResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message = 'Data retrieved successfully'
): ApiResponse<T[]> => {
  return ApiResponseBuilder.success(data, message)
    .setPagination(createPaginationMeta(page, limit, total))
    .build();
};

export const formatSingleResponse = <T>(
  data: T,
  message = 'Data retrieved successfully'
): ApiResponse<T> => {
  return ApiResponseBuilder.success(data, message).build();
};

export const formatCreatedResponse = <T>(
  data: T,
  message = 'Resource created successfully'
): ApiResponse<T> => {
  return ApiResponseBuilder.success(data, message).build();
};

export const formatUpdatedResponse = <T>(
  data: T,
  message = 'Resource updated successfully'
): ApiResponse<T> => {
  return ApiResponseBuilder.success(data, message).build();
};

export const formatDeletedResponse = (
  message = 'Resource deleted successfully'
): ApiResponse<null> => {
  return ApiResponseBuilder.success(null, message).build();
};

/**
 * Error Response Formatters
 */
export const formatValidationErrorResponse = (
  validationErrors: ValidationError[],
  message = 'Validation failed'
): ApiResponse<null> => {
  return ApiResponseBuilder.validationError(message, validationErrors).build();
};

export const formatNotFoundResponse = (
  resource = 'Resource',
  id?: string
): ApiResponse<null> => {
  const message = id 
    ? `${resource} with ID ${id} not found`
    : `${resource} not found`;
  return ApiResponseBuilder.notFound(message).build();
};

export const formatUnauthorizedResponse = (
  message = 'Authentication required'
): ApiResponse<null> => {
  return ApiResponseBuilder.unauthorized(message).build();
};

export const formatForbiddenResponse = (
  message = 'Insufficient permissions'
): ApiResponse<null> => {
  return ApiResponseBuilder.forbidden(message).build();
};

export const formatServerErrorResponse = (
  message = 'An unexpected error occurred'
): ApiResponse<null> => {
  return ApiResponseBuilder.serverError(message).build();
};

/**
 * Business Logic Specific Formatters
 */
export const formatAnalyticsResponse = <T>(
  data: T,
  lastUpdated?: Date,
  message = 'Analytics data retrieved successfully'
): ApiResponse<T> => {
  const meta: ResponseMeta = {};
  
  if (lastUpdated) {
    meta.version = lastUpdated.toISOString();
  }

  return ApiResponseBuilder.success(data, message)
    .setMeta(meta)
    .build();
};

export const formatBulkOperationResponse = (
  successCount: number,
  failureCount: number,
  errors?: any[],
  message?: string
): ApiResponse<any> => {
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
  } else {
    return ApiResponseBuilder.error(
      message || defaultMessage,
      'PARTIAL_SUCCESS',
      responseData
    ).build();
  }
};

export const formatExportResponse = (
  filename: string,
  downloadUrl: string,
  format: string,
  recordCount: number,
  message = 'Export completed successfully'
): ApiResponse<any> => {
  const data = {
    filename,
    downloadUrl,
    format,
    recordCount,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
  };

  return ApiResponseBuilder.success(data, message).build();
};

export default ApiResponseBuilder;