import http from "../axios/index"

export interface Product {
    id: string
    mainCategoryId?: string
    subCategoryId?: string
    name: string
    slug: string
    thumbnailUrl: string
    shortDescription: string
    salePrice: number
    basePrice: number
    stockQuantity: number
    isAvailable: boolean
    isFeatured: boolean
    averageRating: number
    totalReviews: number
    createdAt: string
    description: string
    imageUrls: string
    weight: number
    dimensions: string
    unit: string
    unitSize: string
    brandId: string
    expiryDate?: Date
}

export interface ProductFilterDto {
    storeId?: string
    categoryId?: string
    minPrice?: number
    maxPrice?: number
    keyword?: string
    PageNumber?: number
    pageSize?: number
    sortBy?: string
    sortDesc?: boolean
}

export interface PaginatedResponse<T> {
    currentPage: number
    items: T[]
    pageSize: number
    totalItems: number
    totalPages: number
}

const getAllProducts = () => http.get<Product[]>("/api/Product")

const getFilteredProducts = (filter: ProductFilterDto) =>
    http.get<PaginatedResponse<Product>>("/api/Product/filter", { params: filter })

const getProductById = (id: string) =>
    http.get<Product>(`/api/Product/${id}`)

const getProductsByStore = (storeId: string) =>
    http.get<Product[]>(`/api/Product/store/${storeId}`)

const searchProducts = (keyword: string) =>
    http.get<Product[]>(`/api/Product/search`, { params: { keyword } })

const getFeaturedProducts = (count = 10) =>
    http.get<Product[]>(`/api/Product/featured`, { params: { count } })

const ProductService = {
    getAllProducts,
    getFilteredProducts,
    getProductById,
    getProductsByStore,
    searchProducts,
    getFeaturedProducts,
}

export default ProductService
