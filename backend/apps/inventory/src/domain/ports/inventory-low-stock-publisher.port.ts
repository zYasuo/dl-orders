import { IInventoryLowStockEvent } from '@app/shared';

export abstract class InventoryLowStockPublisherPort {
  abstract publish(event: IInventoryLowStockEvent): Promise<void>;
}
