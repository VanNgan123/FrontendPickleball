import axiosPickleball from "../api/axiosPickleball";
import type { Product } from "../types";

export interface WishlistData {
  _id?: string;
  userId: string;
  products: Product[];
}

export interface WishlistResponse {
  status: string;
  message?: string;
  data: WishlistData | null;
}

export interface WishlistCheckResponse {
  status: string;
  data: { inWishlist: boolean };
}

const wishlistService = {
  getWishlist: async (): Promise<WishlistResponse> => {
    const response = await axiosPickleball.get("/api/wishlist");
    return response as unknown as WishlistResponse;
  },

  addToWishlist: async (productId: string): Promise<WishlistResponse> => {
    const response = await axiosPickleball.post("/api/wishlist", { productId });
    return response as unknown as WishlistResponse;
  },

  removeFromWishlist: async (productId: string): Promise<WishlistResponse> => {
    const response = await axiosPickleball.delete(`/api/wishlist/${productId}`);
    return response as unknown as WishlistResponse;
  },

  clearWishlist: async (): Promise<WishlistResponse> => {
    const response = await axiosPickleball.delete("/api/wishlist");
    return response as unknown as WishlistResponse;
  },

  checkProduct: async (productId: string): Promise<WishlistCheckResponse> => {
    const response = await axiosPickleball.get(`/api/wishlist/check/${productId}`);
    return response as unknown as WishlistCheckResponse;
  },
};

export default wishlistService;
