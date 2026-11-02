import axiosPickleball from "../api/axiosPickleball";

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  address?: string[];
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  address?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileResponse {
  status: string;
  data: UserProfile;
}

export interface UsersResponse {
  status: string;
  data: UserProfile[];
}

const userService = {
  // Lay profile
  getProfile: async (): Promise<ProfileResponse> => {
    const response = await axiosPickleball.get("/api/users/profile");
    return response as unknown as ProfileResponse;
  },

  // Cap nhat profile
  updateProfile: async (
    payload: UpdateProfilePayload
  ): Promise<ProfileResponse> => {
    const response = await axiosPickleball.put("/api/users/profile", payload);
    return response as unknown as ProfileResponse;
  },

  // Upload avatar
  updateAvatar: async (file: File): Promise<ProfileResponse> => {
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await axiosPickleball.put("/api/users/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response as unknown as ProfileResponse;
  },

  getAllUsers: async (): Promise<UsersResponse> => {
    const response = await axiosPickleball.get("/api/users/admin/all");
    return response as unknown as UsersResponse;
  },

  toggleUserActive: async (userId: string): Promise<ProfileResponse> => {
    const response = await axiosPickleball.put(
      `/api/users/admin/${userId}/toggle-active`
    );
    return response as unknown as ProfileResponse;
  },

  updateUserRole: async (
    userId: string,
    role: "customer" | "staff" | "admin"
  ): Promise<ProfileResponse> => {
    const response = await axiosPickleball.put(`/api/users/admin/${userId}/role`, {
      role,
    });
    return response as unknown as ProfileResponse;
  },
};

export default userService;
