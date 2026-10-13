import axios, { type AxiosRequestConfig } from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("izeon_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== "/login") {
      localStorage.removeItem("izeon_token");
      localStorage.removeItem("izeon_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// --- High-Performance In-Memory Cache Layer ---
// Caches GET queries to avoid repeating expensive DB queries when navigating between views.
interface CacheEntry {
  data: any;
  timestamp: number;
}

const apiCache = new Map<string, CacheEntry>();
const DEFAULT_CACHE_TTL = 45 * 1000; // 45 seconds cache TTL

export const invalidateApiCache = (pattern?: string) => {
  if (!pattern) {
    apiCache.clear();
    return;
  }
  for (const key of apiCache.keys()) {
    if (key.includes(pattern)) {
      apiCache.delete(key);
    }
  }
};

// Automatic cache invalidation on database mutations
const originalPost = api.post.bind(api);
const originalPut = api.put.bind(api);
const originalDelete = api.delete.bind(api);
const originalPatch = api.patch.bind(api);

api.post = async function (...args: Parameters<typeof originalPost>) {
  invalidateApiCache();
  return originalPost(...args);
} as typeof api.post;

api.put = async function (...args: Parameters<typeof originalPut>) {
  invalidateApiCache();
  return originalPut(...args);
} as typeof api.put;

api.delete = async function (...args: Parameters<typeof originalDelete>) {
  invalidateApiCache();
  return originalDelete(...args);
} as typeof api.delete;

api.patch = async function (...args: Parameters<typeof originalPatch>) {
  invalidateApiCache();
  return originalPatch(...args);
} as typeof api.patch;

// Cached GET wrapper
const originalGet = api.get.bind(api);

export interface CachedRequestConfig<D = any> extends AxiosRequestConfig<D> {
  bypassCache?: boolean;
  ttl?: number;
}

api.get = (async (url: string, config?: any) => {
  const bypass = config?.bypassCache === true;
  const ttl = config?.ttl || DEFAULT_CACHE_TTL;
  const cacheKey = `${url}__${JSON.stringify(config?.params || {})}`;

  if (!bypass) {
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return {
        data: cached.data,
        status: 200,
        statusText: "OK (From Cache)",
        headers: {},
        config: config || {},
        request: {},
      };
    }
  }

  const response = await originalGet(url, config);
  apiCache.set(cacheKey, {
    data: response.data,
    timestamp: Date.now(),
  });

  return response;
}) as any;

export default api;
