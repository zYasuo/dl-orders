export type StandardApiErrorBody = {
    success?: false;
    statusCode: number;
    error: string;
    message: string;
    details?: unknown;
    timestamp?: string;
};

export type ApiSuccessResponse<T> = {
    success: true;
    timestamp: string;
    data: T;
};

export type ApiPaginatedSuccessResponse<T> = {
    success: true;
    timestamp: string;
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};

export class ApiError extends Error {
    readonly statusCode: number;
    readonly error: string;
    readonly details?: unknown;

    constructor(body: StandardApiErrorBody) {
        super(body.message);
        this.name = 'ApiError';
        this.statusCode = body.statusCode;
        this.error = body.error;
        this.details = body.details;
    }
}
