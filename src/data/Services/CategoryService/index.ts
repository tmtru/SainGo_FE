import http from "../axios/index"

export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    imageUrl: string;
    iconUrl: string;
    displayOrder: number;
    isActive: boolean;
    createdAt: string;
    deletedAt: string | null;
}


const getAllCategory = () => http.get<Category[]>("/api/ProductCategory/main");

const getSubCategories = (parentId: string) => http.get<Category[]>(`/api/ProductCategory/sub`);

const getCategoryById = (id: string) => http.get<Category>(`/api/ProductCategory/main/${id}`);

const getSubCategoriesById = (parentId: string) => http.get<Category[]>(`/api/ProductCategory/sub/${parentId}`);

const CategoryService = {
    getAllCategory,
    getSubCategories,
    getCategoryById,
    getSubCategoriesById
}

export default CategoryService
