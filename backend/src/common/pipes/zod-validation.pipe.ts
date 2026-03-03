import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { z } from 'zod';
import type { ZodType } from 'zod';

@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
    constructor(private readonly schema: ZodType<T>) {}

    transform(value: unknown, _metadata: ArgumentMetadata): T {
        const result = this.schema.safeParse(value);

        if (!result.success) {
            const errors = z.treeifyError(result.error);
            throw new BadRequestException({
                message: 'Validation failed',
                errors,
            });
        }

        return result.data;
    }
}
