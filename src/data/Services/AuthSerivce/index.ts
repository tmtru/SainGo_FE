import http from "../axios/index";

// Interface phản hồi sau khi đăng nhập
export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn?: number;
}

// Payload khi đăng nhập
export interface LoginPayload {
    email: string;
    password: string;
}

// Gửi refreshToken dạng chuỗi
type RefreshTokenPayload = string;


const login = (payload: LoginPayload) =>
    http.post<AuthResponse>("/api/Login", payload);

const refreshToken = (refreshToken: RefreshTokenPayload) =>
    http.post<AuthResponse>("/api/Login/refresh-token", refreshToken, {
        headers: { "Content-Type": "application/json" },
    });

const AuthService = {
    login,
    refreshToken,
};

export default AuthService;
