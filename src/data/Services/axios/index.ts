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
    console.error("API Error:", { statusCode, message });
    throw new Error(errorMsg);
  }

  return { data, message, statusCode };
}

// ================== Axios instance ==================
const instance: AxiosInstance = axios.create({
  baseURL: "https://saingo-d9b9abexg5ghd4d3.japaneast-01.azurewebsites.net", // Use standard Next.js env variable
  // baseURL: "https://localhost:7028",
  timeout: 60000,
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

const normalizeError = (reason: unknown): Error => {
  if (reason instanceof Error) {
    return reason;
  }

  try {
    const serialized = typeof reason === "string" ? reason : JSON.stringify(reason);
    return new Error(serialized);
  } catch {
    return new Error("Unknown error");
  }
};

const clearAuthStorage = () => {
  deleteStorage(STORAGE.TOKEN);
  deleteStorage(STORAGE.USER_INFO);
  deleteStorage(STORAGE.REFRESH_TOKEN);
};

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

const attachAuthorizationHeader = (request: CustomAxiosRequestConfig, token: string) => {
  request.headers = {
    ...request.headers,
    Authorization: `Bearer ${token} `,
  };
};

const requestNewAccessToken = async (refreshToken: string): Promise<string> => {
  const res = await AuthService.refreshToken(refreshToken);
  const { accessToken, refreshToken: nextRefreshToken } = res.data;

  setStorage(STORAGE.TOKEN, accessToken);
  if (nextRefreshToken) {
    setStorage(STORAGE.REFRESH_TOKEN, nextRefreshToken);
  }

  processQueue(null, accessToken);
  return accessToken;
};

const enqueueRequestWhileRefreshing = (request: CustomAxiosRequestConfig) =>
  new Promise<AxiosResponse>((resolve, reject) => {
    failedQueue.push({
      resolve: (token: string) => {
        attachAuthorizationHeader(request, token);
        resolve(instance(request));
      },
      reject,
    });
  });

const handleUnauthorizedResponse = async (
  response: AxiosResponse<ApiResponse<unknown>>,
): Promise<AxiosResponse<ApiResponse<unknown>>> => {
  const originalRequest = response.config as CustomAxiosRequestConfig;

  if (originalRequest._retry) {
    clearAuthStorage();
    throw new Error("Không thể làm mới token");
  }

  originalRequest._retry = true;

  const refreshToken = getStorage(STORAGE.REFRESH_TOKEN);
  if (!refreshToken) {
    clearAuthStorage();
    throw new Error("Không có refresh token");
  }

  if (isRefreshing) {
    return enqueueRequestWhileRefreshing(originalRequest) as Promise<AxiosResponse<ApiResponse<unknown>>>;
  }

  isRefreshing = true;

  try {
    const newAccessToken = await requestNewAccessToken(refreshToken);
    attachAuthorizationHeader(originalRequest, newAccessToken);
    return instance(originalRequest);
  } catch (refreshError) {
    processQueue(refreshError, null);
    clearAuthStorage();
    throw refreshError;
  } finally {
    isRefreshing = false;
  }
};

const isBlobResponse = (response: AxiosResponse): response is AxiosResponse<Blob> =>
  response.config?.responseType === "blob" && response.data instanceof Blob;

const shouldHandleUnauthorized = (payload: ApiResponse<unknown>): boolean =>
  payload.statusCode === 401 && payload.success === false;

// ================== Request Interceptor ==================
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (config.method?.toLowerCase() === "get") {
      config.params = {
        ...config.params,
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
  (error) => Promise.reject(normalizeError(error))
);

// ================== Response Interceptor ==================
instance.interceptors.response.use(
  async (response: AxiosResponse) => {
    if (isBlobResponse(response)) {
      return response;
    }

    const apiResponse = response as AxiosResponse<ApiResponse<unknown>>;

    if (shouldHandleUnauthorized(apiResponse.data)) {
      return handleUnauthorizedResponse(apiResponse);
    }

    const parsed = parseBody(apiResponse);
    return {
      ...apiResponse,
      data: parsed.data,
    };
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    const errorMsg =
      error.response?.data?.message || error.message || "Lỗi không xác định hoặc mất kết nối";
    toast.error(errorMsg);
    return Promise.reject(normalizeError(error));
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