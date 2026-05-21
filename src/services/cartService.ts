import axiosPickleball from "../api/axiosPickleball";
import type { CartResponse } from "../types";

const cartService = {
  // Lấy giỏ hàng của user đang đăng nhập
  getCart: async (): Promise<CartResponse> => {
    const response = await axiosPickleball.get("/api/cart/me");
    return response as unknown as CartResponse;
  },

  // Thêm sản phẩm vào giỏ
  addToCart: async (productId: string, qty: number): Promise<CartResponse> => {
    const response = await axiosPickleball.post("/api/cart", {
      productId,
      qty,
    });
    return response as unknown as CartResponse;
  },

  // Cập nhật số lượng
  updateCartItem: async (
    productId: string,
    qty: number
  ): Promise<CartResponse> => {
    const response = await axiosPickleball.put("/api/cart", {
      productId,
      qty,
    });
    return response as unknown as CartResponse;
  },

  // Xóa 1 sản phẩm
  removeFromCart: async (productId: string): Promise<CartResponse> => {
    const response = await axiosPickleball.delete(`/api/cart/${productId}`);
    return response as unknown as CartResponse;
  },

  // Xóa toàn bộ giỏ
  clearCart: async (): Promise<CartResponse> => {
    const response = await axiosPickleball.delete("/api/cart/clear/all");
    return response as unknown as CartResponse;
  },
};

export default cartService;
