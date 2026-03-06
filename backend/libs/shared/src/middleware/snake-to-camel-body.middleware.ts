import { NextFunction, Request, Response } from 'express';

function toCamelCase(str: string): string {
    const snakeToCamel = str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    return snakeToCamel.charAt(0).toLowerCase() + snakeToCamel.slice(1);
}

function convertKeys(obj: unknown): unknown {
    if (obj === null || obj === undefined) {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(convertKeys);
    }
    if (typeof obj === 'object' && obj.constructor === Object) {
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj)) {
            const camelKey = toCamelCase(key);
            result[camelKey] = convertKeys(value);
        }
        return result;
    }
    return obj;
}

export function snakeToCamelBody(_req: Request, res: Response, next: NextFunction): void {
    const req = _req as Request & { body?: unknown };
    if (req.body && typeof req.body === 'object' && !Array.isArray(req.body) && req.body.constructor === Object) {
        req.body = convertKeys(req.body) as Record<string, unknown>;
    }
    next();
}
