import axios from 'axios';

export const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// In tests, axios may be mocked without `create`. Fallback to the mock instance.
const hasCreate = typeof axios?.create === 'function';
export const api = hasCreate
  ? axios.create({
      baseURL: API_BASE,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: false,
    })
  : axios;

// Guard interceptor wiring for mocked axios objects
if (api?.interceptors?.response?.use) {
  api.interceptors.response.use(
    (resp) => resp,
    (error) => {
      // Normalize error object for callers and tests
      const message = error?.response?.data?.error || error.message || 'Request failed';
      return Promise.reject(new Error(message));
    }
  );
}

export default api;
