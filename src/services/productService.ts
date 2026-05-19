import axiosPickleball from "../api/axiosPickleball";
import type { ProductResponse, ProductSearchResponse, SingleProductResponse } from "../types";

const productService = {
  // Lấy tất cả sản phẩm
  getAllProducts: async (): Promise<ProductResponse> => {
    const response = await axiosPickleball.get("/api/products");
    return response as ProductResponse;
  },

  // Lấy sản phẩm theo ID
  getProductById: async (id: string): Promise<SingleProductResponse> => {
    const response = await axiosPickleball.get(`/api/products/${id}`);
    return response as SingleProductResponse;
  },

  // Tìm kiếm và lọc sản phẩm
  searchAndFilterProducts: async (
    params: Record<string, string>
  ): Promise<ProductSearchResponse> => {
    const queryString = new URLSearchParams(params).toString();
    const response = await axiosPickleball.get(`/api/products/search?${queryString}`);
    return response as ProductSearchResponse;
  },
};

export default productService;
