import { ApiProperty } from '@nestjs/swagger';

export class InventoryStockLookupItemSwagger {
  @ApiProperty()
  productId!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  inStock!: boolean;

  @ApiProperty()
  lastUnits!: boolean;
}
