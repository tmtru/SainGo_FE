"use client";

import React, { useEffect, useState } from "react";
import { useCart } from "@/components/header/CartContext";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import UserAddressService from "@/data/Services/UserAddress";
import OrderService from "@/data/Services/OrderService";
import ShippingService from "@/data/Services/ShippingService";
import UserCouponService from "@/data/Services/UserCouponService";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "@/components/Context/AuthContext";
import { set } from "lodash";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaPhone,
  FaCommentDots,
  FaTicketAlt,
  FaCreditCard,
  FaMoneyBillWave,
} from "react-icons/fa"; // Import icons

function formatCurrency(value: number) {
  return value.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
}

// Helper function to get the next 24 hours in 30-minute intervals
const getDeliveryTimeSlots = () => {
  const now = new Date();
  const slots = [];
  // Start from the next 30-minute mark
  let current = new Date(now.getTime());
  current.setMinutes(current.getMinutes() + (30 - (current.getMinutes() % 30)));
  current.setSeconds(0);
  current.setMilliseconds(0);

  for (let i = 0; i < 48; i++) {
    // 48 slots for 24 hours (30 min intervals)
    const displayTime = current.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    slots.push(displayTime);
    current.setMinutes(current.getMinutes() + 30);
  }
  return slots;
};

export default function CheckOutMain() {
  const { cartItems, clearCart } = useCart();
  const router = useRouter();
  const [leadTime, setLeadTime] = useState<string | null>(null);

  const [defaultAddress, setDefaultAddress] = useState<any>(null);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [loadingShipping, setLoadingShipping] = useState(false);

  // --- NEW/UPDATED STATE FOR USER INPUT ---
  const [billingInfo, setBillingInfo] = useState({
    name: "",
    phone: "", // Added phone to billingInfo
    fullAddress: "",
  });

  const [deliveryType, setDeliveryType] = useState<"regular" | "preorder">(
    "regular"
  ); // 'regular' or 'preorder'
  const [preOrderTime, setPreOrderTime] = useState(""); // Selected delivery time for pre-order
  const [notes, setNotes] = useState(""); // Added notes/special instructions
  // ----------------------------------------

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
  const timeSlots = getDeliveryTimeSlots(); // Get time slots

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

  // Apply coupon function - (kept the same)
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
        orderAmount: subtotal,
      });
      console.log("Coupon response:", res);

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

  // Remove coupon function - (kept the same)
  const removeCoupon = () => {
    setCoupon("");
    setDiscount(0);
    setCouponMessage("");
    setCouponApplied(false);
    localStorage.removeItem("coupon");
    localStorage.removeItem("discount");
    toast.info("🗑️ Đã xóa mã giảm giá");
  };

  // Fetch default address and set initial billingInfo/phone
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
        // Set initial phone and name from default address/user
        setBillingInfo((prev) => ({
          ...prev,
          phone: user.phone || "",
          name: user.fullName || "",
        }));
      } catch (err) {
        console.warn("Không có địa chỉ mặc định");
        setBillingInfo((prev) => ({
          ...prev,
          phone: user.phone || "",
          name: user.fullName || "",
        }));
      } finally {
        setLoadingAddress(false);
      }
    };

    fetchDefaultAddress();
  }, [user]);

  // Calculate shipping fee and lead time - (kept the same logic, depends on defaultAddress)
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
          const leadTimeRes = await ShippingService.calculateDeliveryTime(
            request
          );

          const date = new Date(leadTimeRes.data);

          const formattedDate = date.toLocaleDateString("vi-VN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });

          console.log("Ngày giao hàng dự kiến:", formattedDate);

          setLeadTime(formattedDate);
        } catch (err) {
          toast.warn(
            "Khu vực bạn không hỗ trợ giao hàng. Vui lòng chọn khu vực khác."
          );
          setShippingFee(0);
          setLeadTime(null);
        } finally {
          setLoadingShipping(false);
        }
      } else {
        setShippingFee(0); // No address, no shipping fee calculation
        setLeadTime(null);
      }
    };

    calculateShipping();
  }, [defaultAddress]);

  // Handle input change for general billing info (Name, FullAddress, Phone)
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setBillingInfo((prev) => ({ ...prev, [id]: value }));
  };

  // Handle placing the order
  const handlePlaceOrder = async () => {
    if (!billingInfo.phone || (deliveryType === "preorder" && !preOrderTime)) {
      toast.error(
        "Vui lòng nhập số điện thoại và chọn thời gian giao hàng (nếu đặt trước)."
      );
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
        // --- NEW FIELDS FOR ORDER OBJECT ---
        deliveryPhone: billingInfo.phone, // Use phone from state
        specialInstructions: notes, // Use notes from state
        preferredTimeSlot:
          deliveryType === "preorder" ? preOrderTime : undefined, // Pre-order time
        // ----------------------------------
      };

      // Address logic (unchanged)
      if (defaultAddress) {
        order.deliveryAddressId = defaultAddress.id;
        order.deliveryName = defaultAddress.name; // Gán thêm deliveryName
      } else {
        if (!billingInfo.fullAddress || !billingInfo.name) {
          toast.error(
            "Vui lòng tạo địa chỉ hoặc nhập đầy đủ thông tin giao hàng."
          );
          setError("Vui lòng tạo địa chỉ mặc định trước khi thanh toán.");
          return;
        }
        order.deliveryAddressText = billingInfo.fullAddress;
        order.deliveryName = billingInfo.name; // Use name from state
      }

      // Tạo đơn hàng
      const res = await OrderService.createOrder(order);
      const createdOrder = res.data;
      const orderId = createdOrder.id;
      console.log("Đơn hàng đã tạo:", createdOrder);
      if (!orderId) {
        toast.error("❌ Không thể tạo đơn hàng. Vui lòng thử lại sau.");
        return;
      }

      if (paymentMethod === "momo") {
        const momoRes = await OrderService.createMomoPayment(orderId);
        const payUrl = momoRes.data;
        console.log("Link thanh toán Momo:", payUrl);

        if (payUrl) {
          toast.success("✅ Chuyển sang Momo để thanh toán...");
          window.location.href = payUrl;
        } else {
          toast.error("❌ Không lấy được link thanh toán Momo.");
        }
      } else {
        clearCart();
        toast.success("🎉 Đặt hàng thành công!");
        localStorage.removeItem("coupon");
        localStorage.removeItem("discount");
        // router.push(`/`); // Redirect to a success page (or home as before)
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
          <div
            className="col-lg-8 p--20 order-2 order-xl-1"
            style={{ padding: "0 40px", border: "none" }}
          >
            {/* 1. Địa chỉ Giao hàng */}
            <div className="mb-5 p-4 border rounded-3 shadow-sm bg-white">
              <h3 className="mb-4 d-flex align-items-center">
                <FaMapMarkerAlt className="me-2 text-primary" /> Địa chỉ giao
                hàng
              </h3>
              {loadingAddress ? (
                <p className="text-muted">Đang tải địa chỉ mặc định...</p>
              ) : defaultAddress ? (
                <div className="p-3 border rounded bg-light">
                  <p className="mb-1">
                    <strong>{defaultAddress.name}</strong> -{" "}
                    <span>{defaultAddress.phone}</span>
                  </p>
                  <p className="mb-0">{defaultAddress.fullAddress}</p>
                  <button
                    className="rts-btn btn-primary btn-sm mt-3"
                    onClick={() => router.push("/account")}
                  >
                    {" "}
                    Thay đổi địa chỉ
                  </button>
                </div>
              ) : (
                <div
                  className="p-3 border rounded"
                  style={{ borderColor: "var(--rts-color-danger) !important" }}
                >
                  <p className="mb-2 text-danger">
                    <strong>Không có địa chỉ mặc định.</strong>
                  </p>
                  <p className="mb-3 small text-muted">
                    Vui lòng ấn vào tạo địa chỉ mới để tính phí vận chuyển và
                    hoàn tất đơn hàng.
                  </p>

                  <div className="form-group mb-3">
                    <label htmlFor="name" className="form-label small fw-bold">
                      Tên người nhận *
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="form-control"
                      placeholder="Tên người nhận"
                      value={billingInfo.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <button
                    className="rts-btn btn-primary btn-sm"
                    onClick={() => router.push("/account")}
                  >
                    {" "}
                    Quản lý/Tạo địa chỉ
                  </button>
                </div>
              )}
            </div>

            {/* 2. Thông tin Liên hệ và Giao hàng */}
            <div className="mb-5 p-4 border rounded-3 shadow-sm bg-white">
              <h3 className="mb-4 d-flex align-items-center">
                <FaCalendarAlt className="me-2 text-primary" /> Thông tin giao
                nhận
              </h3>

              {/* Số điện thoại */}
              <div className="form-group mb-4">
                <label
                  htmlFor="phone"
                  className="form-label d-flex align-items-center small fw-bold"
                >
                  <FaPhone className="me-2 text-secondary" /> Số điện thoại nhận
                  hàng *
                </label>
                <input
                  type="text"
                  id="phone"
                  className="form-control form-control-lg"
                  placeholder="Nhập số điện thoại"
                  value={billingInfo.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Lựa chọn giao hàng */}
              <div className="mb-4 border-top pt-3">
                <label className="form-label d-flex align-items-center small fw-bold mb-3">
                  <FaClock className="me-2 text-secondary" /> Thời gian giao
                  hàng
                </label>
                <div className="d-flex gap-4">
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="deliveryType"
                      id="regularDelivery"
                      value="regular"
                      checked={deliveryType === "regular"}
                      onChange={() => {
                        setDeliveryType("regular");
                        setPreOrderTime("");
                      }}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="regularDelivery"
                    >
                      Giao hàng sớm nhất
                    </label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="deliveryType"
                      id="preorderDelivery"
                      value="preorder"
                      checked={deliveryType === "preorder"}
                      onChange={() => setDeliveryType("preorder")}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="preorderDelivery"
                    >
                      Đặt giao hàng trước
                    </label>
                  </div>
                </div>

                {/* Pre-order Time Picker */}
                {deliveryType === "preorder" && (
                  <div className="mt-3 form-group w-50">
                    <label
                      htmlFor="preOrderTime"
                      className="form-label small fw-bold"
                    >
                      Chọn giờ giao hàng *
                    </label>
                    <select
                      id="preOrderTime"
                      className="form-control form-control-lg"
                      value={preOrderTime}
                      onChange={(e) => setPreOrderTime(e.target.value)}
                      required
                    >
                      <option value="">-- Chọn giờ --</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Ghi chú */}
              <div className="form-group border-top pt-3">
                <label
                  htmlFor="notes"
                  className="form-label d-flex align-items-center small fw-bold"
                >
                  <FaCommentDots className="me-2 text-secondary" /> Ghi chú (tùy
                  chọn)
                </label>
                <textarea
                  id="notes"
                  className="form-control"
                  rows={3}
                  placeholder="Ví dụ: Giao sau 18h, Không gọi điện khi đến nơi,..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
              </div>
            </div>

            {/* 3. Phương thức Thanh toán */}
            <div className="mb-5 p-4 border rounded-3 shadow-sm bg-white">
              <h3 className="mb-4 d-flex align-items-center">
                <FaCreditCard className="me-2 text-primary" /> Phương thức thanh
                toán *
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
                        checked={paymentMethod === "cash"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <label
                        className="form-check-label d-flex align-items-center"
                        htmlFor="cashOption"
                      >
                        <FaMoneyBillWave className="me-2 text-success" /> Thanh
                        toán khi nhận hàng (COD)
                      </label>
                    </div>
                  </li>
                  {/* Có thể thêm các option thanh toán khác ở đây */}
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

              {/* Coupon Section (CHUYỂN SANG CỘT PHẢI) */}
              <div className="coupon-section mb-4 p-3 border rounded-3 bg-light">
                <div className="d-flex align-items-center mb-3">
                  <FaTicketAlt
                    className="text-primary me-2"
                    style={{ fontSize: "1.2rem" }}
                  />
                  <h6 className="mb-0 fw-bold">Mã giảm giá</h6>
                </div>

                {!couponApplied ? (
                  <form onSubmit={applyCoupon}>
                    <div className="d-flex gap-5">
                      <input
                        type="text"
                        placeholder="Nhập mã giảm giá"
                        className="form-control"
                        value={coupon}
                        onChange={(e) => {
                          setCoupon(e.target.value.toUpperCase());
                          setCouponMessage("");
                        }}
                        disabled={isApplyingCoupon}
                      />
                      <button
                        type="submit"
                        className="rts-btn btn-primary"
                        disabled={isApplyingCoupon || !coupon.trim()}
                      >
                        {isApplyingCoupon ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                              aria-hidden="true"
                            ></span>
                          </>
                        ) : (
                          "Áp dụng"
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="coupon-applied-state">
                    <div className="d-flex align-items-center justify-content-between p-2 bg-success bg-opacity-10 border border-success rounded-3">
                      <div className="d-flex align-items-center">
                        <i className="fa-solid fa-check-circle text-success me-2"></i>
                        <div>
                          <strong className="text-success small">
                            Mã "{coupon}" đã áp dụng
                          </strong>
                          <div className="small text-muted">
                            Giảm {formatCurrency(discount)}
                          </div>
                        </div>
                      </div>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={removeCoupon}
                        title="Xóa mã giảm giá"
                        style={{
                          width: "30px",
                          height: "30px",
                          padding: "0",
                          lineHeight: "1",
                        }}
                      >
                        <i className="fa-solid fa-times"></i>
                      </button>
                    </div>
                  </div>
                )}

                {couponMessage && !couponApplied && (
                  <div className="mt-2">
                    <div
                      className="alert alert-danger alert-dismissible fade show mb-0 small py-2 px-3"
                      role="alert"
                    >
                      <i className="fa-solid fa-exclamation-triangle me-2"></i>
                      {couponMessage}
                    </div>
                  </div>
                )}
              </div>
              {/* END Coupon Section */}

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
              <div
                className="single-shop-list mb-3"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <strong className="">Tổng cộng</strong>
                <strong className="price text-primary">
                  {formatCurrency(finalTotal)}
                </strong>
              </div>

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
                  defaultAddress === null ||
                  !billingInfo.phone || // Must have phone
                  (deliveryType === "preorder" && !preOrderTime) // Must pick time for preorder
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
          background-color: #f7f7f7; /* Nền nhẹ nhàng */
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
        .rts-btn.btn-primary {
          /* Giữ màu sắc và style của nút chính */
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
      `}</style>
    </div>
  );
}
