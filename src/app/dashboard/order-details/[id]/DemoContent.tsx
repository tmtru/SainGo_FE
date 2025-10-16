'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import OrderService, { Order, OrderItem } from '@/data/Services/OrderService';
import UserService, { UserProfile } from '@/data/Services/UserService';
import { toast } from 'react-toastify';
import CustomLoader from '@/components/common/CustomLoader';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams();
  const orderId = useMemo(() => {
    if (typeof id === 'string') {
      return id;
    }
    if (Array.isArray(id) && id.length > 0) {
      return id[0] ?? '';
    }
    return '';
  }, [id]);

  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<UserProfile | null>(null);
  const [orderStatuses, setOrderStatuses] = useState<{ id: string; name: string }[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  const formatCurrency = useCallback((value?: number | null) => {
    if (value === undefined || value === null || Number.isNaN(value)) {
      return '0₫';
    }
    return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  }, []);

  const formatDate = useCallback((value?: string | null) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleDateString('vi-VN');
  }, []);

  const formatDateTime = useCallback((value?: string | null) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleString('vi-VN');
  }, []);

  const humanize = useCallback((value?: string | null) => {
    if (!value) return '';
    return value
      .split(/[_-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }, []);

  const getStatusBadgeClass = useCallback((status?: string | null) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'badge bg-warning text-dark';
      case 'confirmed':
      case 'processing':
        return 'badge bg-info text-white';
      case 'delivered':
      case 'completed':
        return 'badge bg-success text-white';
      case 'cancelled':
      case 'canceled':
      case 'expired':
        return 'badge bg-danger text-white';
      default:
        return 'badge bg-secondary text-white';
    }
  }, []);

  const getPaymentStatusBadgeClass = useCallback((status?: string | null) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'badge bg-success text-white';
      case 'pending':
      case 'unpaid':
        return 'badge bg-warning text-dark';
      case 'failed':
      case 'refunded':
        return 'badge bg-danger text-white';
      default:
        return 'badge bg-secondary text-white';
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!orderId) return;

      try {
        const [orderRes, statusesRes] = await Promise.all([
          OrderService.getOrderById(orderId),
          OrderService.getOrderStatuses(),
        ]);

        const orderData = orderRes.data;
        setOrder(orderData);
        setSelectedStatus(orderData.statusId || '');
        setOrderStatuses(statusesRes.data);

        if (orderData.customerId) {
          try {
            const userRes = await UserService.getUserById(orderData.customerId);
            setCustomer(userRes.data);
          } catch (error) {
            console.warn('Không thể tải thông tin khách hàng:', error);
          }
        }
      } catch (error) {
        console.error('Không thể tải chi tiết đơn hàng:', error);
        toast.error('Không thể tải chi tiết đơn hàng.');
      }
    };

    fetchData();
  }, [orderId]);

  const handleStatusUpdate = async () => {
    if (!orderId || !selectedStatus || selectedStatus === order?.statusId) return;

    setIsUpdating(true);
    try {
      await OrderService.updateOrderStatus({
        orderId,
        statusId: selectedStatus,
      });

      setOrder((prev) => (prev ? { ...prev, statusId: selectedStatus } : prev));
      toast.success('Cập nhật trạng thái đơn hàng thành công!');
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái:', error);
      toast.error('Không thể cập nhật trạng thái đơn hàng.');
      setSelectedStatus(order?.statusId || '');
    } finally {
      setIsUpdating(false);
    }
  };

  const currentStatusLabel = useMemo(() => {
    if (!order?.statusId) {
      return 'Không xác định';
    }
    const status = orderStatuses.find((s) => s.id === order.statusId);
    return status?.name ?? humanize(order.statusId);
  }, [humanize, order?.statusId, orderStatuses]);

  const paymentStatusLabel = useMemo(() => {
    return order?.paymentStatus ? humanize(order.paymentStatus) : 'Không xác định';
  }, [humanize, order?.paymentStatus]);

  const scheduleLabel = useMemo(() => {
    if (!order) return '';
    const parts: string[] = [];
    if (order.preferredDeliveryDate) {
      parts.push(formatDate(order.preferredDeliveryDate));
    }
    if (order.preferredTimeSlot) {
      parts.push(order.preferredTimeSlot);
    }
    if (parts.length === 0 && order.requestedDeliveryTime) {
      parts.push(order.requestedDeliveryTime);
    }
    return parts.join(' • ');
  }, [formatDate, order]);

  const timeline = useMemo(() => {
    if (!order) return [];
    const steps: { label: string; value: string }[] = [];

    if (order.createdAt) {
      steps.push({ label: 'Tạo đơn', value: formatDateTime(order.createdAt) });
    }
    if (order.paidAt) {
      steps.push({ label: 'Thanh toán', value: formatDateTime(order.paidAt) });
    }
    if (order.estimatedDeliveryTime) {
      steps.push({ label: 'Dự kiến giao', value: formatDateTime(order.estimatedDeliveryTime) });
    } else if (scheduleLabel) {
      steps.push({ label: 'Lịch khách yêu cầu', value: scheduleLabel });
    }
    if (order.actualDeliveryTime) {
      steps.push({ label: 'Giao thành công', value: formatDateTime(order.actualDeliveryTime) });
    }
    if (order.cancellationReason) {
      steps.push({ label: 'Huỷ đơn', value: order.cancellationReason });
    }

    return steps;
  }, [formatDateTime, order, scheduleLabel]);

  if (!order) {
    return <CustomLoader />;
  }

  const orderCode = order.orderNumber ? `#${order.orderNumber}` : `#${order.id}`;
  const totalItems = order.orderItems?.length ?? 0;
  const totalQuantity = order.orderItems?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const subtotal = order.subtotal ?? order.totalAmount ?? 0;
  const deliveryFee = order.deliveryFee ?? 0;
  const serviceFee = order.serviceFee ?? 0;
  const taxAmount = order.taxAmount ?? 0;
  const discountAmount = order.discountAmount ?? 0;

  const receiverName = order.deliveryAddress?.name || order.customerName || customer?.fullName || 'Không xác định';
  const receiverPhone =
    order.deliveryPhone ||
    order.deliveryAddress?.phoneNumber ||
    order.customerPhone ||
    customer?.phone ||
    'Không xác định';

  const statusBadgeClass = getStatusBadgeClass(order.statusId);
  const paymentBadgeClass = getPaymentStatusBadgeClass(order.paymentStatus);

  return (
    <div className="body-root-inner">
      <div className="transection">
        <div className="title-right-actioin-btn-wrapper-product-list d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
          <div>
            <h3 className="title mb-2">Đơn hàng {orderCode}</h3>
            <p className="text-muted small mb-0">Bảng điều khiển / Đơn hàng / {orderCode}</p>
          </div>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <span className={statusBadgeClass}>{currentStatusLabel}</span>
            <span className={paymentBadgeClass}>{paymentStatusLabel}</span>
            {order.shipperName && (
              <span className="badge bg-light text-dark border">
                Shipper: {order.shipperName}
              </span>
            )}
          </div>
        </div>

        <div className="billing-address-area-4 mt-4 mb-4">
          <h4 className="title">Cập nhật trạng thái đơn hàng</h4>
          <div className="status-update-section">
            <div className="row align-items-end g-3">
              <div className="col-md-4">
                <p className="form-label mb-1">Trạng thái hiện tại:</p>
                <p className="current-status">
                  <strong>{currentStatusLabel}</strong>
                </p>
              </div>
              <div className="col-md-4">
                <label htmlFor="statusSelect" className="form-label">
                  Chọn trạng thái mới:
                </label>
                <select
                  id="statusSelect"
                  className="form-control"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  disabled={isUpdating}
                >
                  <option value="">-- Chọn trạng thái --</option>
                  {orderStatuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4 d-flex align-items-center gap-2">
                <button
                  className="rts-btn btn-primary radious-sm"
                  onClick={handleStatusUpdate}
                  disabled={isUpdating || !selectedStatus || selectedStatus === order.statusId}
                >
                  {isUpdating ? 'Đang cập nhật...' : 'Cập nhật trạng thái'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-lg-4 col-md-6">
            <div className="single-over-fiew-card h-100">
              <span className="top-main">Tổng quan</span>
              <div className="bottom pt-3">
                <ul className="list-unstyled small mb-0">
                  <li className="d-flex justify-content-between py-1">
                    <span>Mã đơn</span>
                    <span className="fw-semibold">{orderCode}</span>
                  </li>
                  <li className="d-flex justify-content-between py-1">
                    <span>Ngày đặt</span>
                    <span>{formatDateTime(order.createdAt) || '—'}</span>
                  </li>
                  <li className="d-flex justify-content-between py-1">
                    <span>Số sản phẩm</span>
                    <span>{totalItems}</span>
                  </li>
                  <li className="d-flex justify-content-between py-1">
                    <span>Tổng số lượng</span>
                    <span>{totalQuantity}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6">
            <div className="single-over-fiew-card h-100">
              <span className="top-main">Thanh toán</span>
              <div className="bottom pt-3">
                <ul className="list-unstyled small mb-0">
                  <li className="d-flex justify-content-between py-1">
                    <span>Phương thức</span>
                    <span className="fw-semibold">{order.paymentMethod || 'Không xác định'}</span>
                  </li>
                  <li className="d-flex justify-content-between py-1">
                    <span>Trạng thái</span>
                    <span className="fw-semibold">{paymentStatusLabel}</span>
                  </li>
                  {order.paidAt && (
                    <li className="d-flex justify-content-between py-1">
                      <span>Thanh toán lúc</span>
                      <span>{formatDateTime(order.paidAt)}</span>
                    </li>
                  )}
                  {order.couponCode && (
                    <li className="d-flex justify-content-between py-1">
                      <span>Mã giảm giá</span>
                      <span className="text-success fw-semibold">{order.couponCode}</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-12">
            <div className="single-over-fiew-card h-100">
              <span className="top-main">Giao hàng</span>
              <div className="bottom pt-3">
                <ul className="list-unstyled small mb-0">
                  <li className="py-1">
                    <span className="d-block text-muted">Người nhận</span>
                    <span className="fw-semibold">{receiverName}</span>
                  </li>
                  <li className="py-1">
                    <span className="d-block text-muted">Số điện thoại</span>
                    <a href={`tel:${receiverPhone}`} className="fw-semibold">
                      {receiverPhone}
                    </a>
                  </li>
                  <li className="py-1">
                    <span className="d-block text-muted">Địa chỉ</span>
                    <span className="d-block">{order.deliveryAddress?.fullAddress || 'Không có địa chỉ'}</span>
                  </li>
                  {scheduleLabel && (
                    <li className="py-1">
                      <span className="d-block text-muted">Lịch yêu cầu</span>
                      <span className="fw-semibold">{scheduleLabel}</span>
                    </li>
                  )}
                  {order.estimatedDeliveryTime && (
                    <li className="py-1">
                      <span className="d-block text-muted">Dự kiến giao</span>
                      <span>{formatDateTime(order.estimatedDeliveryTime)}</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {customer && (
          <div className="customers-details-wrapper-one-dashboard mb-4">
            <h4 className="title">Thông tin khách hàng</h4>
            <div className="main-customers-details-top">
              <div className="left">
                <img src="/assets/images-dashboard/avatar/03.png" alt="avatar" />
                <div className="information-area">
                  <h4 className="name">{customer.fullName}</h4>
                  <span className="designation">Khách hàng</span>
                </div>
              </div>
              <div className="right-area">
                <div className="short-contact-info">
                  <p className="name">Email</p>
                  <a href={`mailto:${customer.email}`}>{customer.email || 'Không có'}</a>
                </div>
                <div className="short-contact-info">
                  <p className="name">Số điện thoại</p>
                  <a href={`tel:${customer.phone}`}>{customer.phone || 'Không có'}</a>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="billing-address-area-4 mb-4">
          <h4 className="title">Ghi chú & hướng dẫn</h4>
          <div className="row g-3">
            <div className="col-md-6">
              <div className="border rounded-3 p-3 h-100">
                <p className="fw-semibold mb-2">Ghi chú giao hàng</p>
                <p className="mb-0 text-muted">
                  {order.deliveryNote || order.specialInstructions || 'Không có ghi chú'}
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="border rounded-3 p-3 h-100">
                <p className="fw-semibold mb-2">Trạng thái bổ sung</p>
                <p className="mb-0 text-muted">
                  {order.cancellationReason ? (
                    <span className="text-danger">Huỷ đơn: {order.cancellationReason}</span>
                  ) : (
                    'Không có thông tin bổ sung'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="order-details-table-1-table table-responsive">
          <h4 className="title">Chi tiết đơn hàng</h4>
          <table className="table order-details-table table-responsive">
            <thead className="bg-active">
              <tr>
                <th>Sản phẩm</th>
                <th className="text-center">Đơn giá</th>
                <th className="text-center">Số lượng</th>
                <th className="text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems.map((item: OrderItem) => (
                <tr key={`${item.productId}-${item.productVariantId ?? ''}`}>
                  <td>
                    <div className="d-flex flex-column">
                      <span className="fw-semibold">{item.productName}</span>
                      {item.productVariantId && (
                        <span className="text-muted small">Mã biến thể: {item.productVariantId}</span>
                      )}
                    </div>
                  </td>
                  <td className="text-center">{formatCurrency(item.unitPrice)}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-right">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </td>
                </tr>
              ))}

              <tr>
                <td colSpan={3} className="text-end f-w-600">Tạm tính</td>
                <td className="text-right">{formatCurrency(subtotal)}</td>
              </tr>
              {deliveryFee > 0 && (
                <tr>
                  <td colSpan={3} className="text-end">Phí giao hàng</td>
                  <td className="text-right">{formatCurrency(deliveryFee)}</td>
                </tr>
              )}
              {serviceFee > 0 && (
                <tr>
                  <td colSpan={3} className="text-end">Phí dịch vụ</td>
                  <td className="text-right">{formatCurrency(serviceFee)}</td>
                </tr>
              )}
              {taxAmount > 0 && (
                <tr>
                  <td colSpan={3} className="text-end">Thuế</td>
                  <td className="text-right">{formatCurrency(taxAmount)}</td>
                </tr>
              )}
              {discountAmount > 0 && (
                <tr>
                  <td colSpan={3} className="text-end text-success f-w-600">Giảm giá</td>
                  <td className="text-right text-success">-{formatCurrency(discountAmount)}</td>
                </tr>
              )}
              <tr>
                <td colSpan={3} className="text-end f-w-600">Tổng cộng</td>
                <td className="text-right f-w-600">{formatCurrency(order.totalAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {timeline.length > 0 && (
          <div className="billing-address-area-4 mt-4">
            <h4 className="title">Mốc thời gian</h4>
            <ul className="list-group">
              {timeline.map((item) => (
                <li key={item.label} className="list-group-item d-flex justify-content-between align-items-center flex-column flex-md-row">
                  <span className="text-muted mb-2 mb-md-0">{item.label}</span>
                  <span className="fw-semibold text-dark text-md-end">{item.value}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailPage;