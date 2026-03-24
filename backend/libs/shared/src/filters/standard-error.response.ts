import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export interface StandardErrorResponse {
  success: false;
  statusCode: number;
  error: string;
  message: string;
  details?: unknown;
  timestamp: string;
}

export class StandardErrorResponseDto implements StandardErrorResponse {
  @ApiProperty({ example: false, description: 'Indicates a failed response' })
  success!: false;

  @ApiProperty({ example: 404, description: 'HTTP status code' })
  statusCode!: number;

  @ApiProperty({ example: 'Not Found', description: 'HTTP status text' })
  error!: string;

  @ApiProperty({ example: 'Product not found', description: 'Human-readable message' })
  message!: string;

  @ApiPropertyOptional({ description: 'Optional details (e.g. validation errors)' })
  details?: unknown;

  @ApiProperty({
    example: '2026-03-09T14:00:00.000Z',
    description: 'Response timestamp (ISO 8601)',
  })
  timestamp!: string;
}
