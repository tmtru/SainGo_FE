'use client';

import { useAuth } from '@/components/Context/AuthContext';
import GhnService from '@/data/Services/GhnService';
import OrderService, { Order } from '@/data/Services/OrderService';
import UserAddressService, { UserAddress } from '@/data/Services/UserAddress';
import UserService, { UserProfile } from '@/data/Services/UserService';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

const AccountTabs = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [profile, setProfile] = useState<UserProfile>({});
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const { user } = useAuth();

  // State cho modal
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [newAddress, setNewAddress] = useState<UserAddress>({
    userId: '',
    name: '',
    fullAddress: '',
    city: '',
    district: '',
    ward: '',
    isDefault: false,
  });

  type DropdownOption = {
    id: string;
    name: string;
  };

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [selectedWardId, setSelectedWardId] = useState<any | null>(null);

  useEffect(() => {
    OrderService.getMyOrders().then(res => setOrders(res.data));
  }, []);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await GhnService.getProvinces();
        console.log('Provinces:', res);
        setProvinces(res.data);
      } catch (error) {
        console.error("Lỗi khi tải tỉnh/thành:", error);
      }
    };
    fetchProvinces();
  }, []);

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

  useEffect(() => {
    UserService.getProfile().then(res => {
      setProfile({
        ...res.data,
        gender: res.data.gender ? res.data.gender : 'other'
      });
    });
    console.log(user?.roleName);
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const res = await UserAddressService.getMyAddresses();
      setAddresses(res.data);
    } catch (error) {
      console.error('Lỗi khi tải địa chỉ:', error);
    }
  };

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
    toast.success('Cập nhật thông tin thành công!');
  };

  const handleNewAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewAddress((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const resetAddressForm = () => {
    setNewAddress({
      userId: '',
      name: '',
      fullAddress: '',
      city: '',
      district: '',
      ward: '',
      isDefault: false,
    });
    setSelectedProvinceId(null);
    setSelectedDistrictId(null);
    setSelectedWardId(null);
    setDistricts([]);
    setWards([]);
  };

  const handleOpenAddressModal = () => {
    resetAddressForm();
    setShowAddressModal(true);
  };

  const handleCloseAddressModal = () => {
    setShowAddressModal(false);
    resetAddressForm();
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!newAddress.name || !newAddress.fullAddress || !newAddress.city || !newAddress.district) {
        toast.error('Vui lòng điền đầy đủ thông tin địa chỉ');
        return;
      }

      const selectedProvince = provinces.find(p => p.provinceID === selectedProvinceId);
      const selectedDistrict = districts.find(d => d.districtID === selectedDistrictId);
      const selectedWard = wards.find(w => w.wardCode === selectedWardId);
      console.log("Selected Address:", selectedDistrict, selectedWard);
      const stringifiedAddress: UserAddress = {
        userId: '',
        name: newAddress.name,
        fullAddress: newAddress.fullAddress + ", " + (selectedWard.wardName) + ", " + (selectedDistrict?.districtName || '') + ", " + (selectedProvince?.provinceName || ''),
        city: selectedProvince?.provinceName ?? '',
        district: selectedDistrict?.districtID.toString() ?? '',
        ward: selectedWardId ?? '',
        isDefault: false,
      };


      await UserAddressService.addAddress(stringifiedAddress);
      await loadAddresses();
      handleCloseAddressModal();
      toast.success('Đã thêm địa chỉ mới thành công!');
    } catch (error) {
      console.error('Lỗi khi thêm địa chỉ:', error);
      toast.error('Không thể thêm địa chỉ. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này không?')) {
      return;
    }

    try {
      await UserAddressService.deleteAddress(addressId);
      await loadAddresses();
      toast.success('Đã xóa địa chỉ thành công!');
    } catch (error) {
      console.error('Lỗi khi xóa địa chỉ:', error);
      toast.error('Không thể xóa địa chỉ. Vui lòng thử lại.');
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      await UserAddressService.setDefaultAddress(addressId);
      await loadAddresses();
      toast.success('Đã đặt làm địa chỉ mặc định!');
    } catch (error) {
      console.error('Lỗi khi đặt địa chỉ mặc định:', error);
      toast.error('Không thể đặt làm địa chỉ mặc định. Vui lòng thử lại.');
    }
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
              {user?.roleName === 'Admin' && (
                <Link href="/dashboard/product-list" className="nav-link">
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

              {/* Tab địa chỉ */}
              {activeTab === 'address' && (
                <div className="address-section-area">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="title">Sổ địa chỉ của bạn</h2>
                    <button className="rts-btn btn-primary" onClick={handleOpenAddressModal}>
                      <i className="fa-solid fa-plus me-2"></i>Thêm địa chỉ mới
                    </button>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="text-center my-5">
                      <i className="fa-solid fa-map-location-dot fa-2x text-muted mb-3"></i>
                      <h5>Chưa có địa chỉ nào</h5>
                      <p>Hãy thêm địa chỉ giao hàng để việc đặt hàng dễ dàng hơn.</p>
                    </div>
                  ) : (
                    <div className="row">
                      {addresses.map((addr) => (
                        <div key={addr.id} className="col-md-6 col-lg-4 mb-4">
                          <div className="card h-100 shadow-sm border rounded-3 p-3">
                            <div className="d-flex justify-content-between mb-2">
                              <div>
                                <h5 className="mb-1">
                                  <i className="fa-solid fa-user me-2"></i>{addr.name}
                                </h5>
                                {addr.isDefault && (
                                  <span className="badge bg-success text-white">
                                    <i className="fa-solid fa-star me-1"></i>Địa chỉ mặc định
                                  </span>
                                )}
                              </div>
                              <div>
                                {!addr.isDefault && (
                                  <button
                                    className="btn btn-sm btn-outline-secondary me-2"
                                    onClick={() => handleSetDefaultAddress(addr.id!)}
                                    title="Đặt làm mặc định"
                                  >
                                    <i className="fa-solid fa-star"></i>
                                  </button>
                                )}
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteAddress(addr.id!)}
                                  title="Xóa"
                                >
                                  <i className="fa-solid fa-trash"></i>
                                </button>
                              </div>
                            </div>
                            <p className="mb-1 text-muted">
                              <i className="fa-solid fa-location-dot me-2"></i>
                              {addr.fullAddress}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}


              {showAddressModal && (
                <>
                  <div className="modal fade show d-block" tabIndex={-1} role="dialog">
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                      <div className="modal-content border-0 shadow-lg">
                        <form onSubmit={handleAddAddress}>
                          {/* Modal Header */}
                          <div className="modal-header text-white border-0 rounded-top">
                            <h4 className="modal-title fw-bold mb-0">
                              <i className="fas fa-plus-circle me-2"></i>
                              Thêm địa chỉ giao hàng mới
                            </h4>
                            <button
                              type="button"
                              className="btn-close btn-close-white"
                              onClick={handleCloseAddressModal}
                              aria-label="Close"
                            ></button>
                          </div>

                          {/* Modal Body */}
                          <div className="modal-body p-4">
                            <div className="row g-4">
                              {/* Full width for name */}
                              <div className="col-12">
                                <div className="mb-3">
                                  <label className="form-label fw-semibold text-dark">
                                    <i className="fas fa-user text-success me-2"></i>
                                    Tên người nhận
                                    <span className="text-danger ms-1">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    name="name"
                                    className="form-control form-control-lg border-2"
                                    value={newAddress.name}
                                    onChange={handleNewAddressChange}
                                    placeholder="Nhập tên người nhận"
                                    required
                                  />
                                </div>
                              </div>

                              {/* Address fields in logical order */}
                              <div className="col-md-4">
                                <div className="mb-3">
                                  <label className="form-label fw-semibold text-dark">
                                    <i className="fas fa-map-marked-alt text-success me-2"></i>
                                    Tỉnh / Thành phố
                                    <span className="text-danger ms-1">*</span>
                                  </label>
                                  <select
                                    className="form-select form-select-lg border-2"
                                    value={selectedProvinceId || ""}
                                    onChange={(e) => {
                                      const provinceId = Number.parseInt(e.target.value)
                                      const selected = provinces.find((p) => p.provinceID === provinceId)
                                      setSelectedProvinceId(provinceId)
                                      setSelectedDistrictId(null)
                                      setSelectedWardId(null)
                                      setNewAddress((prev) => ({
                                        ...prev,
                                        city: selected?.provinceName || "",
                                        district: "",
                                        ward: "",
                                      }))
                                    }}
                                    required
                                  >
                                    <option value="">Chọn tỉnh/thành phố</option>
                                    {provinces.map((province) => (
                                      <option key={province.provinceID} value={province.provinceID}>
                                        {province.provinceName}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              <div className="col-md-4">
                                <div className="mb-3">
                                  <label className="form-label fw-semibold text-dark">
                                    <i className="fas fa-building text-success me-2"></i>
                                    Quận / Huyện
                                    <span className="text-danger ms-1">*</span>
                                  </label>
                                  <select
                                    className="form-select form-select-lg border-2"
                                    value={selectedDistrictId || ""}
                                    onChange={(e) => {
                                      const districtId = Number.parseInt(e.target.value)
                                      const selected = districts.find((d) => d.districtID === districtId)
                                      setSelectedDistrictId(districtId)
                                      setSelectedWardId(null)
                                      setNewAddress((prev) => ({
                                        ...prev,
                                        district: selected?.districtName || "",
                                        ward: "",
                                      }))
                                    }}
                                    disabled={!selectedProvinceId}
                                    required
                                  >
                                    <option value="">Chọn quận/huyện</option>
                                    {districts.map((district) => (
                                      <option key={district.districtID} value={district.districtID}>
                                        {district.districtName}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              <div className="col-md-4">
                                <div className="mb-3">
                                  <label className="form-label fw-semibold text-dark">
                                    <i className="fas fa-home text-success me-2"></i>
                                    Phường / Xã
                                  </label>
                                  <select
                                    className="form-select form-select-lg border-2"
                                    value={selectedWardId || ""}
                                    onChange={(e) => {
                                      const wardCode = e.target.value
                                      const selected = wards.find((w) => w.wardCode === wardCode)
                                      setSelectedWardId(wardCode)
                                      setNewAddress((prev) => ({
                                        ...prev,
                                        ward: selected?.wardCode || "",
                                      }))
                                    }}
                                    disabled={!selectedDistrictId}
                                  >
                                    <option value="">Chọn phường/xã</option>
                                    {wards.map((ward) => (
                                      <option key={ward.wardCode} value={ward.wardCode}>
                                        {ward.wardName}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              {/* Full width for detailed address */}
                              <div className="col-12">
                                <div className="mb-3">
                                  <label className="form-label fw-semibold text-dark">
                                    <i className="fas fa-location-dot text-success me-2"></i>
                                    Địa chỉ chi tiết
                                    <span className="text-danger ms-1">*</span>
                                  </label>
                                  <textarea
                                    name="fullAddress"
                                    className="form-control form-control-lg border-2"
                                    rows={3}
                                    value={newAddress.fullAddress}
                                    onChange={(e) => handleNewAddressChange(e as any)}
                                    placeholder="Số nhà, tên đường, khu vực... (VD: 123 Nguyễn Trãi, Khu phố 1)"
                                    required
                                  />
                                </div>
                              </div>

                            </div>
                          </div>

                          {/* Modal Footer */}
                          <div className="modal-footer bg-light border-0 rounded-bottom p-4">
                            <button type="submit" className="btn btn-success btn-lg px-4" disabled={isLoading}>
                              {isLoading ? (
                                <>
                                  <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                    aria-hidden="true"
                                  ></span>
                                  Đang thêm...
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-check me-2"></i>
                                  Lưu địa chỉ
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                  <div className="modal-backdrop fade show"></div>
                </>
              )}








              {activeTab === 'account' && (
                <form className="account-details-area" onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
                  <h2 className="title">Thông tin cá nhân</h2>
                  <div className="row">
                    {/* <div className="col-md-3 mb-3 text-center me-5" style={{ maxWidth: '200px' }}>
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
                        className="btn btn-sm btn-outline-secondary mb-2"
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        Đổi ảnh
                      </button>
                    </div> */}
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
                              dob: e.target.value || undefined,
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
      <style jsx>{`
        .form-control:focus, .form-select:focus {

          box-shadow: 0 0 0 0.2rem rgba(74, 124, 89, 0.25);
        }
        
        .btn-outline-success {
          margin-right: 20px;
        }
        
        .btn-outline-success:hover {

          color: white;
        }
        
        .btn-outline-success::before {
          opacity: 0;
        }
        
        .btn-check:checked + .btn-outline-success {

        }
        
        .text-success {

        }
        
        .bg-success {

        }
        
        input[type="radio"] {
          display: none;
        }
        
        label:before {
          display: none;
        }
        
        input[type="text"], input[type="number"], input[type="email"], input[type="password"], select {
          border: 1px solid #4a7c59;
        }
        
        .card {
          border: 1px solid #e0e0e0;
          transition: box-shadow 0.3s ease;
        }
        
        .card:hover {
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .btn-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
};

export default AccountTabs;