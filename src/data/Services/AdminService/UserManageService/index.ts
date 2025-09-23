import http from "../../axios/index"

export interface UserProfileDto {
    userId: string
    fullName?: string
    email?: string
    phone?: string
    gender?: string
    dob?: string
    isVerified?: boolean
    avatarUrl?: string
    roleName?: string
    isActive?: boolean
}

export interface AdminUserFilterDto {
    keyword?: string
    roleId?: string
    isActive?: boolean
    sortBy?: string
    sortDesc?: boolean
    pageNumber?: number
    pageSize?: number
}

export interface SetUserRoleDto {
    roleId: string
}

export interface SetUserStatusDto {
    isActive: boolean
}

export interface PaginatedResponse<T> {
    currentPage: number
    items: T[]
    pageSize: number
    totalItems: number
    totalPages: number
}


const getFilteredUsers = (filter: AdminUserFilterDto) =>
    http.get<PaginatedResponse<UserProfileDto>>("/api/admin/AdminUser", {
        params: filter,
    })

const getUserById = (id: string) =>
    http.get<UserProfileDto>(`/api/admin/AdminUser/${id}`)

const updateUserRole = (id: string, dto: SetUserRoleDto) =>
    http.put(`/api/admin/AdminUser/${id}/role`, dto)

const updateUserStatus = (id: string, dto: SetUserStatusDto) =>
    http.put(`/api/admin/AdminUser/${id}/status`, dto)
const AdminUserService = {
    getFilteredUsers,
    getUserById,
    updateUserRole,
    updateUserStatus,
}

export default AdminUserService
