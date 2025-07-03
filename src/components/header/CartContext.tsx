'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { toast } from 'react-toastify';
import CartService, { CartItem } from '@/data/Services/CartService';
import STORAGE, { getStorage } from '@/lib/storage';

type CartInput = Omit<CartItem, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'productName' | 'productImage'>;

interface CartContextProps {
  cartItems: CartItem[];
  addToCart: (item: CartInput) => Promise<void>;
  addToWishlist: (item: CartInput) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateItemQuantity: (productId: string, quantity: number) => Promise<void>;
  isCartLoaded: boolean;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartLoaded, setIsCartLoaded] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      const token = getStorage(STORAGE.REFRESH_TOKEN);
      if (!token) {
        setIsCartLoaded(true);
        return;
      }

      try {
        const res = await CartService.getCart();
        if (!res.data || !Array.isArray(res.data.items)) {
          setCartItems([]);
          return;
        }

        setCartItems(res.data.items);
      } catch (err: any) {
        if (err.response?.status !== 401) {
          console.error(err);
        }
      } finally {
        setIsCartLoaded(true);
      }
    };

    fetchCart();
  }, []);

  const isEqual = (a: string | null, b: string | null) => {
    return a === b || (a === null && b === '') || (a === '' && b === null);
  };
  const addToCart = async (item: CartInput) => {

    try {
      const existingItem = cartItems.find(
        (i) =>
          i.productId === item.productId &&
          isEqual(i.productVariantId, item.productVariantId)
      );

      let payload = { ...item };

      // Nếu sản phẩm đã có trong giỏ, cộng dồn số lượng
      if (existingItem) {
        payload.quantity += existingItem.quantity;
      }

      const res = await CartService.addItem(payload);

      if (!res.data) {
        toast.error('Không thể thêm sản phẩm vào giỏ hàng.');
        throw new Error('Không thể thêm sản phẩm vào giỏ hàng.');
      }

      // Cập nhật lại danh sách cartItems sau khi thêm hoặc cập nhật
      setCartItems((prev) => {
        const updated = prev.map((i) =>
          i.productId === payload.productId &&
            isEqual(i.productVariantId, payload.productVariantId)
            ? { ...i, quantity: payload.quantity }
            : i
        );

        // Nếu sản phẩm chưa tồn tại trong giỏ
        const isNew = !prev.some(
          (i) =>
            i.productId === payload.productId &&
            isEqual(i.productVariantId, payload.productVariantId)
        );

        console.log('isNew', isNew);

        return isNew ? [...updated, res.data] : updated;
      });

      toast.success('Đã thêm vào giỏ hàng.');
    } catch (error) {
      toast.error('Lỗi khi thêm sản phẩm vào giỏ hàng.');
      console.error(error);
    }
  };



  const addToWishlist = async (item: CartInput) => {
    try {
      const res = await CartService.addItem(item);
      setCartItems((prev) => [...prev, res.data]);
      toast.success('Đã thêm vào wishlist.');
    } catch (err) {
      toast.error('Không thể thêm vào wishlist.');
      console.error(err);
    }
  };

  const removeFromCart = async (id: string) => {
    try {
      await CartService.removeItem(id);
      setCartItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      toast.error('Không thể xoá sản phẩm.');
      console.error(err);
    }
  };

  const updateItemQuantity = async (productId: string, quantity: number) => {
    try {
      const existingItem = cartItems.find((i) => i.productId === productId);
      if (!existingItem) {
        toast.error('Không tìm thấy sản phẩm trong giỏ.');
        return;
      }

      const updatedItem: CartInput = {
        cartId: existingItem.cartId,
        productId: existingItem.productId,
        productVariantId: existingItem.productVariantId,
        unitPrice: existingItem.unitPrice,
        quantity,
      };

      const res = await CartService.addItem(updatedItem); // dùng lại addItem để update
      setCartItems((prev) =>
        prev.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );

      toast.success('Đã cập nhật số lượng.');
    } catch (err) {
      toast.error('Không thể cập nhật số lượng.');
      console.error(err);
    }
  };

  const clearCart = async () => {
    try {
      setCartItems([]);
    } catch (err) {
      console.error(err);
    }
  };

  const value = useMemo(
    () => ({
      cartItems,
      addToCart,
      addToWishlist,
      removeFromCart,
      updateItemQuantity,
      isCartLoaded,
      clearCart,
    }),
    [cartItems, isCartLoaded]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
