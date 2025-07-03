import http from "../axios/index";

export interface User {
    id: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    address: string;
    role: string; // "admin" | "customer"
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null; // Nullable for soft delete
}

export interface UserProfile {
    fullName?: string;
    phone?: string;
    email?: string;
    avatarUrl?: string;
    gender?: string;
    dob?: string;
    roleName?: string;
}

const getProfile = () =>
    http.get<UserProfile>("/api/User/me");

const updateProfile = (payload: UserProfile) =>
    http.put<void>("/api/User/me", payload);

const getUserById = (userId: string) =>
    http.get<UserProfile>(`/api/User/${userId}`);

const UserService = {
    getProfile,
    updateProfile,
    getUserById, // <- thêm vào export
};


export default UserService;
