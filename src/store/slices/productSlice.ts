import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Product } from "../../types";
import productService from "../../services/productService";

// =============================================
// State interface
// =============================================
interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  searchResults: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  } | null;
  loading: boolean;
  detailLoading: boolean;
  searchLoading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  currentProduct: null,
  searchResults: [],
  pagination: null,
  loading: false,
  detailLoading: false,
  searchLoading: false,
  error: null,
};

// =============================================
// Async Thunks
// =============================================

/** Lấy tất cả sản phẩm */
export const fetchAllProducts = createAsyncThunk<
  Product[],
  void,
  { rejectValue: string }
>("products/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const data = await productService.getAllProducts();
    return data.data || [];
  } catch (error: any) {
    return rejectWithValue(error?.message || "Không thể tải sản phẩm");
  }
});

/** Lấy sản phẩm theo ID */
export const fetchProductById = createAsyncThunk<
  Product,
  string,
  { rejectValue: string }
>("products/fetchById", async (id, { rejectWithValue }) => {
  try {
    const data = await productService.getProductById(id);
    return data.data;
  } catch (error: any) {
    return rejectWithValue(error?.message || "Không tìm thấy sản phẩm");
  }
});

/** Tìm kiếm & lọc sản phẩm */
export const searchProducts = createAsyncThunk<
  { products: Product[]; pagination: ProductState["pagination"] },
  Record<string, string>,
  { rejectValue: string }
>("products/search", async (params, { rejectWithValue }) => {
  try {
    const data = await productService.searchAndFilterProducts(params);
    return {
      products: data.data || [],
      pagination: data.pagination || null,
    };
  } catch (error: any) {
    return rejectWithValue(error?.message || "Tìm kiếm thất bại");
  }
});

// =============================================
// Slice
// =============================================
const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.pagination = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchAllProducts
    builder
      .addCase(fetchAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi không xác định";
      });

    // fetchProductById
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload || "Lỗi không xác định";
      });

    // searchProducts
    builder
      .addCase(searchProducts.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload || "Lỗi không xác định";
      });
  },
});

export const { clearCurrentProduct, clearSearchResults, clearError } =
  productSlice.actions;

export default productSlice.reducer;
