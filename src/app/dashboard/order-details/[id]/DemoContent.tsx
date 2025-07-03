'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import OrderService, { Order, OrderItem } from '@/data/Services/OrderService';
import UserService, { UserProfile } from '@/data/Services/UserService';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams();
  const orderId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';

  const printRef = useRef<HTMLDivElement>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!orderId) return;

      try {
        const orderRes = await OrderService.getOrderById(orderId);
        const orderData = orderRes.data;
        setOrder(orderData);

        if (orderData.customerId) {
          const userRes = await UserService.getUserById(orderData.customerId);
          setCustomer(userRes.data);
        }
      } catch (error) {
        console.error('Không thể tải chi tiết đơn hàng:', error);
      }
    };

    fetchData();
  }, [orderId]);

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

  if (!order) return <div>Đang tải đơn hàng...</div>;

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
              <div><strong>Trạng thái đơn hàng:</strong> {order.statusId ?? 'Không xác định'}</div>
                {order.deliveryNote && (
                <div><strong>Ghi chú:</strong> {order.deliveryNote}</div>
                )}
            </div>
          </div>
        </div>

        {/* Thông tin thêm về đơn hàng */}


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
              {/* Tổng phụ */}
              {/* <tr>
                <td colSpan={3} className="text-end f-w-600">Tạm tính</td>
                <td className="text-right">{order.subtotal.toLocaleString('vi-VN')}₫</td>
              </tr> */}
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
