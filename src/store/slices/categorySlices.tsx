import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import categoryService from "../../services/categoryService";
import type { Category } from "../../services/categoryService";

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk<
  Category[],
  void,
  { rejectValue: string }
>("categories/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const data = await categoryService.getAllCategories();
    return data || [];
  } catch (error: any) {
    return rejectWithValue(error?.message || "Không thể tải danh mục");
  }
});

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi không xác định";
      });
  },
});

export default categorySlice.reducer;