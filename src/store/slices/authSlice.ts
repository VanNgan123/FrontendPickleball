import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import authService from "../../services/authService";
import type {
  AuthUser,
  LoginPayload,
  RegisterPayload,
  ProfileResponse,
} from "../../services/authService";

// =============================================
// Helpers
// =============================================

/** Trích xuất message lỗi từ Axios hoặc Error thông thường */
const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || error.message || fallback;
  }
  if (error instanceof Error) {
    return error.message || fallback;
  }
  return fallback;
};

// =============================================
// State interface
// =============================================
interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Khôi phục trạng thái từ localStorage
const storedUser = localStorage.getItem("user");
const storedAccessToken = localStorage.getItem("accessToken");

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  accessToken: storedAccessToken || null,
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
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, "Đăng ký thất bại"));
  }
});

/** Đăng nhập */
export const loginUser = createAsyncThunk<
  { user: AuthUser; accessToken: string },
  LoginPayload,
  { rejectValue: string }
>("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const data = await authService.login(payload);
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("user", JSON.stringify(data.user));
    return {
      user: data.user,
      accessToken: data.accessToken,
    };
  } catch (error: unknown) {
    return rejectWithValue(extractErrorMessage(error, "Đăng nhập thất bại"));
  }
});

/** Refresh Access Token */
export const refreshAccessToken = createAsyncThunk<
  { accessToken: string },
  void,
  { rejectValue: string }
>("auth/refreshToken", async (_, { rejectWithValue }) => {
  try {
    const data = await authService.refreshToken();
    localStorage.setItem("accessToken", data.accessToken);
    return { accessToken: data.accessToken };
  } catch (error: unknown) {
    return rejectWithValue(
      extractErrorMessage(error, "Refresh token thất bại")
    );
  }
});

/** Đăng xuất (Async Thunk gọi API) */
export const logoutUser = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("auth/logout", async () => {
  try {
    await authService.logout();
  } catch {
    // Vẫn tiếp tục xóa state ở client khi logout lỗi
  }
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
});

/** Lấy profile user (bao gồm avatar) */
export const fetchUserProfile = createAsyncThunk<
  { user: AuthUser },
  void,
  { rejectValue: string }
>("auth/fetchProfile", async (_, { rejectWithValue }) => {
  try {
    const data: ProfileResponse = await authService.getProfile();
    const profileData = data.data;
    const user: AuthUser = {
      id: profileData._id || profileData.id || "",
      name: profileData.name,
      email: profileData.email,
      role: profileData.role,
      avatar: profileData.avatar,
    };
    localStorage.setItem("user", JSON.stringify(user));
    return { user };
  } catch (error: unknown) {
    return rejectWithValue(
      extractErrorMessage(error, "Lấy profile thất bại")
    );
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
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("accessToken");
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
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      });

    // Logout Thunk
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.error = null;
      });

    // Fetch Profile
    builder.addCase(fetchUserProfile.fulfilled, (state, action) => {
      state.user = action.payload.user;
    });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
