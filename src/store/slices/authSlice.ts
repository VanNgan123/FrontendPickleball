import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../../services/authService";
import type {
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "../../services/authService";

// =============================================
// State interface
// =============================================
interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Khôi phục trạng thái từ localStorage
const storedUser = localStorage.getItem("user");
const storedAccessToken = localStorage.getItem("accessToken");
const storedRefreshToken = localStorage.getItem("refreshToken");

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  accessToken: storedAccessToken || null,
  refreshToken: storedRefreshToken || null,
  isAuthenticated: !!storedAccessToken,
  loading: false,
  error: null,
};

// =============================================
// Async Thunks
// =============================================

/** Đăng ký tài khoản */
export const registerUser = createAsyncThunk<
  { message: string },
  RegisterPayload,
  { rejectValue: string }
>("auth/register", async (payload, { rejectWithValue }) => {
  try {
    const data = await authService.register(payload);
    return { message: data.message };
  } catch (error: any) {
    const message =
      error?.response?.data?.message || error?.message || "Đăng ký thất bại";
    return rejectWithValue(message);
  }
});

/** Đăng nhập */
export const loginUser = createAsyncThunk<
  { user: AuthUser; accessToken: string; refreshToken: string },
  LoginPayload,
  { rejectValue: string }
>("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const data = await authService.login(payload);
    // Lưu token vào localStorage
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(data.user));
    return {
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  } catch (error: any) {
    const message =
      error?.response?.data?.message || error?.message || "Đăng nhập thất bại";
    return rejectWithValue(message);
  }
});

/** Refresh Access Token */
export const refreshAccessToken = createAsyncThunk<
  { accessToken: string },
  void,
  { rejectValue: string }
>("auth/refreshToken", async (_, { rejectWithValue, getState }) => {
  try {
    const state = getState() as { auth: AuthState };
    const token = state.auth.refreshToken;
    if (!token) throw new Error("Không có refresh token");

    const data = await authService.refreshToken(token);
    localStorage.setItem("accessToken", data.accessToken);
    return { accessToken: data.accessToken };
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Refresh token thất bại";
    return rejectWithValue(message);
  }
});

/** Lấy profile user (bao gồm avatar) */
export const fetchUserProfile = createAsyncThunk<
  { user: AuthUser },
  void,
  { rejectValue: string }
>("auth/fetchProfile", async (_, { rejectWithValue }) => {
  try {
    const data = await authService.getProfile();
    const user: AuthUser = {
      id: (data as any).data?._id || (data as any).data?.id || (data as any)._id || (data as any).id,
      name: (data as any).data?.name || (data as any).name,
      email: (data as any).data?.email || (data as any).email,
      role: (data as any).data?.role || (data as any).role,
      avatar: (data as any).data?.avatar || (data as any).avatar,
    };
    // Cập nhật localStorage
    localStorage.setItem("user", JSON.stringify(user));
    return { user };
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Lấy profile thất bại";
    return rejectWithValue(message);
  }
});

// =============================================
// Slice
// =============================================
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đăng ký thất bại";
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đăng nhập thất bại";
      });

    // Refresh Token
    builder
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        // Nếu refresh thất bại, đăng xuất
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      });

    // Fetch Profile
    builder
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
