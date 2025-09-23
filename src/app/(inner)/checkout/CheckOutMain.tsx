"use client";

import React, { useEffect, useState } from 'react';
import { useCart } from '@/components/header/CartContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import UserAddressService from '@/data/Services/UserAddress';
import OrderService from '@/data/Services/OrderService';
import ShippingService from '@/data/Services/ShippingService';
import UserCouponService from '@/data/Services/UserCouponService';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '@/components/Context/AuthContext';
import { set } from 'lodash';

function formatCurrency(value: number) {
    return value.toLocaleString('vi-VN', {
        style: 'currency',
        currency: 'VND',
    });
}

export default function CheckOutMain() {
    const { cartItems, clearCart } = useCart();
    const router = useRouter();
    const [leadTime, setLeadTime] = useState<string | null>(null);

    const [defaultAddress, setDefaultAddress] = useState<any>(null);
    const [loadingAddress, setLoadingAddress] = useState(true);
    const [shippingFee, setShippingFee] = useState<number>(0);
    const [loadingShipping, setLoadingShipping] = useState(false);

    const [billingInfo, setBillingInfo] = useState({
        name: '',
        phone: '',
        fullAddress: '',
    });

    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [error, setError] = useState<string | null>(null);
    const subtotal = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    // Coupon states
    const [coupon, setCoupon] = useState('');
    const [discount, setDiscount] = useState(0);
    const [couponMessage, setCouponMessage] = useState('');
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [couponApplied, setCouponApplied] = useState(false);

    const { user } = useAuth();

    // Load saved coupon and discount from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedDiscount = parseFloat(localStorage.getItem('discount') || '0');
            const storedCouponCode = localStorage.getItem('coupon') || '';

            setDiscount(storedDiscount);
            setCoupon(storedCouponCode);

            if (storedCouponCode && storedDiscount > 0) {
                setCouponApplied(true);
                setCouponMessage(`Mã giảm giá "${storedCouponCode}" đã được áp dụng`);
            }
        }
    }, []);

    const finalTotal = subtotal - discount + shippingFee;

    // Apply coupon function
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
                setCouponMessage(`Tuyệt vời! Bạn đã tiết kiệm được ${formatCurrency(discountAmount)} (${discountPercentage}%)`);
                setCouponApplied(true);
                localStorage.setItem('coupon', coupon);
                localStorage.setItem('discount', discountAmount.toString());
                toast.success(`🎉 Áp dụng mã giảm giá thành công! Tiết kiệm ${formatCurrency(discountAmount)}`);
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
            setCouponMessage('Có lỗi xảy ra khi xác minh mã giảm giá. Vui lòng thử lại');
            setCouponApplied(false);
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    // Remove coupon function
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
        if (!user) return;

        const fetchDefaultAddress = async () => {
            try {
                const res = await UserAddressService.getMyDefaultAddress();
                const mergedAddress = {
                    ...res.data,
                    phone: user.phone,
                    name: user.fullName,
                };
                setDefaultAddress(mergedAddress);
            } catch (err) {
                console.warn('Không có địa chỉ mặc định');
            } finally {
                setLoadingAddress(false);
            }
        };

        fetchDefaultAddress();
    }, [user]);

    useEffect(() => {
        const calculateShipping = async () => {
            if (defaultAddress) {
                setLoadingShipping(true);
                try {
                    const request = {
                        toDistrictId: defaultAddress.district,
                        toWardCode: defaultAddress.ward,
                        serviceId: 53320,
                        length: 20,
                        width: 20,
                        height: 10,
                        weight: 500,
                        insuranceValue: 100000,
                    };

                    const res = await ShippingService.calculateShippingFee(request);
                    setShippingFee(res.data);

                    // Gọi thêm leadtime
                    const leadTimeRes = await ShippingService.calculateDeliveryTime(request);

                    const date = new Date(leadTimeRes.data);

                    const formattedDate = date.toLocaleDateString("vi-VN", {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });

                    console.log("Ngày giao hàng dự kiến:", formattedDate);

                    setLeadTime(formattedDate);
                } catch (err) {
                    toast.warn('Khu vực bạn không hỗ trợ giao hàng. Vui lòng chọn khu vực khác.');
                    setShippingFee(0);
                    setLeadTime(null);
                } finally {
                    setLoadingShipping(false);
                }
            }
        };

        calculateShipping();
    }, [defaultAddress]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setBillingInfo(prev => ({ ...prev, [id]: value }));
    };

    const handlePlaceOrder = async () => {
        try {
            const orderItems = cartItems.map(item => ({
                productId: item.productId,
                productVariantId: item.productVariantId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                productName: item.productName,
            }));
            let couponCode = couponApplied ? coupon : undefined;
            const order: any = {
                orderitems: orderItems,
                paymentMethod,
                subtotal,
                couponCode: couponCode || undefined,
                discountAmount: discount,
                shippingFee,
                totalAmount: finalTotal,
            };

            // Địa chỉ
            if (defaultAddress) {
                order.deliveryAddressId = defaultAddress.id;
            } else {
                if (!billingInfo.fullAddress || !billingInfo.name || !billingInfo.phone) {
                    toast.error('Vui lòng tạo địa chỉ trước khi thanh toán.');
                    setError('Vui lòng tạo địa chỉ mặc định trước khi thanh toán.');
                    return;
                }
                order.deliveryAddressText = billingInfo.fullAddress;
                order.deliveryPhone = billingInfo.phone;
                order.specialInstructions = billingInfo.name;
            }

            // Tạo đơn hàng
            const res = await OrderService.createOrder(order);
            const createdOrder = res.data;
            const orderId = createdOrder.id;
            console.log("Đơn hàng đã tạo:", createdOrder);
            if (!orderId) {
                toast.error('❌ Không thể tạo đơn hàng. Vui lòng thử lại sau.');
                return;
            }

            if (paymentMethod === 'momo') {
                const momoRes = await OrderService.createMomoPayment(orderId);
                const payUrl = momoRes.data;
                console.log("Link thanh toán Momo:", payUrl);

                if (payUrl) {
                    toast.success('✅ Chuyển sang Momo để thanh toán...');
                    window.location.href = payUrl;
                } else {
                    toast.error('❌ Không lấy được link thanh toán Momo.');
                }
            } else {
                clearCart();
                toast.success('🎉 Đặt hàng thành công!');
                localStorage.removeItem('coupon');
                localStorage.removeItem('discount');
                router.push('/');
            }
        } catch (err: any) {
            console.error(err);
            toast.error(`❌ Lỗi khi đặt hàng: ${err.message}`);
        }
    };

    return (
        <div className="checkout-area rts-section-gap">
            <div className="container">
                <div className="row">
                    <div className="col-lg-8 p--20 order-2 order-xl-1 cart-total-area-start-right" style={{ padding: '40px', border: "none" }}>
                        <h3>Địa chỉ giao hàng</h3>

                        {loadingAddress ? (
                            <p>Đang tải địa chỉ mặc định...</p>
                        ) : (defaultAddress ? (
                            <div className="border rounded bg-light mb-4" style={{ padding: '20px' }}>
                                <p><strong>{defaultAddress.name}</strong></p>
                                <p>{defaultAddress.fullAddress}</p>
                                <p>📞 {defaultAddress.phone}</p>
                            </div>
                        ) : (
                                    <div className="border rounded bg-light mb-4" style={{ padding: '20px' }}>
                                        <p><strong style={{ color: "red"}}>Không có địa chỉ mặc định.Vui lòng tạo địa chỉ mới.</strong></p>
                                        
                                <button
                                    className="rts-btn btn-primary"
                                    onClick={() => router.push('/account')}
                                > Tạo địa chỉ mới</button>
                            </div>)
                        )}

                        {/* Coupon Section */}
                        <div className="coupon-section mb-4 p-4 border rounded-3 bg-light">
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
                                    <div className="d-flex align-items-center justify-content-between p-3 bg-opacity-10 border border-success border-opacity-25 rounded-3">
                                        <div className="d-flex align-items-center">
                                            <i className="fa-solid fa-check-circle text-success me-2"></i>
                                            <div>
                                                <strong className="text-success">Mã "{coupon}" đã được áp dụng</strong>
                                                <div className="small text-muted">
                                                    Tiết kiệm {formatCurrency(discount)} ({((discount / subtotal) * 100).toFixed(0)}%)
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
                            </ul>
                        </div>

                        {loadingShipping ? (
                            <p>Đang tính phí và thời gian giao hàng...</p>
                        ) : (
                            <>
                                <div className="shipping">
                                    <span className='col-6'>Phí vận chuyển</span>
                                    <p><strong>{formatCurrency(shippingFee)}</strong></p>
                                </div>
                                <div className="shipping">
                                    <span className='col-6'>Thời gian giao hàng dự kiến</span>
                                    <p><strong>{leadTime || 'Chưa có thông tin'}</strong></p>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="col-lg-4 order-1 order-xl-2">
                        <div className="right-card-sidebar-checkout" style={{ padding: '28px' }}>
                            <h3 className="title-checkout">Tóm tắt đơn hàng</h3>

                            {cartItems.map(item => (
                                <div className="single-shop-list" key={item.id}>
                                    <div className="left-area">
                                        <span className="title">{item.productName} × {item.quantity}</span>
                                    </div>
                                    <span className="price">{formatCurrency(item.unitPrice * item.quantity)}</span>
                                </div>
                            ))}

                            <div className="single-shop-list">
                                <span>Tạm tính</span>
                                <span className="price">{formatCurrency(subtotal)}</span>
                            </div>

                            {discount > 0 && (
                                <div className="single-shop-list">
                                    <span className="text-success">
                                        <i className="fa-solid fa-tag me-1"></i>
                                        Giảm giá ({((discount / subtotal) * 100).toFixed(0)}%)
                                    </span>
                                    <span className="price text-success">-{formatCurrency(discount)}</span>
                                </div>
                            )}

                            <div className="single-shop-list">
                                <span>Phí vận chuyển</span>
                                <span className="price">{formatCurrency(shippingFee)}</span>
                            </div>

                            <div className="single-shop-list">
                                <strong>Tổng cộng</strong>
                                <strong className="price">{formatCurrency(finalTotal)}</strong>
                            </div>

                            {discount > 0 && (
                                <div className="savings-highlight text-center mt-2">
                                    <small className="text-success fw-bold">
                                        🎉 Bạn đã tiết kiệm được {formatCurrency(discount)}!
                                    </small>
                                </div>
                            )}

                            <button className="rts-btn btn-primary w-100 mt-3" onClick={handlePlaceOrder} disabled={cartItems.length === 0 || loadingShipping || defaultAddress === null}>
                                Đặt hàng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <style jsx>{`
        button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

      `}</style>
        </div>
    );
}