import { Stock } from '../entities/stock.entities';

export class StockWasReducedEvent {
    constructor(public readonly stock: Stock) {}
}
