"use client";

import type React from "react";

import HeaderOne from "@/components/header/HeaderOne";
import { useState, useEffect } from "react";
// import ShopMainList from "./ShopMainList";
import FooterOne from "@/components/footer/FooterOne";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProductService, {
  type Product,
  type ProductFilterDto,
} from "@/data/Services/ProductService";
import { Pagination } from "@mui/material";
import CategoryService, {
  type Category,
} from "@/data/Services/CategoryService";
import { RestaurantMenuWithApi } from "@/components/product/RestaurantMenu";

// Sort options interface
interface SortOption {
  value: string;
  label: string;
  sortBy: string;
  sortDesc: boolean;
}

// Available sort options
const sortOptions: SortOption[] = [
  { value: "latest", label: "Mới nhất", sortBy: "createdAt", sortDesc: true },
  { value: "oldest", label: "Cũ nhất", sortBy: "createdAt", sortDesc: false },
  { value: "name-asc", label: "Tên (A-Z)", sortBy: "name", sortDesc: false },
  { value: "name-desc", label: "Tên (Z-A)", sortBy: "name", sortDesc: true },
  {
    value: "price-low",
    label: "Giá: Thấp đến Cao",
    sortBy: "price",
    sortDesc: false,
  },
  {
    value: "price-high",
    label: "Giá: Cao đến Thấp",
    sortBy: "price",
    sortDesc: true,
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("tab1");
  const searchParams = useSearchParams();
  const router = useRouter();
  const [totalPages, setTotalPages] = useState<number>(0);

  // States for filter inputs, initialized from URL search parameters
  const [localSearchQuery, setLocalSearchQuery] = useState<string>(
    searchParams.get("keyword") || "" // Mapped to API's 'keyword'
  );

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("categoryId")?.split(",") || []
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.get("brandId")?.split(",") || []
  );
  const [minPrice, setMinPrice] = useState<number>(
    Number.parseFloat(searchParams.get("minPrice") || "0")
  );
  const [maxPrice, setMaxPrice] = useState<number>(
    Number.parseFloat(searchParams.get("maxPrice") || "150")
  );

  // Sort states
  const [sortBy, setSortBy] = useState<string>(
    searchParams.get("sortBy") || "createdAt"
  );
  const [sortDesc, setSortDesc] = useState<boolean>(
    searchParams.get("sortDesc") === "true" || true
  );
  const [selectedSortValue, setSelectedSortValue] = useState<string>(
    searchParams.get("sort") || "latest"
  );

  // Add states for PageNumber, PageSize if you want client control
  const [pageNumber, setPageNumber] = useState<number>(
    Number.parseInt(searchParams.get("pageNumber") || "1", 10)
  );
  const [pageSize, setPageSize] = useState<number>(
    Number.parseInt(searchParams.get("pageSize") || "15", 10)
  );

  // API response states
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [debouncedSearchQuery, setDebouncedSearchQuery] =
    useState(localSearchQuery);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      const filterDto: ProductFilterDto = {};

      if (debouncedSearchQuery) {
        filterDto.keyword = debouncedSearchQuery;
        params.append("keyword", debouncedSearchQuery);
      }

      if (selectedCategories.length > 0) {
        const joined = selectedCategories.join(",");
        filterDto.categoryId = joined;
        params.append("categoryId", joined);
      }

      if (minPrice !== 0) {
        filterDto.minPrice = minPrice;
        params.append("minPrice", minPrice.toString());
      }

      if (maxPrice !== 150) {
        filterDto.maxPrice = maxPrice;
        params.append("maxPrice", maxPrice.toString());
      }

      // Add sort parameters
      filterDto.sortBy = sortBy;
      filterDto.sortDesc = sortDesc;
      params.append("sortBy", sortBy);
      params.append("sortDesc", sortDesc.toString());
      params.append("sort", selectedSortValue);

      filterDto.PageNumber = pageNumber;
      params.append("pageNumber", pageNumber.toString());

      filterDto.pageSize = pageSize;
      params.append("pageSize", pageSize.toString());

      // Cập nhật URL
      router.push(`?${params.toString()}`, { scroll: false });

      try {
        const response = await ProductService.getFilteredProducts(filterDto);
        console.log("Filtered products fetched:", response);
        const { items, totalPages, totalItems, currentPage } = response.data;

        setFilteredProducts(items);
        setTotalPages(totalPages);
      } catch (err: any) {
        console.error("Failed to fetch products:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "An unexpected error occurred."
        );
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await CategoryService.getAllCategory();
        console.log("All categories fetched:", response);
        setAllCategories(response.data);
      } catch (err: any) {
        console.error("Failed to fetch categories:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "An unexpected error occurred while fetching categories."
        );
      }
    };

    fetchProducts();
    fetchCategories();
  }, [
    debouncedSearchQuery,
    selectedCategories,
    selectedBrands,
    minPrice,
    maxPrice,
    sortBy,
    sortDesc,
    pageNumber,
    pageSize,
    router,
  ]);

  useEffect(() => {
    setPageNumber(1);
  }, [
    debouncedSearchQuery,
    selectedCategories,
    selectedBrands,
    minPrice,
    maxPrice,
    sortBy,
    sortDesc,
  ]);

  const handleCategoryChange = (category: string): void => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        const newState = prev.filter((cat: string) => cat !== category);
        setPageNumber(1);
        return newState;
      } else {
        setPageNumber(1);
        return [category];
      }
    });
  };

  const handleBrandChange = (brand: string): void => {
    setSelectedBrands((prev) => {
      const newState = prev.includes(brand)
        ? prev.filter((b: string) => b !== brand)
        : [...prev, brand];
      setPageNumber(1);
      return newState;
    });
  };

  const handleMinPriceChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const val: number = Number.parseFloat(e.target.value);
    if (!isNaN(val)) setMinPrice(val);
    setPageNumber(1);
  };

  const handleMaxPriceChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const val: number = Number.parseFloat(e.target.value);
    if (!isNaN(val)) setMaxPrice(val);
    setPageNumber(1);
  };

  const handlePriceRangeCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;

    setSelectedPriceRanges((prev) => {
      const updated = checked
        ? [...prev, value]
        : prev.filter((v) => v !== value);

      // Cập nhật minPrice và maxPrice dựa trên các khoảng giá được chọn
      if (updated.length === 0) {
        setMinPrice(0);
        setMaxPrice(999999999); // hoặc giá cao nhất
      } else {
        const minValues = updated.map((v) =>
          Number.parseInt(v.split("-")[0], 10)
        );
        const maxValues = updated.map((v) =>
          Number.parseInt(v.split("-")[1], 10)
        );
        setMinPrice(Math.min(...minValues));
        setMaxPrice(Math.max(...maxValues));
      }

      setPageNumber(1); // reset phân trang
      return updated;
    });
  };

  const handlePriceFilterSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
  };

  const handleSearchInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setLocalSearchQuery(e.target.value);
    setPageNumber(1);
  };

  const handleSearchSubmit = (e: React.FormEvent): void => {
    e.preventDefault();

    const params = new URLSearchParams(window.location.search);

    // Cập nhật lại keyword trên URL
    if (localSearchQuery.trim()) {
      params.set("keyword", localSearchQuery.trim());
    } else {
      params.delete("keyword");
    }

    params.set("pageNumber", "1");

    router.push(`?${params.toString()}`, { scroll: false });
    setDebouncedSearchQuery(localSearchQuery.trim());
    setPageNumber(1);
  };

  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const selectedValue = e.target.value;
    const selectedOption = sortOptions.find(
      (option) => option.value === selectedValue
    );

    if (selectedOption) {
      setSelectedSortValue(selectedValue);
      setSortBy(selectedOption.sortBy);
      setSortDesc(selectedOption.sortDesc);
      setPageNumber(1);
    }
  };

  const handlePageChange = (page: number) => {
    setPageNumber(page);
  };

  // Get current sort option label
  const getCurrentSortLabel = (): string => {
    const currentOption = sortOptions.find(
      (option) => option.value === selectedSortValue
    );
    return currentOption?.label || "Latest";
  };

  return (
    <div className="shop-page">
      <HeaderOne />

      {/* Breadcrumb */}
      <div className="rts-navigation-area-breadcrumb bg_light-1">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="navigator-breadcrumb-wrapper">
                <Link href="/">Trang chủ</Link>
                <i className="fa-regular fa-chevron-right" />
                <Link className="current" href="#">
                  Menu
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-seperator bg_light-1">
        <div className="container">
          <hr className="section-seperator" />
        </div>
      </div>

      <div className="rts-section-gap">
       
      </div>
      <div className="container">
         <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
          <div className="max-w-4xl mx-auto p-8">
            <div className="bg-white shadow-2xl rounded-lg overflow-hidden border-4 border-green-800">
              <RestaurantMenuWithApi
                products={filteredProducts}
                categories={allCategories}
                loading={loading}
                error={error}
                searchQuery={debouncedSearchQuery}
                onSearchChange={(query) => {
                  setLocalSearchQuery(query);
                  setDebouncedSearchQuery(query);
                }}
                selectedCategories={selectedCategories}
                onCategoryChange={handleCategoryChange}
              />

              {!loading && !error && filteredProducts.length > 0 && (
                <div className="mt-4 d-flex justify-content-center">
                  <Pagination
                    count={totalPages}
                    page={pageNumber}
                    onChange={(_, page) => handlePageChange(page)}
                    color="primary"
                    shape="rounded"
                    showFirstButton
                    showLastButton
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <FooterOne />
    </div>
  );
}
