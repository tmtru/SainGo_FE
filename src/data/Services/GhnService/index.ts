import http from "../axios/index";

export interface GhnProvince {
    ProvinceID: number;
    ProvinceName: string;
}

export interface GhnDistrict {
    DistrictID: number;
    DistrictName: string;
}

export interface GhnWard {
    WardCode: string;
    WardName: string;
}

const getProvinces = () =>
    http.get<any>("/api/GhnLocation/provinces");

const getDistricts = (provinceId: number) =>
    http.get<any>(`/api/GhnLocation/districts?provinceId=${provinceId}`);

const getWards = (districtId: number) =>
    http.get<any>(`/api/GhnLocation/wards?districtId=${districtId}`);

const GhnService = {
    getProvinces,
    getDistricts,
    getWards,
};

export default GhnService;
