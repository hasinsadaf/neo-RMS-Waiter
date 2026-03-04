import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Log API initialization
console.log("%c[API Init]", "color: green; font-weight: bold", {
  baseURL: import.meta.env.VITE_API_URL,
  env: import.meta.env.MODE,
  authTokenExists: !!localStorage.getItem("authToken"),
  tenantId: localStorage.getItem("tenantId"),
  restaurantId: localStorage.getItem("restaurantId"),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  const tenantId = localStorage.getItem("tenantId");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (tenantId) {
    // backend expects tenant identifier as x-tenant-id header
    config.headers["x-tenant-id"] = tenantId;
  }

  // === DEBUG LOGGING ===
  const fullUrl = `${api.defaults.baseURL}${config.url}`;
  console.log("%c[API Request]", "color: blue; font-weight: bold", {
    baseURL: api.defaults.baseURL,
    endpoint: config.url,
    fullURL: fullUrl,
    method: config.method.toUpperCase(),
    headers: config.headers,
    params: config.params,
    data: config.data,
  });

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // === DEBUG LOGGING FOR ERRORS ===
    console.log("%c[API Error]", "color: red; font-weight: bold", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      requestHeaders: error.config?.headers,
      responseData: error.response?.data,
      message: error.message,
    });

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        await api.post("/auth/refresh-token");
        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("authRole");
        window.location.href = "/waiter/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;