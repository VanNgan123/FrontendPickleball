import axiosPickleball from "../api/axiosPickleball";
import type { CartResponse } from "../types";

const cartService = {
  // Lấy giỏ hàng theo userId
  getCart: async (userId: string): Promise<CartResponse> => {
    const response = await axiosPickleball.get(`/api/cart/${userId}`);
    return response as unknown as CartResponse;
  },

  // Thêm sản phẩm vào giỏ
  addToCart: async (
    userId: string,
    productId: string,
    qty: number
  ): Promise<CartResponse> => {
    const response = await axiosPickleball.post("/api/cart", {
      userId,
      productId,
      qty,
    });
    return response as unknown as CartResponse;
  },

  // Cập nhật số lượng
  updateCartItem: async (
    userId: string,
    productId: string,
    qty: number
  ): Promise<CartResponse> => {
    const response = await axiosPickleball.put(`/api/cart/${userId}`, {
      productId,
      qty,
    });
    return response as unknown as CartResponse;
  },

  // Xóa 1 sản phẩm
  removeFromCart: async (
    userId: string,
    productId: string
  ): Promise<CartResponse> => {
    const response = await axiosPickleball.delete(
      `/api/cart/${userId}/${productId}`
    );
    return response as unknown as CartResponse;
  },

  // Xóa toàn bộ giỏ
  clearCart: async (userId: string): Promise<CartResponse> => {
    const response = await axiosPickleball.delete(
      `/api/cart/clear/${userId}`
    );
    return response as unknown as CartResponse;
  },
};

export default cartService;
