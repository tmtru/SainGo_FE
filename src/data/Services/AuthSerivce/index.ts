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

export interface RegisterPayload {
    userName: string;
    email: string;
    password: string;
    dob: string;
    fullName: string;
    phone: string;
}

export interface ResendEmailPayload {
    email: string;
}

const login = (payload: LoginPayload) =>
    http.post<AuthResponse>("/api/Login", payload);

const refreshToken = (token: string) =>
    http.post<AuthResponse>("/api/Login/refresh-token", { refreshToken: token });

const register = (payload: RegisterPayload) =>
    http.post("/api/Login/register", payload);

const verifyEmail = (token: string) =>
    http.get<AuthResponse>("/api/Login/verify-email", {
        params: { token }
    });

const resendVerificationEmail = (payload: ResendEmailPayload) =>
    http.post("/api/Login/resend-verification", payload);

const googleLogin = (idToken: any) =>
    http.post<AuthResponse>("/api/Login/google-logi", { idToken });


const AuthService = {
    login,
    refreshToken,
    register,
    verifyEmail,
    resendVerificationEmail,
    googleLogin
};

export default AuthService;
