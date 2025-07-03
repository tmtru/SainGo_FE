import http from "../axios/index";

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn?: number;
}

export interface LoginPayload {
    email: string;
    password: string;
}

const login = (payload: LoginPayload) =>
    http.post<AuthResponse>("/api/Login", payload);

const refreshToken = (token: string) =>
    http.post<AuthResponse>("/api/Login/refresh-token", { refreshToken: token });


const AuthService = {
    login,
    refreshToken,
};

export default AuthService;
