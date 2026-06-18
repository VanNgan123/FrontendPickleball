import axiosPickleball from "../api/axiosPickleball";

// =============================================
// Types
// =============================================
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface LoginResponse {
  status: string;
  message: string;
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
}

export interface RegisterResponse {
  status: string;
  message: string;
  data: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
  };
}

export interface RefreshTokenResponse {
  status: string;
  message: string;
  accessToken: string;
}

export interface ProfileResponse {
  status: string;
  data: AuthUser & { _id?: string };
}

// =============================================
// Auth Service
// =============================================
const authService = {
  // Đăng ký tài khoản mới
  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const response = await axiosPickleball.post("/api/users/register", payload);
    return response as unknown as RegisterResponse;
  },

  // Đăng nhập
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const response = await axiosPickleball.post("/api/users/login", payload);
    return response as unknown as LoginResponse;
  },

  // Refresh access token (cookie tự gửi refresh token)
  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const response = await axiosPickleball.post("/api/users/refresh-token", {});
    return response as unknown as RefreshTokenResponse;
  },

  // Đăng xuất
  logout: async (): Promise<{ status: string; message: string }> => {
    const response = await axiosPickleball.post("/api/users/logout");
    return response as unknown as { status: string; message: string };
  },

  // Lấy profile user hiện tại
  getProfile: async (): Promise<ProfileResponse> => {
    const response = await axiosPickleball.get("/api/users/profile");
    return response as unknown as ProfileResponse;
  },
};

export default authService;
