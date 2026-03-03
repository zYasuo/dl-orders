import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from './zod-validation.pipe';

const schema = z.object({
    description: z.string().min(1, 'description is required'),
});
type SchemaType = z.infer<typeof schema>;

describe('ZodValidationPipe', () => {
    let pipe: ZodValidationPipe<SchemaType>;

    beforeEach(() => {
        pipe = new ZodValidationPipe(schema);
    });

    it('returns parsed value when data is valid', () => {
        const value = { description: 'valid order' };
        const metadata = { type: 'body' as const, metatype: Object, data: undefined };

        const result = pipe.transform(value, metadata);

        expect(result).toEqual({ description: 'valid order' });
    });

    it('throws BadRequestException with message and errors (tree format) when data is invalid', () => {
        const value = { description: '' };
        const metadata = { type: 'body' as const, metatype: Object, data: undefined };

        expect(() => pipe.transform(value, metadata)).toThrow(BadRequestException);

        try {
            pipe.transform(value, metadata);
        } catch (e) {
            const ex = e as BadRequestException;
            const response = ex.getResponse() as { message: string; errors: unknown };
            expect(response.message).toBe('Validation failed');
            expect(response.errors).toBeDefined();
            expect(typeof response.errors).toBe('object');
            expect(response.errors).toHaveProperty('properties');
            expect((response.errors as { properties: Record<string, unknown> }).properties).toHaveProperty('description');
        }
    });

    it('sets exception statusCode to 400', () => {
        const value = {};
        const metadata = { type: 'body' as const, metatype: Object, data: undefined };

        try {
            pipe.transform(value, metadata);
        } catch (e) {
            const ex = e as BadRequestException;
            expect(ex.getStatus()).toBe(400);
        }
    });
});
