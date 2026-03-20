import { ZodValidationPipe } from '@app/shared';
import { Body, Controller, Param } from '@nestjs/common';
import {
  SCreateInventory,
  type TCreateInventory,
} from '../../../application/dto/create-inventory.schema';
import { CreateInventoryUseCase } from '../../../application/use-cases/create-inventory.use-case';
import { FindAllInventoryUseCase } from '../../../application/use-cases/find-all-invetory.use-case';
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
  async findAll(): Promise<InventoryEntity[]> {
    return this.findAllInventoryUseCase.execute();
  }
}
