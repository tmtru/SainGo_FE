'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import CategoryService, { Category } from '@/data/Services/CategoryService';
import AdminProductService, {
  CreateAdminProductDto,
} from '@/data/Services/AdminService/ProductManageService';
import UploadService from '@/data/Services/UploadImage';

interface RecipeStep {
  step: number;
  description: string;
}

export default function AddProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<CreateAdminProductDto>({
    mainCategoryId: '',
    name: '',
    slug: '',
    basePrice: 0,
    salePrice: undefined,
    description: '',
    shortDescription: '',
    unit: '1',
    unitSize: '',
    lowStockThreshold: undefined,
    isAvailable: true,
    isFeatured: false,
    isOrganic: false,
  });

  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [previewThumb, setPreviewThumb] = useState('/placeholder.png');
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for pricing calculation
  const [discountType, setDiscountType] = useState<'percentage' | 'amount'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);

  // State for JSON fields
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [recipeSteps, setRecipeSteps] = useState<RecipeStep[]>([{ step: 1, description: '' }]);
  const [healthBenefits, setHealthBenefits] = useState<string[]>(['']);
  const [nutritionHighlights, setNutritionHighlights] = useState('');

  useEffect(() => {
    (async () => {
      const catRes = await CategoryService.getAllCategory();
      setCategories(catRes.data);
    })();
  }, []);

  useEffect(() => {
    if (form.basePrice > 0) {
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
  }, [form.basePrice, discountType, discountValue]);

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
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setDiscountValue(value);
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

  // Ingredient handlers
  const addIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const updateIngredient = (index: number, value: string) => {
    const updated = [...ingredients];
    updated[index] = value;
    setIngredients(updated);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  // Recipe step handlers
  const addRecipeStep = () => {
    setRecipeSteps([...recipeSteps, { step: recipeSteps.length + 1, description: '' }]);
  };

  const updateRecipeStep = (index: number, description: string) => {
    const updated = [...recipeSteps];
    updated[index] = { step: index + 1, description };
    setRecipeSteps(updated);
  };

  const removeRecipeStep = (index: number) => {
    const filtered = recipeSteps.filter((_, i) => i !== index);
    const reindexed = filtered.map((step, idx) => ({ step: idx + 1, description: step.description }));
    setRecipeSteps(reindexed);
  };

  // Health benefit handlers
  const addHealthBenefit = () => {
    setHealthBenefits([...healthBenefits, '']);
  };

  const updateHealthBenefit = (index: number, value: string) => {
    const updated = [...healthBenefits];
    updated[index] = value;
    setHealthBenefits(updated);
  };

  const removeHealthBenefit = (index: number) => {
    setHealthBenefits(healthBenefits.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let thumbUrl = '';
      if (thumbnail) {
        const res = await UploadService.uploadSingle(thumbnail);
        thumbUrl = res.data;
      }

      const imgUrls: string[] = [];
      for (const file of images) {
        const res = await UploadService.uploadSingle(file);
        imgUrls.push(res.data);
      }

      // Filter out empty values and serialize to JSON
      const filteredIngredients = ingredients.filter(i => i.trim() !== '');
      const filteredRecipeSteps = recipeSteps.filter(r => r.description.trim() !== '');
      const filteredHealthBenefits = healthBenefits.filter(h => h.trim() !== '');

      const payload: CreateAdminProductDto = {
        ...form,
        imageUrl: thumbUrl,
        ingredients: filteredIngredients.length > 0 ? JSON.stringify(filteredIngredients) : undefined,
        cookingMethod: filteredRecipeSteps.length > 0 ? JSON.stringify(filteredRecipeSteps) : undefined,
        healthBenefits: filteredHealthBenefits.length > 0 ? JSON.stringify(filteredHealthBenefits) : undefined,
        nutritionHighlights: nutritionHighlights.trim() || undefined,
      };

      await AdminProductService.create(payload);
      toast.success('Product created successfully!');
      router.push('/dashboard/product-list');
    } catch (err: any) {
      console.error(err);
      toast.error('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#f8fffe' }}>
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow-lg border-0">
            <div className="card-header text-white" style={{ background: 'linear-gradient(135deg, #2d5a3d, #4a7c59)' }}>
              <div className="d-flex align-items-center">
                <i className="fas fa-plus-circle me-2 fs-4"></i>
                <h2 className="mb-0 fs-3">Thêm Sản Phẩm Mới</h2>
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
                        <div className="row">
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
                              <div className="form-text">URL thân thiện cho sản phẩm</div>
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
                              <div className="mb-2">
                                <div className="btn-group w-100" role="group">
                                  <input
                                    type="radio"
                                    className="btn-check"
                                    name="discountType"
                                    id="percentage"
                                    checked={discountType === 'percentage'}
                                    onChange={() => setDiscountType('percentage')}
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
                                    onChange={() => setDiscountType('amount')}
                                  />
                                  <label className="btn btn-outline-success" htmlFor="amount">
                                    <i className="fas fa-dollar-sign me-1"></i>
                                    Số tiền
                                  </label>
                                </div>
                              </div>

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

                              <div className="input-group">
                                <span className="input-group-text" style={{ backgroundColor: '#e8f5e8', color: '#2d5a3d' }}>₫</span>
                                <input
                                  readOnly
                                  type="number"
                                  value={form.salePrice || ''}
                                  className="form-control"
                                  style={{ borderColor: '#4a7c59' }}
                                  placeholder="0"
                                />
                              </div>

                              {form.salePrice != undefined && form.salePrice > 0 && (
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

                        <div className="p-3" style={{ border: '1px solid #4a7c59', backgroundColor: '#f8f9fa', marginBottom: '1rem' }}>
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
                                    type="text"
                                    value={form.unit}
                                    onChange={handleChange}
                                    required
                                    className="form-control"
                                    style={{ borderColor: '#4a7c59' }}
                                    placeholder="Ví dụ: 500, 1.5, 2..."
                                  />
                                  <span className="input-group-text bg-light border-start-0" style={{ borderColor: '#4a7c59' }}>
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

                {/* Description Section */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="card border-0 mb-4" style={{ backgroundColor: '#f0f8f0' }}>
                      <div className="card-header bg-transparent border-bottom-0">
                        <h5 className="mb-0" style={{ color: '#2d5a3d' }}>
                          <i className="fas fa-file-alt me-2"></i>
                          Mô Tả Sản Phẩm
                        </h5>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-12">
                            <div className="mb-3">
                              <label className="form-label fw-bold">
                                Mô Tả Ngắn <span className="text-danger">*</span>
                              </label>
                              <textarea
                                id="shortDescription"
                                value={form.shortDescription}
                                onChange={handleChange}
                                required
                                rows={3}
                                className="form-control"
                                style={{ borderColor: '#4a7c59' }}
                                placeholder="Nhập mô tả ngắn gọn về sản phẩm..."
                                maxLength={200}
                              />
                              <div className="form-text d-flex justify-content-between">
                                <span>Mô tả ngắn sẽ hiển thị trong danh sách sản phẩm</span>
                                <span className="text-muted">
                                  {form.shortDescription?.length}/200
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="mb-3">
                              <label className="form-label fw-bold">
                                Mô Tả Chi Tiết <span className="text-danger">*</span>
                              </label>
                              <textarea
                                id="description"
                                value={form.description}
                                onChange={handleChange}
                                required
                                rows={8}
                                className="form-control"
                                style={{ borderColor: '#4a7c59' }}
                                placeholder="Nhập mô tả chi tiết về sản phẩm..."
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ingredients Section */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="card border-0 mb-4" style={{ backgroundColor: '#f0f8f0' }}>
                      <div className="card-header bg-transparent border-bottom-0">
                        <div className="d-flex justify-content-between align-items-center">
                          <h5 className="mb-0" style={{ color: '#2d5a3d' }}>
                            <i className="fas fa-apple-alt me-2"></i>
                            Thành Phần
                          </h5>
                          <button
                            type="button"
                            onClick={addIngredient}
                            className="btn btn-success btn-sm"
                            style={{ backgroundColor: '#4a7c59', borderColor: '#4a7c59' }}
                          >
                            <i className="fas fa-plus me-1"></i>
                            Thêm Thành Phần
                          </button>
                        </div>
                      </div>
                      <div className="card-body">
                        {ingredients.map((ingredient, index) => (
                          <div key={index} className="mb-2">
                            <div className="input-group">
                              <span className="input-group-text" style={{ backgroundColor: '#e8f5e8' }}>
                                {index + 1}
                              </span>
                              <input
                                type="text"
                                value={ingredient}
                                onChange={(e) => updateIngredient(index, e.target.value)}
                                className="form-control"
                                style={{ borderColor: '#4a7c59' }}
                                placeholder="Nhập thành phần..."
                              />
                              {ingredients.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeIngredient(index)}
                                  className="btn btn-outline-danger"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recipe Steps Section */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="card border-0 mb-4" style={{ backgroundColor: '#f0f8f0' }}>
                      <div className="card-header bg-transparent border-bottom-0">
                        <div className="d-flex justify-content-between align-items-center">
                          <h5 className="mb-0" style={{ color: '#2d5a3d' }}>
                            <i className="fas fa-list-ol me-2"></i>
                            Hướng Dẫn Chế Biến
                          </h5>
                          <button
                            type="button"
                            onClick={addRecipeStep}
                            className="btn btn-success btn-sm"
                            style={{ backgroundColor: '#4a7c59', borderColor: '#4a7c59' }}
                          >
                            <i className="fas fa-plus me-1"></i>
                            Thêm Bước
                          </button>
                        </div>
                      </div>
                      <div className="card-body">
                        {recipeSteps.map((step, index) => (
                          <div key={index} className="mb-3">
                            <label className="form-label fw-bold">Bước {step.step}</label>
                            <div className="input-group">
                              <textarea
                                value={step.description}
                                onChange={(e) => updateRecipeStep(index, e.target.value)}
                                className="form-control"
                                style={{ borderColor: '#4a7c59' }}
                                rows={2}
                                placeholder="Mô tả chi tiết bước này..."
                              />
                              {recipeSteps.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeRecipeStep(index)}
                                  className="btn btn-outline-danger"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Health Benefits Section */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="card border-0 mb-4" style={{ backgroundColor: '#f0f8f0' }}>
                      <div className="card-header bg-transparent border-bottom-0">
                        <div className="d-flex justify-content-between align-items-center">
                          <h5 className="mb-0" style={{ color: '#2d5a3d' }}>
                            <i className="fas fa-heartbeat me-2"></i>
                            Lợi Ích Sức Khỏe
                          </h5>
                          <button
                            type="button"
                            onClick={addHealthBenefit}
                            className="btn btn-success btn-sm"
                            style={{ backgroundColor: '#4a7c59', borderColor: '#4a7c59' }}
                          >
                            <i className="fas fa-plus me-1"></i>
                            Thêm Lợi Ích
                          </button>
                        </div>
                      </div>
                      <div className="card-body">
                        {healthBenefits.map((benefit, index) => (
                          <div key={index} className="mb-2">
                            <div className="input-group">
                              <span className="input-group-text" style={{ backgroundColor: '#e8f5e8' }}>
                                <i className="fas fa-check text-success"></i>
                              </span>
                              <input
                                type="text"
                                value={benefit}
                                onChange={(e) => updateHealthBenefit(index, e.target.value)}
                                className="form-control"
                                style={{ borderColor: '#4a7c59' }}
                                placeholder="Nhập lợi ích sức khỏe..."
                              />
                              {healthBenefits.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeHealthBenefit(index)}
                                  className="btn btn-outline-danger"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nutrition Highlights */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="card border-0 mb-4" style={{ backgroundColor: '#f0f8f0' }}>
                      <div className="card-header bg-transparent border-bottom-0">
                        <h5 className="mb-0" style={{ color: '#2d5a3d' }}>
                          <i className="fas fa-chart-pie me-2"></i>
                          Điểm Nổi Bật Dinh Dưỡng
                        </h5>
                      </div>
                      <div className="card-body">
                        <textarea
                          value={nutritionHighlights}
                          onChange={(e) => setNutritionHighlights(e.target.value)}
                          className="form-control"
                          style={{ borderColor: '#4a7c59' }}
                          rows={4}
                          placeholder="Ví dụ: Giàu protein, ít calo, nhiều vitamin C..."
                        />
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
                                Hình Đại Diện <span className="text-danger">*</span>
                              </label>
                              <div className="text-center">
                                <div className="position-relative d-inline-block mb-3">
                                  <div
                                    className="rounded-3 overflow-hidden shadow-sm"
                                    style={{ width: '200px', height: '200px', border: '3px solid #4a7c59' }}
                                  >
                                    <Image
                                      src={previewThumb}
                                      alt="Thumbnail"
                                      fill
                                      style={{ objectFit: 'cover' }}
                                      className="rounded-3"
                                    />
                                  </div>
                                </div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleThumbChange}
                                  className="form-control"
                                  style={{ borderColor: '#4a7c59' }}
                                  id="thumbnail"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
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
                            </div>
                          </div>

                          <div className="col-md-6">
                            <div className="mb-3">
                              <h6 className="fw-bold mb-3">Quy Tắc Đặt Hàng</h6>
                              <div className="row">
                                <div className="col-12 mb-3">
                                  <label className="form-label fw-bold">
                                    Ngưỡng Hàng Tồn Kho Thấp
                                  </label>
                                  <input
                                    id="lowStockThreshold"
                                    type="number"
                                    min="0"
                                    value={form.lowStockThreshold ?? ''}
                                    onChange={handleChange}
                                    className="form-control"
                                    style={{ borderColor: '#4a7c59' }}
                                    placeholder="Nhập ngưỡng cảnh báo..."
                                  />
                                  <div className="form-text">Số lượng tối thiểu để cảnh báo hết hàng</div>
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

      <ToastContainer position="top-right" autoClose={3000} />

      <style jsx>{`
        .form-control:focus, .form-select:focus {
          border-color: #4a7c59;
          box-shadow: 0 0 0 0.2rem rgba(74, 124, 89, 0.25);
        }
        
        .btn-outline-success {
          color: #4a7c59;
          border-color: #4a7c59;
          margin-right: 0;
        }
        
        .btn-outline-success:hover {
          background-color: #4a7c59;
          border-color: #4a7c59;
          color: white;
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
          display: none;
        }
      `}</style>
    </div>
  );
}