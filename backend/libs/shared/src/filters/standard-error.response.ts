export interface StandardErrorResponse {
    statusCode: number;
    error: string;
    message: string;
    details?: unknown;
    timestamp: string;
}
