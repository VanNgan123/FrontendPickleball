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

// =============================================
// Cart Types
// =============================================
export interface CartItem {
  productId: {
    _id: string;
    name: string;
    price: number;
    image: string[];
    salePrice?: number;
    stock: number;
  };
  qty: number;
  _id?: string;
}

export interface Cart {
  _id?: string;
  userId: string;
  items: CartItem[];
}

export interface CartResponse {
  success: boolean;
  data: Cart;
}
