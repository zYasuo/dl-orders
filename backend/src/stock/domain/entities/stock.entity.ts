export class Stock {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly price: number,
    public readonly quantity: number,
    public readonly description: string | null,
    public readonly createdAt: Date,
  ) {}
}
