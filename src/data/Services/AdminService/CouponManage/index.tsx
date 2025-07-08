import http from "../../axios/index";

export interface AdminCouponPayload {
    id?: string;
    code: string;
    name: string;
    description: string;
    type: number; // enum dạng số: 0 = %, 1 = fixed
    value: number;
    minOrderAmount: number;
    maxDiscountAmount: number;
    usageLimit: number;
    perUserLimit: number;
    applicableTo: number; // enum dạng số
    startDate: string; 
    endDate: string;
    isActive: boolean;
}

const getAllAdminCoupons = () =>
    http.get<AdminCouponPayload[]>("/api/admin/AdminCoupon");

const getAdminCouponById = (id: string) =>
    http.get<AdminCouponPayload>(`/api/admin/AdminCoupon/${id}`);

const createAdminCoupon = (payload: AdminCouponPayload) =>
    http.post("/api/admin/AdminCoupon", payload);

const updateAdminCoupon = (id: string, payload: AdminCouponPayload) =>
    http.put(`/api/admin/AdminCoupon/${id}`, payload);

const deleteAdminCoupon = (id: string) =>
    http.delete(`/api/admin/AdminCoupon/${id}`);

const AdminCouponService = {
    getAllAdminCoupons,
    getAdminCouponById,
    createAdminCoupon,
    updateAdminCoupon,
    deleteAdminCoupon,
};

export default AdminCouponService;
