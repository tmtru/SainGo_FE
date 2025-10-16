import { AxiosResponse } from "axios";
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
    orderNumber?: string;
    customerId?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    deliveryPhone?: string;
    deliveryAddressId?: string;
    paymentMethod: string;
    deliveryNote?: string;
    subtotal: number;
    couponCode?: string;
    discountAmount?: number;
    totalAmount: number;
    orderItems: OrderItem[];
    statusId?: string;
    createdAt?: string;
    updatedAt?: string;
    deliveryAddress?: UserAddress;
    deliveryFee?: number;
    serviceFee?: number;
    taxAmount?: number;
    orderType?: string;
    requestedDeliveryTime?: string; // ISO format, e.g. "2025-07-27T11:34:55.126Z"
    preferredTimeSlot?: string; // e.g. "Morning", "Afternoon", "Evening"
    preferredDeliveryDate?: string;
    specialInstructions?: string;
    deliveryTime?: string; // e.g. "ASAP", "Scheduled"
    paymentStatus?: string;
    paidAt?: string;
    cancellationReason?: string;
    estimatedDeliveryTime?: string;
    actualDeliveryTime?: string;
    shipperId?: string;
    shipperName?: string;

}
export interface ChangeOrderStatus {
    statusId: string;
    orderId: string;
}
export interface AssignOrderPayload {
    orderId: string;
    shipperId: string;
}
export interface ShipperOption {
    userId: string;
    userName?: string;
    fullName?: string;
    phone?: string;
    email?: string;
    avatarUrl?: string;
}
export interface OrderFilterDto {
    pageNumber?: number
    pageSize?: number
    keyword?: string
    storeId?: string
    statusId?: string
    fromDate?: string // ISO format, e.g. "2025-07-27T11:34:55.126Z"
    toDate?: string
    minTotalAmount?: number
    maxTotalAmount?: number
    sortBy?: string
    sortDesc?: boolean
}
export interface PaginatedResponse<T> {
    currentPage: number
    items: T[]
    pageSize: number
    totalItems: number
    totalPages: number
}

const filterAdminOrders = (filter: OrderFilterDto) =>
    http.post<PaginatedResponse<Order>>("/api/Order/admin/filter", filter)

const createOrder = (order: Order) =>
    http.post<Order>("/api/Order", order);


const getOrderById = (id: string) =>
    http.get<Order>(`/api/Order/${id}`);


const getMyOrders = () =>
    http.get<Order[]>("/api/Order/me");


const getAllOrdersAdmin = () =>
    http.get<Order[]>("/api/Order/admin/all");


const rollbackExpiredOrders = () =>
    http.post<boolean>("/api/Order/admin/rollback-expired");

const createMomoPayment = (orderId: string) =>
    http.post<string>(`/api/Payment/momo/create?orderId=${orderId}`);

const getOrderStatuses = () =>
    http.get<{ id: string; name: string }[]>("/api/Order/admin/order_statuses");

const updateOrderStatus = (changeOrderStatus: ChangeOrderStatus) =>
    http.post(`/api/Order/admin/change_order_statuses`, changeOrderStatus);

const updateOrderStatusAsShipper = (payload: ChangeOrderStatus) =>
    http.post(`/api/Order/shipper/change_order_status`, payload);

const assignOrderToShipper = (payload: AssignOrderPayload) =>
    http.post(`/api/Order/admin/assign-shipper`, payload);

const getActiveShippers = () =>
    http.get<ShipperOption[]>("/api/Order/admin/shippers");

const filterShipperOrders = (filter: OrderFilterDto) =>
    http.post<PaginatedResponse<Order>>("/api/Order/shipper/filter", filter);

const exportOrders = (filter: OrderFilterDto): Promise<AxiosResponse<Blob>> =>
    http.post<Blob>("/api/Order/admin/export", filter, { responseType: "blob" });


const OrderService = {
    createOrder,
    getOrderById,
    getMyOrders,
    getAllOrdersAdmin,
    rollbackExpiredOrders,
    createMomoPayment,
    getOrderStatuses,
    updateOrderStatus,
    updateOrderStatusAsShipper,
    filterAdminOrders,
    filterShipperOrders,
    assignOrderToShipper,
    getActiveShippers,
    exportOrders
};

export default OrderService;
