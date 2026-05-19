import axiosPickleball from "../api/axiosPickleball";
import type { Category, CategoryResponse } from "../types";

const categoryService = {
  getAllCategories: async (): Promise<Category[]> => {
    const response = await axiosPickleball.get("/api/category");
    if (Array.isArray(response)) {
      return response as Category[];
    }
    const typed = response as CategoryResponse;
    return typed.data || [];
  },

  getCategoryById: async (id: string): Promise<Category> => {
    const response = await axiosPickleball.get(`/api/category/${id}`);
    if (response && typeof response === "object" && "data" in response) {
      const typed = response as { data: Category };
      return typed.data;
    }
    return response as Category;
  },
};

export default categoryService;
