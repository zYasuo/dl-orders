export class Order {
    constructor(
        public readonly id: string,
        public description: string,
        public readonly createdAt: Date,
    ) {}
}
