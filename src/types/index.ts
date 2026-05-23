export interface Category {
  _id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  salePrice?: number;
  brand?: string;
  categories?: Category[] | string[];
  image: string[];
  stock: number;
  specs?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductResponse {
  status: string;
  message: string;
  data: Product[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ProductSearchResponse {
  status: string;
  message: string;
  data: Product[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface SingleProductResponse {
  status: string;
  message: string;
  data: Product;
}

export interface CategoryResponse {
  status: string;
  message: string;
  data: Category[];
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
  message?: string;
  data: Cart;
}
