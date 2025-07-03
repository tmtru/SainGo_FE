'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/components/header/CartContext';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import 'react-toastify/dist/ReactToastify.css';

const CartMain = () => {
  const { cartItems, removeFromCart, updateItemQuantity } = useCart();
  const router = useRouter();

  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [subtotal, setSubtotal] = useState(0);

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      setSubtotal(0);
      return;
    }
    const total = cartItems.reduce((acc, item) => {
      const price = isNaN(item.unitPrice) ? 0 : item.unitPrice;
      const quantity = item.quantity ?? 1;
      return acc + price * quantity;
    }, 0);
    setSubtotal(total);
  }, [cartItems]);

  const applyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (coupon === '12345') {
      setDiscount(0.25);
      setCouponMessage('✅ Mã giảm giá đã được áp dụng (-25%)');
      localStorage.setItem('coupon', coupon);
      localStorage.setItem('discount', '0.25');
    } else {
      setDiscount(0);
      setCouponMessage('❌ Mã giảm giá không hợp lệ');
      localStorage.removeItem('coupon');
      localStorage.removeItem('discount');
    }
  };

  const finalTotal = subtotal - subtotal * discount;

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('🛒 Giỏ hàng của bạn đang trống!');
      return;
    }

    // ✅ Lưu dữ liệu để chuyển sang trang checkout
    localStorage.setItem('coupon', coupon);
    localStorage.setItem('discount', discount.toString());
    localStorage.setItem('subtotal', subtotal.toString());
    localStorage.setItem('finalTotal', finalTotal.toString());

    router.push('/checkout');
  };

  return (
    <div className="rts-cart-area rts-section-gap bg_light-1">
      <div className="container">
        <div className="row g-5">
          <div className="col-xl-9 col-12 order-2 order-xl-1">
            <div className="cart-area-main-wrapper">
              <div className="cart-top-area-note">
                <p>
                  Thêm <span>$59.69</span> vào giỏ để được miễn phí giao hàng
                </p>
                <div className="bottom-content-deals mt--10">
                  <div className="single-progress-area-incard">
                    <div className="progress">
                      <div className="progress-bar wow fadeInLeft" role="progressbar" style={{ width: '80%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rts-cart-list-area">
              <div className="single-cart-area-list head">
                <div className="product-main"><p>Sản phẩm</p></div>
                <div className="price"><p>Đơn giá</p></div>
                <div className="quantity"><p>Số lượng</p></div>
                <div className="subtotal"><p>Tạm tính</p></div>
              </div>

              {cartItems.map(item => (
                <div className="single-cart-area-list main item-parent" key={item.id}>
                  <div className="product-main-cart">
                    <div className="close section-activation" onClick={() => removeFromCart(item.id)}>
                      <i className="fa-regular fa-x" />
                    </div>
                    <div className="thumbnail">
                      <img src={item.productImage} alt={item.productName} />
                    </div>
                    <div className="information">
                      <h6 className="title">{item.productName}</h6>
                      <span>SKU: SKUZNFER</span>
                    </div>
                  </div>

                  <div className="price">
                    <p>${item.unitPrice.toFixed(2)}</p>
                  </div>

                  <div className="quantity">
                    <div className="quantity-edit">
                      <input type="text" className="input" value={item.quantity} readOnly />
                      <div className="button-wrapper-action">
                        <button
                          className="button minus"
                          onClick={() => item.quantity > 1 && updateItemQuantity(item.id, item.quantity - 1)}
                        >
                          <i className="fa-regular fa-chevron-down" />
                        </button>
                        <button
                          className="button plus"
                          onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                        >
                          <i className="fa-regular fa-chevron-up" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="subtotal">
                    <p>${(item.unitPrice * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}

              {/* Coupon Area */}
              <div className="bottom-cupon-code-cart-area mt-4">
                <form onSubmit={applyCoupon} className="d-flex gap-3 flex-wrap">
                  <input
                    type="text"
                    placeholder="Nhập mã giảm giá"
                    className="form-control"
                    value={coupon}
                    onChange={e => {
                      setCoupon(e.target.value);
                      setCouponMessage('');
                    }}
                  />
                  <button type="submit" className="rts-btn btn-primary">Áp dụng</button>
                </form>
                {couponMessage && (
                  <p style={{ color: coupon === '12345' ? 'green' : 'red', marginTop: '8px' }}>
                    {couponMessage}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Tổng thanh toán */}
          <div className="col-xl-3 col-12 order-1 order-xl-2">
            <div className="cart-total-area-start-right">
              <h5 className="title">Tổng cộng</h5>



              <div className="shipping">
                <span>Giao hàng</span>
                <ul>
                  <li><input type="radio" id="f-option" name="selector" /><label htmlFor="f-option">Miễn phí</label></li>
                  <li><input type="radio" id="s-option" name="selector" /><label htmlFor="s-option">Phí cố định</label></li>
                  <li><input type="radio" id="t-option" name="selector" /><label htmlFor="t-option">Nhận tại cửa hàng</label></li>
                  <li>
                    <p>Phí giao hàng sẽ được tính ở bước tiếp theo</p>
                  </li>
                </ul>
              </div>

              <div className="bottom">
                <div className="subtotal">
                  <span>Tạm tính</span>
                  <h3 className="price">${subtotal.toFixed(2)}</h3>
                </div>
                {/* <div className="wrapper">
                  <span>Thành tiền</span>
                  <h6 className="price">${finalTotal.toFixed(2)}</h6>
                </div> */}
                <div className="button-area">
                  <button className="rts-btn btn-primary" onClick={handleCheckout}>
                    Tiến hành thanh toán
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CartMain;
