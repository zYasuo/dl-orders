import { StandardErrorResponseDto, ZodValidationPipe } from '@app/shared';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateInventoryDto, SCreateInventory, type TCreateInventory } from '../../../application/dto/create-inventory.schema';
import { CreateInventoryUseCase } from '../../../application/use-cases/create-inventory.use-case';
import { FindAllInventoryUseCase } from '../../../application/use-cases/find-all-invetory.use-case';
import { Inventory } from '../../../domain/entities/inventory.entity';
import { IReservationAuditLogPort } from '../../../domain/ports/reservation-audit-log.port';

@ApiTags('Inventories')
@Controller('inventories')
export class InventoryController {
    constructor(
        private readonly createInventoryUseCase: CreateInventoryUseCase,
        private readonly reservationAuditLogPort: IReservationAuditLogPort,
        private readonly findAllInventoryUseCase: FindAllInventoryUseCase,
    ) {}

    @Post()
    @ApiOperation({ summary: 'Create inventory item' })
    @ApiBody({ type: CreateInventoryDto })
    @ApiResponse({ status: 201, description: 'Inventory item created' })
    @ApiResponse({ status: 400, description: 'Invalid input', type: StandardErrorResponseDto })
    async create(@Body(new ZodValidationPipe(SCreateInventory)) input: TCreateInventory): Promise<Inventory> {
        return this.createInventoryUseCase.execute(input);
    }

    @Get('reservations/:orderId/audit-log')
    @ApiOperation({ summary: 'Reservation audit log for order' })
    @ApiParam({ name: 'orderId', description: 'Order ID' })
    @ApiResponse({ status: 200, description: 'List of reservation audit events' })
    getReservationAuditLog(@Param('orderId') orderId: string) {
        return this.reservationAuditLogPort.getByOrderId(orderId);
    }

    @Get()
    @ApiOperation({ summary: 'Get all inventory items' })
    @ApiResponse({ status: 200, description: 'List of inventory items' })
    async findAll(): Promise<Inventory[]> {
        return this.findAllInventoryUseCase.execute();
    }
}
