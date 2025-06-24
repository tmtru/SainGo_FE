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
import { User } from "@/data/Services/UserService";
import AuthService from "@/data/Services/AuthSerivce";

// ================== Context Type ==================
type AuthContextType = {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    loading: boolean;
    loginWithEmail: (email: string, password: string) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ================== Auth Provider ==================
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                const storedToken = getStorage(STORAGE.TOKEN);
                const storedUser = getStorage(STORAGE.USER_INFO);

                if (storedToken) setToken(storedToken);

                if (storedUser) {
                    try {
                        // setUser(decode_data<User>(storedUser));
                    } catch {
                        deleteStorage(STORAGE.USER_INFO);
                    }
                }
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

            setToken(accessToken);
            // setUser(user);

            setStorage(STORAGE.TOKEN, accessToken);
            if (refreshToken) setStorage(STORAGE.REFRESH_TOKEN, refreshToken);
            // if (user) setStorage(STORAGE.USER_INFO, user); 
        } catch (error: any) {
            toast.error(error?.message || "Đăng nhập thất bại");
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
        if (typeof window !== "undefined") window.location.replace("/login");
    };

    const contextValue = useMemo(
        () => ({
            isAuthenticated: !!token,
            user,
            token,
            loading,
            loginWithEmail,
            logout,
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
