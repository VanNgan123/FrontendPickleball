
import axios from "axios";
const axiosPickleball= axios.create({
    baseURL : import.meta.env.REACT_APP_API,
    timeout: 10000,
});


// Thêm một bộ đón chặn request
axiosPickleball.interceptors.request.use(
   function (config) {
      // Làm gì đó trước khi request dược gửi đi

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
   function (error) {
      // Bất kì mã trạng thái nào lọt ra ngoài tầm 2xx đều khiến hàm này được trigger\
      // Làm gì đó với lỗi response
      return Promise.reject(error?.message);
   }
);

export default axiosPickleball;