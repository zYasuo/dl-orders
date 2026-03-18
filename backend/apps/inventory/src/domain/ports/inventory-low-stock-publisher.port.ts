import { IInventoryLowStockEvent } from '@app/shared';

export abstract class IInventoryLowStockPublisherPort {
  abstract publish(event: IInventoryLowStockEvent): Promise<void>;
}
