'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import CategoryService, { Category } from '@/data/Services/CategoryService';
import AdminProductService, {
  AdminProductVariantDto,
  UpdateAdminProductDto,
  AdminProduct,
} from '@/data/Services/AdminService/ProductManageService';
import UploadService from '@/data/Services/UploadImage';

export default function UpdateProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [originalProduct, setOriginalProduct] = useState<AdminProduct | null>(null);
  const [form, setForm] = useState<UpdateAdminProductDto>({
    id: '',
    mainCategoryId: '',
    name: '',
    slug: '',
    basePrice: 0,
    salePrice: 0,
    unit: 1,
    unitSize: '',
    lowStockThreshold: 0,
    maxOrderQuantity: 0,
    minOrderQuantity: 0,
    isAvailable: true,
    isFeatured: false,
    isOrganic: false,
    isFreshProduct: false,
    displayOrder: 0,
    variants: [],
    initialStock: 0,
  });

  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [previewThumb, setPreviewThumb] = useState('/placeholder.png');
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<AdminProductVariantDto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // State for pricing calculation
  const [discountType, setDiscountType] = useState<'percentage' | 'amount'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [manualSalePrice, setManualSalePrice] = useState(false);

  // Load categories
  useEffect(() => {
    (async () => {
      try {
        const catRes = await CategoryService.getAllCategory();
        setCategories(catRes.data);
      } catch (error) {
        console.error('Error loading categories:', error);
        toast.error('Không thể tải danh mục');
      }
    })();
  }, []);

  // Load product data
  useEffect(() => {
    if (!productId) return;

    (async () => {
      try {
        setIsLoading(true);
        const response = await AdminProductService.getById(productId);
        const product = response.data;
        console.log('Loaded product:', product.imageUrls);
        setOriginalProduct(product);

        // Populate form with existing data
        setForm({
          id: product.id,
          mainCategoryId: product.mainCategoryId || '',
          subCategoryId: product.subCategoryId || '',
          brandId: product.brandId || '',
          name: product.name || '',
          slug: product.slug || '',
          description: product.description || '',
          shortDescription: product.shortDescription || '',
          sku: product.sku || '',
          barcode: product.barcode || '',
          basePrice: product.basePrice || 0,
          salePrice: product.salePrice || 0,
          costPrice: product.costPrice || 0,
          weight: product.weight || 0,
          dimensions: product.dimensions || '',
          unit: product.unit || 1,
          unitSize: product.unitSize || '',
          thumbnailUrl: product.thumbnailUrl || '',
          imageUrls: product.imageUrls || '',
          initialStock: product.stockQuantity || 0,
          lowStockThreshold: product.lowStockThreshold || 0,
          maxOrderQuantity: product.maxOrderQuantity || 0,
          minOrderQuantity: product.minOrderQuantity || 0,
          isAvailable: product.isAvailable ?? true,
          isFeatured: product.isFeatured ?? false,
          isOrganic: product.isOrganic ?? false,
          isFreshProduct: product.isFreshProduct ?? false,
          metaTitle: product.metaTitle || '',
          metaDescription: product.metaDescription || '',
          displayOrder: product.displayOrder || 0,
          variants: product.variants || [],
        });

        // Set images
        if (product.thumbnailUrl) {
          setPreviewThumb(product.thumbnailUrl);
        }
        if (product.imageUrls) {
          try {
            const urls = JSON.parse(product.imageUrls);
            if (Array.isArray(urls)) {
              setPreviewImages(urls);
            } else {
              setPreviewImages([]);
            }
          } catch (err) {
            console.error('Lỗi parse imageUrls:', err);
            setPreviewImages([]);
          }
        }


        // Set variants
        if (product.variants && product.variants.length > 0) {
          setVariants(product.variants);
        }

        // Calculate discount if applicable
        if (product.basePrice && product.salePrice && product.basePrice > product.salePrice) {
          const discountAmount = product.basePrice - product.salePrice;
          const discountPercent = (discountAmount / product.basePrice) * 100;

          // Determine if it's likely a percentage or amount discount
          if (discountPercent % 1 === 0 && discountPercent <= 50) {
            setDiscountType('percentage');
            setDiscountValue(discountPercent);
          } else {
            setDiscountType('amount');
            setDiscountValue(discountAmount);
          }
        }

      } catch (error) {
        console.error('Error loading product:', error);
        toast.error('Không thể tải thông tin sản phẩm');
        router.push('/dashboard/products');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [productId, router]);

  // Auto-calculate sale price
  useEffect(() => {
    if (form.basePrice > 0 && !manualSalePrice) {
      let calculatedSalePrice = 0;

      if (discountType === 'percentage') {
        calculatedSalePrice = form.basePrice * (1 - discountValue / 100);
      } else {
        calculatedSalePrice = form.basePrice - discountValue;
      }

      calculatedSalePrice = Math.max(0, calculatedSalePrice);

      setForm(prev => ({
        ...prev,
        salePrice: parseFloat(calculatedSalePrice.toFixed(2)),
      }));
    }
  }, [form.basePrice, discountType, discountValue, manualSalePrice]);

  const handleChange = (e: any) => {
    const { id, type, value, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : type === 'number' ? +value : value,
    }));
  };

  const handleBasePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setForm(prev => ({
      ...prev,
      basePrice: value,
    }));
    setManualSalePrice(false);
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setDiscountValue(value);
    setManualSalePrice(false);
  };

  const handleManualSalePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setForm(prev => ({
      ...prev,
      salePrice: value,
    }));
    setManualSalePrice(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleThumbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnail(file);
    setPreviewThumb(URL.createObjectURL(file));
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
    setPreviewImages(files.map(f => URL.createObjectURL(f)));
  };

  const addVariant = () => {
    setVariants(prev => [
      ...prev,
      { name: '', sku: '', priceAdjustment: 0, attributeName: '', attributeValue: '' },
    ]);
  };

  const updateVariant = (idx: number, key: keyof AdminProductVariantDto, val: any) => {
    setVariants(prev => {
      const arr = [...prev];
      (arr[idx] as any)[key] = val;
      return arr;
    });
  };

  const removeVariant = (idx: number) => {
    setVariants(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (variants.length === 0 && (form.initialStock == null || form.initialStock ==undefined || form.initialStock < 0)) {
        toast.error('Vui lòng nhập số lượng sản phẩm hiện có.');
        setIsSubmitting(false);
        return;
      }

      let thumbUrl = form.thumbnailUrl || '';
      if (thumbnail) {
        const res = await UploadService.uploadSingle(thumbnail);
        thumbUrl = res.data;
      }

      let imageUrls = form.imageUrls || '';
      if (images.length > 0) {
        const uploadPromises = images.map(file => UploadService.uploadSingle(file));
        const uploadResults = await Promise.all(uploadPromises);
        imageUrls = uploadResults.map(res => res.data).join(',');
      }

      const payload: UpdateAdminProductDto = {
        ...form,
        thumbnailUrl: thumbUrl,
        imageUrls: imageUrls,
        variants: variants,
      };

      await AdminProductService.update(productId, payload);
      toast.success('Cập nhật sản phẩm thành công!');
    } catch (err: any) {
      console.error(err);
      toast.error('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container-fluid py-4" style={{ backgroundColor: '#f8fffe' }}>
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card shadow-lg border-0">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-success" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Đang tải thông tin sản phẩm...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#f8fffe' }}>
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow-lg border-0">
            <div className="card-header text-white" style={{ background: 'linear-gradient(135deg, #2d5a3d, #4a7c59)' }}>
              <div className="d-flex align-items-center" style={{ gap: '10px', padding: '20px', color: 'white' }}>
                <i className="fas fa-edit me-2 fs-4"></i>
                <h3 className="mb-0" style={{ color: "white" }}>Cập Nhật Sản Phẩm</h3>
                {originalProduct && (
                  <span className="badge bg-light text-dark ms-2">
                    ID: {originalProduct.id}
                  </span>
                )}
              </div>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {/* Basic Information Section */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="card border-0 mb-4" style={{ backgroundColor: '#f0f8f0' }}>
                      <div className="card-header bg-transparent border-bottom-0">
                        <h5 className="mb-0" style={{ color: '#2d5a3d' }}>
                          <i className="fas fa-info-circle me-2"></i>
                          Thông Tin Cơ Bản
                        </h5>
                      </div>
                      <div className="card-body">
                        <div className="row pb-5">
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label fw-bold">
                                Tên Sản Phẩm <span className="text-danger">*</span>
                              </label>
                              <input
                                id="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                className="form-control form-control-lg"
                                style={{ borderColor: '#4a7c59' }}
                                placeholder="Nhập tên sản phẩm..."
                              />
                            </div>

                            <div className="mb-3">
                              <label className="form-label fw-bold">
                                Slug <span className="text-danger">*</span>
                              </label>
                              <input
                                id="slug"
                                value={form.slug}
                                onChange={handleChange}
                                required
                                className="form-control"
                                style={{ borderColor: '#4a7c59' }}
                                placeholder="san-pham-moi"
                              />
                            </div>

                            <div className="mb-3">
                              <label className="form-label fw-bold">
                                Danh Mục <span className="text-danger">*</span>
                              </label>
                              <select
                                id="mainCategoryId"
                                value={form.mainCategoryId}
                                onChange={handleChange}
                                required
                                className="form-select form-select-lg"
                                style={{ borderColor: '#4a7c59' }}
                              >
                                <option value="">-- Chọn danh mục --</option>
                                {categories.map(c => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="col-md-6">
                            {/* Enhanced Pricing Section */}
                            <div className="mb-3">
                              <label className="form-label fw-bold">
                                Giá Gốc <span className="text-danger">*</span>
                              </label>
                              <div className="input-group">
                                <span className="input-group-text" style={{ backgroundColor: '#e8f5e8', color: '#2d5a3d' }}>₫</span>
                                <input
                                  type="number"
                                  value={form.basePrice || ''}
                                  onChange={handleBasePriceChange}
                                  required
                                  className="form-control form-control-lg"
                                  style={{ borderColor: '#4a7c59' }}
                                  placeholder="0"
                                />
                              </div>
                              {form.basePrice > 0 && (
                                <div className="form-text text-success fw-bold">
                                  {formatCurrency(form.basePrice)}
                                </div>
                              )}
                            </div>

                            <div className="mb-3">
                              <label className="form-label fw-bold">Giá Khuyến Mãi</label>

                              {/* Discount Type Selection */}
                              <div className="mb-2">
                                <div className="btn-group w-100" role="group">
                                  <input
                                    type="radio"
                                    className="btn-check"
                                    name="discountType"
                                    id="percentage"
                                    checked={discountType === 'percentage'}
                                    onChange={() => {
                                      setDiscountType('percentage');
                                      setManualSalePrice(false);
                                    }}
                                  />
                                  <label className="btn btn-outline-success" htmlFor="percentage">
                                    <i className="fas fa-percent me-1"></i>
                                    Phần trăm
                                  </label>

                                  <input
                                    type="radio"
                                    className="btn-check"
                                    name="discountType"
                                    id="amount"
                                    checked={discountType === 'amount'}
                                    onChange={() => {
                                      setDiscountType('amount');
                                      setManualSalePrice(false);
                                    }}
                                  />
                                  <label className="btn btn-outline-success" htmlFor="amount">
                                    <i className="fas fa-dollar-sign me-1"></i>
                                    Số tiền
                                  </label>
                                </div>
                              </div>

                              {/* Discount Input */}
                              <div className="input-group mb-2">
                                <span className="input-group-text" style={{ backgroundColor: '#e8f5e8', color: '#2d5a3d' }}>
                                  {discountType === 'percentage' ? '%' : '₫'}
                                </span>
                                <input
                                  type="number"
                                  value={discountValue || ''}
                                  onChange={handleDiscountChange}
                                  className="form-control"
                                  style={{ borderColor: '#4a7c59' }}
                                  placeholder={discountType === 'percentage' ? '10' : '0'}
                                />
                              </div>

                              {/* Sale Price Display */}
                              <div className="input-group">
                                <span className="input-group-text" style={{ backgroundColor: '#e8f5e8', color: '#2d5a3d' }}>₫</span>
                                <input
                                  readOnly
                                  type="number"
                                  value={form.salePrice || ''}
                                  onChange={handleManualSalePriceChange}
                                  className="form-control"
                                  style={{ borderColor: '#4a7c59' }}
                                  placeholder="0"
                                />
                              </div>

                              {form.salePrice !== undefined && form.salePrice > 0 && (
                                <div className="form-text">
                                  <span className="text-success fw-bold">
                                    {formatCurrency(form.salePrice)}
                                  </span>
                                  {form.basePrice > 0 && (
                                    <span className="ms-2 text-muted">
                                      (Tiết kiệm: {formatCurrency(form.basePrice - form.salePrice)})
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div
                          className="p-3"
                          style={{
                            border: '1px solid #4a7c59',
                            backgroundColor: '#f8f9fa',
                            marginBottom: '1rem',
                          }}
                        >
                          <div className="row">
                            <div className="col-6">
                              <div className="mb-3">
                                <label htmlFor="unit" className="form-label fw-bold">
                                  Khối lượng / Số lượng <span className="text-danger">*</span>
                                </label>
                                <div className="input-group">
                                  <input
                                    id="unit"
                                    name="unit"
                                    type="number"
                                    step="any"
                                    min="0"
                                    value={form.unit}
                                    onChange={handleChange}
                                    required
                                    className="form-control"
                                    style={{ borderColor: '#4a7c59' }}
                                    placeholder="Ví dụ: 500, 1.5, 2..."
                                  />
                                  <span
                                    className="input-group-text bg-light border-start-0"
                                    style={{ borderColor: '#4a7c59' }}
                                  >
                                    {form.unitSize || 'đơn vị'}
                                  </span>
                                </div>
                                <div className="form-text">Nhập khối lượng / thể tích / số lượng sản phẩm.</div>
                              </div>
                            </div>

                            <div className="col-6">
                              <div className="mb-3">
                                <label htmlFor="unitSize" className="form-label fw-bold">
                                  Đơn vị tính
                                </label>
                                <input
                                  id="unitSize"
                                  name="unitSize"
                                  type="text"
                                  value={form.unitSize}
                                  onChange={handleChange}
                                  className="form-control"
                                  style={{ borderColor: '#4a7c59' }}
                                  placeholder="g, kg, ml, lít, hộp, chai..."
                                />
                                <div className="form-text">Ví dụ: g, ml, lít, hộp, gói, cái,...</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Images Section */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="card border-0 mb-4" style={{ backgroundColor: '#f0f8f0' }}>
                      <div className="card-header bg-transparent border-bottom-0">
                        <h5 className="mb-0" style={{ color: '#2d5a3d' }}>
                          <i className="fas fa-images me-2"></i>
                          Hình Ảnh Sản Phẩm
                        </h5>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label fw-bold">
                                Hình Đại Diện
                              </label>
                              <div className="text-center">
                                <div className="position-relative d-inline-block mb-3">
                                  <div
                                    className="rounded-3 overflow-hidden shadow-sm"
                                    style={{ width: '200px', height: '200px', border: '3px solid #4a7c59' }}
                                  >
                                    <img
                                      src={previewThumb}
                                      alt="Thumbnail"
                                      style={{ objectFit: 'fill' }}
                                      className="rounded-3"
                                    />
                                  </div>
                                  {previewThumb !== '/placeholder.png' && (
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success">
                                      <i className="fas fa-check"></i>
                                    </span>
                                  )}
                                </div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleThumbChange}
                                  className="form-control"
                                  style={{ borderColor: '#4a7c59', objectFit: 'fill' }}
                                  id="thumbnail"
                                />
                                <label htmlFor="thumbnail" className="btn btn-outline-success mt-2">
                                  <i className="fas fa-upload me-2"></i>
                                  Thay Đổi Hình Đại Diện
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label fw-bold">Thư Viện Hình Ảnh</label>
                              <div className="row g-2 mb-3">
                                {previewImages.map((src, i) => (
                                  <div key={i} className="col-3">
                                    <div
                                      className="position-relative rounded-3 overflow-hidden shadow-sm"
                                      style={{ height: '80px', border: '2px solid #4a7c59' }}
                                    >
                                      <img
                                        src={src}
                                        alt={`img-${i}`}
                                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                        className="rounded-3"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImagesChange}
                                className="form-control"
                                style={{ borderColor: '#4a7c59' }}
                                id="gallery"
                              />
                              <label htmlFor="gallery" className="btn btn-outline-success mt-2">
                                <i className="fas fa-plus me-2"></i>
                                Thay Đổi Hình Ảnh
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>


                {/* Variants Section */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="card border-0 mb-4" style={{ backgroundColor: '#f0f8f0' }}>
                      {/*     <div className="card-header bg-transparent border-bottom-0">
                        <div className="d-flex justify-content-between align-items-center">
                          <h5 className="mb-0" style={{ color: '#2d5a3d' }}>
                            <i className="fas fa-boxes me-2"></i>
                            Biến Thể Sản Phẩm
                          </h5>
                          <button
                            type="button"
                            onClick={addVariant}
                            className="btn btn-success btn-sm"
                            style={{ backgroundColor: '#4a7c59', borderColor: '#4a7c59' }}
                          >
                            <i className="fas fa-plus me-1"></i>
                            Thêm Biến Thể
                          </button>
                        </div>
                      </div>
                      <div className="card-body">
                        {variants.length === 0 ? (
                          <div className="text-center py-4">
                            <i className="fas fa-box-open fa-3x text-muted mb-3"></i>
                            <p className="text-muted">Chưa có biến thể nào. Nhấn "Thêm Biến Thể" để bắt đầu.</p>
                            <div className="alert alert-info mt-3">
                              <strong>Lưu ý:</strong> Nếu không có biến thể, vui lòng nhập số lượng ban đầu bên dưới.
                            </div>
                          </div>
                        ) : (
                          <div className="table-responsive">
                            <table className="table table-bordered">
                              <thead style={{ backgroundColor: '#e8f5e8' }}>
                                <tr>
                                  <th style={{ color: '#2d5a3d' }}>Tên Biến Thể</th>
                                  <th style={{ color: '#2d5a3d' }}>SKU</th>
                                  <th style={{ color: '#2d5a3d' }}>Điều Chỉnh Giá</th>
                                  <th style={{ color: '#2d5a3d' }}>Thuộc Tính</th>
                                  <th style={{ color: '#2d5a3d' }}>Giá Trị</th>
                                  <th style={{ color: '#2d5a3d' }}>Hành Động</th>
                                </tr>
                              </thead>
                              <tbody>
                                {variants.map((v, idx) => (
                                  <tr key={idx}>
                                    <td>
                                      <input
                                        placeholder="Tên biến thể"
                                        value={v.name}
                                        onChange={e => updateVariant(idx, 'name', e.target.value)}
                                        className="form-control form-control-sm"
                                        style={{ borderColor: '#4a7c59' }}
                                      />
                                    </td>
                                    <td>
                                      <input
                                        placeholder="SKU123"
                                        value={v.sku}
                                        onChange={e => updateVariant(idx, 'sku', e.target.value)}
                                        className="form-control form-control-sm"
                                        style={{ borderColor: '#4a7c59' }}
                                      />
                                    </td>
                                    <td>
                                      <div className="input-group input-group-sm">
                                        <span className="input-group-text" style={{ backgroundColor: '#e8f5e8', color: '#2d5a3d' }}>₫</span>
                                        <input
                                          placeholder="0"
                                          type="number"
                                          value={v.priceAdjustment}
                                          onChange={e => updateVariant(idx, 'priceAdjustment', +e.target.value)}
                                          className="form-control"
                                          style={{ borderColor: '#4a7c59' }}
                                        />
                                      </div>
                                    </td>
                                    <td>
                                      <input
                                        placeholder="Màu sắc"
                                        value={v.attributeName}
                                        onChange={e => updateVariant(idx, 'attributeName', e.target.value)}
                                        className="form-control form-control-sm"
                                        style={{ borderColor: '#4a7c59' }}
                                      />
                                    </td>
                                    <td>
                                      <input
                                        placeholder="Đỏ"
                                        value={v.attributeValue}
                                        onChange={e => updateVariant(idx, 'attributeValue', e.target.value)}
                                        className="form-control form-control-sm"
                                        style={{ borderColor: '#4a7c59' }}
                                      />
                                    </td>
                                    <td>
                                      <button
                                        type="button"
                                        onClick={() => removeVariant(idx)}
                                        className="btn btn-outline-danger btn-sm"
                                      >
                                        <i className="fas fa-trash"></i>
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )} */}

                      {/* Initial stock nếu không có variants */}
                      {variants.length === 0 && (
                        <div className="row">
                          <div className="col-md-4">
                            <div className="mb-3">
                              <label className="form-label fw-bold">
                                Số Lượng Ban Đầu <span className="text-danger">*</span>
                              </label>
                              <input
                                id="initialStock"
                                type="number"
                                value={form.initialStock || 0}
                                onChange={handleChange}
                                required
                                className="form-control"
                                style={{ borderColor: '#4a7c59' }}
                                placeholder="Nhập số lượng..."
                              />
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                </div>

                {/* Product Options */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="card border-0 mb-4" style={{ backgroundColor: '#f0f8f0' }}>
                      <div className="card-header bg-transparent border-bottom-0">
                        <h5 className="mb-0" style={{ color: '#2d5a3d' }}>
                          <i className="fas fa-cog me-2"></i>
                          Tùy Chọn Sản Phẩm
                        </h5>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-6">
                            <div className="mb-3">
                              <h6 className="fw-bold mb-3">Trạng Thái Sản Phẩm</h6>
                              <div className="form-check form-switch mb-2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="isAvailable"
                                  checked={form.isAvailable!}
                                  onChange={handleChange}
                                  style={{ backgroundColor: form.isAvailable ? '#4a7c59' : '', borderColor: '#4a7c59' }}
                                />
                                <label className="form-check-label" htmlFor="isAvailable">
                                  <i className="fas fa-check-circle text-success me-1"></i>
                                  Có Sẵn
                                </label>
                              </div>
                              <div className="form-check form-switch mb-2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="isFeatured"
                                  checked={form.isFeatured!}
                                  onChange={handleChange}
                                  style={{ backgroundColor: form.isFeatured ? '#4a7c59' : '', borderColor: '#4a7c59' }}
                                />
                                <label className="form-check-label" htmlFor="isFeatured">
                                  <i className="fas fa-star text-warning me-1"></i>
                                  Sản Phẩm Nổi Bật
                                </label>
                              </div>
                              <div className="form-check form-switch mb-2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="isOrganic"
                                  checked={form.isOrganic!}
                                  onChange={handleChange}
                                  style={{ backgroundColor: form.isOrganic ? '#4a7c59' : '', borderColor: '#4a7c59' }}
                                />
                                <label className="form-check-label" htmlFor="isOrganic">
                                  <i className="fas fa-leaf text-success me-1"></i>
                                  Hữu Cơ
                                </label>
                              </div>
                              <div className="form-check form-switch mb-2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="isFreshProduct"
                                  checked={form.isFreshProduct!}
                                  onChange={handleChange}
                                  style={{ backgroundColor: form.isFreshProduct ? '#4a7c59' : '', borderColor: '#4a7c59' }}
                                />
                                <label className="form-check-label" htmlFor="isFreshProduct">
                                  <i className="fas fa-snowflake text-info me-1"></i>
                                  Sản Phẩm Tươi Sống
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="col-md-6">
                            <div className="mb-3">
                              <h6 className="fw-bold mb-3">Quy Tắc Đặt Hàng</h6>
                              <div className="row">
                                <div className="col-12 mb-3">
                                  <label className="form-label fw-bold">Ngưỡng Hàng Tồn Kho Thấp</label>
                                  <input
                                    id="lowStockThreshold"
                                    type="number"
                                    value={form.lowStockThreshold}
                                    onChange={handleChange}
                                    className="form-control"
                                    style={{ borderColor: '#4a7c59' }}
                                    placeholder="0"
                                  />
                                </div>
                                <div className="col-6 mb-3">
                                  <label className="form-label fw-bold">Số Lượng Tối Thiểu</label>
                                  <input
                                    id="minOrderQuantity"
                                    type="number"
                                    value={form.minOrderQuantity}
                                    onChange={handleChange}
                                    className="form-control"
                                    style={{ borderColor: '#4a7c59' }}
                                    placeholder="0"
                                  />
                                </div>
                                <div className="col-6 mb-3">
                                  <label className="form-label fw-bold">Số Lượng Tối Đa</label>
                                  <input
                                    id="maxOrderQuantity"
                                    type="number"
                                    value={form.maxOrderQuantity}
                                    onChange={handleChange}
                                    className="form-control"
                                    style={{ borderColor: '#4a7c59' }}
                                    placeholder="0"
                                  />
                                </div>
                                <div className="col-12">
                                  <label className="form-label fw-bold">Thứ Tự Hiển Thị</label>
                                  <input
                                    id="displayOrder"
                                    type="number"
                                    value={form.displayOrder}
                                    onChange={handleChange}
                                    className="form-control"
                                    style={{ borderColor: '#4a7c59' }}
                                    placeholder="0"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit buttons */}
                <div className="row">
                  <div className="col-12">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body">
                        <div className="d-flex justify-content-end gap-3">
                          <button
                            type="button"
                            onClick={() => router.back()}
                            className="btn btn-outline-secondary btn-lg px-4"
                          >
                            <i className="fas fa-arrow-left me-2"></i>
                            Hủy Bỏ
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn btn-lg px-4"
                            style={{
                              backgroundColor: '#4a7c59',
                              borderColor: '#4a7c59',
                              color: 'white'
                            }}
                          >
                            {isSubmitting ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Đang Lưu...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-save me-2"></i>
                                Lưu Sản Phẩm
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
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
        
        .btn-outline-success {
          color: #4a7c59;
          border-color: #4a7c59;
                    margin-right: 20px;
        }
        
        .btn-outline-success:hover {
          background-color: #4a7c59;
          border-color: #4a7c59;
          color: white;
        }
                  .btn-outline-success::before {
          opacity: 0;
        }
        
        .btn-check:checked + .btn-outline-success {
          background-color: #4a7c59;
          border-color: #4a7c59;
        }
        
        .text-success {
          color: #4a7c59 !important;
        }
        
        .bg-success {
          background-color: #4a7c59 !important;
        }
        input[type="radio"] {
          display: none;

        }
        label:after {
        display:none;
      }
        input[type="text"], input[type="number"], input[type="email"], input[type="password"], select {
          border: 1px solid #4a7c59;
          }
      `}</style>
    </div>
  );
}