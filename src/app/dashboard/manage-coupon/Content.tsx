'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminCouponService, { AdminCouponPayload } from '@/data/Services/AdminService/CouponManage';

interface CouponFormData {
    id?: string;
    code: string;
    name: string;
    description: string;
    type: number;
    value: number;
    minOrderAmount: number;
    maxDiscountAmount: number;
    usageLimit: number;
    perUserLimit: number;
    applicableTo: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
}

const initialFormData: CouponFormData = {
    code: '',
    name: '',
    description: '',
    type: 0,
    value: 0,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    usageLimit: 100,
    perUserLimit: 1,
    applicableTo: 0,
    startDate: '',
    endDate: '',
    isActive: true,
};

const CouponTable: React.FC<{
    coupons: AdminCouponPayload[];
    onEdit: (coupon: AdminCouponPayload) => void;
    onDelete: (id: string) => void;
    onToggleStatus: (id: string, isActive: boolean) => void;
}> = ({ coupons, onEdit, onDelete, onToggleStatus }) => {
    const getTypeLabel = (type: number) => {
        return type === 0 ? 'Phần trăm (%)' : 'Giá trị cố định (VND)';
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <span className="badge bg-success">
                <i className="fas fa-check-circle me-1"></i>
                Hoạt động
            </span>
        ) : (
            <span className="badge bg-danger">
                <i className="fas fa-times-circle me-1"></i>
                Tạm dừng
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const formatValue = (value: number, type: number) => {
        return type === 0 ? `${value}%` : `${value.toLocaleString('vi-VN')}đ`;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };
    return (
        <div className="table-responsive">
            <table className="table table-hover table-striped">
                <thead style={{ backgroundColor: '#e8f5e8' }}>
                    <tr>
                        <th style={{ color: '#2d5a3d' }}>Mã coupon</th>
                        <th style={{ color: '#2d5a3d' }}>Tên coupon</th>
                        <th style={{ color: '#2d5a3d' }}>Loại</th>
                        <th style={{ color: '#2d5a3d' }}>Giá trị</th>
                        <th style={{ color: '#2d5a3d' }}>Ngày bắt đầu</th>
                        <th style={{ color: '#2d5a3d' }}>Ngày kết thúc</th>
                        <th style={{ color: '#2d5a3d' }}>Trạng thái</th>
                        <th style={{ color: '#2d5a3d' }}>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {coupons.map((coupon) => (
                        <tr key={coupon.id}>
                            <td>
                                <span className="badge bg-primary font-monospace">{coupon.code}</span>
                            </td>
                            <td>
                                <h6 className="mb-1 fw-bold">{coupon.name}</h6>
                                <small className="text-muted">{coupon.description}</small>
                            </td>
                            <td>
                                <span className="badge bg-light text-dark">
                                    {getTypeLabel(coupon.type)}
                                </span>
                            </td>
                            <td>
                                <span className="fw-bold text-success">
                                    {formatValue(coupon.value, coupon.type)}
                                </span>
                            </td>
                            <td>
                                <small className="text-muted">{formatDate(coupon.startDate)}</small>
                            </td>
                            <td>
                                <small className="text-muted">{formatDate(coupon.endDate)}</small>
                            </td>
                            <td>{getStatusBadge(coupon.isActive)}</td>
                            <td>
                                <div className="d-flex gap-1">
                                    <button
                                        onClick={() => onEdit(coupon)}
                                        className="btn btn-outline-primary btn-sm"
                                        title="Chỉnh sửa"
                                    >
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button
                                        onClick={() => onToggleStatus(coupon.id!, !coupon.isActive)}
                                        className={`btn btn-sm ${coupon.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                        title={coupon.isActive ? 'Tạm dừng' : 'Kích hoạt'}
                                    >
                                        <i className={`fas ${coupon.isActive ? 'fa-pause' : 'fa-play'}`}></i>
                                    </button>
                                    <button
                                        onClick={() => onDelete(coupon.id!)}
                                        className="btn btn-outline-danger btn-sm"
                                        title="Xóa"
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default function CouponManagePage() {
    const router = useRouter();
    const [coupons, setCoupons] = useState<AdminCouponPayload[]>([]);
    const [filteredCoupons, setFilteredCoupons] = useState<AdminCouponPayload[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<AdminCouponPayload | null>(null);
    const [formData, setFormData] = useState<CouponFormData>(initialFormData);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };
    // Load coupons
    useEffect(() => {
        const loadCoupons = async () => {
            try {
                setIsLoading(true);
                const response = await AdminCouponService.getAllAdminCoupons();
                setCoupons(response.data);
            } catch (error) {
                console.error('Error loading coupons:', error);
                toast.error('Không thể tải danh sách coupon');
            } finally {
                setIsLoading(false);
            }
        };

        loadCoupons();
    }, []);

    // Filter coupons
    useEffect(() => {
        let filtered = [...coupons];

        if (searchTerm) {
            filtered = filtered.filter(coupon =>
                coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                coupon.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedStatus) {
            filtered = filtered.filter(coupon => {
                if (selectedStatus === 'active') return coupon.isActive;
                if (selectedStatus === 'inactive') return !coupon.isActive;
                return true;
            });
        }

        setFilteredCoupons(filtered);
    }, [coupons, searchTerm, selectedStatus]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
                type === 'number' ? parseFloat(value) || 0 : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingCoupon) {
                await AdminCouponService.updateAdminCoupon(editingCoupon.id!, formData);
                toast.success('Cập nhật coupon thành công!');
                setCoupons(prev => prev.map(c =>
                    c.id === editingCoupon.id ? { ...formData, id: editingCoupon.id } : c
                ));
            } else {
                const response = await AdminCouponService.createAdminCoupon(formData);
                toast.success('Thêm coupon thành công!');
                setCoupons(prev => [...prev, response.data]);
            }

            setShowForm(false);
            setEditingCoupon(null);
            setFormData(initialFormData);
        } catch (error) {
            console.error('Error saving coupon:', error);
            toast.error('Có lỗi xảy ra khi lưu coupon');
        }
    };

    const handleEdit = (coupon: AdminCouponPayload) => {
        setEditingCoupon(coupon);
        setFormData({
            ...coupon,
            startDate: coupon.startDate.split('T')[0],
            endDate: coupon.endDate.split('T')[0]
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa coupon này?')) return;

        try {
            await AdminCouponService.deleteAdminCoupon(id);
            toast.success('Xóa coupon thành công!');
            setCoupons(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            console.error('Error deleting coupon:', error);
            toast.error('Không thể xóa coupon');
        }
    };

    const handleToggleStatus = async (id: string, isActive: boolean) => {
        try {
            const coupon = coupons.find(c => c.id === id);
            if (!coupon) return;

            const payload = { ...coupon, isActive };
            await AdminCouponService.updateAdminCoupon(id, payload);
            toast.success(isActive ? 'Kích hoạt coupon thành công!' : 'Tạm dừng coupon thành công!');

            setCoupons(prev => prev.map(c =>
                c.id === id ? { ...c, isActive } : c
            ));
        } catch (error) {
            console.error('Error updating coupon status:', error);
            toast.error('Không thể cập nhật trạng thái coupon');
        }
    };

    const handleAddNew = () => {
        setEditingCoupon(null);
        setFormData(initialFormData);
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingCoupon(null);
        setFormData(initialFormData);
    };

    if (isLoading) {
        return (
            <div className="container-fluid py-4" style={{ backgroundColor: '#f8fffe' }}>
                <div className="row justify-content-center">
                    <div className="col-12">
                        <div className="card shadow-lg border-0">
                            <div className="card-body text-center py-5">
                                <div className="spinner-border text-success" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-3 text-muted">Đang tải danh sách coupon...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4" style={{ backgroundColor: '#f8fffe' }}>
            <div className="row">
                <div className="col-12">
                    <div className="card shadow-lg border-0">
                        {/* Header */}
                        <div className="card-header text-white" style={{ background: 'linear-gradient(135deg, #2d5a3d, #4a7c59)' }}>
                            <div className="d-flex justify-content-between align-items-center" style={{ padding: '20px' }}>
                                <div className="d-flex align-items-center">
                                    <i className="fas fa-ticket-alt me-3 fs-4"></i>
                                    <div>
                                        <h3 className="mb-0" style={{ color: "white" }}>Quản Lý Coupon</h3>
                                        <p className="mb-0 opacity-75" style={{ color: "white" }}>Tổng cộng {filteredCoupons.length} coupon</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleAddNew}
                                    className="btn btn-light btn-lg"
                                    style={{ fontWeight: 'bold' }}
                                >
                                    <i className="fas fa-plus me-2"></i>
                                    Thêm Coupon
                                </button>
                            </div>
                        </div>

                        <div className="card-body">
                            {/* Form */}
                            {showForm && (
                                <div className="row mb-4">
                                    <div className="col-12">
                                        <div className="card border-0" style={{ backgroundColor: '#f0f8f0' }}>
                                            <div className="card-header" style={{ backgroundColor: '#e8f5e8' }}>
                                                <h5 className="mb-0">
                                                    <i className="fas fa-edit me-2"></i>
                                                    {editingCoupon ? 'Chỉnh sửa Coupon' : 'Thêm Coupon mới'}
                                                </h5>
                                            </div>
                                            <div className="card-body">
                                                <form onSubmit={handleSubmit}>
                                                    <div className="row g-3">
                                                        <div className="col-md-6">
                                                            <label className="form-label fw-bold">Mã coupon *</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                name="code"
                                                                value={formData.code}
                                                                onChange={handleInputChange}
                                                                required
                                                                placeholder="VD: SUMMER2024"
                                                            />
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label className="form-label fw-bold">Tên coupon *</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                name="name"
                                                                value={formData.name}
                                                                onChange={handleInputChange}
                                                                required
                                                                placeholder="Giảm giá mùa hè"
                                                            />
                                                        </div>
                                                        <div className="col-12">
                                                            <label className="form-label fw-bold">Mô tả</label>
                                                            <textarea
                                                                className="form-control"
                                                                name="description"
                                                                value={formData.description}
                                                                onChange={handleInputChange}
                                                                rows={2}
                                                                placeholder="Mô tả về coupon..."
                                                            />
                                                        </div>
                                                        <div className="col-md-3">
                                                            <label className="form-label fw-bold">Loại giảm giá</label>
                                                            <select
                                                                className="form-select"
                                                                name="type"
                                                                value={formData.type}
                                                                onChange={handleInputChange}
                                                            >
                                                                <option value={0}>Phần trăm (%)</option>
                                                                <option value={1}>Giá trị cố định (VND)</option>
                                                            </select>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <label className="form-label fw-bold">Giá trị *</label>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                name="value"
                                                                value={formData.value}
                                                                onChange={handleInputChange}
                                                                required
                                                                min="0"
                                                            />
                                                        </div>
                                                        <div className="col-md-3">
                                                            <label className="form-label fw-bold">Giá trị đơn hàng tối thiểu (đ)</label>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                name="minOrderAmount"
                                                                value={formData.minOrderAmount}
                                                                onChange={handleInputChange}
                                                                min="0"
                                                            />
                                                        </div>
                                                        <div className="col-md-3">
                                                            <label className="form-label fw-bold">Giảm tối đa (đ)</label>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                name="maxDiscountAmount"
                                                                value={formData.maxDiscountAmount}
                                                                onChange={handleInputChange}
                                                                min="0"
                                                            />
                                                        </div>
                                                        <div className="col-md-3">
                                                            <label className="form-label fw-bold">Số lượng sử dụng</label>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                name="usageLimit"
                                                                value={formData.usageLimit}
                                                                onChange={handleInputChange}
                                                                min="1"
                                                            />
                                                        </div>
                                                        <div className="col-md-3">
                                                            <label className="form-label fw-bold">Giới hạn/người</label>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                name="perUserLimit"
                                                                value={formData.perUserLimit}
                                                                onChange={handleInputChange}
                                                                min="1"
                                                            />
                                                        </div>
                                                        {/* <div className="col-md-3">
                                                            <label className="form-label fw-bold">Áp dụng cho</label>
                                                            <select
                                                                className="form-select"
                                                                name="applicableTo"
                                                                value={formData.applicableTo}
                                                                onChange={handleInputChange}
                                                            >
                                                                <option value={0}>Tất cả sản phẩm</option>
                                                                <option value={1}>Danh mục cụ thể</option>
                                                                <option value={2}>Sản phẩm cụ thể</option>
                                                            </select>
                                                        </div> */}
                                                        <div className="col-md-3">
                                                            <label className="form-label fw-bold">Ngày bắt đầu *</label>
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                name="startDate"
                                                                value={formData.startDate}
                                                                onChange={handleInputChange}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="col-md-3">
                                                            <label className="form-label fw-bold">Ngày kết thúc *</label>
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                name="endDate"
                                                                value={formData.endDate}
                                                                onChange={handleInputChange}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="col-md-12">
                                                            <div className="form-check">
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-check-input"
                                                                    name="isActive"
                                                                    checked={formData.isActive}
                                                                    onChange={handleInputChange}
                                                                />
                                                                <label className="form-check-label">
                                                                    Kích hoạt coupon
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex gap-2 mt-3">
                                                        <button type="submit" className="btn btn-success">
                                                            <i className="fas fa-save me-2"></i>
                                                            {editingCoupon ? 'Cập nhật' : 'Thêm mới'}
                                                        </button>
                                                        <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                                                            <i className="fas fa-times me-2"></i>
                                                            Hủy
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Filters */}
                            <div className="row mb-4">
                                <div className="col-12">
                                    <div className="card border-0" style={{ backgroundColor: '#f0f8f0' }}>
                                        <div className="card-body">
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold">Tìm kiếm</label>
                                                    <div className="input-group">
                                                        <span className="input-group-text" style={{ backgroundColor: '#e8f5e8', color: '#2d5a3d' }}>
                                                            <i className="fas fa-search"></i>
                                                        </span>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Mã coupon hoặc tên..."
                                                            value={searchTerm}
                                                            onChange={(e) => setSearchTerm(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label fw-bold">Trạng thái</label>
                                                    <select
                                                        className="form-select"
                                                        value={selectedStatus}
                                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                                    >
                                                        <option value="">Tất cả</option>
                                                        <option value="active">Hoạt động</option>
                                                        <option value="inactive">Tạm dừng</option>
                                                    </select>
                                                </div>
                                                <div className="col-md-2">
                                                    <label className="form-label fw-bold">&nbsp;</label>
                                                    <button
                                                        onClick={() => {
                                                            setSearchTerm('');
                                                            setSelectedStatus('');
                                                        }}
                                                        className="btn btn-outline-secondary d-block w-100"
                                                    >
                                                        <i className="fas fa-undo me-2"></i>
                                                        Đặt lại
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Statistics */}
                            <div className="row mb-4">
                                <div className="col-md-4">
                                    <div className="card bg-primary text-white">
                                        <div className="card-body">
                                            <div className="d-flex align-items-center">
                                                <i className="fas fa-ticket-alt fa-2x me-3"></i>
                                                <div>
                                                    <h4 className="mb-0">{coupons.length}</h4>
                                                    <p className="mb-0">Tổng coupon</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card bg-success text-white">
                                        <div className="card-body">
                                            <div className="d-flex align-items-center">
                                                <i className="fas fa-check-circle fa-2x me-3"></i>
                                                <div>
                                                    <h4 className="mb-0">{coupons.filter(c => c.isActive).length}</h4>
                                                    <p className="mb-0">Hoạt động</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card bg-danger text-white">
                                        <div className="card-body">
                                            <div className="d-flex align-items-center">
                                                <i className="fas fa-pause fa-2x me-3"></i>
                                                <div>
                                                    <h4 className="mb-0">{coupons.filter(c => !c.isActive).length}</h4>
                                                    <p className="mb-0">Tạm dừng</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Coupons Table */}
                            <div className="row">
                                <div className="col-12">
                                    {filteredCoupons.length > 0 ? (
                                        <CouponTable
                                            coupons={filteredCoupons}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                            onToggleStatus={handleToggleStatus}
                                        />
                                    ) : (
                                        <div className="text-center py-5">
                                            <i className="fas fa-ticket-alt fa-3x text-muted mb-3"></i>
                                            <h5 className="text-muted">Không tìm thấy coupon nào</h5>
                                            <p className="text-muted">
                                                {coupons.length === 0
                                                    ? 'Hãy thêm coupon đầu tiên của bạn'
                                                    : 'Thử thay đổi bộ lọc để tìm coupon khác'
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />

            <style jsx>{`
                .form-control:focus, .form-select:focus {
                    border-color: #4a7c59;
                    box-shadow: 0 0 0 0.2rem rgba(74, 124, 89, 0.25);
                }
                
                .btn-outline-primary {
                    color: #4a7c59;
                    border-color: #4a7c59;
                }
                
                .btn-outline-primary:hover {
                    background-color: #4a7c59;
                    border-color: #4a7c59;
                    color: white;
                }
                
                .table-hover tbody tr:hover {
                    background-color: rgba(74, 124, 89, 0.05);
                }
            `}</style>
        </div>
    );
}