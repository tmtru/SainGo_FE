import http from "../axios/index"

export interface RecipeStep {
    step: number
    text: string
}

export interface Product {
    id: string
    mainCategoryId: string
    subCategoryId?: string
    brandId?: string

    name: string
    slug: string
    description?: string
    shortDescription?: string
    sku?: string

    basePrice: number
    salePrice?: number
    costPrice?: number

    weight?: number
    unit: string
    unitSize?: string
    lowStockThreshold?: number

    isAvailable?: boolean
    isFeatured?: boolean
    isOrganic?: boolean
    isVegetarian?: boolean
    isVegan?: boolean
    isGlutenFree?: boolean

    createdAt?: string
    updatedAt?: string
    deletedAt?: string

    allergens?: string
    caloriesPer100g?: number
    proteinPer100g?: number
    carbsPer100g?: number
    fatPer100g?: number

    imageUrl?: string
    nutritionHighlights?: string
    ingredients: string[]
    recipeSteps: RecipeStep[]
    healthBenefits: string[]
    reheatingInstructions?: string
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

const getSaledProducts = (count = 10) =>
    http.get<Product[]>(`/api/Product/best-sales`, { params: { count } })

const ProductService = {
    getAllProducts,
    getFilteredProducts,
    getProductById,
    getProductsByStore,
    searchProducts,
    getFeaturedProducts,
    getSaledProducts
}

export default ProductService
