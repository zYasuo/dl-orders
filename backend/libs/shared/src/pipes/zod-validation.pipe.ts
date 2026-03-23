import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { z } from 'zod';
import type { ZodType } from 'zod';

@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown, metadata: ArgumentMetadata): T {
    if (metadata.type !== 'body' && metadata.type !== 'query') {
      return value as T;
    }

    if (metadata.type === 'body') {
      if (value === undefined || value === null) {
        throw new BadRequestException({
          message: 'Validation failed',
          errors: {
            errors: ['Request body is empty or missing Content-Type: application/json header'],
          },
        });
      }
    } else {
      if (value === undefined || value === null) {
        value = {};
      }
    }

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
