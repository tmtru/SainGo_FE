import { AnyAaaaRecord } from "dns";
import http from "../axios/index";

export interface ShippingFeeRequest {
    toDistrictId: number;
    toWardCode: string;
    serviceId: number;
    length?: number;
    width?: number;
    height?: number;
    weight?: number;
    insuranceValue?: number;
    codFailedAmount?: number;
}



const calculateShippingFee = (data: ShippingFeeRequest) =>
    http.post<any>("/api/Shipping/calculate-fee", data);

const calculateDeliveryTime = (data: ShippingFeeRequest) =>
    http.post<any>("/api/Shipping/calculate-leadtime", data);

const ShippingService = {
    calculateShippingFee,
    calculateDeliveryTime,
};

export default ShippingService;
