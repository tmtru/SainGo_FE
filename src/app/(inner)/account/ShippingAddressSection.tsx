import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GhnService from '@/data/Services/GhnService';
import UserAddressService, { UserAddress } from '@/data/Services/UserAddress';
import { toast } from 'react-toastify';

interface Province {
    provinceID: number;
    provinceName: string;
}

interface District {
    districtID: number;
    districtName: string;
}

interface Ward {
    wardCode: string;
    wardName: string;
}

interface ShippingAddressSectionProps {
    defaultAddress: UserAddress | null;
    loadingAddress: boolean;
    onAddressChange?: (address: UserAddress) => void;
    formatCurrency: (amount: number) => string;
    router?: ReturnType<typeof useRouter>;
}

const ShippingAddressSection: React.FC<ShippingAddressSectionProps> = ({
    defaultAddress,
    loadingAddress,
    onAddressChange,
    formatCurrency,
    router
}) => {
    const [showInlineAddressForm, setShowInlineAddressForm] = useState<boolean>(false);
    const [isLoadingInlineAddress, setIsLoadingInlineAddress] = useState<boolean>(false);

    // Address form state
    const [newAddress, setNewAddress] = useState<{
        name: string;
        phone: string;
        fullAddress: string;
        city: string;
        district: string;
        ward: string;
    }>({
        name: '',
        phone: '',
        fullAddress: '',
        city: '',
        district: '',
        ward: '',
    });

    // Location data
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);

    // Selected location IDs
    const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
    const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
    const [selectedWardId, setSelectedWardId] = useState<string | null>(null);

    // Load provinces on component mount
    useEffect(() => {
        const fetchProvinces = async (): Promise<void> => {
            try {
                const res = await GhnService.getProvinces();
                setProvinces(res.data);
            } catch (error) {
                console.error("Lỗi khi tải tỉnh/thành:", error);
            }
        };
        fetchProvinces();
    }, []);

    // Load districts when province changes
    useEffect(() => {
        const fetchDistricts = async (): Promise<void> => {
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

    // Load wards when district changes
    useEffect(() => {
        const fetchWards = async (): Promise<void> => {
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

    const handleNewAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
        setNewAddress(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const provinceId = parseInt(e.target.value);
        const selected = provinces.find((p: Province) => p.provinceID === provinceId);
        setSelectedProvinceId(provinceId);
        setSelectedDistrictId(null);
        setSelectedWardId(null);
        setNewAddress(prev => ({
            ...prev,
            city: selected?.provinceName || '',
            district: '',
            ward: ''
        }));
    };

    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const districtId = parseInt(e.target.value);
        const selected = districts.find((d: District) => d.districtID === districtId);
        setSelectedDistrictId(districtId);
        setSelectedWardId(null);
        setNewAddress(prev => ({
            ...prev,
            district: selected?.districtName || '',
            ward: ''
        }));
    };

    const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const wardCode = e.target.value;
        const selected = wards.find((w: Ward) => w.wardCode === wardCode);
        setSelectedWardId(wardCode);
        setNewAddress(prev => ({
            ...prev,
            ward: selected?.wardName || ''
        }));
    };

    const resetAddressForm = (): void => {
        setNewAddress({
            name: '',
            phone: '',
            fullAddress: '',
            city: '',
            district: '',
            ward: '',
        });
        setSelectedProvinceId(null);
        setSelectedDistrictId(null);
        setSelectedWardId(null);
        setDistricts([]);
        setWards([]);
    };

    const handleSaveInlineAddress = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setIsLoadingInlineAddress(true);

        try {
            if (!newAddress.name || !newAddress.phone || !newAddress.fullAddress ||
                !selectedProvinceId || !selectedDistrictId) {
                toast.error('Vui lòng điền đầy đủ thông tin địa chỉ');
                return;
            }

            const selectedProvince = provinces.find((p: Province) => p.provinceID === selectedProvinceId);
            const selectedDistrict = districts.find((d: District) => d.districtID === selectedDistrictId);
            const selectedWard = wards.find((w: Ward) => w.wardCode === selectedWardId);

            const fullAddressString = newAddress.fullAddress +
                (selectedWard ? ", " + selectedWard.wardName : "") +
                ", " + (selectedDistrict?.districtName || '') +
                ", " + (selectedProvince?.provinceName || '');

            const addressData: UserAddress = {
                userId: '',
                name: newAddress.name,
                fullAddress: fullAddressString,
                city: selectedProvince?.provinceName ?? '',
                district: selectedDistrictId?.toString() ?? '',
                ward: selectedWardId ?? '',
                isDefault: false,
            };

            // Save to database
            const response = await UserAddressService.addAddress(addressData);

            // Create temporary address object for immediate use
            const tempAddress: UserAddress = {
                ...addressData,
                id: response.data?.id || 'temp-' + Date.now()
            };

            // Notify parent component about new address
            if (onAddressChange) {
                onAddressChange(tempAddress);
            }

            setShowInlineAddressForm(false);
            resetAddressForm();
            toast.success('Đã lưu địa chỉ giao hàng thành công!');
        } catch (error) {
            console.error('Lỗi khi lưu địa chỉ:', error);
            toast.error('Không thể lưu địa chỉ. Vui lòng thử lại.');
        } finally {
            setIsLoadingInlineAddress(false);
        }
    };

    const handleCancelInlineForm = (): void => {
        setShowInlineAddressForm(false);
        resetAddressForm();
    };

    return (
        <div className="col-lg-8 p--20 order-2 order-xl-1 cart-total-area-start-right"
            style={{ padding: '40px', border: "none" }}>
            <h3>Địa chỉ giao hàng</h3>

            {loadingAddress ? (
                <p>Đang tải địa chỉ mặc định...</p>
            ) : defaultAddress ? (
                <div className="border rounded bg-light mb-4" style={{ padding: '20px' }}>
                    <p><strong>{defaultAddress.name}</strong></p>
                    <p>{defaultAddress.fullAddress}</p>
                    <button
                        className="btn btn-outline-secondary btn-sm mt-2"
                        onClick={() => setShowInlineAddressForm(true)}
                    >
                        Thay đổi địa chỉ
                    </button>
                </div>
            ) : (
                <div className="border rounded bg-light mb-4" style={{ padding: '20px' }}>
                    {!showInlineAddressForm ? (
                        <>
                            <p><strong style={{ color: "red" }}>
                                Không có địa chỉ mặc định. Vui lòng nhập địa chỉ giao hàng.
                            </strong></p>
                            <div className="d-flex gap-2">
                                <button
                                    className="rts-btn btn-primary"
                                    onClick={() => setShowInlineAddressForm(true)}
                                >
                                    Nhập địa chỉ giao hàng
                                </button>
                                <button
                                    className="rts-btn btn-secondary"
                                    // onClick={() => router.push('/account')}
                                >
                                    Quản lý địa chỉ
                                </button>
                            </div>
                        </>
                    ) : (
                        <form onSubmit={handleSaveInlineAddress}>
                            <div className="row g-3">
                                <div className="col-12">
                                    <h6 className="mb-3">
                                        <i className="fa-solid fa-location-dot text-primary me-2"></i>
                                        Thông tin giao hàng
                                    </h6>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Tên người nhận <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="form-control"
                                        value={newAddress.name}
                                        onChange={handleNewAddressChange}
                                        placeholder="Nhập tên người nhận"
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Số điện thoại <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="form-control"
                                        value={newAddress.phone}
                                        onChange={handleNewAddressChange}
                                        placeholder="Nhập số điện thoại"
                                        required
                                    />
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">
                                        Tỉnh / Thành phố <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className="form-select"
                                        value={selectedProvinceId || ""}
                                        onChange={handleProvinceChange}
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

                                <div className="col-md-4">
                                    <label className="form-label">
                                        Quận / Huyện <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className="form-select"
                                        value={selectedDistrictId || ""}
                                        onChange={handleDistrictChange}
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

                                <div className="col-md-4">
                                    <label className="form-label">Phường / Xã</label>
                                    <select
                                        className="form-select"
                                        value={selectedWardId || ""}
                                        onChange={handleWardChange}
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

                                <div className="col-12">
                                    <label className="form-label">
                                        Địa chỉ chi tiết <span className="text-danger">*</span>
                                    </label>
                                    <textarea
                                        name="fullAddress"
                                        className="form-control"
                                        rows={2}
                                        value={newAddress.fullAddress}
                                        onChange={handleNewAddressChange}
                                        placeholder="Số nhà, tên đường..."
                                        required
                                    />
                                </div>

                                <div className="col-12">
                                    <div className="d-flex gap-2 mt-3">
                                        <button
                                            type="submit"
                                            className="rts-btn btn-primary"
                                            disabled={isLoadingInlineAddress}
                                        >
                                            {isLoadingInlineAddress ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"
                                                        role="status" aria-hidden="true"></span>
                                                    Đang lưu...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fa-solid fa-check me-2"></i>
                                                    Lưu và tiếp tục
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={handleCancelInlineForm}
                                            disabled={isLoadingInlineAddress}
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* Hiển thị form địa chỉ mới khi có địa chỉ mặc định nhưng user muốn thay đổi */}
            {showInlineAddressForm && defaultAddress && (
                <div className="border rounded bg-light mb-4" style={{ padding: '20px' }}>
                    <form onSubmit={handleSaveInlineAddress}>
                        <div className="row g-3">
                            <div className="col-12">
                                <h6 className="mb-3">
                                    <i className="fa-solid fa-location-dot text-primary me-2"></i>
                                    Địa chỉ giao hàng mới
                                </h6>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">
                                    Tên người nhận <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-control"
                                    value={newAddress.name}
                                    onChange={handleNewAddressChange}
                                    placeholder="Nhập tên người nhận"
                                    required
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">
                                    Số điện thoại <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    className="form-control"
                                    value={newAddress.phone}
                                    onChange={handleNewAddressChange}
                                    placeholder="Nhập số điện thoại"
                                    required
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label">
                                    Tỉnh / Thành phố <span className="text-danger">*</span>
                                </label>
                                <select
                                    className="form-select"
                                    value={selectedProvinceId || ""}
                                    onChange={handleProvinceChange}
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

                            <div className="col-md-4">
                                <label className="form-label">
                                    Quận / Huyện <span className="text-danger">*</span>
                                </label>
                                <select
                                    className="form-select"
                                    value={selectedDistrictId || ""}
                                    onChange={handleDistrictChange}
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

                            <div className="col-md-4">
                                <label className="form-label">Phường / Xã</label>
                                <select
                                    className="form-select"
                                    value={selectedWardId || ""}
                                    onChange={handleWardChange}
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

                            <div className="col-12">
                                <label className="form-label">
                                    Địa chỉ chi tiết <span className="text-danger">*</span>
                                </label>
                                <textarea
                                    name="fullAddress"
                                    className="form-control"
                                    rows={2}
                                    value={newAddress.fullAddress}
                                    onChange={handleNewAddressChange}
                                    placeholder="Số nhà, tên đường..."
                                    required
                                />
                            </div>

                            <div className="col-12">
                                <div className="d-flex gap-2 mt-3">
                                    <button
                                        type="submit"
                                        className="rts-btn btn-primary"
                                        disabled={isLoadingInlineAddress}
                                    >
                                        {isLoadingInlineAddress ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"
                                                    role="status" aria-hidden="true"></span>
                                                Đang lưu...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fa-solid fa-check me-2"></i>
                                                Sử dụng địa chỉ này
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={handleCancelInlineForm}
                                        disabled={isLoadingInlineAddress}
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ShippingAddressSection;