import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { toast } from "react-toastify";
import STORAGE, { getStorage, setStorage, deleteStorage } from "@/lib/storage";
import { trimData } from "@/lib/utils";
import AuthService from "../AuthSerivce";

// ================== Kiểu dữ liệu ==================
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

// ================== Hàm parse response ==================
export function parseBody<T>(response: AxiosResponse<ApiResponse<T>>): {
  data: T;
  message: string;
  statusCode: number;
} {
  const { success, message, data, statusCode } = response.data;

  if (!success) {
    const errorMsg = message || `Lỗi hệ thống(SC${statusCode})`;
    toast.error(errorMsg);
    throw new Error(errorMsg);
  }

  return { data, message, statusCode };
}

// ================== Axios instance ==================
const instance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_REACT_APP_API_ROOT, // Use standard Next.js env variable
  timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 60000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: process.env.NEXT_PUBLIC_API_WITH_CREDENTIALS === "true",
});

// ================== Refresh Token Logic ==================
interface FailedQueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });
  failedQueue = [];
};

// ================== Request Interceptor ==================
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (config.method?.toLowerCase() === "get") {
      config.params = {
        ...config.params,
        IsDomain: 1, // Only add if required by your API
      };
    }

    if (config.data && !(config.data instanceof FormData)) {
      config.data = trimData(config.data);
    }

    const token = getStorage(STORAGE.TOKEN);
    if (token) {
      config.headers.set("Authorization", `Bearer ${token} `);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ================== Response Interceptor ==================
instance.interceptors.response.use(
  async (response: AxiosResponse<ApiResponse<unknown>>) => {
    const { success, message, statusCode } = response.data;

    // Handle API-level 401 (Unauthorized) indicated in response body
    if (statusCode === 401 && success === false) {
      const originalRequest = response.config as CustomAxiosRequestConfig;

      if (originalRequest._retry) {
        deleteStorage(STORAGE.TOKEN);
        deleteStorage(STORAGE.USER_INFO);
        deleteStorage(STORAGE.REFRESH_TOKEN);
        if (typeof window !== "undefined") {
          window.location.replace("/login");
        }
        throw new Error("Không thể làm mới token");
      }

      originalRequest._retry = true;

      const refreshToken = getStorage(STORAGE.REFRESH_TOKEN);
      if (!refreshToken) {
        deleteStorage(STORAGE.TOKEN);
        deleteStorage(STORAGE.USER_INFO);
        deleteStorage(STORAGE.REFRESH_TOKEN);
        if (typeof window !== "undefined") {
          window.location.replace("/login");
        }
        throw new Error("Không có refresh token");
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers = {
                ...originalRequest.headers,
                Authorization: `Bearer ${token} `,
              };
              resolve(instance(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        const res = await AuthService.refreshToken(refreshToken);
        const accessToken = res.data.accessToken; // Use parseBody to handle response
        setStorage(STORAGE.TOKEN, accessToken);

        processQueue(null, accessToken);
        isRefreshing = false;

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${accessToken} `,
        };

        return instance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        deleteStorage(STORAGE.TOKEN);
        deleteStorage(STORAGE.USER_INFO);
        deleteStorage(STORAGE.REFRESH_TOKEN);
        if (typeof window !== "undefined") {
          window.location.replace("/login");
        }
        throw refreshError;
      }
    }

    const parsed = parseBody(response);
    return {
      ...response,
      data: parsed.data,
      message: parsed.message,
      statusCode: parsed.statusCode
    };
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    // Handle non-200 HTTP statuses (e.g., network errors, 500)
    const errorMsg =
      error.response?.data?.message ||
      error.message ||
      "Lỗi không xác định hoặc mất kết nối";
    toast.error(errorMsg);
    return Promise.reject(error);
  }
);

// ================== Export ==================
export default instance;

export const httpGetFile = (
  path: string,
  optionalHeader: Record<string, string> = {}
): Promise<AxiosResponse<Blob>> =>
  instance.get(path, {
    headers: optionalHeader,
    responseType: "blob",
  });