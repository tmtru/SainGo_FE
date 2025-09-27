"use client";

import {
    useContext,
    useEffect,
    useState,
    ReactNode,
    createContext,
    useMemo,
} from "react";
import { toast } from "react-toastify";
import { decode_data } from "@/lib/encoder";
import STORAGE, { getStorage, setStorage, deleteStorage } from "@/lib/storage";
import UserService, { User, UserProfile } from "@/data/Services/UserService";
import AuthService from "@/data/Services/AuthSerivce";
import { useRouter } from "next/navigation";

// ================== Context Type ==================
type AuthContextType = {
    isAuthenticated: boolean;
    user: UserProfile | null;
    token: string | null;
    loading: boolean;
    loginWithEmail: (email: string, password: string) => Promise<void>;
    logout: () => void;
    loginWithToken: (accessToken: string, refreshToken: string) => Promise<void>;
    loginWithGoogle: (idToken: any) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ================== Auth Provider ==================
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                const storedToken = getStorage(STORAGE.TOKEN);
                if (storedToken) setToken(storedToken);
                const userRes = await UserService.getProfile();
                setUser(userRes.data);
            } catch (e) {
                console.error("Init Auth failed:", e);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    const loginWithEmail = async (email: string, password: string) => {
        try {
            const payload = { email, password };
            const res = await AuthService.login(payload);
            const { accessToken, refreshToken } = res.data;
            if (res.data == null) {
                throw new Error("Đăng nhập thất bại");
            }

            setToken(accessToken);
            setStorage(STORAGE.TOKEN, accessToken);
            if (refreshToken) setStorage(STORAGE.REFRESH_TOKEN, refreshToken);

            // ⬇ Sau khi có token → gọi getProfile để lấy thông tin người dùng (bao gồm role)
            const userRes = await UserService.getProfile();
            setUser(userRes.data);
            console.log(userRes.data)
        } catch (error: any) {
            toast.error("Đăng nhập thất bại. Email hoặc mật khẩu không đúng!");
            logout();
            throw error;
        }
    };
    const loginWithToken = async (accessToken: string, refreshToken: string) => {
        try {
            setToken(accessToken);
            setStorage(STORAGE.TOKEN, accessToken);
            if (refreshToken) setStorage(STORAGE.REFRESH_TOKEN, refreshToken);

            // ⬇ Sau khi có token → gọi getProfile để lấy thông tin người dùng (bao gồm role)
            const userRes = await UserService.getProfile();
            setUser(userRes.data);
            console.log(userRes.data)
        } catch (error: any) {
            toast.error(error?.message || "Đăng nhập thất bại");
            logout();
            throw error;
        }
    };
    const loginWithGoogle = async (idToken: string) => {
        try {
            // Gọi API BE để verify Google token
            const res = await AuthService.googleLogin(idToken);
            const { accessToken, refreshToken } = res.data;

            if (!accessToken) throw new Error("Google login failed");

            setToken(accessToken);
            setStorage(STORAGE.TOKEN, accessToken);
            if (refreshToken) setStorage(STORAGE.REFRESH_TOKEN, refreshToken);

            // Lấy profile user sau khi login thành công
            const userRes = await UserService.getProfile();
            setUser(userRes.data);
            toast.success("Đăng nhập Google thành công!");
        } catch (error: any) {
            toast.error(error?.message || "Đăng nhập Google thất bại");
            logout();
            throw error;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        deleteStorage(STORAGE.TOKEN);
        deleteStorage(STORAGE.REFRESH_TOKEN);
        deleteStorage(STORAGE.USER_INFO);
        toast.info("Đã đăng xuất");
        router.push("/login");
    };

    const contextValue = useMemo(
        () => ({
            isAuthenticated: !!token,
            user,
            token,
            loading,
            loginWithEmail,
            logout,
            loginWithToken,
            loginWithGoogle,
        }),
        [token, user, loading]
    );

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// ================== Hook ==================
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
