"use client";

import React, { useEffect, useState } from 'react';
import { useCart } from '@/components/header/CartContext';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import UserAddressService, { UserAddress } from '@/data/Services/UserAddress';
import OrderService from '@/data/Services/OrderService';
import ShippingService from '@/data/Services/ShippingService';
import UserCouponService from '@/data/Services/UserCouponService';
import GhnService from '@/data/Services/GhnService';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '@/components/Context/AuthContext';
import { set } from 'lodash';
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaPhone, FaCommentDots, FaTicketAlt, FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';

function formatCurrency(value: number) {
    return value.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
    });
}

// Hàm format ngày: YYYY-MM-DD
const formatDateValue = (date: Date) => {
    return date.toISOString().split("T")[0];
};

const formatDateLabel = (date: Date) => {
    const days = [
        "Chủ Nhật",
        "Thứ Hai",
        "Thứ Ba",
        "Thứ Tư",
        "Thứ Năm",
        "Thứ Sáu",
        "Thứ Bảy",
    ];
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${dayName}, ${day}/${month}`;
};

// Hàm sinh danh sách ngày khả dụng (bắt đầu từ ngày mai)
const generateAvailableDates = (daysAhead: number) => {
    const today = new Date();
    const result = [];

    // Bắt đầu từ ngày mai (i = 1)
    for (let i = 1; i <= daysAhead; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        result.push({
            value: formatDateValue(d),
            label: formatDateLabel(d),
        });
    }
    return result;
};

// Hàm kiểm tra xem có phải hôm nay không
const isToday = (dateString: string) => {
    const today = new Date();
    const checkDate = new Date(dateString);
    return today.toDateString() === checkDate.toDateString();
};

// Hàm lấy khung giờ khả dụng dựa trên ngày được chọn
const getAvailableTimeSlots = (selectedDate: string) => {
    const baseTimeSlots = [
        { value: "07:00-08:00", label: "Sáng sớm (7:00 - 8:00)", disabled: false },
        { value: "08:00-09:00", label: "Sáng (8:00 - 9:00)", disabled: false },
        { value: "09:00-10:00", label: "Sáng (9:00 - 10:00)", disabled: false },
        { value: "10:00-11:00", label: "Sáng muộn (10:00 - 11:00)", disabled: false },
        { value: "11:00-12:00", label: "Trưa (11:00 - 12:00)", disabled: false },
        { value: "12:00-13:00", label: "Trưa (12:00 - 13:00)", disabled: false },
        { value: "13:00-14:00", label: "Chiều sớm (13:00 - 14:00)", disabled: false },
        { value: "14:00-15:00", label: "Chiều sớm (14:00 - 15:00)", disabled: false },
        { value: "15:00-16:00", label: "Chiều (15:00 - 16:00)", disabled: false },
        { value: "16:00-17:00", label: "Chiều (16:00 - 17:00)", disabled: false },
        { value: "17:00-18:00", label: "Chiều muộn (17:00 - 18:00)", disabled: false },
        { value: "18:00-19:00", label: "Tối sớm (18:00 - 19:00)", disabled: false },
        { value: "19:00-20:00", label: "Tối (19:00 - 20:00)", disabled: false },
    ];

    // Nếu là ngày mai
    if (selectedDate) {
        const selectedDateObj = new Date(selectedDate);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Nếu chọn ngày mai, disable các khung giờ đã qua (tính theo giờ hiện tại + 2 tiếng chuẩn bị)
        if (selectedDateObj.toDateString() === tomorrow.toDateString()) {
            const now = new Date();
            const currentHour = now.getHours() + 2; // Cộng thêm 2 tiếng để chuẩn bị

            return baseTimeSlots.map(slot => {
                const slotStartHour = parseInt(slot.value.split('-')[0].split(':')[0]);
                return {
                    ...slot,
                    disabled: slotStartHour <= currentHour
                };
            });
        }
    }

    return baseTimeSlots;
};

export default function CheckOutMain() {
    const { cartItems, clearCart } = useCart();
    const router = useRouter();
    const [leadTime, setLeadTime] = useState<string | null>(null);
    const [errrorText, setErrrorText] = useState<string | null>(null);
    const [preOrderDate, setPreOrderDate] = useState("");
    const [preOrderTimeSlot, setPreOrderTimeSlot] = useState("");
    const MAX_PREORDER_DAYS = 7;

    const availableDates = generateAvailableDates(MAX_PREORDER_DAYS);
    const availableTimeSlots = getAvailableTimeSlots(preOrderDate);

    // Address states
    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<any>(null);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [addressMode, setAddressMode] = useState<'select' | 'input'>('select');

    const [shippingFee, setShippingFee] = useState<number>(0);
    const [loadingShipping, setLoadingShipping] = useState(false);

    // Manual address input states
    const [manualAddress, setManualAddress] = useState({
        name: '',
        phone: '',
        fullAddress: '',
        city: '',
        district: '',
        ward: ''
    });

    // GHN location states for manual input
    const [provinces, setProvinces] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [wards, setWards] = useState<any[]>([]);
    const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
    const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
    const [selectedWardId, setSelectedWardId] = useState<any | null>(null);

    const [deliveryType, setDeliveryType] = useState<'regular' | 'preorder'>('regular');
    const [notes, setNotes] = useState('');

    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [error, setError] = useState<string | null>(null);
    const subtotal = cartItems.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
    );

    // Coupon states
    const [coupon, setCoupon] = useState("");
    const [discount, setDiscount] = useState(0);
    const [couponMessage, setCouponMessage] = useState("");
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [couponApplied, setCouponApplied] = useState(false);

    const { user } = useAuth();

    // Reset preOrderTimeSlot when date changes
    useEffect(() => {
        setPreOrderTimeSlot('');
    }, [preOrderDate]);

    // Load provinces on mount for manual address input
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const res = await GhnService.getProvinces();
                setProvinces(res.data);
            } catch (error) {
                console.error("Lỗi khi tải tỉnh/thành:", error);
            }
        };
        fetchProvinces();
    }, []);

    // Load districts when province changes
    useEffect(() => {
        const fetchDistricts = async () => {
            if (!selectedProvinceId) {
                setDistricts([]);
                setWards([]);
                setSelectedDistrictId(null);
                setSelectedWardId(null);
                return;
            }

            try {
                const res = await GhnService.getDistricts(selectedProvinceId);
                setDistricts(res.data);
                setWards([]);
                setSelectedDistrictId(null);
                setSelectedWardId(null);
            } catch (error) {
                console.error("Lỗi khi tải quận/huyện:", error);
            }
        };
        fetchDistricts();
    }, [selectedProvinceId]);

    // Load wards when district changes
    useEffect(() => {
        const fetchWards = async () => {
            if (!selectedDistrictId) {
                setWards([]);
                setSelectedWardId(null);
                return;
            }

            try {
                const res = await GhnService.getWards(selectedDistrictId);
                setWards(res.data);
                setSelectedWardId(null);
            } catch (error) {
                console.error("Lỗi khi tải phường/xã:", error);
            }
        };
        fetchWards();
    }, [selectedDistrictId]);

    // Load saved coupon and discount from localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedDiscount = parseFloat(
                localStorage.getItem("discount") || "0"
            );
            const storedCouponCode = localStorage.getItem("coupon") || "";

            setDiscount(storedDiscount);
            setCoupon(storedCouponCode);

            if (storedCouponCode && storedDiscount > 0) {
                setCouponApplied(true);
                setCouponMessage(`Mã giảm giá "${storedCouponCode}" đã được áp dụng`);
            }
        }
    }, []);

    const finalTotal = subtotal - discount + shippingFee;

    // Load addresses and set default
    useEffect(() => {
        if (!user) return;

        const fetchAddresses = async () => {
            try {
                const res = await UserAddressService.getMyAddresses();
                setAddresses(res.data);

                if (res.data && res.data.length > 0) {
                    const defaultAddr = res.data.find(addr => addr.isDefault) || res.data[0];
                    setSelectedAddress(defaultAddr);
                    setAddressMode('select');
                } else {
                    setAddressMode('input');
                    setManualAddress(prev => ({
                        ...prev,
                        name: user.fullName || '',
                        phone: user.phone || ''
                    }));
                }
            } catch (err) {
                console.warn('Lỗi khi tải địa chỉ:', err);
                setAddressMode('input');
                setManualAddress(prev => ({
                    ...prev,
                    name: user.fullName || '',
                    phone: user.phone || ''
                }));
            } finally {
                setLoadingAddresses(false);
            }
        };

        fetchAddresses();
    }, [user]);

    // Calculate shipping fee and lead time
    useEffect(() => {
        const calculateShipping = async () => {
            let addressForShipping = null;

            if (addressMode === 'select' && selectedAddress) {
                addressForShipping = selectedAddress;
            } else if (addressMode === 'input' && selectedDistrictId && selectedWardId) {
                addressForShipping = {
                    district: selectedDistrictId.toString(),
                    ward: selectedWardId
                };
            }

            if (addressForShipping) {
                setLoadingShipping(true);
                try {
                    const request = {
                        toDistrictId: parseInt(addressForShipping.district),
                        toWardCode: addressForShipping.ward,
                        serviceId: 53320,
                        length: 20,
                        width: 20,
                        height: 10,
                        weight: 500,
                        insuranceValue: 100000,
                    };

                    const res = await ShippingService.calculateShippingFee(request);
                    setShippingFee(res.data);

                    const leadTimeRes = await ShippingService.calculateDeliveryTime(request);
                    const date = new Date(leadTimeRes.data);
                    const formattedDate = date.toLocaleDateString("vi-VN", {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });

                    setErrrorText(null);
                    setLeadTime(formattedDate);
                } catch (err) {
                    toast.warn('Khu vực bạn không hỗ trợ giao hàng. Vui lòng chọn khu vực khác.');
                    setErrrorText('Khu vực không hỗ trợ giao hàng');
                    setShippingFee(0);
                    setLeadTime(null);
                } finally {
                    setLoadingShipping(false);
                }
            } else {
                setShippingFee(0);
                setLeadTime(null);
            }
        };
        calculateShipping();
    }, [selectedAddress, addressMode, selectedDistrictId, selectedWardId]);

    // Handle manual address input changes
    const handleManualAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setManualAddress(prev => ({ ...prev, [name]: value }));
    };

    // Apply coupon function
    const applyCoupon = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!coupon || !subtotal) {
            setCouponMessage("Vui lòng nhập mã giảm giá hợp lệ");
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

            if (res?.data) {
                const discountAmount = res.data;
                setDiscount(discountAmount);
                const discountPercentage = ((discountAmount / subtotal) * 100).toFixed(
                    0
                );
                setCouponMessage(
                    `Tuyệt vời! Bạn đã tiết kiệm được ${formatCurrency(
                        discountAmount
                    )} (${discountPercentage}%)`
                );
                setCouponApplied(true);
                localStorage.setItem("coupon", coupon);
                localStorage.setItem("discount", discountAmount.toString());
                toast.success(
                    `🎉 Áp dụng mã giảm giá thành công! Tiết kiệm ${formatCurrency(
                        discountAmount
                    )}`
                );
            } else {
                setDiscount(0);
                setCouponMessage("Mã giảm giá không hợp lệ hoặc đã hết hạn sử dụng");
                setCouponApplied(false);
                localStorage.removeItem("coupon");
                localStorage.removeItem("discount");
            }
        } catch (err) {
            console.error(err);
            setDiscount(0);
            setCouponMessage(
                "Có lỗi xảy ra khi xác minh mã giảm giá. Vui lòng thử lại"
            );
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

    // Generate preferredTimeSlot string for backend
    const generatePreferredTimeSlot = () => {
        if (deliveryType === 'preorder' && preOrderDate && preOrderTimeSlot) {
            return `${preOrderDate} ${preOrderTimeSlot}`;
        }
        return undefined;
    };

    // Handle placing the order
    const handlePlaceOrder = async () => {
        // Validation
        if (addressMode === 'select' && !selectedAddress) {
            toast.error('Vui lòng chọn địa chỉ giao hàng.');
            return;
        }

        if (addressMode === 'input') {
            if (!manualAddress.name || !manualAddress.phone || !manualAddress.fullAddress || !selectedProvinceId || !selectedDistrictId) {
                toast.error('Vui lòng nhập đầy đủ thông tin địa chỉ giao hàng.');
                return;
            }
        }

        if (deliveryType === 'preorder' && (!preOrderDate || !preOrderTimeSlot)) {
            toast.error('Vui lòng chọn đầy đủ ngày và khung giờ giao hàng cho đơn đặt trước.');
            return;
        }

        try {
            const orderItems = cartItems.map((item) => ({
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
                specialInstructions: notes,
                preferredTimeSlot: generatePreferredTimeSlot(),
                deliveryPhone: addressMode === "input" ? manualAddress.phone : selectedAddress?.phone || manualAddress.phone,
                deliveryName: addressMode === "input" ? manualAddress.name : selectedAddress?.name || manualAddress.name,
                deliveryNote: notes,
            };

            // Set address and phone based on mode
            if (addressMode === "select" && selectedAddress) {
                order.deliveryAddressId = selectedAddress.id;
                order.deliveryName = selectedAddress.name;
                order.deliveryPhone = selectedAddress.phone || manualAddress.phone;
            }
            else if (addressMode === "input") {
                const selectedProvince = provinces.find(p => p.provinceID === selectedProvinceId);
                const selectedDistrict = districts.find(d => d.districtID === selectedDistrictId);
                const selectedWard = wards.find(w => w.wardCode === selectedWardId);

                const stringifiedAddress: UserAddress = {
                    userId: '',
                    name: manualAddress.name,
                    fullAddress:
                        manualAddress.fullAddress +
                        (selectedWard ? ", " + selectedWard.wardName : "") +
                        (selectedDistrict ? ", " + selectedDistrict.districtName : "") +
                        (selectedProvince ? ", " + selectedProvince.provinceName : ""),
                    city: selectedProvince?.provinceName ?? '',
                    district: selectedDistrict?.districtID.toString() ?? '',
                    ward: selectedWardId ?? '',
                    isDefault: false,
                };

                const newAddress = await UserAddressService.addAddress(stringifiedAddress);
                order.deliveryAddressId = newAddress.data.id;
            }

            // Create order
            const res = await OrderService.createOrder(order);
            const createdOrder = res.data;
            const orderId = createdOrder.id;

            if (!orderId) {
                toast.error('❌ Không thể tạo đơn hàng. Vui lòng thử lại sau.');
                return;
            }

            if (paymentMethod === 'momo') {
                const momoRes = await OrderService.createMomoPayment(orderId);
                const payUrl = momoRes.data;

                if (payUrl) {
                    toast.success('✅ Chuyển sang Momo để thanh toán...');
                    window.location.href = payUrl;
                } else {
                    toast.error('❌ Không lấy được link thanh toán Momo.');
                }
            } else {
                clearCart();
                localStorage.removeItem('coupon');
                localStorage.removeItem('discount');
                toast.success('🎉 Đặt hàng thành công!');
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
                    {/* Cột 1: Thông tin giao hàng và thanh toán */}
                    <div className="col-lg-8 p--20 order-2 order-xl-1" style={{ padding: '0 40px', border: "none" }}>

                        {/* 1. Địa chỉ Giao hàng */}
                        <div className="mb-5 p-5 border rounded-3 shadow-sm bg-white">
                            <h3 className="mb-4 d-flex align-items-center">
                                <FaMapMarkerAlt className="me-2 text-primary" /> Địa chỉ giao hàng
                            </h3>
                            {errrorText && (
                                <div className="alert alert-danger d-flex align-items-center" role="alert">
                                    <i className="fa-solid fa-triangle-exclamation me-2"></i>
                                    <span>{errrorText}</span>
                                </div>
                            )}

                            {loadingAddresses ? (
                                <p className="text-muted">Đang tải địa chỉ...</p>
                            ) : (
                                <>
                                    {/* Address Mode Selection */}
                                    <div className="mb-4">
                                        <div className="d-flex gap-4">
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="addressMode"
                                                    id="selectAddress"
                                                    value="select"
                                                    checked={addressMode === 'select'}
                                                    onChange={() => setAddressMode('select')}
                                                    disabled={addresses.length === 0}
                                                />
                                                <label className="form-check-label" htmlFor="selectAddress">
                                                    Chọn từ sổ địa chỉ {addresses.length > 0 && `(${addresses.length} địa chỉ)`}
                                                </label>
                                            </div>
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="addressMode"
                                                    id="inputAddress"
                                                    value="input"
                                                    checked={addressMode === 'input'}
                                                    onChange={() => setAddressMode('input')}
                                                />
                                                <label className="form-check-label" htmlFor="inputAddress">
                                                    Nhập địa chỉ mới
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address Selection Mode */}
                                    {addressMode === 'select' && addresses.length > 0 && (
                                        <div className="address-selection">
                                            <label className="form-label small fw-bold mb-3">Chọn địa chỉ giao hàng *</label>
                                            <div className="row">
                                                {addresses.map((addr) => (
                                                    <div key={addr.id} className="col-md-6 mb-3">
                                                        <div className={`card h-100 cursor-pointer ${selectedAddress?.id === addr.id ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'}`}
                                                            onClick={() => setSelectedAddress(addr)}>
                                                            <div className="card-body p-3">
                                                                <div className="form-check">
                                                                    <input
                                                                        className="form-check-input"
                                                                        type="radio"
                                                                        name="selectedAddress"
                                                                        checked={selectedAddress?.id === addr.id}
                                                                        onChange={() => setSelectedAddress(addr)}
                                                                    />
                                                                    <label className="form-check-label">
                                                                        <h6 className="mb-1">
                                                                            {addr.name}
                                                                            {addr.isDefault && (
                                                                                <span className="badge bg-success text-white ms-2">Mặc định</span>
                                                                            )}
                                                                        </h6>
                                                                        <p className="mb-1 small text-muted">{addr.phone}</p>
                                                                        <p className="mb-0 small">{addr.fullAddress}</p>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Manual phone input for selected address if needed */}
           
                                                <div className="form-group mt-3">
                                                    <label htmlFor="deliveryPhone" className="form-label small fw-bold">
                                                        <FaPhone className="me-2 text-secondary" /> Số điện thoại nhận hàng *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="deliveryPhone"
                                                        className="form-control"
                                                        placeholder="Nhập số điện thoại"
                                                        value={manualAddress.phone}
                                                        onChange={(e) => setManualAddress(prev => ({ ...prev, phone: e.target.value }))}
                                                        required
                                                    />
                                                </div>
                              

                                            <button
                                                className="rts-btn btn-primary btn-sm mt-3"
                                                onClick={() => router.push('/account')}
                                            >
                                                Quản lý địa chỉ
                                            </button>
                                        </div>
                                    )}

                                    {/* Manual Address Input Mode */}
                                    {addressMode === 'input' && (
                                        <div className="manual-address-input">
                                            <div className="row">
                                                <div className="col-md-6 form-group mb-3">
                                                    <label htmlFor="manualName" className="form-label small fw-bold">Tên người nhận *</label>
                                                    <input
                                                        type="text"
                                                        id="manualName"
                                                        name="name"
                                                        className="form-control"
                                                        placeholder="Tên người nhận"
                                                        value={manualAddress.name}
                                                        onChange={handleManualAddressChange}
                                                        required
                                                    />
                                                </div>

                                                <div className="col-md-6 form-group mb-3">
                                                    <label htmlFor="manualPhone" className="form-label small fw-bold">Số điện thoại *</label>
                                                    <input
                                                        type="text"
                                                        id="manualPhone"
                                                        name="phone"
                                                        className="form-control"
                                                        placeholder="Số điện thoại"
                                                        value={manualAddress.phone}
                                                        onChange={handleManualAddressChange}
                                                        required
                                                    />
                                                </div>

                                                <div className="col-md-4 form-group mb-3">
                                                    <label className="form-label fw-bold">Tỉnh/Thành phố *</label>
                                                    <select
                                                        className="form-control"
                                                        style={{ fontSize: '16px' }}
                                                        value={selectedProvinceId || ""}
                                                        onChange={(e) => {
                                                            const provinceId = parseInt(e.target.value);
                                                            const selected = provinces.find(p => p.provinceID === provinceId);
                                                            setSelectedProvinceId(provinceId);
                                                            setSelectedDistrictId(null);
                                                            setSelectedWardId(null);
                                                            setManualAddress(prev => ({
                                                                ...prev,
                                                                city: selected?.provinceName || "",
                                                                district: "",
                                                                ward: ""
                                                            }));
                                                        }}
                                                        required
                                                    >
                                                        <option value="">-- Chọn tỉnh/thành phố --</option>
                                                        {provinces.map((province) => (
                                                            <option key={province.provinceID} value={province.provinceID}>
                                                                {province.provinceName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="col-md-4 form-group mb-3">
                                                    <label className="form-label fw-bold">Quận/Huyện *</label>
                                                    <select
                                                        className="form-control"
                                                        style={{ fontSize: '16px' }}
                                                        value={selectedDistrictId || ""}
                                                        onChange={(e) => {
                                                            const districtId = parseInt(e.target.value);
                                                            const selected = districts.find(d => d.districtID === districtId);
                                                            setSelectedDistrictId(districtId);
                                                            setSelectedWardId(null);
                                                            setManualAddress(prev => ({
                                                                ...prev,
                                                                district: selected?.districtName || "",
                                                                ward: ""
                                                            }));
                                                        }}
                                                        disabled={!selectedProvinceId}
                                                        required
                                                    >
                                                        <option value="">-- Chọn quận/huyện --</option>
                                                        {districts.map((district) => (
                                                            <option key={district.districtID} value={district.districtID}>
                                                                {district.districtName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="col-md-4 form-group mb-3">
                                                    <label className="form-label fw-bold">Phường/Xã</label>
                                                    <select
                                                        className="form-control"
                                                        style={{ fontSize: '16px' }}
                                                        value={selectedWardId || ""}
                                                        onChange={(e) => {
                                                            const wardCode = e.target.value;
                                                            const selected = wards.find(w => w.wardCode === wardCode);
                                                            setSelectedWardId(wardCode);
                                                            setManualAddress(prev => ({
                                                                ...prev,
                                                                ward: selected?.wardCode || ""
                                                            }));
                                                        }}
                                                        disabled={!selectedDistrictId}
                                                    >
                                                        <option value="">-- Chọn phường/xã --</option>
                                                        {wards.map((ward) => (
                                                            <option key={ward.wardCode} value={ward.wardCode}>
                                                                {ward.wardName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="col-12 form-group mb-3">
                                                    <label htmlFor="manualFullAddress" className="form-label small fw-bold">Địa chỉ chi tiết *</label>
                                                    <input
                                                        type="text"
                                                        id="manualFullAddress"
                                                        name="fullAddress"
                                                        className="form-control"
                                                        placeholder="Số nhà, đường, ngõ..."
                                                        value={manualAddress.fullAddress}
                                                        onChange={handleManualAddressChange}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* No Address Available */}
                                    {addressMode === 'select' && addresses.length === 0 && (
                                        <div className="text-center my-4">
                                            <p className="text-muted">Bạn chưa có địa chỉ nào được lưu.</p>
                                            <button
                                                className="rts-btn btn-primary btn-sm"
                                                onClick={() => router.push('/account')}
                                            >
                                                Tạo địa chỉ mới
                                            </button>
                                            <span className="mx-2">hoặc</span>
                                            <button
                                                className="rts-btn btn-outline-primary btn-sm"
                                                onClick={() => setAddressMode('input')}
                                            >
                                                Nhập địa chỉ ngay
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* 2. Thông tin Liên hệ và Giao hàng */}
                        <div className="mb-5 p-5 border rounded-3 shadow-sm bg-white">
                            <h3 className="mb-4 d-flex align-items-center">
                                <FaCalendarAlt className="me-2 text-primary" /> Thông tin giao nhận
                            </h3>

                            {/* Lựa chọn giao hàng */}
                            <div className="mb-4">
                                <label className="form-label d-flex align-items-center fw-bold mb-3">
                                    <FaClock className="me-2 " /> Thời gian giao hàng
                                </label>
                                <div className="d-flex gap-4">
                                    <div className="form-check form-check-inline">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="deliveryType"
                                            id="regularDelivery"
                                            value="regular"
                                            checked={deliveryType === 'regular'}
                                            onChange={() => {
                                                setDeliveryType('regular');
                                                setPreOrderDate('');
                                                setPreOrderTimeSlot('');
                                            }}
                                        />
                                        <label className="form-check-label" htmlFor="regularDelivery">
                                            Giao hàng sớm nhất {leadTime && <small className="text-muted">({leadTime})</small>}
                                        </label>
                                    </div>
                                    <div className="form-check form-check-inline">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="deliveryType"
                                            id="preorderDelivery"
                                            value="preorder"
                                            checked={deliveryType === 'preorder'}
                                            onChange={() => setDeliveryType('preorder')}
                                        />
                                        <label className="form-check-label" htmlFor="preorderDelivery">
                                            Đặt lịch giao hàng
                                        </label>
                                    </div>
                                </div>

                                {/* Pre-order Date and Time Picker */}

                                {deliveryType === "preorder" && (
                                    <div className="right-card-sidebar-checkout my-4" style={{ padding: '24px' }}>

                                        <div className="row g-4">
                                            {/* Cột trái: Ngày giao hàng */}
                                            <div className="col-md-6">
                                                <h6 className="fw-bold mb-3 d-flex align-items-center">
                                                    <i className="fa-solid fa-calendar-day text-primary me-2"></i>
                                                    Ngày giao hàng *
                                                </h6>
                                                <div className="d-flex flex-column gap-2">
                                                    {availableDates.map((date) => (
                                                        <div
                                                            key={date.value}
                                                            className={`p-2 border rounded-3 cursor-pointer d-flex align-items-center justify-content-between 
                ${preOrderDate === date.value ? "border-success bg-success bg-opacity-10" : "border-gray-300 bg-white"}
              `}
                                                            onClick={() => setPreOrderDate(date.value)}
                                                        >
                                                            <label htmlFor={`date-${date.value}`} className="d-flex align-items-center mb-0 w-100 cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    className="form-check-input me-2"
                                                                    id={`date-${date.value}`}
                                                                    name="deliveryDate"
                                                                    value={date.value}
                                                                    checked={preOrderDate === date.value}
                                                                    onChange={(e) => setPreOrderDate(e.target.value)}
                                                                    required
                                                                />
                                                                {/* đổi text-muted thành text-dark để dễ đọc */}
                                                                <span className={`small ${preOrderDate === date.value ? "fw-bold text-dark" : "text-dark"}`}>
                                                                    {date.label}
                                                                </span>
                                                            </label>
                                                            {preOrderDate === date.value && <i className="fa-solid fa-check text-success ms-2"></i>}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Cột phải: Khung giờ giao hàng */}
                                            <div className="col-md-6">
                                                <h6 className="fw-bold mb-3 d-flex align-items-center">
                                                    <i className="fa-solid fa-clock text-primary me-2"></i>
                                                    Khung giờ giao hàng *
                                                </h6>
                                                {preOrderDate ? (
                                                    <div className="d-flex flex-column gap-2  custom-scrollbar" style={{ maxHeight: "300px", overflowY: "auto" }}>
                                                        {availableTimeSlots.map((slot) => (
                                                            <div
                                                                key={slot.value}
                                                                className={`p-2 border rounded-3 d-flex align-items-center justify-content-between
                  ${slot.disabled ? "bg-light text-muted" : "cursor-pointer bg-white"}
                  ${preOrderTimeSlot === slot.value ? "border-success bg-success bg-opacity-10" : "border-gray-300"}
                `}
                                                                onClick={() => !slot.disabled && setPreOrderTimeSlot(slot.value)}
                                                            >
                                                                <label htmlFor={`time-${slot.value}`} className="d-flex align-items-center mb-0 w-100 cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        className="form-check-input me-2"
                                                                        id={`time-${slot.value}`}
                                                                        name="deliveryTimeSlot"
                                                                        value={slot.value}
                                                                        checked={preOrderTimeSlot === slot.value}
                                                                        onChange={(e) => setPreOrderTimeSlot(e.target.value)}
                                                                        disabled={slot.disabled}
                                                                        required
                                                                    />
                                                                    <span className={`small ${slot.disabled ? "text-muted" : preOrderTimeSlot === slot.value ? "fw-bold text-dark" : "text-dark"}`}>
                                                                        {slot.label}
                                                                    </span>
                                                                </label>
                                                                {slot.disabled && <span className="badge bg-danger text-white small px-2 py-1">Hết slot</span>}
                                                                {preOrderTimeSlot === slot.value && <i className="fa-solid fa-check text-success ms-2"></i>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-muted small">Vui lòng chọn ngày trước để xem khung giờ khả dụng</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Tổng kết lựa chọn */}
                                        <div className="mt-4 p-3 border rounded-3 bg-light">
                                            <h6 className="fw-bold mb-2">Tổng kết</h6>
                                            {preOrderDate && preOrderTimeSlot ? (
                                                <p className="mb-0 small text-dark">
                                                    Bạn đã chọn: <strong>{availableDates.find(d => d.value === preOrderDate)?.label}</strong> -
                                                    <strong> {availableTimeSlots.find(s => s.value === preOrderTimeSlot)?.label}</strong>
                                                </p>
                                            ) : (
                                                <p className="mb-0 small text-muted">Vui lòng chọn ngày và khung giờ để tiếp tục</p>
                                            )}
                                        </div>
                                    </div>
                                )}





                            </div>

                            {/* Ghi chú */}
                            <div className="form-group border-top pt-3">
                                <label htmlFor="notes" className="form-label d-flex align-items-center fw-bold">
                                    <FaCommentDots className="me-2" /> Ghi chú (tùy chọn)
                                </label>
                                <textarea
                                    id="notes"
                                    className="form-control"
                                    rows={3}
                                    placeholder="Ví dụ: Giao sau 18h, Không gọi điện khi đến nơi, Để hàng ở bảo vệ..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                ></textarea>
                            </div>
                        </div>

                        {/* 3. Phương thức Thanh toán */}
                        <div className="mb-5 p-5 border rounded-3 shadow-sm bg-white">
                            <h3 className="mb-4 d-flex align-items-center">
                                <FaCreditCard className="me-2 text-primary" /> Phương thức thanh toán *
                            </h3>
                            <div className="shipping">
                                <ul className="list-unstyled">
                                    <li>
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                id="cashOption"
                                                name="paymentSelector"
                                                value="cash"
                                                checked={paymentMethod === 'cash'}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                            />
                                            <label className="form-check-label d-flex align-items-center" htmlFor="cashOption">
                                                <FaMoneyBillWave className="me-2 text-success" /> Thanh toán khi nhận hàng (COD)
                                            </label>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Cột 2: Tóm tắt đơn hàng và Coupon */}
                    <div className="col-lg-4 order-1 order-xl-2">
                        <div
                            className="right-card-sidebar-checkout "
                            style={{ padding: "28px", top: "20px" }}
                        >
                            <h3 className="title-checkout mb-4">Tóm tắt đơn hàng</h3>

                            {/* Coupon Section */}
                            <div className="coupon-section mb-4 p-3 border rounded-3 bg-light">
                                <div className="d-flex align-items-center mb-3">
                                    <FaTicketAlt className="text-primary me-2" style={{ fontSize: '1.2rem' }} />
                                    <h6 className="mb-0 fw-bold">Mã giảm giá</h6>
                                </div>

                                {!couponApplied ? (
                                    <form onSubmit={applyCoupon}>
                                        <div className="d-flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Nhập mã giảm giá"
                                                className="form-control"
                                                value={coupon}
                                                onChange={e => {
                                                    setCoupon(e.target.value.toUpperCase());
                                                    setCouponMessage('');
                                                }}
                                                disabled={isApplyingCoupon}
                                            />
                                            <button
                                                type="submit"
                                                className="rts-btn btn-primary"
                                                disabled={isApplyingCoupon || !coupon.trim()}
                                            >
                                                {isApplyingCoupon ? (
                                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                ) : ('Áp dụng')}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="coupon-applied-state">
                                        <div className="d-flex align-items-center justify-content-between p-2 bg-success bg-opacity-10 border border-success rounded-3">
                                            <div className="d-flex align-items-center">
                                                <i className="fa-solid fa-check-circle text-success me-2"></i>
                                                <div>
                                                    <strong className="text-success small">Mã "{coupon}" đã áp dụng</strong>
                                                    <div className="small text-muted">
                                                        Giảm {formatCurrency(discount)}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={removeCoupon}
                                                title="Xóa mã giảm giá"
                                                style={{ width: '30px', height: '30px', padding: '0', lineHeight: '1' }}
                                            >
                                                <i className="fa-solid fa-times"></i>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {couponMessage && !couponApplied && (
                                    <div className="mt-2">
                                        <div className="alert alert-danger alert-dismissible fade show mb-0 small py-2 px-3" role="alert">
                                            <i className="fa-solid fa-exclamation-triangle me-2"></i>
                                            {couponMessage}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Cart Items */}
                            <div className="order-items mb-3 border-bottom pb-3">
                                <h6 className="fw-bold mb-2">Sản phẩm</h6>
                                {cartItems.map((item) => (
                                    <div
                                        className="single-shop-list small"
                                        key={item.id}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            marginBottom: "8px",
                                        }}
                                    >
                                        <div className="left-area">
                                            <span className="title">
                                                {item.productName} × {item.quantity}
                                            </span>
                                        </div>
                                        <span className="price text-end">
                                            {formatCurrency(item.unitPrice * item.quantity)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Price Summary */}
                            <div className="price-summary mb-3 border-bottom pb-3">
                                <div
                                    className="single-shop-list"
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginBottom: "8px",
                                    }}
                                >
                                    <span>Tạm tính</span>
                                    <span className="price">{formatCurrency(subtotal)}</span>
                                </div>

                                {discount > 0 && (
                                    <div
                                        className="single-shop-list"
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            marginBottom: "8px",
                                        }}
                                    >
                                        <span className="text-success small">
                                            <i className="fa-solid fa-tag me-1"></i> Giảm giá
                                        </span>
                                        <span className="price text-success small">
                                            -{formatCurrency(discount)}
                                        </span>
                                    </div>
                                )}

                                <div
                                    className="single-shop-list"
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginBottom: "8px",
                                    }}
                                >
                                    <span>Phí vận chuyển</span>
                                    <span className="price fw-bold">
                                        {loadingShipping
                                            ? "Đang tính..."
                                            : formatCurrency(shippingFee)}
                                    </span>
                                </div>
                            </div>

                            {/* Total and Place Order Button */}
                            <div className="single-shop-list mb-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong className="">Tổng cộng</strong>
                                <strong className="price text-primary">{formatCurrency(finalTotal)}</strong>
                            </div>
                            {deliveryType === "preorder" && (
                                <div className="mt-5 mb-5 p-3 border rounded-3 bg-light">
                                    <h6 className="fw-bold mb-2">Ngày giao hàng</h6>
                                    {preOrderDate && preOrderTimeSlot ? (
                                        <p className="mb-0 small text-dark">
                                            Bạn đã chọn: <strong>{availableDates.find(d => d.value === preOrderDate)?.label}</strong> -
                                            <strong> {availableTimeSlots.find(s => s.value === preOrderTimeSlot)?.label}</strong>
                                        </p>
                                    ) : (
                                        <p className="mb-0 small text-muted">Vui lòng chọn ngày và khung giờ để tiếp tục</p>
                                    )}
                                </div>
                            )

                            }

                            {discount > 0 && (
                                <div className="savings-highlight text-center mb-3 p-2 bg-warning bg-opacity-10 rounded-3">
                                    <small className="text-success fw-bold">
                                        🎉 Bạn đã tiết kiệm được {formatCurrency(discount)}!
                                    </small>
                                </div>
                            )}

                            <button
                                className="rts-btn btn-primary w-100 mt-2 btn-lg"
                                onClick={handlePlaceOrder}
                                disabled={
                                    cartItems.length === 0 ||
                                    loadingShipping ||
                                    (addressMode === 'select' && !selectedAddress) ||
                                    (addressMode === 'input' && (!manualAddress.name || !manualAddress.phone || !manualAddress.fullAddress || !selectedProvinceId || !selectedDistrictId)) ||
                                    (deliveryType === 'preorder' && (!preOrderDate || !preOrderTimeSlot)) ||
                                    (errrorText !== '' && errrorText !== null)
                                }
                            >
                                HOÀN TẤT ĐẶT HÀNG
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .checkout-area {
                    background-color: #f7f7f7;
                }
                .right-card-sidebar-checkout {
                    background-color: #ffffff;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    padding: 20px;
                }
                .form-group {
                    margin-bottom: 1.5rem;
                }
                .form-control-lg {
                    height: calc(2.5rem + 2px);
                    padding: 0.5rem 1rem;
                }
                .cursor-pointer {
                    cursor: pointer;
                }
                .cursor-pointer:hover {
                    transform: translateY(-1px);
                    transition: transform 0.2s ease;
                }
                button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .single-shop-list {
                    border-bottom: 1px dotted #eee;
                    padding-bottom: 5px;
                }
                .single-shop-list:last-child {
                    border-bottom: none;
                }
                .border-primary {
                    border-color: #0d6efd !important;
                }
                .bg-primary {
                    --bs-bg-opacity: 0.1;
                    background-color: rgba(13, 110, 253, var(--bs-bg-opacity)) !important;
                }
                .date-selection, .time-selection {
                    max-height: 250px;
                    overflow-y: auto;
                    border: 1px solid #dee2e6;
                    border-radius: 0.375rem;
                    padding: 0.75rem;
                }
                .form-check-input:disabled ~ .form-check-label {
                    opacity: 0.5;
                }
                .time-selection::-webkit-scrollbar {
                    width: 6px;
                }
                .time-selection::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .time-selection::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 10px;
                }
                .time-selection::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
                    .custom-scrollbar {
  scrollbar-width: thin;              /* Firefox */
  scrollbar-color: #cbd5e0 #f8f9fa;   /* thumb color + track color */
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;                         /* mảnh gọn */
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f8f9fa;                /* màu nền track */
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;          /* màu thanh kéo */
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #a0aec0;          /* hover đậm hơn */
}
            `}</style>
            <ToastContainer />
        </div>
    );
}
