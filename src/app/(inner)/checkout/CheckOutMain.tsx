"use client";

import React, { useEffect, useState } from 'react';
import { useCart } from '@/components/header/CartContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import UserAddressService from '@/data/Services/UserAddress';
import OrderService from '@/data/Services/OrderService';
import 'react-toastify/dist/ReactToastify.css';

function formatCurrency(value: number) {
    return value.toLocaleString('vi-VN', {
        style: 'currency',
        currency: 'VND',
    });
}

export default function CheckOutMain() {
    const { cartItems, clearCart } = useCart();
    const router = useRouter();

    const [useManualAddress, setUseManualAddress] = useState(false);
    const [defaultAddress, setDefaultAddress] = useState<any>(null);
    const [loadingAddress, setLoadingAddress] = useState(true);

    const [billingInfo, setBillingInfo] = useState({
        name: '',
        phone: '',
        fullAddress: '',
    });

    const [paymentMethod, setPaymentMethod] = useState('cash');

    useEffect(() => {
        const fetchDefaultAddress = async () => {
            try {
                const res = await UserAddressService.getMyDefaultAddress();
                setDefaultAddress(res.data);
            } catch (err) {
                console.warn('Không có địa chỉ mặc định');
            } finally {
                setLoadingAddress(false);
            }
        };
        fetchDefaultAddress();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setBillingInfo(prev => ({ ...prev, [id]: value }));
    };

    const subtotal = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const discount = parseFloat(localStorage.getItem('discount') || '0');
    const couponCode = localStorage.getItem('coupon') || '';
    const finalTotal = subtotal - subtotal * discount;

    const handlePlaceOrder = async () => {
        try {
            const orderItems = cartItems.map(item => ({
                productId: item.productId,
                productVariantId: item.productVariantId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                productName: item.productName,
            }));

            const order: any = {
                orderitems: orderItems,
                paymentMethod,
                subtotal,
                discountAmount: subtotal * discount,
                totalAmount: finalTotal,
            };

            if (!useManualAddress && defaultAddress) {
                order.deliveryAddressId = defaultAddress.id;
            } else {
                if (!billingInfo.fullAddress || !billingInfo.name || !billingInfo.phone) {
                    toast.error('Vui lòng điền đầy đủ thông tin địa chỉ mới.');
                    return;
                }
                order.deliveryAddressText = billingInfo.fullAddress;
                order.deliveryPhone = billingInfo.phone;
                order.specialInstructions = billingInfo.name;
            }

            const res = await OrderService.createOrder(order);
            clearCart();
            toast.success('🎉 Đặt hàng thành công!');
        } catch (err: any) {
            toast.error(`❌ Lỗi khi đặt hàng: ${err.message}`);
        }
    };

    return (
        <div className="checkout-area rts-section-gap">
            <div className="container">
                <div className="row">
                    <div className="col-lg-8 p--20 order-2 order-xl-1 cart-total-area-start-right" style={{ padding: '40px', border: "none" }}>
                        <h3 >Địa chỉ giao hàng</h3>

                        {loadingAddress ? (
                            <p>Đang tải địa chỉ mặc định...</p>
                        ) : !useManualAddress && defaultAddress ? (
                            <div className="border rounded bg-light mb-4" style={{ padding: '20px' }}>
                                <p><strong>{defaultAddress.name}</strong></p>
                                <p>{defaultAddress.fullAddress}</p>
                                <p>📞 {defaultAddress.phone}</p>
                            </div>
                        ) : (
                            <div className="rts-billing-details-area">
                                <div className="single-input">
                                    <label htmlFor="name">Tên người nhận *</label>
                                    <input id="name" value={billingInfo.name} onChange={handleInputChange} required />
                                </div>
                                <div className="single-input">
                                    <label htmlFor="phone">Số điện thoại *</label>
                                    <input id="phone" value={billingInfo.phone} onChange={handleInputChange} required />
                                </div>
                                <div className="single-input">
                                    <label htmlFor="fullAddress">Địa chỉ chi tiết *</label>
                                    <input id="fullAddress" value={billingInfo.fullAddress} onChange={handleInputChange} required />
                                </div>
                            </div>
                        )}

                        <div className="form-check mt-2 mb-4">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="manualAddressCheck"
                                checked={useManualAddress}
                                onChange={() => setUseManualAddress(prev => !prev)}
                            />
                            <label className="form-check-label" htmlFor="manualAddressCheck">
                                Nhập địa chỉ mới
                            </label>
                        </div>
                        
                        <div className="shipping">
                            <span>Phương thức thanh toán *</span>
                            <ul>
                                <li>
                                    <input type="radio" id="f-option" name="selector" value="cash" checked={paymentMethod === 'cash'} onChange={(e) => setPaymentMethod(e.target.value)} />
                                    <label htmlFor="f-option">Thanh toán khi nhận hàng (COD)</label>
                                </li>
                                <li>
                                    <input type="radio" id="s-option" name="selector" value="banking" checked={paymentMethod === 'banking'} onChange={(e) => setPaymentMethod(e.target.value)} />
                                    <label htmlFor="s-option">Chuyển khoản ngân hàng</label>
                                </li>
                                <li>
                                    <input type="radio" id="t-option" name="selector" value="momo" checked={paymentMethod === 'momo'} onChange={(e) => setPaymentMethod(e.target.value)} />
                                    <label htmlFor="t-option">Momo</label>
                                </li>
                                <li>
                                    <p>Phí giao hàng sẽ được tính ở bước tiếp theo</p>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="col-lg-4 order-1 order-xl-2">
                        <div className="right-card-sidebar-checkout" style={{ padding: '28px'    }}>
                            <h3 className="title-checkout">Tóm tắt đơn hàng</h3>

                            {cartItems.map(item => (
                                <div className="single-shop-list" key={item.id}>
                                    <div className="left-area">
                                        <span className="title">{item.productName} × {item.quantity}</span>
                                    </div>
                                    <span className="price">{formatCurrency(item.unitPrice * item.quantity)}</span>
                                </div>
                            ))}

                            <div className="single-shop-list"><span>Tạm tính</span><span className="price">{formatCurrency(subtotal)}</span></div>
                            {discount > 0 && <div className="single-shop-list"><span>Giảm giá</span><span className="price">- {formatCurrency(subtotal * discount)}</span></div>}
                            <div className="single-shop-list"><strong>Tổng cộng</strong><strong className="">{formatCurrency(finalTotal)}</strong></div>

                            <button className="rts-btn btn-primary w-100 mt-3" onClick={handlePlaceOrder}>
                                Đặt hàng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
// src/components/service/CheckOutMain.tsx
// 'use client';
// import React, { useState } from 'react';
// import { useCart } from '@/components/header/CartContext';

// const DEFAULT_SHIPPING_COST = 50;

// export default function CheckOutMain() {
//     const { cartItems } = useCart();
//     const [coupon, setCoupon] = useState('');
//     const [discount, setDiscount] = useState(0);
//     const [billingInfo, setBillingInfo] = useState({
//         email: '',
//         firstName: '',
//         lastName: '',
//         company: '',
//         country: '',
//         street: '',
//         city: '',
//         state: '',
//         zip: '',
//         phone: '',
//         orderNotes: '',
//     });

//     const [couponMessage, setCouponMessage] = useState('');
//     const handleCouponApply = () => {
//         if (coupon === '12345') {
//             setDiscount(0.25);
//             setCouponMessage('Coupon applied -25% Discount');
//         } else {
//             setDiscount(0);
//             setCouponMessage('Coupon code is incorrect');
//         }
//     };

//     const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
//     const discountAmount = subtotal * discount;
//     const shippingCost = discount > 0 ? 0 : DEFAULT_SHIPPING_COST;
//     const total = subtotal - discountAmount + shippingCost;

//     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//         const { id, value } = e.target;
//         setBillingInfo({ ...billingInfo, [id]: value });
//     };

//     const [showCoupon, setShowCoupon] = useState(false);
//     const toggleCouponInput = () => {
//         setShowCoupon((prev) => !prev);
//     };

//     return (
//         <div className="checkout-area rts-section-gap">
//             <div className="container">
//                 <div className="row">
//                     {/* Left: Billing Details */}
//                     <div className="col-lg-8 pr--40 order-2 order-xl-1">
//                         <div className="coupon-input-area-1">
//                             <div className="coupon-area">
//                                 <div className="coupon-ask cupon-wrapper-1" onClick={toggleCouponInput}>
//                                     <button className="coupon-click" onClick={handleCouponApply}>
//                                         Have a coupon? Click here to enter your code
//                                     </button>
//                                 </div>
//                                 <div className={`coupon-input-area cupon1 ${showCoupon ? 'show' : ''}`}>
//                                     <div className="inner">
//                                         <p>If you have a coupon code, please apply it below.</p>
//                                         <div className="form-area">
//                                             <input
//                                                 type="text"
//                                                 placeholder="Enter Coupon Code..."
//                                                 value={coupon}
//                                                 onChange={e => {
//                                                     setCoupon(e.target.value);
//                                                     setCouponMessage('');
//                                                 }}
//                                             />
//                                             <button type="button" className="btn-primary rts-btn" onClick={handleCouponApply}>
//                                                 Apply Coupon
//                                             </button>
//                                         </div>
//                                         {couponMessage && (
//                                             <p
//                                                 style={{
//                                                     color: coupon === '12345' ? 'green' : 'red',
//                                                     marginTop: '8px',
//                                                 }}
//                                             >
//                                                 {couponMessage}
//                                             </p>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Billing Form */}
//                         <div className="rts-billing-details-area">
//                             <h3 className="title">Billing Details</h3>
//                             <form>
//                                 {[
//                                     { id: 'email', label: 'Email Address*' },
//                                     { id: 'firstName', label: 'First Name*' },
//                                     { id: 'lastName', label: 'Last Name*' },
//                                     { id: 'company', label: 'Company Name (Optional)*' },
//                                     { id: 'country', label: 'Country / Region*' },
//                                     { id: 'street', label: 'Street Address*' },
//                                     { id: 'city', label: 'Town / City*' },
//                                     { id: 'state', label: 'State*' },
//                                     { id: 'zip', label: 'Zip Code*' },
//                                     { id: 'phone', label: 'Phone*' },
//                                 ].map(({ id, label }) => (
//                                     <div className="single-input" key={id}>
//                                         <label htmlFor={id}>{label}</label>
//                                         <input id={id} value={(billingInfo as any)[id]} onChange={handleInputChange} required />
//                                     </div>
//                                 ))}
//                                 <div className="single-input">
//                                     <label htmlFor="orderNotes">Order Notes*</label>
//                                     <textarea id="orderNotes" value={billingInfo.orderNotes} onChange={handleInputChange}></textarea>
//                                 </div>
//                                 <button type="submit" className="rts-btn btn-primary">
//                                     Update Cart
//                                 </button>
//                             </form>
//                         </div>
//                     </div>

//                     {/* Right: Order Summary */}
//                     <div className="col-lg-4 order-1 order-xl-2">
//                         <h3 className="title-checkout">Your Order</h3>
//                         <div className="right-card-sidebar-checkout">
//                             <div className="top-wrapper">
//                                 <div className="product">Products</div>
//                                 <div className="price">Price</div>
//                             </div>

//                             {cartItems.length === 0 ? (
//                                 <p>Your cart is empty.</p>
//                             ) : (
//                                 cartItems.map((item) => (
//                                     <div className="single-shop-list" key={item.id}>
//                                         <div className="left-area">
//                                             <img src={item.image} alt={item.title} />
//                                             <span className="title">{item.title} × {item.quantity}</span>
//                                         </div>
//                                         <span className="price">${(item.price * item.quantity).toFixed(2)}</span>
//                                     </div>
//                                 ))
//                             )}

//                             <div className="single-shop-list">
//                                 <div className="left-area">
//                                     <span>Subtotal</span>
//                                 </div>
//                                 <span className="price">${subtotal.toFixed(2)}</span>
//                             </div>

//                             {discount > 0 && (
//                                 <div className="single-shop-list">
//                                     <div className="left-area">
//                                         <span>Discount (25%)</span>
//                                     </div>
//                                     <span className="price">-${discountAmount.toFixed(2)}</span>
//                                 </div>
//                             )}

//                             <div className="single-shop-list">
//                                 <div className="left-area">
//                                     <span>Shipping</span>
//                                 </div>
//                                 <span className="price">${shippingCost.toFixed(2)}</span>
//                             </div>

//                             <div className="single-shop-list">
//                                 <div className="left-area">
//                                     <span style={{ fontWeight: 600, color: '#2C3C28' }}>Total Price:</span>
//                                 </div>
//                                 <span className="price" style={{ color: '#629D23' }}>${total.toFixed(2)}</span>
//                             </div>

//                             {/* Payment methods */}
//                             <div className="cottom-cart-right-area">
//                                 <ul>
//                                     <li>
//                                         <input type="radio" id="bank" name="payment" />
//                                         <label htmlFor="bank">Direct Bank Transfer</label>
//                                     </li>
//                                     <li>
//                                         <input type="radio" id="check" name="payment" />
//                                         <label htmlFor="check">Check Payments</label>
//                                     </li>
//                                     <li>
//                                         <input type="radio" id="cod" name="payment" />
//                                         <label htmlFor="cod">Cash On Delivery</label>
//                                     </li>
//                                     <li>
//                                         <input type="radio" id="paypal" name="payment" />
//                                         <label htmlFor="paypal">Paypal</label>
//                                     </li>
//                                 </ul>
//                                 <div className="single-category mb--30">
//                                     <input id="terms" type="checkbox" required />
//                                     <label htmlFor="terms"> I have read and agree to terms and conditions *</label>
//                                 </div>
//                                 <a href="#" className="rts-btn btn-primary">Place Order</a>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }
