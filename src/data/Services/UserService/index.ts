export interface User {
    id: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    address: string;
    role: string; // "admin" | "user"
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null; // Nullable for soft delete
}