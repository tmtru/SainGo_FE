import http from "../../axios/index";
export interface CategoryAdmin {
    id: string;
    name: string;
    slug: string;
    description: string;
    imageUrl: string;
    iconUrl: string;
    displayOrder: number;
    isActive: boolean;
    createdAt: string;
    deletedAt: string | null;
}
// Lấy danh sách tất cả category admin
const getAllAdminCategories = () =>
    http.get<CategoryAdmin[]>("/api/admin/AdminProductCategory/main");

// Lấy chi tiết category theo id
const getAdminCategoryById = (id: string) =>
    http.get<CategoryAdmin>(`/api/admin/AdminProductCategory/main/${id}`);

// Tạo category mới
const createAdminCategory = (payload: AdminCategoryPayload) =>
    http.post("/api/admin/AdminProductCategory/main", payload);

// Cập nhật category
const updateAdminCategory = (id: string, payload: AdminCategoryPayload) =>
    http.put(`/api/admin/AdminProductCategory/main/${id}`, payload);

// Xoá category
const deleteAdminCategory = (id: string) =>
    http.delete(`/api/admin/AdminProductCategory/main/${id}`);

// Export service
const AdminCategoryService = {
    getAllAdminCategories,
    getAdminCategoryById,
    createAdminCategory,
    updateAdminCategory,
    deleteAdminCategory,
};

export default AdminCategoryService;

export interface AdminCategoryPayload {
    id?: string;
    name: string;
    slug: string;
    description: string;
    imageUrl: string;
    iconUrl: string;
    displayOrder: number;
    isActive: boolean;
    productSubCategoryIds: string[];
}
