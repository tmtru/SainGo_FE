'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from './CartContext';

const CartDropdown: React.FC = () => {
  const { cartItems, removeFromCart } = useCart();

  const total = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const freeShippingThreshold = 125;
  const remaining = freeShippingThreshold - total;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="btn-border-only cart category-hover-header">
      <i className="fa-sharp fa-regular fa-cart-shopping" />
      <span className="text">Giỏ hàng</span>
      <span className="number">{cartItems.length}</span>
      <div className="category-sub-menu card-number-show">
        <h5 className="shopping-cart-number">
          Giỏ hàng của bạn ({cartItems.length.toString().padStart(2, '0')})
        </h5>

        {cartItems.map(item => (
          <div key={item.id} className="cart-item-1 border-top">
            <div className="img-name">
              <div
                className="close section-activation"
                onClick={() => removeFromCart(item.id)}
                role="button"
                tabIndex={0}
              >
                <i className="fa-regular fa-x" />
              </div>

              <div className="thumbanil">
                {item.productImage && (
                  <Image
                    src={item.productImage}
                    alt={item.productName ?? 'Product Image'}
                    width={60}
                    height={60}
                    unoptimized
                  />
                )}
              </div>

              <div className="details">
                <Link href="/shop/details-profitable-business-makes-your-profit">
                  <h5 className="title line-clamp-1">{item.productName}</h5>
                </Link>
                <div className="number">
                  {item.quantity} <i className="fa-regular fa-x" />{" "}
                  <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="sub-total-cart-balance">
          <div className="bottom-content-deals mt--10">
            <div className="top">
              <span>Tổng tiền:</span>
              <span className="number-c">{formatCurrency(total)}</span>
            </div>

            <div className="single-progress-area-incard">
              <div className="progress">
                <div
                  className="progress-bar wow fadeInLeft"
                  role="progressbar"
                  style={{
                    width: `${Math.min((total / freeShippingThreshold) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="button-wrapper d-flex align-items-center justify-content-between">
            <Link href="/cart" className="rts-btn btn-primary">
              Xem chi tiết
            </Link>
            <Link href="/checkout" className="rts-btn btn-primary border-only">
              Thanh toán
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartDropdown;
