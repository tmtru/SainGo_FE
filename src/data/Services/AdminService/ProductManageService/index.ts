import http from "../../axios/index"

// Types
export interface AdminProductVariantDto {
    name: string
    sku: string
    priceAdjustment: number
    initialStock?: number
    attributeName: string
    attributeValue: string
}

export interface CreateAdminProductDto {
    mainCategoryId: string
    subCategoryId?: string
    brandId?: string
    name: string
    slug: string
    description?: string
    shortDescription?: string
    sku?: string
    barcode?: string
    basePrice: number
    salePrice?: number
    costPrice?: number
    weight?: number
    dimensions?: string
    unit: number
    unitSize?: string
    thumbnailUrl?: string
    imageUrls?: string
    initialStock?: number
    lowStockThreshold?: number
    maxOrderQuantity?: number
    minOrderQuantity?: number
    isAvailable?: boolean
    isFeatured?: boolean
    isOrganic?: boolean
    isFreshProduct?: boolean
    metaTitle?: string
    metaDescription?: string
    displayOrder?: number
    variants?: AdminProductVariantDto[]
}

export interface UpdateAdminProductDto extends CreateAdminProductDto {
    id: string
}

export interface AddInventoryDto {
    productId: string
    productVariantId?: string
    quantity: number
}

export interface AdminProductFilterDto {
    storeId?: string
    categoryId?: string
    minPrice?: number
    maxPrice?: number
    keyword?: string
    pageNumber?: number
    pageSize?: number
    sortBy?: string
    sortDesc?: boolean
}

// Responses
export interface PaginatedResponse<T> {
    currentPage: number
    items: T[]
    pageSize: number
    totalItems: number
    totalPages: number
}

export interface AdminProduct {
    id: string
    mainCategoryId: string
    subCategoryId?: string
    brandId?: string
    name: string
    slug: string
    description?: string
    shortDescription?: string
    sku?: string
    barcode?: string
    basePrice: number
    salePrice?: number
    costPrice?: number
    weight?: number
    dimensions?: string
    unit: number
    unitSize?: string
    thumbnailUrl?: string
    imageUrls?: string
    stockQuantity: number
    lowStockThreshold?: number
    maxOrderQuantity?: number
    minOrderQuantity?: number
    isAvailable?: boolean
    isFeatured?: boolean
    isOrganic?: boolean
    isFreshProduct?: boolean
    metaTitle?: string
    metaDescription?: string
    displayOrder?: number
    variants?: AdminProductVariantDto[]
    createdAt?: string
    updatedAt?: string
}

// API Calls
const getAll = () => http.get<AdminProduct[]>("/api/admin/ManageProduct")

const getById = (id: string) =>
    http.get<AdminProduct>(`/api/admin/ManageProduct/${id}`)

const create = (dto: CreateAdminProductDto) =>
    http.post<AdminProduct>("/api/admin/ManageProduct", dto)

const update = (id: string, dto: UpdateAdminProductDto) =>
    http.put<AdminProduct>(`/api/admin/ManageProduct/${id}`, dto)

const remove = (id: string) =>
    http.delete(`/api/admin/ManageProduct/${id}`)

const search = (keyword: string) =>
    http.get<AdminProduct[]>(`/api/admin/ManageProduct/search`, {
        params: { keyword },
    })

const getFiltered = (filter: AdminProductFilterDto) =>
    http.get<PaginatedResponse<AdminProduct>>(`/api/admin/ManageProduct/filter`, {
        params: filter,
    })

const getByStoreId = (storeId: string) =>
    http.get<AdminProduct[]>(`/api/admin/ManageProduct/store/${storeId}`)

const addInventory = (productId: string, dto: AddInventoryDto) =>
    http.post(`/api/admin/ManageProduct/${productId}/inventory`, dto)

// Export service
const AdminProductService = {
    getAll,
    getById,
    create,
    update,
    remove,
    search,
    getFiltered,
    getByStoreId,
    addInventory,
}

export default AdminProductService
