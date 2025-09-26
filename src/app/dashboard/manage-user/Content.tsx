'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminUserService, { AdminUserFilterDto, SetUserRoleDto, SetUserStatusDto, UserProfileDto } from '@/data/Services/AdminService/UserManageService';


interface UserTableProps {
    users: UserProfileDto[];
    onRoleChange: (userId: string, roleId: string) => void;
    onStatusToggle: (userId: string, isActive: boolean) => void;
    onViewDetails: (user: UserProfileDto) => void;
}

const UserTable: React.FC<UserTableProps> = ({
    users,
    onRoleChange,
    onStatusToggle,
    onViewDetails
}) => {
    const getGenderLabel = (gender?: string) => {
        if (!gender) return 'Chưa xác định';
        return gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : 'Khác';
    };

    const getStatusBadge = (isActive?: boolean) => {
        return isActive !== true && (
            <span className="badge bg-warning">
                <i className="fas fa-clock me-1"></i>
                Bị khóa
            </span>
        );
    };
    const getVerifiedBadge = (isVerified?: boolean) => {
        return isVerified === false && (
            <span className="badge bg-danger">
                <i className="fas fa-check-circle me-1"></i>
                Chưa xác thực
            </span>
        )
    };
    const getRoleBadge = (roleName?: string) => {
        const roleColor = roleName === 'Admin' ? 'bg-danger' :
            roleName === 'Staff' ? 'bg-primary' : 'bg-info';
        return (
            <span className={`badge ${roleColor}`}>
                {roleName || 'User'}
            </span>
        );
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Chưa cập nhật';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const handleRoleChange = (userId: string, event: React.ChangeEvent<HTMLSelectElement>) => {
        const roleId = event.target.value;
        if (roleId) {
            onRoleChange(userId, roleId);
        }
    };

    return (
        <div className="table-responsive">
            <table className="table table-hover table-striped">
                <thead style={{ backgroundColor: '#e8f5e8' }}>
                    <tr>
                        <th style={{ color: '#2d5a3d' }}>Avatar</th>
                        <th style={{ color: '#2d5a3d' }}>Thông tin</th>
                        <th style={{ color: '#2d5a3d' }}>Liên hệ</th>
                        <th style={{ color: '#2d5a3d' }}>Vai trò</th>
                        <th style={{ color: '#2d5a3d' }}>Trạng thái</th>
                        <th style={{ color: '#2d5a3d' }}>Ngày sinh</th>
                        <th style={{ color: '#2d5a3d' }}>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.userId}>
                            <td>
                                <div className="d-flex align-items-center">
                                    {user.avatarUrl ? (
                                        <img
                                            src={user.avatarUrl}
                                            alt={user.fullName}
                                            className="rounded-circle"
                                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div
                                            className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                                            style={{ width: '40px', height: '40px' }}
                                        >
                                            <i className="fas fa-user text-white"></i>
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td>
                                <div>
                                    <h6 className="mb-1 fw-bold">{user.fullName || 'Chưa cập nhật'}</h6>
                                    <small className="text-muted">
                                        {getGenderLabel(user.gender)}
                                    </small>
                                </div>
                            </td>
                            <td>
                                <div>
                                    <div className="mb-1">
                                        <i className="fas fa-envelope me-2 text-muted"></i>
                                        <small>{user.email}</small>
                                    </div>
                                    {user.phone && (
                                        <div>
                                            <i className="fas fa-phone me-2 text-muted"></i>
                                            <small>{user.phone}</small>
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td>
                                <div className="d-flex flex-column gap-1">
                                    {getRoleBadge(user.roleName)}
                                    {/* <select
                                        className="form-select form-select-sm"
                                        onChange={(e) => handleRoleChange(user.userId, e)}
                                        defaultValue=""
                                    >
                                        <option value="">Đổi vai trò</option>
                                        <option value="user-role-id">User</option>
                                        <option value="staff-role-id">Staff</option>
                                        <option value="admin-role-id">Admin</option>
                                    </select> */}
                                </div>
                            </td>
                            <td>
                                <div className="d-flex flex-column gap-1">
                                    {getStatusBadge(user.isActive)}
                                    {getVerifiedBadge(user.isVerified)}
                                </div>
                            </td>
                            <td>
                                <small className="text-muted">{formatDate(user.dob)}</small>
                            </td>
                            <td>
                                <div className="d-flex gap-1">
                                    <button
                                        onClick={() => onViewDetails(user)}
                                        className="btn btn-outline-info btn-sm"
                                        title="Xem chi tiết"
                                    >
                                        <i className="fas fa-eye"></i>
                                    </button>
                                    <button
                                        onClick={() => onStatusToggle(user.userId, user.isActive !== true)}
                                        className={`btn btn-sm ${user.isActive === true ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                        title={user.isActive === true ? 'Tạm khóa' : 'Kích hoạt'}
                                    >
                                        <i className={`fas ${user.isActive === true ? 'fa-lock' : 'fa-unlock'}`}></i>
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

const UserDetailsModal: React.FC<{
    user: UserProfileDto | null;
    onClose: () => void;
}> = ({ user, onClose }) => {
    if (!user) return null;

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header" style={{ backgroundColor: '#2d5a3d', color: 'white' }}>
                        <h5 className="modal-title">
                            <i className="fas fa-user me-2"></i>
                            Chi tiết người dùng
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <div className="row">
                            <div className="col-md-4 text-center">
                                {user.avatarUrl ? (
                                    <img
                                        src={user.avatarUrl}
                                        alt={user.fullName}
                                        className="rounded-circle mb-3"
                                        style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div
                                        className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mb-3 mx-auto"
                                        style={{ width: '120px', height: '120px' }}
                                    >
                                        <i className="fas fa-user fa-3x text-white"></i>
                                    </div>
                                )}
                                <h5>{user.fullName || 'Chưa cập nhật'}</h5>
                                <p className="text-muted">{user.roleName || 'User'}</p>
                            </div>
                            <div className="col-md-8">
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="form-label fw-bold">Email</label>
                                        <p className="form-control-plaintext">{user.email}</p>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label fw-bold">Số điện thoại</label>
                                        <p className="form-control-plaintext">{user.phone || 'Chưa cập nhật'}</p>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label fw-bold">Giới tính</label>
                                        <p className="form-control-plaintext">
                                            {user.gender === 'male' ? 'Nam' : user.gender === 'female' ? 'Nữ' : 'Chưa xác định'}
                                        </p>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label fw-bold">Ngày sinh</label>
                                        <p className="form-control-plaintext">
                                            {user.dob ? new Date(user.dob).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                                        </p>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label fw-bold">Trạng thái xác thực</label>
                                        <p className="form-control-plaintext">
                                            {user.isActive === true ? (
                                                <span className="badge bg-success">Đã xác thực</span>
                                            ) : (
                                                <span className="badge bg-warning">Chưa xác thực</span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-bold">User ID</label>
                                        <p className="form-control-plaintext">
                                            <code>{user.userId}</code>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function UserManagePage() {
    const router = useRouter();
    const [users, setUsers] = useState<UserProfileDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<UserProfileDto | null>(null);
    const [filter, setFilter] = useState<AdminUserFilterDto>({
        keyword: '',
        roleId: '',
        isActive: undefined,
        sortBy: 'fullName',
        sortDesc: false,
        pageNumber: 1,
        pageSize: 10
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        pageSize: 10
    });

    // Load users
    useEffect(() => {
        const loadUsers = async () => {
            try {
                setIsLoading(true);
                const response = await AdminUserService.getFilteredUsers(filter);
                setUsers(response.data.items);
                setPagination({
                    currentPage: response.data.currentPage,
                    totalPages: response.data.totalPages,
                    totalItems: response.data.totalItems,
                    pageSize: response.data.pageSize
                });
            } catch (error) {
                console.error('Error loading users:', error);
                toast.error('Không thể tải danh sách người dùng');
            } finally {
                setIsLoading(false);
            }
        };

        loadUsers();
    }, [filter]);

    const handleFilterChange = (key: keyof AdminUserFilterDto, value: any) => {
        setFilter(prev => ({
            ...prev,
            [key]: value,
            pageNumber: 1 // Reset to first page when filtering
        }));
    };

    const handlePageChange = (page: number) => {
        setFilter(prev => ({
            ...prev,
            pageNumber: page
        }));
    };

    const handleRoleChange = async (userId: string, roleId: string) => {
        try {
            const roleDto: SetUserRoleDto = { roleId };
            await AdminUserService.updateUserRole(userId, roleDto);
            toast.success('Cập nhật vai trò thành công!');

            // Refresh user list
            const response = await AdminUserService.getFilteredUsers(filter);
            setUsers(response.data.items);
        } catch (error) {
            console.error('Error updating user role:', error);
            toast.error('Không thể cập nhật vai trò');
        }
    };

    const handleStatusToggle = async (userId: string, isActive: boolean) => {
        try {
            const statusDto: SetUserStatusDto = { isActive };
            await AdminUserService.updateUserStatus(userId, statusDto);
            toast.success(isActive ? 'Kích hoạt tài khoản thành công!' : 'Tạm khóa tài khoản thành công!');

            // Refresh user list
            const response = await AdminUserService.getFilteredUsers(filter);
            setUsers(response.data.items);
        } catch (error) {
            console.error('Error updating user status:', error);
            toast.error('Không thể cập nhật trạng thái tài khoản');
        }
    };

    const handleViewDetails = (user: UserProfileDto) => {
        setSelectedUser(user);
    };

    const handleResetFilter = () => {
        setFilter({
            keyword: '',
            roleId: '',
            isActive: undefined,
            sortBy: 'fullName',
            sortDesc: false,
            pageNumber: 1,
            pageSize: 10
        });
    };

    const renderPagination = () => {
        const pages = [];
        for (let i = 1; i <= pagination.totalPages; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`btn btn-sm ${i === pagination.currentPage ? 'btn-primary' : 'btn-outline-primary'} me-1`}
                >
                    {i}
                </button>
            );
        }
        return pages;
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
                                <p className="mt-3 text-muted">Đang tải danh sách người dùng...</p>
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
                                    <i className="fas fa-users me-3 fs-4"></i>
                                    <div>
                                        <h3 className="mb-0" style={{ color: "white" }}>Quản Lý Người Dùng</h3>
                                        <p className="mb-0 opacity-75" style={{ color: "white" }}>
                                            Tổng cộng {pagination.totalItems} người dùng
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card-body">
                            {/* Filters */}
                            <div className="row mb-4">
                                <div className="col-12">
                                    <div className="card border-0" style={{ backgroundColor: '#f0f8f0' }}>
                                        <div className="card-body">
                                            <div className="row g-3">
                                                <div className="col-md-4">
                                                    <label className="form-label fw-bold">Tìm kiếm</label>
                                                    <div className="input-group">
                                                        <span className="input-group-text" style={{ backgroundColor: '#e8f5e8', color: '#2d5a3d' }}>
                                                            <i className="fas fa-search"></i>
                                                        </span>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Tên, email, số điện thoại..."
                                                            value={filter.keyword || ''}
                                                            onChange={(e) => handleFilterChange('keyword', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-2">
                                                    <label className="form-label fw-bold">Vai trò</label>
                                                    <select
                                                        className="form-select"
                                                        value={filter.roleId || ''}
                                                        onChange={(e) => handleFilterChange('roleId', e.target.value)}
                                                    >
                                                        <option value="">Tất cả</option>
                                                        <option value="user-role-id">User</option>
                                                        <option value="admin-role-id">Admin</option>
                                                    </select>
                                                </div>
                                                <div className="col-md-2">
                                                    <label className="form-label fw-bold">Trạng thái</label>
                                                    <select
                                                        className="form-select"
                                                        value={filter.isActive === undefined ? '' : filter.isActive.toString()}
                                                        onChange={(e) => handleFilterChange('isActive', e.target.value === '' ? undefined : e.target.value === 'true')}
                                                    >
                                                        <option value="">Tất cả</option>
                                                        <option value="true">Hoạt động</option>
                                                        <option value="false">Tạm khóa</option>
                                                    </select>
                                                </div>
                                                <div className="col-md-2">
                                                    <label className="form-label fw-bold">Sắp xếp</label>
                                                    <select
                                                        className="form-select"
                                                        value={filter.sortBy || ''}
                                                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                                    >
                                                        <option value="fullName">Tên</option>
                                                        <option value="email">Email</option>
                                                        <option value="dob">Ngày sinh</option>
                                                    </select>
                                                </div>
                                                <div className="col-md-2">
                                                    <label className="form-label fw-bold">&nbsp;</label>
                                                    <button
                                                        onClick={handleResetFilter}
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
                                                <i className="fas fa-users fa-2x me-3"></i>
                                                <div>
                                                    <h4 className="mb-0">{pagination.totalItems}</h4>
                                                    <p className="mb-0" style={{color: "white"}}>Tổng người dùng</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card bg-success text-white">
                                        <div className="card-body">
                                            <div className="d-flex align-items-center">
                                                <i className="fas fa-user-check fa-2x me-3"></i>
                                                <div>
                                                    <h4 className="mb-0">{users.filter(u => u.isActive === true && u.isVerified===true).length}</h4>
                                                    <p className="mb-0" style={{ color: "white" }}>Đang hoạt động</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card bg-warning text-white">
                                        <div className="card-body">
                                            <div className="d-flex align-items-center">
                                                <i className="fas fa-user-clock fa-2x me-3"></i>
                                                <div>
                                                    <h4 className="mb-0">{users.filter(u => u.isActive !== true).length}</h4>
                                                    <p className="mb-0" style={{ color: "white" }}>Bị khóa</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Users Table */}
                            <div className="row">
                                <div className="col-12">
                                    {users.length > 0 ? (
                                        <>
                                            <UserTable
                                                users={users}
                                                onRoleChange={handleRoleChange}
                                                onStatusToggle={handleStatusToggle}
                                                onViewDetails={handleViewDetails}
                                            />

                                            {/* Pagination */}
                                            {pagination.totalPages > 1 && (
                                                <div className="d-flex justify-content-center mt-4">
                                                    <div className="d-flex align-items-center">
                                                        <button
                                                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                                                            disabled={pagination.currentPage === 1}
                                                            className="btn btn-outline-primary btn-sm me-2"
                                                        >
                                                            <i className="fas fa-chevron-left"></i>
                                                        </button>
                                                        {renderPagination()}
                                                        <button
                                                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                                                            disabled={pagination.currentPage === pagination.totalPages}
                                                            className="btn btn-outline-primary btn-sm ms-2"
                                                        >
                                                            <i className="fas fa-chevron-right"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center py-5">
                                            <i className="fas fa-users fa-3x text-muted mb-3"></i>
                                            <h5 className="text-muted">Không tìm thấy người dùng nào</h5>
                                            <p className="text-muted">Thử thay đổi bộ lọc để tìm người dùng khác</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Details Modal */}
            <UserDetailsModal
                user={selectedUser}
                onClose={() => setSelectedUser(null)}
            />

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