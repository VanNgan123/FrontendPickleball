import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import cartService from "../../services/cartService";
import type { CartItem } from "../../types";
import type { RootState } from "../store";

// =============================================
// State interface
// =============================================
interface CartState {
  items: CartItem[];
  loading: boolean;
  actionLoading: boolean; // loading cho add/update/remove
  error: string | null;
}

const initialState: CartState = {
  items: [],
  loading: false,
  actionLoading: false,
  error: null,
};

// Helper: kiểm tra đã đăng nhập
const ensureAuthenticated = (getState: () => unknown): void => {
  const state = getState() as RootState;
  const userId = state.auth.user?.id;
  if (!userId) throw new Error("Vui lòng đăng nhập để sử dụng giỏ hàng");
};

// =============================================
// Async Thunks
// =============================================

/** Lấy giỏ hàng */
export const fetchCart = createAsyncThunk<
  CartItem[],
  void,
  { rejectValue: string }
>("cart/fetch", async (_, { rejectWithValue, getState }) => {
  try {
    ensureAuthenticated(getState);
    const data = await cartService.getCart();
    return data.data?.items || [];
  } catch (error: any) {
    return rejectWithValue(error?.message || "Không thể tải giỏ hàng");
  }
});

/** Thêm vào giỏ */
export const addToCart = createAsyncThunk<
  CartItem[],
  { productId: string; qty: number },
  { rejectValue: string }
>("cart/add", async ({ productId, qty }, { rejectWithValue, getState }) => {
  try {
    ensureAuthenticated(getState);
    const data = await cartService.addToCart(productId, qty);
    return data.data?.items || [];
  } catch (error: any) {
    return rejectWithValue(error?.message || "Thêm vào giỏ thất bại");
  }
});

/** Cập nhật số lượng */
export const updateCartItem = createAsyncThunk<
  CartItem[],
  { productId: string; qty: number },
  { rejectValue: string }
>(
  "cart/update",
  async ({ productId, qty }, { rejectWithValue, getState }) => {
    try {
      ensureAuthenticated(getState);
      const data = await cartService.updateCartItem(productId, qty);
      return data.data?.items || [];
    } catch (error: any) {
      return rejectWithValue(error?.message || "Cập nhật thất bại");
    }
  }
);

/** Xóa 1 sản phẩm */
export const removeFromCart = createAsyncThunk<
  CartItem[],
  { productId: string },
  { rejectValue: string }
>("cart/remove", async ({ productId }, { rejectWithValue, getState }) => {
  try {
    ensureAuthenticated(getState);
    const data = await cartService.removeFromCart(productId);
    return data.data?.items || [];
  } catch (error: any) {
    return rejectWithValue(error?.message || "Xóa thất bại");
  }
});

/** Xóa toàn bộ giỏ */
export const clearCart = createAsyncThunk<void, void, { rejectValue: string }>(
  "cart/clear",
  async (_, { rejectWithValue, getState }) => {
    try {
      ensureAuthenticated(getState);
      await cartService.clearCart();
    } catch (error: any) {
      return rejectWithValue(error?.message || "Xóa giỏ thất bại");
    }
  }
);

// =============================================
// Slice
// =============================================
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    resetCart: (state) => {
      state.items = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchCart
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi";
      });

    // addToCart
    builder
      .addCase(addToCart.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.items = action.payload;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || "Lỗi";
      });

    // updateCartItem
    builder
      .addCase(updateCartItem.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.items = action.payload;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || "Lỗi";
      });

    // removeFromCart
    builder
      .addCase(removeFromCart.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.items = action.payload;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || "Lỗi";
      });

    // clearCart
    builder.addCase(clearCart.fulfilled, (state) => {
      state.items = [];
    });
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;
