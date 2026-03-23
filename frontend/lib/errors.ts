import { ApiError, type StandardApiErrorBody } from '@/types/api';

export async function throwIfNotOk(response: Response): Promise<void> {
    if (response.ok) {
        return;
    }
    let body: Partial<StandardApiErrorBody>;
    try {
        body = await response.json();
    } catch {
        throw new ApiError({
            statusCode: response.status,
            error: response.statusText || 'Error',
            message: response.statusText || 'Não foi possível processar a resposta.',
        });
    }
    throw new ApiError({
        statusCode: body.statusCode ?? response.status,
        error: body.error ?? 'Error',
        message: body.message ?? 'Algo deu errado.',
        details: body.details,
        timestamp: body.timestamp,
    });
}
