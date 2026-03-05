import axios from 'axios';

let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function clearAccessToken() {
  accessToken = null;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    const isAuthRoute = original?.url?.startsWith('/auth/login') || original?.url?.startsWith('/auth/register');
    if (error.response?.status === 401 && !original._retry && !isAuthRoute) {
      original._retry = true;

      try {
        const { data } = await axios.post(
          (import.meta.env.VITE_API_BASE_URL || '/api') + '/auth/refresh',
          null,
          { withCredentials: true }
        );
        setAccessToken(data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        clearAccessToken();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
