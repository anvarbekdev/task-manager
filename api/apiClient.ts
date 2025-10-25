import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useSession } from '~/context/AuthContext';

const apiClient = axios.create({
  baseURL: 'http://192.168.169.134:3000/api',
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('@user') as any;
  if (token) {
    config.headers.Authorization = `Bearer ${JSON.parse(token.accessToken)}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response.status === 401) {
      const { session } = useSession();

      const refreshResponse = await axios.post('/refresh-token', { session });
      session
      const { accessToken } = refreshResponse.data;
      await AsyncStorage.setItem('accessToken', accessToken);

      error.config.headers.Authorization = `Bearer ${accessToken}`;
      return axios(error.config);
    }

    return Promise.reject(error);
  }
);

// export const API = "http://192.168.230.250:3000"
export const API = process.env.GLOBAL_API_URL;