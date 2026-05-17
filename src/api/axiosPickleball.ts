
import axios from "axios";

const axiosPickleball = axios.create({
   baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
   timeout: 10000,
});


// Thêm một bộ đón chặn request
axiosPickleball.interceptors.request.use(
   function (config) {
      // Gắn access token vào header nếu có
      const token = localStorage.getItem("accessToken");
      if (token) {
         config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
   },
   function (error) {
      // Làm gì đó với lỗi request
      return Promise.reject(error);
   }
);

// Thêm một bộ đón chặn response
axiosPickleball.interceptors.response.use(
   function (response) {
      // Bất kì mã trạng thái nào nằm trong tầm 2xx đều khiến hàm này được trigger
      // Làm gì đó với dữ liệu response
      return response.data;
   },
   async function (error) {
      const originalRequest = error.config;

      // Nếu lỗi 401 và chưa retry -> thử refresh token
      if (error.response?.status === 401 && !originalRequest._retry) {
         originalRequest._retry = true;

         try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (!refreshToken) {
               return Promise.reject(error);
            }

            // Gọi API refresh token (dùng axios trực tiếp, không qua interceptor)
            const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3001";
            const res = await axios.post(`${baseURL}/api/users/refresh-token`, {
               refreshToken,
            });

            const newAccessToken = res.data.accessToken;
            localStorage.setItem("accessToken", newAccessToken);

            // Retry request ban đầu với token mới
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axiosPickleball(originalRequest);
         } catch (refreshError) {
            // Refresh thất bại -> xóa token & chuyển về login
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            window.location.href = "/login";
            return Promise.reject(refreshError);
         }
      }

      return Promise.reject(error);
   }
);

export default axiosPickleball;