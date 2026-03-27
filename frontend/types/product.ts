export type Product = {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string | null;
    createdAt: string;
    updatedAt: string;
    stockQuantity?: number;
    inStock?: boolean;
    lastUnits?: boolean;
};
