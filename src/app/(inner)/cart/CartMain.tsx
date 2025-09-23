'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/components/header/CartContext';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import 'react-toastify/dist/ReactToastify.css';
import UserCouponService from '@/data/Services/UserCouponService';

const CartMain = () => {
  const { cartItems, removeFromCart, updateItemQuantity } = useCart();
  const router = useRouter();

  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [subtotal, setSubtotal] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);

  const formatVND = (amount: any) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const applyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!coupon || !subtotal) {
      setCouponMessage('Vui lòng nhập mã giảm giá hợp lệ');
      setDiscount(0);
      setCouponApplied(false);
      return;
    }

    setIsApplyingCoupon(true);

    try {
      const res = await UserCouponService.applyCoupon({
        code: coupon,
        orderAmount: subtotal
      });
      console.log('Coupon response:', res);

      if (res?.data) {
        const discountAmount = res.data;
        setDiscount(discountAmount);
        const discountPercentage = ((discountAmount / subtotal) * 100).toFixed(0);
        setCouponMessage(`Tuyệt vời! Bạn đã tiết kiệm được ${formatVND(discountAmount)} (${discountPercentage}%)`);
        setCouponApplied(true);
        localStorage.setItem('coupon', coupon);
        localStorage.setItem('discount', discountAmount.toString());
        toast.success(`🎉 Áp dụng mã giảm giá thành công! Tiết kiệm ${formatVND(discountAmount)}`);
      } else {
        setDiscount(0);
        setCouponMessage('Mã giảm giá không hợp lệ hoặc đã hết hạn sử dụng');
        setCouponApplied(false);
        localStorage.removeItem('coupon');
        localStorage.removeItem('discount');
      }
    } catch (err) {
      console.error(err);
      setDiscount(0);
      setCouponMessage('Mã giảm giá không hợp lệ hoặc bạn đã hết số lần sử dụng');
      setCouponApplied(false);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCoupon('');
    setDiscount(0);
    setCouponMessage('');
    setCouponApplied(false);
    localStorage.removeItem('coupon');
    localStorage.removeItem('discount');
    toast.info('🗑️ Đã xóa mã giảm giá');
  };

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

  // Load saved coupon on component mount
  useEffect(() => {
    const savedCoupon = localStorage.getItem('coupon');
    const savedDiscount = localStorage.getItem('discount');

    if (savedCoupon && savedDiscount) {
      setCoupon(savedCoupon);
      setDiscount(parseFloat(savedDiscount));
      setCouponApplied(true);
      setCouponMessage(`Mã giảm giá "${savedCoupon}" đã được áp dụng`);
    }
  }, []);

  const finalTotal = subtotal - discount;

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('🛒 Giỏ hàng của bạn đang trống!');
      return;
    }


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
                    <p>{formatVND(item.unitPrice)}</p>
                  </div>

                  <div className="quantity">
                    <div className="quantity-edit">
                      <input type="text" className="input" value={item.quantity} readOnly />
                      <div className="button-wrapper-action">
                        {/* <button
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
                        </button> */}
                      </div>
                    </div>
                  </div>

                  <div className="subtotal">
                    <p>{formatVND(item.unitPrice * item.quantity)}</p>
                  </div>
                </div>
              ))}

              {/* Improved Coupon Area */}
              <div className="coupon-section mt-4 p-4 border rounded-3 bg-light">
                <div className="d-flex align-items-center mb-3">
                  <i className="fa-solid fa-ticket text-primary me-2" style={{ fontSize: '1.2rem' }}></i>
                  <h6 className="mb-0 fw-bold">Mã giảm giá</h6>
                </div>

                {!couponApplied ? (
                  <form onSubmit={applyCoupon}>
                    <div className="d-flex gap-3 flex-wrap">
                      <div className="flex-grow-1">
                        <input
                          type="text"
                          placeholder="Nhập mã giảm giá của bạn"
                          className="form-control form-control-lg"
                          value={coupon}
                          onChange={e => {
                            setCoupon(e.target.value.toUpperCase());
                            setCouponMessage('');
                          }}
                          disabled={isApplyingCoupon}
                        />
                      </div>
                      <button
                        type="submit"
                        className="rts-btn btn-primary px-4"
                        disabled={isApplyingCoupon || !coupon.trim()}
                      >
                        {isApplyingCoupon ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Đang xử lý...
                          </>
                        ) : (
                          'Áp dụng'
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="coupon-applied-state">
                    <div className="d-flex align-items-center justify-content-between p-3  bg-opacity-10 border border-success border-opacity-25 rounded-3">
                      <div className="d-flex align-items-center col-6">
                        <i className="fa-solid fa-check-circle text-success me-2"></i>
                        <div>
                          <strong className="text-success">Mã "{coupon}" đã được áp dụng</strong>
                          <div className="small text-muted">
                            Tiết kiệm {formatVND(discount)} ({((discount / subtotal) * 100).toFixed(0)}%)
                          </div>
                        </div>
                      </div>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={removeCoupon}
                        title="Xóa mã giảm giá"
                        style={{ width: '40px', height: '40px' }}
                      >
                        <i className="fa-solid fa-times"></i>
                      </button>
                    </div>
                  </div>
                )}

                {couponMessage && !couponApplied && (
                  <div className="mt-3">
                    <div className="alert alert-danger alert-dismissible fade show mb-0" role="alert">
                      <i className="fa-solid fa-exclamation-triangle me-2"></i>
                      {couponMessage}
                    </div>
                  </div>
                )}

                {/* Coupon suggestions */}
                <div className="coupon-suggestions mt-3">
                  <small className="text-muted">
                    <i className="fa-solid fa-lightbulb me-1"></i>
                    Mẹo: Kiểm tra email hoặc tin nhắn để tìm mã giảm giá mới nhất
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Tổng thanh toán */}
          <div className="col-xl-3 col-12 order-1 order-xl-2">
            <div className="cart-total-area-start-right">
              <h5 className="title">Tổng cộng</h5>

              <div className="shipping">
                <span>Giao hàng</span>
                <p>Phí giao hàng sẽ được tính ở bước tiếp theo</p>
              </div>

              <div className="bottom">
                <div className="subtotal">
                  <span>Tạm tính</span>
                  <h3 className="price">{formatVND(subtotal)}</h3>
                </div>

                {discount > 0 && (
                  <div className="wrapper discount-row">
                    <span className="text-success">
                      <i className="fa-solid fa-tag me-1"></i>
                      Giảm giá ({((discount / subtotal) * 100).toFixed(0)}%)
                    </span>
                    <h6 className="price text-success fw-bold">-{formatVND(discount)}</h6>
                  </div>
                )}

                <hr className="my-3" />

                <div className="wrapper final-total">
                  <span className="fw-bold">Thành tiền</span>
                  <h5 className="price fw-bold text-primary">{formatVND(finalTotal)}</h5>
                </div>

                {discount > 0 && (
                  <div className="savings-highlight text-center mt-2">
                    <small className="text-success fw-bold">
                      🎉 Bạn đã tiết kiệm được {formatVND(discount)}!
                    </small>
                  </div>
                )}

                <div className="button-area mt-4">
                  <button className="rts-btn btn-primary w-100" onClick={handleCheckout}>
                    <i className="fa-solid fa-credit-card me-2"></i>
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