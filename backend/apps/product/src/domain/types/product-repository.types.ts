export interface ICreateProduct {
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;
}

export interface IUpdateProduct {
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;
}
