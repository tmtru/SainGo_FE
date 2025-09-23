'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import OrderService, { Order, OrderItem } from '@/data/Services/OrderService';
import UserService, { UserProfile } from '@/data/Services/UserService';
import { toast } from 'react-toastify';
import CustomLoader from '@/components/common/CustomLoader';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams();
  const orderId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';

  const printRef = useRef<HTMLDivElement>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<UserProfile | null>(null);
  const [orderStatuses, setOrderStatuses] = useState<{ id: string; name: string }[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!orderId) return;

      try {
        // Fetch order details
        const orderRes = await OrderService.getOrderById(orderId);
        const orderData = orderRes.data;
        setOrder(orderData);
        setSelectedStatus(orderData.statusId || '');

        // Fetch customer details
        if (orderData.customerId) {
          const userRes = await UserService.getUserById(orderData.customerId);
          setCustomer(userRes.data);
        }

        // Fetch order statuses
        const statusesRes = await OrderService.getOrderStatuses();
        setOrderStatuses(statusesRes.data);
      } catch (error) {
        console.error('Không thể tải chi tiết đơn hàng:', error);
      }
    };

    fetchData();
  }, [orderId]);

  const handleStatusUpdate = async () => {
    if (!orderId || !selectedStatus || selectedStatus === order?.statusId) return;

    setIsUpdating(true);
    try {
      await OrderService.updateOrderStatus({
        orderId: orderId,
        statusId: selectedStatus
      });

      if (order) {
        setOrder({ ...order, statusId: selectedStatus });
      }

      toast.success('Cập nhật trạng thái đơn hàng thành công!');
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái:', error);
      toast.error('Không thể cập nhật trạng thái đơn hàng.');
      // Reset selected status to current order status
      setSelectedStatus(order?.statusId || '');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const content = printRef.current.innerHTML;
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write('<html><head><title>In đơn hàng</title></head><body>');
      printWindow.document.write(content);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getCurrentStatusName = () => {
    const currentStatus = orderStatuses.find(status => status.id === order?.statusId);
    return currentStatus ? currentStatus.name : order?.statusId || 'Không xác định';
  };

  if (!order) return <CustomLoader  />;

  return (
    <div ref={printRef} className="body-root-inner">
      <div className="transection">
        <div className="title-right-actioin-btn-wrapper-product-list">
          <h3 className="title">Đơn hàng #{order.id}</h3>
        </div>

        <div className="product-top-filter-area-l">
          <div className="left-area-button-fiulter">
            <p>Bảng điều khiển / Đơn hàng / #{order.id}</p>
          </div>
        </div>

        {/* Cập nhật trạng thái đơn hàng */}
        <div className="billing-address-area-4 mb-4">
          <h4 className="title">Cập nhật trạng thái đơn hàng</h4>
          <div className="status-update-section">
            <div className="row align-items-end">
              <div className="col-md-4">
                <label className="form-label">Trạng thái hiện tại:</label>
                <p className="current-status"><strong>{getCurrentStatusName()}</strong></p>
              </div>
              <div className="col-md-4">
                <label htmlFor="statusSelect" className="form-label">Chọn trạng thái mới:</label>
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
              <div className="col-md-4">
                <button
                  className="rts-btn btn-primary radious-sm"
                  onClick={handleStatusUpdate}
                  disabled={isUpdating || !selectedStatus || selectedStatus === order?.statusId}
                >
                  {isUpdating ? 'Đang cập nhật...' : 'Cập nhật trạng thái'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Thông tin khách hàng */}
        {customer && (
          <div className="customers-details-wrapper-one-dashboard">
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
                  <a href={`mailto:${customer.email}`}>{customer.email}</a>
                </div>
                <div className="short-contact-info">
                  <p className="name">Số điện thoại</p>
                  <a href={`tel:${customer.phone}`}>{customer.phone}</a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Thông tin đơn hàng */}
        <div className="billing-address-area-4">
          <h4 className="title">Thông tin đơn hàng</h4>
          <div className="">
            <div className="">
              <div>
                <strong>Địa chỉ:</strong>{' '}
                {order.deliveryAddress?.fullAddress || 'Không có địa chỉ'}
              </div>
              <div><strong>Thời gian đặt hàng:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'Không xác định'}</div>
              <div><strong>Phương thức thanh toán:</strong> {order.paymentMethod}</div>
              <div><strong>Trạng thái đơn hàng:</strong> {getCurrentStatusName()}</div>
              {order.deliveryNote && (
                <div><strong>Ghi chú:</strong> {order.deliveryNote}</div>
              )}
            </div>
          </div>
        </div>

        {/* Bảng sản phẩm */}
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
                <tr key={item.productId}>
                  <td>{item.productName}</td>
                  <td className="text-center">{item.unitPrice.toLocaleString('vi-VN')}₫</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-right">
                    {(item.unitPrice * item.quantity).toLocaleString('vi-VN')}₫
                  </td>
                </tr>
              ))}
              {/* Giảm giá */}
              {order.discountAmount && (
                <tr>
                  <td colSpan={3} className="text-end f-w-600">Giảm giá</td>
                  <td className="text-right">-{order.discountAmount.toLocaleString('vi-VN')}₫</td>
                </tr>
              )}
              {/* Tổng cộng */}
              <tr>
                <td colSpan={3} className="text-end f-w-600">Tổng cộng</td>
                <td className="text-right f-w-600">{order.totalAmount.toLocaleString('vi-VN')}₫</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Nút in */}
        {/* <div className="buttons-area-invoice no-print mb--30">
          <button className="rts-btn btn-primary radious-sm with-icon" onClick={handlePrint}>
            <div className="btn-text">In đơn hàng</div>
            <div className="arrow-icon">
              <i className="fa-regular fa-print" />
            </div>
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default OrderDetailPage;