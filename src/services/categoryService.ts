import axiosPickleball from "../api/axiosPickleball";

export interface Category {
  _id: string;
  name: string;
  slug: string;
  parentId: string | null;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

const categoryService = {
  getAllCategories: async (): Promise<Category[]> => {
    const response = await axiosPickleball.get("/api/category");
    return response as unknown as Category[];
  },

  getCategoryById: async (id: string): Promise<Category> => {
    const response = await axiosPickleball.get(`/api/category/${id}`);
    return response as unknown as Category;
  },
};

export default categoryService;
