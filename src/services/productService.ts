import axiosPickleball from "../api/axiosPickleball";
import type { ProductResponse, SingleProductResponse } from "../types";

const productService = {
  // Lấy tất cả sản phẩm
  getAllProducts: async (): Promise<ProductResponse> => {
    const response = await axiosPickleball.get("/api/products");
    return response as unknown as ProductResponse;
  },

  // Lấy sản phẩm theo ID
  getProductById: async (id: string): Promise<SingleProductResponse> => {
    const response = await axiosPickleball.get(`/api/products/${id}`);
    return response as unknown as SingleProductResponse;
  },

  // Tìm kiếm và lọc sản phẩm
  searchAndFilterProducts: async (params: Record<string, string>): Promise<any> => {
    const queryString = new URLSearchParams(params).toString();
    const response = await axiosPickleball.get(`/api/products/search?${queryString}`);
    return response;
  },
};

export default productService;
