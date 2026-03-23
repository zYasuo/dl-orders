export type StandardApiErrorBody = {
    statusCode: number;
    error: string;
    message: string;
    details?: unknown;
    timestamp?: string;
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
