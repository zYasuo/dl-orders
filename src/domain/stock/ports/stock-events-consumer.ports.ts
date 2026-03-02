import { StockWasReducedEvent } from '../events/stock-was-reduced.event';

export abstract class StockEventsConsumerPort {
    abstract consumeStockWasReduced(event: StockWasReducedEvent): Promise<void>;
}
