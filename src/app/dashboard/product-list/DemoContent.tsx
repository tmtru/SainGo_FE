'use client';

import React, { useState, useEffect, useRef } from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductService, { Product, ProductFilterDto } from "@/data/Services/ProductService";
import CategoryService, { Category } from "@/data/Services/CategoryService";
import CustomLoader from "@/components/common/CustomLoader";
import { Pagination } from "@mui/material";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// A simple, reusable accordion component for the filter sidebar
const FilterAccordion = ({ title, children }: { title: string, children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="filter-accordion mb-3">
      <button
        className="accordion-header d-flex justify-content-between align-items-center w-100 btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h6 className="mb-0 fw-semibold">{title}</h6>
        <i className={`fa fa-chevron-down transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>
      {isOpen && (
        <div className="accordion-body mt-3">
          {children}
        </div>
      )}
      <style jsx>{`
                .accordion-header { text-align: left; padding: 0; }
                .transition-transform { transition: transform 0.2s ease-in-out; }
                .rotate-180 { transform: rotate(180deg); }
            `}</style>
    </div>
  );
};


interface EditFormData {
  name?: string;
  basePrice?: number;
  salePrice?: number;
  stockQuantity?: number;
  categoryId?: string;
  description?: string;
}

const ProductDashboard = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // API response states
  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Edit states
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Filter states initialized from URL search parameters
  const [localSearchQuery, setLocalSearchQuery] = useState<string>(
    searchParams.get('keyword') || ''
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('categoryId')?.split(',') || []
  );
  const [minPrice, setMinPrice] = useState<number>(
    parseFloat(searchParams.get('minPrice') || '0')
  );
  const [maxPrice, setMaxPrice] = useState<number>(
    parseFloat(searchParams.get('maxPrice') || '999999999')
  );
  const [pageNumber, setPageNumber] = useState<number>(
    parseInt(searchParams.get('pageNumber') || '1', 10)
  );
  const [pageSize, setPageSize] = useState<number>(
    parseInt(searchParams.get('pageSize') || '15', 10)
  );

  // UI states
  const [selectedRows, setSelectedRows] = useState<Product[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(localSearchQuery);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);

  const dropdownRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  // BƯỚC 1: Thêm state để quản lý việc sắp xếp
  const [sortField, setSortField] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortDesc, setSortDesc] = useState(
    searchParams.get('sortDesc') === 'true' // ← sửa đúng kiểu boolean
  );
  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(localSearchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isInside = Array.from(dropdownRefs.current.values()).some(ref =>
        ref && ref.contains(event.target as Node)
      );
      if (!isInside) setActiveDropdown(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset page number when filters change
  useEffect(() => {
    setPageNumber(1);
  }, [debouncedSearchQuery, selectedCategories, minPrice, maxPrice]);

  // Fetch products and categories
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      const filterDto: ProductFilterDto = {};

      if (debouncedSearchQuery) {
        filterDto.keyword = debouncedSearchQuery;
        params.append('keyword', debouncedSearchQuery);
      }

      if (selectedCategories.length > 0) {
        const joined = selectedCategories.join(',');
        filterDto.categoryId = joined;
        params.append('categoryId', joined);
      }

      if (minPrice !== 0) {
        filterDto.minPrice = minPrice;
        params.append('minPrice', minPrice.toString());
      }

      if (maxPrice !== 999999999) {
        filterDto.maxPrice = maxPrice;
        params.append('maxPrice', maxPrice.toString());
      }

      filterDto.PageNumber = pageNumber;
      params.append('pageNumber', pageNumber.toString());

      filterDto.pageSize = pageSize;
      params.append('pageSize', pageSize.toString());
      // BƯỚC 2: Thêm tham số sắp xếp vào DTO và URL
      filterDto.sortBy = sortField;
      params.append('sortBy', sortField);

      filterDto.sortDesc = sortDesc;
      params.append('sortDesc', sortDesc.toString()); 
      
      // Update URL
      router.push(`?${params.toString()}`, { scroll: false });

      try {
        const response = await ProductService.getFilteredProducts(filterDto);
        const { items, totalPages, totalItems } = response.data;
        setProducts(items);
        setTotalPages(totalPages);
        setTotalItems(totalItems);
      } catch (err: any) {
        console.error("Failed to fetch products:", err);
        setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await CategoryService.getAllCategory();
        setAllCategories(response.data);
      } catch (err: any) {
        console.error("Failed to fetch categories:", err);
        setError(err.response?.data?.message || err.message || 'An unexpected error occurred while fetching categories.');
      }
    };

    fetchProducts();
    fetchCategories();
  }, [
    debouncedSearchQuery,
    selectedCategories,
    minPrice,
    maxPrice,
    pageNumber,
    pageSize,
    sortField, // Thêm vào dependency array
    sortDesc, // Thêm vào dependency array
    router
  ]);
  const handleSort = (column: TableColumn<Product>, direction: 'asc' | 'desc') => {
    if (column.sortField) {
      setSortField(column.sortField);
      setSortDesc(direction === 'desc'); 
    }
  };
  
  // Handle filter changes
  const handleCategoryChange = (category: string): void => {
    setSelectedCategories(prev => {
      const newState = prev.includes(category)
        ? prev.filter((cat: string) => cat !== category)
        : [...prev, category];
      setPageNumber(1);
      return newState;
    });
  };

  const handlePriceRangeCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;

    setSelectedPriceRanges(prev => {
      const updated = checked
        ? [...prev, value]
        : prev.filter(v => v !== value);

      if (updated.length === 0) {
        setMinPrice(0);
        setMaxPrice(999999999);
      } else {
        const minValues = updated.map(v => parseInt(v.split("-")[0], 10));
        const maxValues = updated.map(v => parseInt(v.split("-")[1], 10));
        setMinPrice(Math.min(...minValues));
        setMaxPrice(Math.max(...maxValues));
      }
      setPageNumber(1);
      return updated;
    });
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setLocalSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setDebouncedSearchQuery(localSearchQuery.trim());
  };

  const handlePageChange = (page: number) => {
    setPageNumber(page);
  };

  // Edit functionality
  const handleEdit = (id: string) => {
    const productToEdit = products.find(p => p.id === id);
    if (productToEdit) {
      setEditFormData({
        name: productToEdit.name,
        basePrice: productToEdit.basePrice,
        salePrice: productToEdit.salePrice,
        stockQuantity: productToEdit.stockQuantity,
        // categoryId: productToEdit.categoryId, // Uncomment if needed
        description: productToEdit.description,
      });
      setEditProductId(id);
      setActiveDropdown(null);
    }
  };

  const handleSave = async () => {
    if (!editProductId || isSubmitting) return;
    setIsSubmitting(true);
    try {
      // API call to update product would go here
      // await ProductService.updateProduct(editProductId, editFormData);

      setProducts(products.map(p =>
        p.id === editProductId ? { ...p, ...editFormData } as Product : p
      ));
      toast.success('Product updated successfully!');
    } catch (err: any) {
      console.error("Failed to update product:", err);
      toast.error('Failed to update product.');
    } finally {
      setIsSubmitting(false);
      setEditProductId(null);
      setEditFormData({});
    }
  };

  const handleCancel = () => {
    setEditProductId(null);
    setEditFormData({});
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        // API call to delete product would go here
        // await ProductService.deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
        toast.success('Product deleted successfully!');
      } catch (err: any) {
        console.error("Failed to delete product:", err);
        toast.error('Failed to delete product.');
      } finally {
        setActiveDropdown(null);
      }
    }
  };

  const handleAddProduct = () => router.push('/dashboard/products/add');

  const formatPrice = (price: number): string => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  const formatDate = (dateString: string): string => new Date(dateString).toLocaleDateString('vi-VN');
  const getCategoryName = (categoryId: string): string => allCategories.find(cat => cat.id === categoryId)?.name || 'N/A';

  // Modern styles for react-data-table-component
  // Modern styles for react-data-table-component
  // Modern styles for react-data-table-component
  const customStyles = {
    header: {
      style: {
        display: 'none' as const, // We use our own card header
      },
    },
    headRow: {
      style: {
        backgroundColor: '#f8f9fa',
        borderBottomWidth: '1px',
        borderColor: '#dee2e6',
        fontWeight: 600,
        color: '#495057',
      },
    },
    rows: {
      style: {
        minHeight: '72px',
        // FIX: Use 'as const' to assert the specific literal type
        borderBottomStyle: 'solid' as const,
        borderBottomWidth: '1px',
        borderBottomColor: '#f1f1f1',
      },
      highlightOnHoverStyle: {
        backgroundColor: '#f8f9fa',
        transitionDuration: '0.15s',
        transitionProperty: 'background-color' as const,
      },
    },
    cells: {
      style: {
        padding: '12px 16px',
      },
    },
    noData: {
      style: {
        padding: '48px',
        fontSize: '1rem',
        color: '#6c757d',
      },
    },
  };

  const columns: TableColumn<Product>[] = [
    {
      name: 'Product',
      selector: row => row.name,
      sortable: true,
      sortField: 'name',
      cell: row => (
        <div className="d-flex align-items-center py-2">
          <img
            src={row.thumbnailUrl || '/assets/images/default-product.png'}
            alt={row.name}
            className="rounded me-3"
            style={{ width: '48px', height: '48px', objectFit: 'cover' }}
          />
          {editProductId === row.id ? (
            <input
              type="text"
              value={editFormData.name || ''}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              className="form-control form-control-sm"
            />
          ) : (
            <div>
              <p className="fw-semibold mb-0 text-dark">{row.name}</p>
              <small className="text-muted">SKU: {row.slug}</small>
            </div>
          )}
        </div>
      ),
      minWidth: '300px',
    },
    // { // Uncomment this block to re-enable the Category column
    //     name: 'Category',
    //     selector: row => getCategoryName(row.categoryId || ''),
    //     sortable: true,
    //     cell: row => editProductId === row.id ? (
    //         <select
    //             value={editFormData.categoryId || ''}
    //             onChange={(e) => setEditFormData({ ...editFormData, categoryId: e.target.value })}
    //             className="form-select form-select-sm"
    //         >
    //             <option value="">Select Category</option>
    //             {allCategories.map(cat => (
    //                 <option key={cat.id} value={cat.id}>{cat.name}</option>
    //             ))}
    //         </select>
    //     ) : (
    //         <span className="badge bg-light text-dark">{getCategoryName(row.categoryId || '')}</span>
    //     ),
    // },
    {
      name: 'Base Price',
      selector: row => row.basePrice,
      sortable: true,
      sortField: 'price',
      cell: row => editProductId === row.id ? (
        <input
          type="number"
          value={editFormData.basePrice || 0}
          onChange={(e) => setEditFormData({ ...editFormData, basePrice: parseFloat(e.target.value) || 0 })}
          className="form-control form-control-sm"
          style={{ width: '120px' }}
        />
      ) : (
        <p className="mb-0">{formatPrice(row.basePrice)}</p>
      ),
    },
    {
      name: 'Sale Price',
      sortField: 'price',
      selector: row => row.salePrice || 0,
      sortable: true,
      cell: row => editProductId === row.id ? (
        <input
          type="number"
          value={editFormData.salePrice || 0}
          onChange={(e) => setEditFormData({ ...editFormData, salePrice: parseFloat(e.target.value) || 0 })}
          className="form-control form-control-sm"
          style={{ width: '120px' }}
        />
      ) : (
        <p className="mb-0">{row.salePrice ? formatPrice(row.salePrice) : '—'}</p>
      ),
    },
    {
      name: 'Stock',
      selector: row => row.stockQuantity,
      sortable: true,
      cell: row => editProductId === row.id ? (
        <input
          type="number"
          value={editFormData.stockQuantity || 0}
          onChange={(e) => setEditFormData({ ...editFormData, stockQuantity: parseInt(e.target.value) || 0 })}
          className="form-control form-control-sm"
          style={{ width: '100px' }}
        />
      ) : (
        <div className="text-center">
          <p className={`fw-semibold mb-0 ${row.stockQuantity < 10 ? 'text-danger' : 'text-success'}`}>
            {row.stockQuantity}
          </p>
          {row.stockQuantity === 0 && <small className="badge bg-danger-light text-danger">Out of Stock</small>}
          {row.stockQuantity > 0 && row.stockQuantity < 10 && <small className="badge bg-warning-light text-warning">Low Stock</small>}
        </div>
      ),
    },
    {
      name: 'Created Date',
      selector: row => row.createdAt || '',
      sortable: true,
      sortField: 'createdAt',
      cell: row => <p className="text-muted mb-0">{row.createdAt ? formatDate(row.createdAt) : '—'}</p>,
    },
    {
      name: 'Action',
      cell: row => (
        <div style={{ position: 'relative' }}>
          {editProductId === row.id ? (
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-success" onClick={handleSave} disabled={isSubmitting}>
                <i className="fa fa-check"></i>
              </button>
              <button className="btn btn-sm btn-secondary" onClick={handleCancel} disabled={isSubmitting}>
                <i className="fa fa-times"></i>
              </button>
            </div>
          ) : (
            <>
              <button
                className="btn btn-sm btn-light"
                onClick={() => setActiveDropdown(prev => prev === row.id ? null : row.id)}
              >
                <i className="fa fa-ellipsis-h"></i>
              </button>
              {activeDropdown === row.id && (
                <div
                  className="dropdown-menu show shadow-lg border-0"
                  ref={(el) => {
                    if (el) dropdownRefs.current.set(row.id, el);
                    else dropdownRefs.current.delete(row.id);
                  }}
                  style={{ position: 'absolute', right: '100%', top: 0, zIndex: 10, minWidth: '120px' }}
                >
                  <button className="dropdown-item d-flex align-items-center" onClick={() => handleEdit(row.id)}>
                    <i className="fa fa-edit me-2 text-muted"></i> Edit
                  </button>
                  <button className="dropdown-item d-flex align-items-center text-danger" onClick={() => handleDelete(row.id)}>
                    <i className="fa fa-trash me-2 text-muted"></i> Delete
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <div className="product-dashboard p-3 p-md-4 bg-light">
      <div className="container-fluid">
        <div className="row g-4">
          {/* Sidebar Filters */}
          <div className="col-xl-3 col-lg-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white py-3">
                <h5 className="card-title mb-0 fw-bold">Filters</h5>
              </div>
              <div className="card-body p-4">
                {/* Search */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Search</label>
                  <form onSubmit={handleSearchSubmit}>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Product name..."
                        value={localSearchQuery}
                        onChange={handleSearchInputChange}
                      />
                      <button type="submit" className="btn btn-outline-secondary">
                        <i className="fa fa-search"></i>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Filters with Accordion */}
                <FilterAccordion title="Price Range">
                  {[
                    { label: "Under 500,000₫", value: "0-500000" },
                    { label: "500,000₫ – 1,000,000₫", value: "500000-1000000" },
                    { label: "1,000,000₫ – 3,000,000₫", value: "1000000-3000000" },
                    { label: "3,000,000₫ – 10,000,000₫", value: "3000000-10000000" },
                    { label: "Over 10,000,000₫", value: "10000000-999999999" },
                  ].map(({ label, value }) => (
                    <div className="form-check" key={value}>
                      <input
                        id={`price-${value}`}
                        type="checkbox"
                        className="form-check-input"
                        value={value}
                        onChange={handlePriceRangeCheckbox}
                        checked={selectedPriceRanges.includes(value)}
                      />
                      <label className="form-check-label" htmlFor={`price-${value}`}>{label}</label>
                    </div>
                  ))}
                </FilterAccordion>

                <FilterAccordion title="Categories">
                  {allCategories.map((cat: Category) => (
                    <div className="form-check" key={cat.id}>
                      <input
                        id={cat.id}
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedCategories.includes(cat.id)}
                        onChange={() => handleCategoryChange(cat.id)}
                      />
                      <label className="form-check-label" htmlFor={cat.id}>{cat.name}</label>
                    </div>
                  ))}
                </FilterAccordion>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-xl-9 col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white p-3 d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="card-title mb-0 fw-bold">All Products</h5>
                  <small className="text-muted">
                    {loading ? "Loading..." : `${totalItems} products found`}
                  </small>
                </div>
                <button className="btn btn-primary d-flex align-items-center" onClick={handleAddProduct}>
                  <i className="fa fa-plus me-2"></i>
                  Add Product
                </button>
              </div>

              <div className="card-body p-0">
                {error && <div className="alert alert-danger m-3">{error}</div>}
                {loading ? (
                  <div className="text-center py-5"><CustomLoader /></div>
                ) : (
                  <>
                      <div className="table-responsive">
                        {/* BƯỚC 5: Cấu hình DataTable cho server-side sorting */}
                        <DataTable
                          columns={columns}
                          data={products}
                          selectableRows
                          onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows)}
                          pagination={false}
                          noDataComponent="No products found matching your filters."
                          customStyles={customStyles}
                          highlightOnHover
                          sortServer // Bật chế độ server-side
                          onSort={handleSort} // Gán hàm xử lý
                          defaultSortFieldId={columns.find(c => c.sortField === sortField)?.id}
                          defaultSortAsc={!sortDesc}
                        />
                      </div>

                    {totalPages > 1 && (
                      <div className="d-flex justify-content-center p-3 border-top">
                        <Pagination
                          count={totalPages}
                          page={pageNumber}
                          onChange={(_, page) => handlePageChange(page)}
                          color="primary"
                          shape="rounded"
                          showFirstButton
                          showLastButton
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default ProductDashboard;