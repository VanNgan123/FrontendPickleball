export interface Category {
  _id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductReview {
  _id: string;
  productId: string;
  userId: { _id: string; name: string; email?: string };
  rating: number;
  comment: string;
  images: string[];
  helpful: number;
  adminReply?: { text?: string; replyAt?: string };
  createdAt: string;
}

export interface ProductRatingSummary {
  avgRating: number;
  totalReviews: number;
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
  soldCount?: number;
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
    categories?: Category[] | string[];
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
  status: string;
  message?: string;
  data: Cart;
}
