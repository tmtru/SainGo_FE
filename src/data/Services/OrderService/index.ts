import http from "../axios/index"
import { UserAddress } from "../UserAddress";

export interface OrderItem {
    productId: string;
    productVariantId?: string;
    quantity: number;
    unitPrice: number;
    productName: string;
}

export interface Order {
    id?: string;
    customerId?: string;
    deliveryAddressId?: string;
    paymentMethod: string;
    deliveryNote?: string;
    subtotal: number;
    discountAmount?: number;
    totalAmount: number;
    orderItems: OrderItem[];
    statusId?: string;
    createdAt?: string;
    deliveryAddress?: UserAddress;
}

// Gửi order (chỉ tạo)
const createOrder = (order: Order) =>
    http.post<Order>("/api/Order", order);

// Lấy thông tin đơn hàng theo ID
const getOrderById = (id: string) =>
    http.get<Order>(`/api/Order/${id}`);

// Lấy tất cả đơn hàng của user hiện tại
const getMyOrders = () =>
    http.get<Order[]>("/api/Order/me");

// ✅ Lấy tất cả đơn hàng (admin)
const getAllOrdersAdmin = () =>
    http.get<Order[]>("/api/Order/admin/all");

// ✅ Rollback đơn hàng hết hạn chưa thanh toán (admin)
const rollbackExpiredOrders = () =>
    http.post<boolean>("/api/Order/admin/rollback-expired");

const OrderService = {
    createOrder,
    getOrderById,
    getMyOrders,
    getAllOrdersAdmin,
    rollbackExpiredOrders,
};

export default OrderService;
