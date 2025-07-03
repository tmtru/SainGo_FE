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

  return (
    <div className="btn-border-only cart category-hover-header">
      <i className="fa-sharp fa-regular fa-cart-shopping" />
      <span className="text">Giỏ hàng</span>
      <span className="number">{cartItems.length}</span>
      <div className="category-sub-menu card-number-show">
        <h5 className="shopping-cart-number">
          Shopping Cart ({cartItems.length.toString().padStart(2, '0')})
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
                  <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="sub-total-cart-balance">
          <div className="bottom-content-deals mt--10">
            <div className="top">
              <span>Sub Total:</span>
              <span className="number-c">${total.toFixed(2)}</span>
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

            {total < freeShippingThreshold && (
              <p>
                Spend ore <span>${remaining.toFixed(2)}</span> to reach{' '}
                <span>Free Shipping</span>
              </p>
            )}
          </div>

          <div className="button-wrapper d-flex align-items-center justify-content-between">
            <Link href="/cart" className="rts-btn btn-primary">
              View Cart
            </Link>
            <Link href="/checkout" className="rts-btn btn-primary border-only">
              Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartDropdown;
