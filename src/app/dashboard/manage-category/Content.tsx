'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminCategoryService, { AdminCategoryPayload, CategoryAdmin } from '@/data/Services/AdminService/CategoryManage';


interface CategoryTableProps {
    categories: CategoryAdmin[];
    onEdit: (category: CategoryAdmin) => void;
    onDelete: (categoryId: string) => void;
    onToggleStatus: (categoryId: string, isActive: boolean) => void;
}

const CategoryTable: React.FC<CategoryTableProps> = ({
    categories,
    onEdit,
    onDelete,
    onToggleStatus,
}) => {
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

    return (
        <div className="table-responsive">
            <table className="table table-hover table-striped">
                <thead style={{ backgroundColor: '#e8f5e8' }}>
                    <tr>
                        <th style={{ color: '#2d5a3d', minWidth: '80px' }}>Hình ảnh</th>
                        <th style={{ color: '#2d5a3d', minWidth: '60px' }}>Icon</th>
                        <th style={{ color: '#2d5a3d', minWidth: '200px' }}>Tên danh mục</th>
                        <th style={{ color: '#2d5a3d', minWidth: '150px' }}>Slug</th>
                        <th style={{ color: '#2d5a3d', minWidth: '200px' }}>Mô tả</th>
                        {/* <th style={{ color: '#2d5a3d', minWidth: '100px' }}>Thứ tự</th> */}
                        <th style={{ color: '#2d5a3d', minWidth: '100px' }}>Trạng thái</th>
                        <th style={{ color: '#2d5a3d', minWidth: '120px' }}>Ngày tạo</th>
                        <th style={{ color: '#2d5a3d', minWidth: '150px' }}>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((category) => (
                        <tr key={category.id}>
                            <td>
                                <div
                                    className="rounded-3 overflow-hidden shadow-sm"
                                    style={{ width: '60px', height: '60px', border: '2px solid #4a7c59' }}
                                >
                                    <Image
                                        src={category.imageUrl || '/placeholder.png'}
                                        alt={category.name}
                                        width={60}
                                        height={60}
                                        style={{ objectFit: 'cover' }}
                                        className="rounded-3"
                                    />
                                </div>
                            </td>
                            <td>
                                <div
                                    className="rounded-3 overflow-hidden shadow-sm d-flex align-items-center justify-content-center"
                                    style={{ width: '40px', height: '40px', border: '2px solid #4a7c59', backgroundColor: '#f8f9fa' }}
                                >
                                    {category.iconUrl ? (
                                        <Image
                                            src={category.iconUrl}
                                            alt={category.name}
                                            width={24}
                                            height={24}
                                            style={{ objectFit: 'contain' }}
                                        />
                                    ) : (
                                        <i className="fas fa-folder text-muted"></i>
                                    )}
                                </div>
                            </td>
                            <td>
                                <div>
                                    <h6 className="mb-1 fw-bold">{category.name}</h6>
                                </div>
                            </td>
                            <td>
                                <span className="badge bg-light text-dark font-monospace">
                                    {category.slug}
                                </span>
                            </td>
                            <td>
                                <div style={{ maxWidth: '200px' }}>
                                    <p className="mb-0 text-muted small text-truncate" title={category.description}>
                                        {category.description || 'Không có mô tả'}
                                    </p>
                                </div>
                            </td>
                            {/* <td> 
                                <div className="d-flex align-items-center gap-2">
                                    <span className="badge bg-primary">{category.displayOrder}</span>
                                    <div className="btn-group-vertical" role="group">
                                        <button
                                            onClick={() => onReorder(category.id, 'up')}
                                            className="btn btn-outline-secondary btn-sm"
                                            style={{ fontSize: '10px', padding: '2px 4px' }}
                                            title="Di chuyển lên"
                                        >
                                            <i className="fas fa-chevron-up"></i>
                                        </button>
                                        <button
                                            onClick={() => onReorder(category.id, 'down')}
                                            className="btn btn-outline-secondary btn-sm"
                                            style={{ fontSize: '10px', padding: '2px 4px' }}
                                            title="Di chuyển xuống"
                                        >
                                            <i className="fas fa-chevron-down"></i>
                                        </button>
                                    </div>
                                </div>
                            </td> */}
                            <td>
                                <div className="d-flex align-items-center">
                                    {getStatusBadge(category.isActive)}
                                </div>
                            </td>
                            <td>
                                {category.createdAt && (
                                    <small className="text-muted">
                                        {new Date(category.createdAt).toLocaleDateString('vi-VN')}
                                    </small>
                                )}
                            </td>
                            <td>
                                <div className="d-flex gap-1">
                                    <button
                                        onClick={() => onEdit(category)}
                                        className="btn btn-outline-primary btn-sm"
                                        title="Chỉnh sửa"
                                    >
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button
                                        onClick={() => onToggleStatus(category.id, !category.isActive)}
                                        className={`btn btn-sm ${category.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                        title={category.isActive ? 'Tạm dừng danh mục' : 'Kích hoạt danh mục'}
                                    >
                                        <i className={`fas ${category.isActive ? 'fa-pause' : 'fa-play'}`}></i>
                                    </button>
                                    <button
                                        onClick={() => onDelete(category.id)}
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

export default function CategoryManagePage() {
    const router = useRouter();
    const [categories, setCategories] = useState<CategoryAdmin[]>([]);
    const [filteredCategories, setFilteredCategories] = useState<CategoryAdmin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [sortBy, setSortBy] = useState('displayOrder');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Load data
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const response = await AdminCategoryService.getAllAdminCategories();
                setCategories(response.data);
            } catch (error) {
                console.error('Error loading categories:', error);
                toast.error('Không thể tải danh sách danh mục');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // Filter and search categories
    useEffect(() => {
        let filtered = [...categories];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(category =>
                category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                category.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                category.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (selectedStatus) {
            filtered = filtered.filter(category => {
                if (selectedStatus === 'active') return category.isActive;
                if (selectedStatus === 'inactive') return !category.isActive;
                return true;
            });
        }

        // Sort
        filtered.sort((a, b) => {
            let aValue: any = a[sortBy as keyof CategoryAdmin];
            let bValue: any = b[sortBy as keyof CategoryAdmin];

            if (sortBy === 'createdAt') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        setFilteredCategories(filtered);
        setCurrentPage(1);
    }, [categories, searchTerm, selectedStatus, sortBy, sortOrder]);

    // Pagination
    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

    const handleEdit = (category: CategoryAdmin) => {
        router.push(`/dashboard/update-category/${category.id}`);
    };

    const handleDelete = async (categoryId: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;

        try {
            await AdminCategoryService.deleteAdminCategory(categoryId);
            toast.success('Xóa danh mục thành công!');
            setCategories(prev => prev.filter(c => c.id !== categoryId));
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error('Không thể xóa danh mục');
        }
    };

    const handleToggleStatus = async (categoryId: string, isActive: boolean) => {
        try {
            const category = categories.find(c => c.id === categoryId);
            if (!category) return;

            const payload: AdminCategoryPayload = {
                id: category.id,
                name: category.name,
                slug: category.slug,
                description: category.description,
                imageUrl: category.imageUrl,
                iconUrl: category.iconUrl,
                displayOrder: category.displayOrder,
                isActive,
                productSubCategoryIds: []
            };

            await AdminCategoryService.updateAdminCategory(categoryId, payload);
            toast.success(isActive ? 'Kích hoạt danh mục thành công!' : 'Tạm dừng danh mục thành công!');

            setCategories(prev => prev.map(c =>
                c.id === categoryId ? { ...c, isActive } : c
            ));
        } catch (error) {
            console.error('Error updating category status:', error);
            toast.error('Không thể cập nhật trạng thái danh mục');
        }
    };

    // const handleReorder = async (categoryId: string, direction: 'up' | 'down') => {
    //     const category = categories.find(c => c.id === categoryId);
    //     if (!category) return;

    //     const newOrder = direction === 'up' ? category.displayOrder - 1 : category.displayOrder + 1;
    //     if (newOrder < 1) return;

    //     try {
    //         const payload: AdminCategoryPayload = {
    //             name: category.name,
    //             slug: category.slug,
    //             description: category.description,
    //             imageUrl: category.imageUrl,
    //             iconUrl: category.iconUrl,
    //             displayOrder: newOrder,
    //             isActive: category.isActive,
    //             productSubCategoryIds: []
    //         };

    //         await AdminCategoryService.updateAdminCategory(categoryId, payload);
    //         toast.success('Cập nhật thứ tự thành công!');

    //         setCategories(prev => prev.map(c =>
    //             c.id === categoryId ? { ...c, displayOrder: newOrder } : c
    //         ));
    //     } catch (error) {
    //         console.error('Error updating category order:', error);
    //         toast.error('Không thể cập nhật thứ tự danh mục');
    //     }
    // };

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedStatus('');
        setSortBy('displayOrder');
        setSortOrder('asc');
        setCurrentPage(1);
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
                                <p className="mt-3 text-muted">Đang tải danh sách danh mục...</p>
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
                        <div className="card-header text-white" style={{ background: 'linear-gradient(135deg, #2d5a3d, #4a7c59)', color: 'white' }}>
                            <div className="d-flex justify-content-between align-items-center" style={{ padding: '20px', color: 'white' }}>
                                <div className="d-flex align-items-center">
                                    <i className="fas fa-folder me-3 fs-4"></i>
                                    <div>
                                        <h3 className="mb-0" style={{ color: "white" }}>Quản Lý Danh Mục</h3>
                                        <p className="mb-0 opacity-75" style={{ color: "white" }}>Tổng cộng {filteredCategories.length} danh mục</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => router.push('/dashboard/add-category')}
                                    className="btn btn-light btn-lg"
                                    style={{ fontWeight: 'bold' }}
                                >
                                    <i className="fas fa-plus me-2"></i>
                                    Thêm Danh Mục
                                </button>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="card-body">
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
                                                            placeholder="Tên danh mục, slug, mô tả..."
                                                            value={searchTerm}
                                                            onChange={(e) => setSearchTerm(e.target.value)}
                                                            style={{ borderColor: '#4a7c59' }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-md-3">
                                                    <label className="form-label fw-bold">Trạng thái</label>
                                                    <select
                                                        className="form-select"
                                                        value={selectedStatus}
                                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                                        style={{ borderColor: '#4a7c59' }}
                                                    >
                                                        <option value="">Tất cả</option>
                                                        <option value="active">Hoạt động</option>
                                                        <option value="inactive">Tạm dừng</option>
                                                    </select>
                                                </div>

                                                <div className="col-md-3">
                                                    <label className="form-label fw-bold">Sắp xếp</label>
                                                    <select
                                                        className="form-select"
                                                        value={`${sortBy}-${sortOrder}`}
                                                        onChange={(e) => {
                                                            const [field, order] = e.target.value.split('-');
                                                            setSortBy(field);
                                                            setSortOrder(order as 'asc' | 'desc');
                                                        }}
                                                        style={{ borderColor: '#4a7c59' }}
                                                    >
                                                        <option value="displayOrder-asc">Thứ tự tăng dần</option>
                                                        <option value="displayOrder-desc">Thứ tự giảm dần</option>
                                                        <option value="name-asc">Tên A-Z</option>
                                                        <option value="name-desc">Tên Z-A</option>
                                                        <option value="createdAt-desc">Mới nhất</option>
                                                        <option value="createdAt-asc">Cũ nhất</option>
                                                    </select>
                                                </div>

                                                <div className="col-md-2">
                                                    <label className="form-label fw-bold">&nbsp;</label>
                                                    <button
                                                        onClick={resetFilters}
                                                        className="btn btn-outline-secondary d-block w-100"
                                                        title="Xóa bộ lọc"
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
                                <div className="col-12">
                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <div className="card bg-primary text-white">
                                                <div className="card-body">
                                                    <div className="d-flex align-items-center">
                                                        <i className="fas fa-folder fa-2x me-3"></i>
                                                        <div>
                                                            <h4 className="mb-0">{categories.length}</h4>
                                                            <p className="mb-0" style={{ color: "white" }}>Tổng danh mục</p>
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
                                                            <h4 className="mb-0">{categories.filter(c => c.isActive).length}</h4>
                                                            <p className="mb-0" style={{ color: "white" }}>Hoạt động</p>
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
                                                            <h4 className="mb-0">{categories.filter(c => !c.isActive).length}</h4>
                                                            <p className="mb-0" style={{ color: "white" }}>Tạm dừng</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* <div className="col-md-3">
                                            <div className="card bg-info text-white">
                                                <div className="card-body">
                                                    <div className="d-flex align-items-center">
                                                        <i className="fas fa-sort-numeric-up fa-2x me-3"></i>
                                                        <div>
                                                            <h4 className="mb-0">{Math.max(...categories.map(c => c.displayOrder), 0)}</h4>
                                                            <p className="mb-0" style={{ color: "white" }}>Thứ tự cao nhất</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div> */}
                                    </div>
                                </div>
                            </div>

                            {/* Categories Table */}
                            <div className="row">
                                <div className="col-12">
                                    {paginatedCategories.length > 0 ? (
                                        <CategoryTable
                                            categories={paginatedCategories}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                            onToggleStatus={handleToggleStatus}
                                        />
                                    ) : (
                                        <div className="text-center py-5">
                                            <i className="fas fa-folder-open fa-3x text-muted mb-3"></i>
                                            <h5 className="text-muted">Không tìm thấy danh mục nào</h5>
                                            <p className="text-muted">
                                                {categories.length === 0
                                                    ? 'Hãy thêm danh mục đầu tiên của bạn'
                                                    : 'Thử thay đổi bộ lọc để tìm danh mục khác'
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="row mt-4">
                                    <div className="col-12">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <span className="text-muted">
                                                    Hiển thị {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredCategories.length)}
                                                    trong tổng số {filteredCategories.length} danh mục
                                                </span>
                                            </div>
                                            <nav>
                                                <ul className="pagination mb-0">
                                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                        <button
                                                            className="page-link"
                                                            onClick={() => setCurrentPage(currentPage - 1)}
                                                            disabled={currentPage === 1}
                                                        >
                                                            <i className="fas fa-chevron-left"></i>
                                                        </button>
                                                    </li>
                                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                        <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                                                            <button
                                                                className="page-link"
                                                                onClick={() => setCurrentPage(page)}
                                                                style={currentPage === page ? { backgroundColor: '#4a7c59', borderColor: '#4a7c59' } : {}}
                                                            >
                                                                {page}
                                                            </button>
                                                        </li>
                                                    ))}
                                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                        <button
                                                            className="page-link"
                                                            onClick={() => setCurrentPage(currentPage + 1)}
                                                            disabled={currentPage === totalPages}
                                                        >
                                                            <i className="fas fa-chevron-right"></i>
                                                        </button>
                                                    </li>
                                                </ul>
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            )}
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
        
        .page-link {
          color: #4a7c59;
        }
        
        .page-link:hover {
          color: #2d5a3d;
          background-color: rgba(74, 124, 89, 0.1);
        }
        
        .badge {
          font-size: 0.75em;
        }
        
        .btn-group-vertical .btn {
          line-height: 1;
        }
      `}</style>
        </div>
    );
}