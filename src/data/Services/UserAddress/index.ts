import http from "../axios/index"

export interface UserAddress {
    id?: string
    userId?: string
    name?: string
    fullAddress: string
    phoneNumber?: string
    ward?: string
    district?: string
    city?: string
    latitude?: number
    longitude?: number
    isDefault?: boolean
    createdAt?: string
    deletedAt?: string
}

const getMyAddresses = () =>
    http.get<UserAddress[]>("/api/UserAddress/me")

const getMyDefaultAddress = () =>
    http.get<UserAddress>("/api/UserAddress/me/default")

const addAddress = (address: UserAddress) =>
    http.post<UserAddress>("/api/UserAddress", address)

const updateAddress = (id: string, address: UserAddress) =>
    http.put<UserAddress>(`/api/UserAddress/${id}`, address)

const deleteAddress = (id: string) =>
    http.delete(`/api/UserAddress/${id}`)

const setDefaultAddress = (addressId: string) =>
    http.post(`/api/UserAddress/me/set-default/${addressId}`)

const UserAddressService = {
    getMyAddresses,
    getMyDefaultAddress,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress, 
}
export default UserAddressService
