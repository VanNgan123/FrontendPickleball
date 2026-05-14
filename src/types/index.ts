export interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  salePrice?: number;
  brand?: string;
  categories?: string[];
  image: string[];
  stock: number;
  specs?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductResponse {
  message: string;
  product: Product[];
}

export interface SingleProductResponse {
  message: string;
  product: Product;
}
