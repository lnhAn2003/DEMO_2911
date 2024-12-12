import axios from 'axios';
import Cookies from 'js-cookie';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:4000',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  

axiosInstance.interceptors.request.use(
    (config) => {
      const token = Cookies.get('token');
      console.log('Token from cookies:', token);
      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log('Authorization header set:', config.headers['Authorization']);
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

export default axiosInstance;
