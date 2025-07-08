'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AdminProductService, { AdminProduct } from '@/data/Services/AdminService/ProductManageService';
import CategoryService, { Category } from '@/data/Services/CategoryService';

interface ProductTableProps {
  products: AdminProduct[];
  categories: Category[];
  onEdit: (product: AdminProduct) => void;
  onDelete: (productId: string) => void;
  onToggleStatus: (productId: string, isAvailable: boolean) => void;
  onToggleFeatured: (productId: string, isFeatured: boolean) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  categories,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleFeatured,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Chưa phân loại';
  };

  const getStatusBadge = (isAvailable: boolean) => {
    return isAvailable ? (
      <span className="badge bg-success">
        <i className="fas fa-check-circle me-1"></i>
        Có sẵn
      </span>
    ) : (
      <span className="badge bg-danger">
        <i className="fas fa-times-circle me-1"></i>
        Hết hàng
      </span>
    );
  };

  const getDiscountBadge = (basePrice: number, salePrice: number) => {
    if (salePrice && basePrice > salePrice) {
      const discount = Math.round(((basePrice - salePrice) / basePrice) * 100);
      return (
        <span className="badge bg-warning text-dark">
          -{discount}%
        </span>
      );
    }
    return null;
  };

  return (
    <div className="table-responsive">
      <table className="table table-hover table-striped">
        <thead style={{ backgroundColor: '#e8f5e8' }}>
          <tr>
            <th style={{ color: '#2d5a3d', minWidth: '80px' }}>Hình ảnh</th>
            <th style={{ color: '#2d5a3d', minWidth: '200px' }}>Tên sản phẩm</th>
            <th style={{ color: '#2d5a3d', minWidth: '120px' }}>Danh mục</th>
            <th style={{ color: '#2d5a3d', minWidth: '120px' }}>Giá</th>
            <th style={{ color: '#2d5a3d', minWidth: '100px' }}>Trạng thái</th>
            <th style={{ color: '#2d5a3d', minWidth: '100px' }}>Tính năng</th>
            <th style={{ color: '#2d5a3d', minWidth: '120px' }}>Ngày tạo</th>
            <th style={{ color: '#2d5a3d', minWidth: '150px' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <div
                  className="rounded-3 overflow-hidden shadow-sm"
                  style={{ width: '60px', height: '60px', border: '2px solid #4a7c59' }}
                >
                  <Image
                    src={product.thumbnailUrl || '/placeholder.png'}
                    alt={product.name}
                    width={60}
                    height={60}
                    style={{ objectFit: 'cover' }}
                    className="rounded-3"
                  />
                </div>
              </td>
              <td>
                <div>
                  <h6 className="mb-1 fw-bold">{product.name}</h6>
                  <small className="text-muted">
                    {product.unit} {product.unitSize}
                  </small>
                  {product.sku && (
                    <div>
                      <small className="text-muted">SKU: {product.sku}</small>
                    </div>
                  )}
                </div>
              </td>
              <td>
                <span className="badge bg-light text-dark">
                  {getCategoryName(product.mainCategoryId)}
                </span>
              </td>
              <td>
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-success">
                      {formatCurrency(product.salePrice || product.basePrice)}
                    </span>
                    {getDiscountBadge(product.basePrice, product.salePrice ? product.salePrice : 0)}
                  </div>
                  {product.salePrice && product.basePrice > product.salePrice && (
                    <small className="text-muted text-decoration-line-through">
                      {formatCurrency(product.basePrice)}
                    </small>
                  )}
                </div>
              </td>
              <td>
                <div className="d-flex align-items-center">
                  {getStatusBadge(product.isAvailable ? product.isAvailable : false)}
                </div>
              </td>
              <td>
                <div className="d-flex flex-column gap-1">
                  {product.isFeatured && (
                    <span className="badge bg-warning text-dark">
                      <i className="fas fa-star me-1"></i>
                      Nổi bật
                    </span>
                  )}
                  {product.isOrganic && (
                    <span className="badge bg-success">
                      <i className="fas fa-leaf me-1"></i>
                      Hữu cơ
                    </span>
                  )}
                  {product.isFreshProduct && (
                    <span className="badge bg-info">
                      <i className="fas fa-snowflake me-1"></i>
                      Tươi sống
                    </span>
                  )}
                </div>
              </td>
              <td>
                {product.createdAt && (
                  <small className="text-muted">

                    {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                  </small>
                )}
              </td>
              <td>
                <div className="d-flex gap-1">
                  <button
                    onClick={() => onEdit(product)}
                    className="btn btn-outline-primary btn-sm"
                    title="Chỉnh sửa"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    onClick={() => onToggleStatus(product.id, !product.isAvailable)}
                    className={`btn btn-sm ${product.isAvailable ? 'btn-outline-warning' : 'btn-outline-success'}`}
                    title={product.isAvailable ? 'Ẩn sản phẩm' : 'Hiển thị sản phẩm'}
                  >
                    <i className={`fas ${product.isAvailable ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                  <button
                    onClick={() => onToggleFeatured(product.id, !product.isFeatured)}
                    className={`btn btn-sm ${product.isFeatured ? 'btn-warning' : 'btn-outline-warning'}`}
                    title={product.isFeatured ? 'Bỏ nổi bật' : 'Đánh dấu nổi bật'}
                  >
                    <i className="fas fa-star"></i>
                  </button>
                  <button
                    onClick={() => onDelete(product.id)}
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

export default function ProductManagePage() {
  const router = useRouter();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedFeature, setSelectedFeature] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          AdminProductService.getAll(),
          CategoryService.getAllCategory(),
        ]);

        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Không thể tải dữ liệu');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter and search products
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.mainCategoryId === selectedCategory);
    }

    // Status filter
    if (selectedStatus) {
      filtered = filtered.filter(product => {
        if (selectedStatus === 'available') return product.isAvailable;
        if (selectedStatus === 'unavailable') return !product.isAvailable;
        return true;
      });
    }

    // Feature filter
    if (selectedFeature) {
      filtered = filtered.filter(product => {
        if (selectedFeature === 'featured') return product.isFeatured;
        if (selectedFeature === 'organic') return product.isOrganic;
        if (selectedFeature === 'fresh') return product.isFreshProduct;
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof AdminProduct];
      let bValue: any = b[sortBy as keyof AdminProduct];

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

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, searchTerm, selectedCategory, selectedStatus, selectedFeature, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleEdit = (product: AdminProduct) => {
    router.push(`/dashboard/update-product/${product.id}`);
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;

    try {
      await AdminProductService.remove(productId);
      toast.success('Xóa sản phẩm thành công!');
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Không thể xóa sản phẩm');
    }
  };

  const handleToggleStatus = async (productId: string, isAvailable: boolean) => {
    try {
      await AdminProductService.updateStatus(productId, isAvailable);
      toast.success(isAvailable ? 'Hiển thị sản phẩm thành công!' : 'Ẩn sản phẩm thành công!');
      setProducts(prev => prev.map(p =>
        p.id === productId ? { ...p, isAvailable } : p
      ));
    } catch (error) {
      console.error('Error updating product status:', error);
      toast.error('Không thể cập nhật trạng thái sản phẩm');
    }
  };

  const handleToggleFeatured = async (productId: string, isFeatured: boolean) => {
    try {
      await AdminProductService.updateFeatured(productId, isFeatured);
      toast.success(isFeatured ? 'Đánh dấu nổi bật thành công!' : 'Bỏ đánh dấu nổi bật thành công!');
      setProducts(prev => prev.map(p =>
        p.id === productId ? { ...p, isFeatured } : p
      ));
    } catch (error) {
      console.error('Error updating featured status:', error);
      toast.error('Không thể cập nhật trạng thái nổi bật');
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSelectedFeature('');
    setSortBy('createdAt');
    setSortOrder('desc');
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
                <p className="mt-3 text-muted">Đang tải danh sách sản phẩm...</p>
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
                  <i className="fas fa-boxes me-3 fs-4"></i>
                  <div>
                    <h3 className="mb-0" style={{ color: "white" }}>Quản Lý Sản Phẩm</h3>
                    <p className="mb-0 opacity-75" style={{ color: "white" }}>Tổng cộng {filteredProducts.length} sản phẩm</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/dashboard/add-product')}
                  className="btn btn-light btn-lg"
                  style={{ fontWeight: 'bold' }}
                >
                  <i className="fas fa-plus me-2"></i>
                  Thêm Sản Phẩm
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
                        <div className="col-md-3">
                          <label className="form-label fw-bold">Tìm kiếm</label>
                          <div className="input-group">
                            <span className="input-group-text" style={{ backgroundColor: '#e8f5e8', color: '#2d5a3d' }}>
                              <i className="fas fa-search"></i>
                            </span>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Tên sản phẩm, SKU..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              style={{ borderColor: '#4a7c59' }}
                            />
                          </div>
                        </div>

                        <div className="col-md-2">
                          <label className="form-label fw-bold">Danh mục</label>
                          <select
                            className="form-select"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            style={{ borderColor: '#4a7c59' }}
                          >
                            <option value="">Tất cả</option>
                            {categories.map(category => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-2">
                          <label className="form-label fw-bold">Trạng thái</label>
                          <select
                            className="form-select"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            style={{ borderColor: '#4a7c59' }}
                          >
                            <option value="">Tất cả</option>
                            <option value="available">Có sẵn</option>
                            <option value="unavailable">Hết hàng</option>
                          </select>
                        </div>

                        <div className="col-md-2">
                          <label className="form-label fw-bold">Tính năng</label>
                          <select
                            className="form-select"
                            value={selectedFeature}
                            onChange={(e) => setSelectedFeature(e.target.value)}
                            style={{ borderColor: '#4a7c59' }}
                          >
                            <option value="">Tất cả</option>
                            <option value="featured">Nổi bật</option>
                            <option value="organic">Hữu cơ</option>
                            <option value="fresh">Tươi sống</option>
                          </select>
                        </div>

                        <div className="col-md-2">
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
                            <option value="createdAt-desc">Mới nhất</option>
                            <option value="createdAt-asc">Cũ nhất</option>
                            <option value="name-asc">Tên A-Z</option>
                            <option value="name-desc">Tên Z-A</option>
                            <option value="basePrice-asc">Giá thấp đến cao</option>
                            <option value="basePrice-desc">Giá cao đến thấp</option>
                          </select>
                        </div>

                        <div className="col-md-1">
                          <label className="form-label fw-bold">&nbsp;</label>
                          <button
                            onClick={resetFilters}
                            className="btn btn-outline-secondary d-block w-100"
                            title="Xóa bộ lọc"
                          >
                            <i className="fas fa-undo"></i>
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
                    <div className="col-md-3">
                      <div className="card bg-primary text-white">
                        <div className="card-body">
                          <div className="d-flex align-items-center">
                            <i className="fas fa-boxes fa-2x me-3"></i>
                            <div>
                              <h4 className="mb-0">{products.length}</h4>
                              <p className="mb-0" style={{ color: "white" }}>Tổng sản phẩm</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card bg-success text-white">
                        <div className="card-body">
                          <div className="d-flex align-items-center">
                            <i className="fas fa-check-circle fa-2x me-3"></i>
                            <div>
                              <h4 className="mb-0">{products.filter(p => p.isAvailable).length}</h4>
                              <p className="mb-0" style={{ color: "white" }}>Có sẵn</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card bg-warning text-white">
                        <div className="card-body">
                          <div className="d-flex align-items-center">
                            <i className="fas fa-star fa-2x me-3"></i>
                            <div>
                              <h4 className="mb-0">{products.filter(p => p.isFeatured).length}</h4>
                              <p className="mb-0" style={{ color: "white" }}>Nổi bật</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card bg-danger text-white">
                        <div className="card-body">
                          <div className="d-flex align-items-center">
                            <i className="fas fa-times-circle fa-2x me-3"></i>
                            <div>
                              <h4 className="mb-0">{products.filter(p => !p.isAvailable).length}</h4>
                              <p className="mb-0" style={{ color: "white" }}>Hết hàng</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Table */}
              <div className="row">
                <div className="col-12">
                  {paginatedProducts.length > 0 ? (
                    <ProductTable
                      products={paginatedProducts}
                      categories={categories}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleStatus={handleToggleStatus}
                      onToggleFeatured={handleToggleFeatured}
                    />
                  ) : (
                    <div className="text-center py-5">
                      <i className="fas fa-box-open fa-3x text-muted mb-3"></i>
                      <h5 className="text-muted">Không tìm thấy sản phẩm nào</h5>
                      <p className="text-muted">
                        {products.length === 0
                          ? 'Hãy thêm sản phẩm đầu tiên của bạn'
                          : 'Thử thay đổi bộ lọc để tìm sản phẩm khác'
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
                          Hiển thị {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredProducts.length)}
                          trong tổng số {filteredProducts.length} sản phẩm
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
      `}</style>
    </div>
  );
}