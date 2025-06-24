import http from "../axios/index";

// Interface định nghĩa CartItem từ backend
export interface CartItem {
    id: string;
    cartId: string;
    productId: string;
    productVariantId: string | null;
    quantity: number;
    unitPrice: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    productName?: string;     
    productImage?: string;    
}

export interface Cart {
    id: string;
    userId: string;
    items: CartItem[];
}

// Payload gửi lên khi thêm item
export type AddCartItemPayload = Omit<
    CartItem,
    "id" | "createdAt" | "updatedAt" | "deletedAt" | "productName" | "productImage"
>;

const getCart = () => http.get<Cart>("/api/Cart/me");

const clearCart = () => http.delete("/api/Cart/me");

const addItem = (item: AddCartItemPayload) =>
    http.post<CartItem>("/api/Cart/items", item);


const removeItem = (itemId: string) =>
    http.delete(`/api/Cart/items/${itemId}`);

const getAllAdmin = () => http.get<CartItem[]>("/api/Cart/admin/all");


const CartService = {
    getCart,
    clearCart,
    addItem,
    removeItem,
    getAllAdmin,
};

export default CartService;
