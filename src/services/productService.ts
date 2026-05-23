import axiosPickleball from "../api/axiosPickleball";
import type { ProductResponse, ProductSearchResponse, SingleProductResponse } from "../types";

const productService = {
  // Lấy sản phẩm có phân trang
  getAllProducts: async (params?: { page?: number; limit?: number }): Promise<ProductResponse> => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit !== undefined) query.set("limit", String(params.limit));
    const queryString = query.toString();
    const url = queryString ? `/api/products?${queryString}` : "/api/products";
    const response = await axiosPickleball.get(url);
    return response as unknown as ProductResponse;
  },

  // Lấy sản phẩm theo ID
  getProductById: async (id: string): Promise<SingleProductResponse> => {
    const response = await axiosPickleball.get(`/api/products/${id}`);
    return response as unknown as SingleProductResponse;
  },

  // Tìm kiếm và lọc sản phẩm
  searchAndFilterProducts: async (
    params: Record<string, string>
  ): Promise<ProductSearchResponse> => {
    const queryString = new URLSearchParams(params).toString();
    const response = await axiosPickleball.get(`/api/products/search?${queryString}`);
    return response as unknown as ProductSearchResponse;
  },
};

export default productService;
