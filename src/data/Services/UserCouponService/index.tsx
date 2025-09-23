import http from "../axios/index";

export interface ApplyCouponRequest {
    code: string;
    orderAmount: number;
}



const applyCoupon = (data: ApplyCouponRequest) =>
    http.post<any>("/api/UserCoupon/apply", data);

const checkCoupon = (code: string) =>
    http.get<any>(`/api/UserCoupon/check?code=${encodeURIComponent(code)}`);

const UserCouponService = {
    applyCoupon,
    checkCoupon,
};

export default UserCouponService;
