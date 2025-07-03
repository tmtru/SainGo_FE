'use client';

import { useAuth } from '@/components/Context/AuthContext';
import OrderService, { Order } from '@/data/Services/OrderService';
import UserAddressService, { UserAddress } from '@/data/Services/UserAddress';
import UserService, { UserProfile } from '@/data/Services/UserService';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const AccountTabs = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [profile, setProfile] = useState<UserProfile>({});
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const { user } = useAuth();
  useEffect(() => {
    // gọi orders từ server
    OrderService.getMyOrders().then(res => setOrders(res.data));
  }, []);
  useEffect(() => {
    UserService.getProfile().then(res => {
      setProfile({
        ...res.data,
        gender: res.data.gender ? res.data.gender : 'other'
      });
    });
    console.log(user?.roleName);
    UserAddressService.getMyAddresses().then(res => setAddresses(res.data));
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    await UserService.updateProfile(profile);
    alert('Thông tin đã được cập nhật!');
  };

  return (
    <div className="account-tab-area-start rts-section-gap">
      <div className="container-2">
        <div className="row">
          <div className="col-lg-3">
            <div className="nav accout-dashborard-nav flex-column nav-pills me-3" role="tablist">
              <button className={`nav-link ${activeTab === 'account' ? 'active' : ''}`} onClick={() => setActiveTab('account')}>
                <i className="fa-regular fa-user"></i> Thông tin cá nhân
              </button>
              <button className={`nav-link ${activeTab === 'address' ? 'active' : ''}`} onClick={() => setActiveTab('address')}>
                <i className="fa-regular fa-location-dot"></i> Địa chỉ giao hàng
              </button>
              <button className={`nav-link ${activeTab === 'order' ? 'active' : ''}`} onClick={() => setActiveTab('order')}>
                <i className="fa-regular fa-bag-shopping"></i> Đơn hàng
              </button>
              <button className={`nav-link ${activeTab === 'track' ? 'active' : ''}`} onClick={() => setActiveTab('track')}>
                <i className="fa-regular fa-tractor"></i> Tra cứu đơn
              </button>
              {user?.roleName === 'Admin' && (
                <Link href="/dashboard" className="nav-link">
                  <i className="fa-regular fa-tachometer-alt"></i> Dashboard
                </Link>
              )}

            </div>
          </div>

          <div className="col-lg-9 pl--50 pl_md--10 pl_sm--10 pt_md--30 pt_sm--30">
            <div className="tab-content">
              {activeTab === 'order' && (
                <div className="order-table-account">
                  <div className="h2 title mb-4">Đơn hàng của bạn</div>
                  {orders.length === 0 ? (
                    <p>Bạn chưa có đơn hàng nào.</p>
                  ) : (
                    <div className="accordion" id="orderAccordion">
                      {orders.map((order, index) => (
                        <div className="accordion-body mb-3 border rounded" key={order.id}>
                          <h2 className="accordion-header" id={`heading-${order.id}`}>
                            <button
                              className={`accordion-button ${expandedOrderId === order.id ? '' : 'collapsed'}`}
                              type="button"
                              style={{ fontSize: '16px' }}
                              onClick={() =>
                                setExpandedOrderId(expandedOrderId === order.id ? null : order.id ?? null)
                              }
                            >
                              <div className="d-flex flex-column text-start">
                                <span><strong>Đơn:</strong> #{order?.id?.slice(0, 8)}</span>
                                <span>
                                  <strong>Ngày:</strong>{' '}
                                  {order?.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'Không xác định'}
                                </span>

                                <span><strong>Trạng thái:</strong> {order.statusId}</span>
                                <span><strong>Tổng tiền:</strong> {order.totalAmount.toLocaleString('vi-VN')}₫</span>
                              </div>
                            </button>
                          </h2>
                          {expandedOrderId === order.id && (
                            <div className="accordion-collapse collapse show">
                              <div className="accordion-body p-3">
                                <h6>Chi tiết sản phẩm</h6>
                                <table className="table table-sm">
                                  <thead>
                                    <tr>
                                      <th>Tên sản phẩm</th>
                                      <th>Số lượng</th>
                                      <th>Đơn giá</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {order.orderItems.map((item) => (
                                      <tr key={item.productId}>
                                        <td>{item.productName}</td>
                                        <td>{item.quantity}</td>
                                        <td>{item.unitPrice.toLocaleString('vi-VN')}₫</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                <div><strong>Địa chỉ giao hàng:</strong> {order.deliveryAddress?.fullAddress} </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}


              {activeTab === 'track' && (
                <div className="tracing-order-account">
                  <h2 className="title">Tra cứu đơn hàng</h2>
                  <form className="order-tracking">
                    <div className="single-input">
                      <label>Order Id</label>
                      <input type="text" placeholder="Tìm trong email xác nhận đơn hàng" required />
                    </div>
                    <div className="single-input">
                      <label>Email đặt hàng</label>
                      <input type="email" placeholder="Email bạn dùng khi thanh toán" />
                    </div>
                    <button className="rts-btn btn-primary" type="submit">Track</button>
                  </form>
                </div>
              )}

              {activeTab === 'address' && (
                <div className="">
                  <h2 className="title">Địa chỉ giao hàng của bạn</h2>
                  {addresses.length === 0 ? (
                    <p>Chưa có địa chỉ nào.</p>
                  ) : (
                    <ul className="list-group">
                      {addresses.map(addr => (
                        <li key={addr.id} className="list-group-item p-4">
                          <strong>{addr.name}</strong><br />
                          {addr.fullAddress}<br />
                          {addr.ward}, {addr.district}, {addr.city}<br />
                          {addr.isDefault && <span className="badge bg-success">Mặc định</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {activeTab === 'account' && (
                <form className="account-details-area" onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
                  <h2 className="title">Thông tin cá nhân</h2>
                  <div className="row">
                    <div className="col-md-3 mb-3 text-center me-5" style={{ maxWidth: '200px' }}>
                      {profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt="Avatar" className="rounded-circle shadow" style={{ width: '100%', aspectRatio: 1, objectFit: 'cover' }} />
                      ) : (
                        <div className="bg-light rounded-circle shadow" style={{ width: '100%', paddingTop: '100%' }} />
                      )}
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        className="d-none"
                        onChange={handleAvatarUpload}
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary  mb-2"
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        Đổi ảnh
                      </button>
                    </div>
                    <div className="col-md-8">
                      <div className="single-input">
                        <label>Họ tên</label>
                        <input type="text" name="fullName" value={profile.fullName || ''} onChange={handleProfileChange} />
                      </div>
                      <div className="single-input">
                        <label>Số điện thoại</label>
                        <input type="text" name="phone" value={profile.phone || ''} onChange={handleProfileChange} />
                      </div>
                      <div className="single-input">
                        <label>Giới tính</label>
                        <select name="gender" value={profile.gender || 'other'} onChange={handleProfileChange}>
                          <option value="all">-- Chọn giới tính --</option>
                          <option value="male">Nam</option>
                          <option value="female">Nữ</option>
                          <option value="other">Khác</option>
                        </select>
                      </div>
                      <div className="single-input">
                        <label>Ngày sinh</label>
                        <input
                          type="date"
                          name="dob"
                          value={profile.dob ?? ''}
                          onChange={(e) =>
                            setProfile((prev) => ({
                              ...prev,
                              dob: e.target.value || undefined, // giữ null/undefined nếu user xóa
                            }))
                          }
                        />
                      </div>


                      <button type="submit" className="rts-btn btn-primary mt-3">Lưu thay đổi</button>
                    </div>
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountTabs;
