import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const configuredApiUrl = import.meta.env.VITE_API_URL;

// Development không khai báo env: dùng backend local.
// Production Docker truyền chuỗi rỗng: dùng same-origin qua Nginx.
const baseURL =
  configuredApiUrl === undefined
    ? "http://localhost:3001"
    : configuredApiUrl;

const axiosPickleball = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
});

axiosPickleball.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosPickleball.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | RetryableRequestConfig
      | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isUnauthorized = error.response?.status === 401;
    const isRefreshRequest = originalRequest.url?.includes(
      "/api/users/refresh-token"
    );

    if (
      isUnauthorized &&
      !originalRequest._retry &&
      !isRefreshRequest
    ) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${baseURL}/api/users/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = response.data.accessToken;

        if (!newAccessToken) {
          throw new Error("Backend không trả access token mới");
        }

        localStorage.setItem("accessToken", newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return axiosPickleball(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");

        if (window.location.pathname !== "/login") {
          window.location.replace("/login");
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosPickleball;