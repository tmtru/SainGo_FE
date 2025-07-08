'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';
import AdminCategoryService, { AdminCategoryPayload } from '@/data/Services/AdminService/CategoryManage';
import UploadService from '@/data/Services/UploadImage';

export default function AddCategoryPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<AdminCategoryPayload>({
        name: '',
        slug: '',
        description: '',
        imageUrl: '',
        iconUrl: '',
        displayOrder: 1,
        isActive: true,
        productSubCategoryIds: []
    });

    const [imagePreview, setImagePreview] = useState<string>('');
    const [iconPreview, setIconPreview] = useState<string>('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [iconFile, setIconFile] = useState<File | null>(null);

    // Generate slug from name
    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };


    const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        setImageFile(file);
    }
    const handleIconsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const previewUrl = URL.createObjectURL(file);
        setIconPreview(previewUrl);
        setIconFile(file);
    };
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'name') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                slug: generateSlug(value)
            }));
        } else if (name === 'displayOrder') {
            setFormData(prev => ({
                ...prev,
                [name]: parseInt(value) || 1
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            isActive: e.target.checked
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Vui lòng nhập tên danh mục');
            return;
        }

        if (!formData.slug.trim()) {
            toast.error('Vui lòng nhập slug');
            return;
        }
        let imageUrl = formData.imageUrl || '';
        let iconUrl = formData.iconUrl || '';
        if (imageFile) {
            try {
                const response = await UploadService.uploadSingle(imageFile);
                imageUrl = response.data; 
            } catch (error) {
                console.error('Error uploading image:', error);
                toast.error('Không thể tải lên hình ảnh. Vui lòng thử lại.');
                return;
            }
        }
        if (iconFile) {
            try {
                const response = await UploadService.uploadSingle(iconFile);
                iconUrl = response.data; 
            } catch (error) {
                console.error('Error uploading icon:', error);
                toast.error('Không thể tải lên biểu tượng. Vui lòng thử lại.');
                return;
            }
        }
        formData.imageUrl = imageUrl;
        formData.iconUrl = iconUrl;

        try {
            setIsLoading(true);
            await AdminCategoryService.createAdminCategory(formData);
            toast.success('Thêm danh mục thành công!');
            router.push('/dashboard/manage-category');
        } catch (error) {
            console.error('Error creating category:', error);
            toast.error('Không thể thêm danh mục. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        router.push('/dashboard/categories');
    };

    return (
        <div className="container-fluid py-4" style={{ backgroundColor: '#f8fffe' }}>
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card shadow-lg border-0">
                        {/* Header */}
                        <div className="card-header text-white" style={{ background: 'linear-gradient(135deg, #2d5a3d, #4a7c59)' }}>
                            <div className="d-flex align-items-center" style={{ padding: '20px' }}>
                                <i className="fas fa-plus-circle me-3 fs-4"></i>
                                <div>
                                    <h3 className="mb-0" style={{ color: 'white' }}>Thêm Danh Mục Mới</h3>
                                    <p className="mb-0 opacity-75" style={{ color: 'white' }}>Tạo danh mục sản phẩm mới</p>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                <div className="row g-4">
                                    {/* Basic Information */}
                                    <div className="col-12">
                                        <div className="card border-0" style={{ backgroundColor: '#f0f8f0' }}>
                                            <div className="card-body">
                                                <h5 className="card-title text-success mb-3">
                                                    <i className="fas fa-info-circle me-2"></i>
                                                    Thông tin cơ bản
                                                </h5>

                                                <div className="row g-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label fw-bold">
                                                            Tên danh mục <span className="text-danger">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            className="form-control"
                                                            value={formData.name}
                                                            onChange={handleInputChange}
                                                            placeholder="Nhập tên danh mục"
                                                            required
                                                            style={{ borderColor: '#4a7c59' }}
                                                        />
                                                    </div>

                                                    <div className="col-md-6">
                                                        <label className="form-label fw-bold">
                                                            Slug <span className="text-danger">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="slug"
                                                            className="form-control"
                                                            value={formData.slug}
                                                            onChange={handleInputChange}
                                                            placeholder="duong-dan-url"
                                                            required
                                                            style={{ borderColor: '#4a7c59' }}
                                                        />
                                                        <div className="form-text">
                                                            Đường dẫn URL cho danh mục (tự động tạo từ tên)
                                                        </div>
                                                    </div>

                                                    <div className="col-12">
                                                        <label className="form-label fw-bold">Mô tả</label>
                                                        <textarea
                                                            name="description"
                                                            className="form-control"
                                                            rows={3}
                                                            value={formData.description}
                                                            onChange={handleInputChange}
                                                            placeholder="Nhập mô tả cho danh mục"
                                                            style={{ borderColor: '#4a7c59' }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Media Section */}
                                    <div className="col-12">
                                        <div className="card border-0" style={{ backgroundColor: '#f0f8f0' }}>
                                            <div className="card-body">
                                                <h5 className="card-title text-success mb-3">
                                                    <i className="fas fa-image me-2"></i>
                                                    Hình ảnh
                                                </h5>

                                                <div className="row g-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label fw-bold">URL hình ảnh</label>
                                                        <input
                                                            type="file"
                                                            name="imageUrl"
                                                            className="form-control"
                                                            onChange={handleImagesChange}
                                                            style={{ borderColor: '#4a7c59' }}
                                                        />

                                                        {imagePreview && (
                                                            <div className="mt-2">
                                                                <div className="rounded-3 overflow-hidden shadow-sm" style={{ width: '100px', height: '100px', border: '2px solid #4a7c59' }}>
                                                                    <Image
                                                                        src={imagePreview}
                                                                        alt="Preview"
                                                                        width={100}
                                                                        height={100}
                                                                        style={{ objectFit: 'cover' }}
                                                                        className="rounded-3"
                                                                        onError={() => setImagePreview('')}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="col-md-6">
                                                        <label className="form-label fw-bold">URL icon</label>
                                                        <input
                                                            type="file"
                                                            name="iconUrl"
                                                            className="form-control"
                                                            onChange={handleIconsChange}
                                                            style={{ borderColor: '#4a7c59' }}
                                                        />

                                                        {iconPreview && (
                                                            <div className="mt-2">
                                                                <div className="rounded-3 overflow-hidden shadow-sm d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', border: '2px solid #4a7c59', backgroundColor: '#f8f9fa' }}>
                                                                    <Image
                                                                        src={iconPreview}
                                                                        alt="Icon Preview"
                                                                        width={32}
                                                                        height={32}
                                                                        style={{ objectFit: 'contain' }}
                                                                        onError={() => setIconPreview('')}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Settings Section */}
                                    <div className="col-12">
                                        <div className="card border-0" style={{ backgroundColor: '#f0f8f0' }}>
                                            <div className="card-body">
                                                <h5 className="card-title text-success mb-3">
                                                    <i className="fas fa-cogs me-2"></i>
                                                    Cài đặt
                                                </h5>

                                                <div className="row g-3">


                                                    <div className="col-md-6">
                                                        <label className="form-label fw-bold">Trạng thái</label>
                                                        <div className="form-check form-switch mt-2">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id="isActive"
                                                                checked={formData.isActive}
                                                                onChange={handleStatusChange}
                                                                style={{ backgroundColor: formData.isActive ? '#4a7c59' : undefined }}
                                                            />
                                                            <label className="form-check-label" htmlFor="isActive">
                                                                {formData.isActive ? (
                                                                    <span className="badge bg-success">
                                                                        <i className="fas fa-check-circle me-1"></i>
                                                                        Hoạt động
                                                                    </span>
                                                                ) : (
                                                                    <span className="badge bg-danger">
                                                                        <i className="fas fa-times-circle me-1"></i>
                                                                        Tạm dừng
                                                                    </span>
                                                                )}
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="d-flex gap-3 mt-4">
                                    <button
                                        type="submit"
                                        className="btn btn-success btn-lg"
                                        disabled={isLoading}
                                        style={{ backgroundColor: '#4a7c59', borderColor: '#4a7c59' }}
                                    >
                                        {isLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Đang lưu...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-save me-2"></i>
                                                Lưu danh mục
                                            </>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="btn btn-outline-secondary btn-lg"
                                        disabled={isLoading}
                                    >
                                        <i className="fas fa-times me-2"></i>
                                        Hủy bỏ
                                    </button>
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
        
        .btn-success {
          transition: all 0.3s ease;
        }
        
        .btn-success:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(74, 124, 89, 0.3);
        }
        
        .card {
          transition: all 0.3s ease;
        }
        
        .badge {
          font-size: 0.875em;
        }
        
        .form-check-input:checked {
          border-color: #4a7c59;
        }
      `}</style>
        </div>
    );
}