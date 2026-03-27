import { Paginated, ZodValidationPipe } from '@app/shared';
import { Body, Controller, Param, Query } from '@nestjs/common';
import {
  SCreateInventory,
  type TCreateInventory,
} from '../../../application/dto/create-inventory.schema';
import {
  SFindAllInventoryQuery,
  type TFindAllInventoryQuery,
} from '../../../application/dto/find-all-inventory-query.schema';
import {
  SLookupInventoryByProductIds,
  type TLookupInventoryByProductIds,
} from '../../../application/dto/lookup-inventory-by-product-ids.schema';
import type { TInventoryStockLookupItem } from '../../../application/dto/inventory-stock-lookup-item';
import { CreateInventoryUseCase } from '../../../application/use-cases/create-inventory.use-case';
import { FindAllInventoryUseCase } from '../../../application/use-cases/find-all-invetory.use-case';
import { LookupInventoryByProductIdsUseCase } from '../../../application/use-cases/lookup-inventory-by-product-ids.use-case';
import { InventoryEntity } from '../../../domain/entities/inventory.entity';
import { ReservationAuditLogPort } from '../../../domain/ports/reservation-audit-log.port';
import { InventoryDoc, ApiInventories } from './docs/inventory-doc.decorator';

@ApiInventories()
@Controller('inventories')
export class InventoryController {
  constructor(
    private readonly createInventoryUseCase: CreateInventoryUseCase,
    private readonly reservationAuditLogPort: ReservationAuditLogPort,
    private readonly findAllInventoryUseCase: FindAllInventoryUseCase,
    private readonly lookupInventoryByProductIdsUseCase: LookupInventoryByProductIdsUseCase,
  ) {}

  @InventoryDoc.Create()
  async create(
    @Body(new ZodValidationPipe(SCreateInventory)) input: TCreateInventory,
  ): Promise<InventoryEntity> {
    return this.createInventoryUseCase.execute(input);
  }

  @InventoryDoc.ReservationAuditLog()
  getReservationAuditLog(@Param('orderId') orderId: string) {
    return this.reservationAuditLogPort.getByOrderId(orderId);
  }

  @InventoryDoc.List()
  async findAll(
    @Query(new ZodValidationPipe(SFindAllInventoryQuery)) query: TFindAllInventoryQuery,
  ): Promise<Paginated<InventoryEntity>> {
    return this.findAllInventoryUseCase.execute(query);
  }

  @InventoryDoc.Lookup()
  async lookupByProductIds(
    @Body(new ZodValidationPipe(SLookupInventoryByProductIds)) input: TLookupInventoryByProductIds,
  ): Promise<TInventoryStockLookupItem[]> {
    return this.lookupInventoryByProductIdsUseCase.execute(input);
  }
}
