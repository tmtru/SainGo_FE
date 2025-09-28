"use client";

import type React from "react";

import CustomLoader from "@/components/common/CustomLoader";
import FooterOne from "@/components/footer/FooterOne";
import HeaderOne from "@/components/header/HeaderOne";
import CategoryService, {
  type Category,
} from "@/data/Services/CategoryService";
import ProductService, {
  type Product,
  type ProductFilterDto,
} from "@/data/Services/ProductService";
import { Pagination } from "@mui/material";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ShopMain from "./ShopMain";

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
  const [activeTab, setActiveTab] = useState<string>("all");
  const searchParams = useSearchParams();
  const router = useRouter();
  const [totalPages, setTotalPages] = useState<number>(0);

  // States for filter inputs, initialized from URL search parameters
  const [localSearchQuery, setLocalSearchQuery] = useState<string>(
    searchParams.get("keyword") || ""
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
        const { items, totalPages } = response.data;

        setFilteredProducts(items);
        setTotalPages(totalPages);
      } catch (err: any) {
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
        setAllCategories(response.data);
      } catch (err: any) {
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
    setSelectedCategories([category]);
    setPageNumber(1);
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

      <div className="shop-grid-sidebar-area rts-section-gap">
        <div className="container">
          <div className="row g-0">
            <div className="vendor-search-area">
              <div className="container">
                <div className="row">
                  <div className="col-lg-12">
                    <div className="vendor-search-area-wrapper">
                      <h1 className="title">MENU</h1>
                      <form
                        onSubmit={handleSearchSubmit}
                        className="search-vendor-form"
                      >
                        <input
                          type="text"
                          placeholder="Nhập tên món ăn..."
                          value={localSearchQuery}
                          onChange={handleSearchInputChange}
                          style={{ marginBottom: "15px" }}
                        />
                        <button
                          type="submit"
                          className="rts-btn btn-primary radious-sm with-icon"
                        >
                          <div className="btn-text">Tìm kiếm</div>
                          <div className="arrow-icon">
                            <i className="fa-light fa-magnifying-glass" />
                          </div>
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs categories */}
            <div className="title-area-between">
              <h2 className="title-left mb--0">Danh sách món ăn</h2>
              <ul
                className="nav nav-tabs best-selling-grocery"
                id="categoryTabs"
                role="tablist"
              >
                <li className="nav-item" role="presentation">
                  <button
                    onClick={() => {
                      setActiveTab("all");
                      setSelectedCategories([]);
                    }}
                    className={`nav-link ${
                      activeTab === "all" ? "active" : ""
                    }`}
                  >
                    Tất cả
                  </button>
                </li>

                {allCategories.map((cat: Category) => (
                  <li key={cat.id} className="nav-item" role="presentation">
                    <button
                      onClick={() => {
                        setActiveTab(cat.id);
                        handleCategoryChange(cat.id);
                      }}
                      className={`nav-link ${
                        activeTab === cat.id ? "active" : ""
                      }`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Main Content */}
            <div className="col-xl-12 col-lg-12">
              <div className="filter-select-area">
                <div className="top-filter">
                  <span>
                    {loading
                      ? "Loading..."
                      : `Hiện ${filteredProducts.length} kết quả`}
                  </span>
                  {error && <p className="text-danger">{error}</p>}
                  <div className="right-end">
                    <div
                      className="sort-dropdown-wrapper"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span>Sắp xếp theo:</span>
                      <select
                        value={selectedSortValue}
                        onChange={handleSortChange}
                        style={{
                          padding: "5px 10px",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          background: "white",
                          minWidth: "150px",
                        }}
                      >
                        {sortOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid view */}
              <div className="tab-content" id="myTabContent">
                {loading ? (
                  <div className="col-12 text-center py-5">
                    <CustomLoader />
                  </div>
                ) : error ? (
                  <div className="col-12 text-center py-5">
                    <p>{error}</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="col-12 text-center py-5">
                    <h2>No Product Found</h2>
                  </div>
                ) : (
                  <div className="product-area-wrapper-shopgrid-list mt--20 tab-pane fade show active">
                    <div className="row g-4">
                      {filteredProducts.map((post: Product) => (
                        <div key={post.id} className="col-lg-6">
                          <div className="single-shopping-card-one discount-offer">
                            <ShopMain
                              Id={post.id}
                              Slug={post.slug}
                              ProductImage={post.imageUrl}
                              ProductTitle={post.name}
                              Price={
                                post.salePrice == null
                                  ? post.basePrice.toString()
                                  : post.salePrice.toString()
                              }
                              BasePrice={post.basePrice.toString()}
                              StockAvailable={post.isAvailable ? 1 : 0}
                              Calories={post.caloriesPer100g}
                              Protein={post.proteinPer100g}
                              Carbs={post.carbsPer100g}
                              Fat={post.fatPer100g}
                              NutritionHighlights={post.nutritionHighlights}
                              UnitSize={post.unitSize}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="row mt--50">
                <div className="col-lg-12">
                  <div className="pagination-area-main-wrappper">
                    <ul>
                      {[...Array(totalPages)].map((_, i) => (
                        <li key={i}>
                          <button
                            className={pageNumber === i + 1 ? "active" : ""}
                            onClick={() => handlePageChange(i + 1)}
                          >
                            {(i + 1).toString().padStart(2, "0")}
                          </button>
                        </li>
                      ))}
                      {pageNumber < totalPages && (
                        <li>
                          <button
                            onClick={() => handlePageChange(pageNumber + 1)}
                          >
                            <i className="fa-regular fa-chevrons-right" />
                          </button>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FooterOne />
    </div>
  );
}
