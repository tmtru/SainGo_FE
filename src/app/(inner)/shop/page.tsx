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
            <div
              className="title-area-between"
              style={{ justifyContent: "center" }}
            >
              <ul
                className="nav nav-tabs best-selling-grocery"
                id="categoryTabs"
                role="tablist"
                style={{ margin: "0 auto" }}
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
                    <h2>Các món ăn hiện chưa kịp cập nhật. Vui lòng thử lại sau</h2>
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
      <style jsx>{`
      /* ============================================
   HEALTH FOOD MENU - CUSTOM STYLES
   ============================================ */

/* Main Container */

/* Category Tabs */
.title-area-between {
  margin: 50px 0 40px;
  padding: 0 20px;
}

.nav-tabs.best-selling-grocery {
  border: none !important;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  background: #ffffff;
  padding: 20px;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.nav-tabs.best-selling-grocery .nav-item {
  margin: 0;
}

.nav-tabs.best-selling-grocery .nav-link {
  border: 2px solid #e5e7eb !important;
  background: #ffffff;
  color: #6b7280;
  padding: 12px 28px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 15px;
  transition: all 0.3s ease;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
}

.nav-tabs.best-selling-grocery .nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  transition: all 0.4s ease;
  z-index: -1;
}

.nav-tabs.best-selling-grocery .nav-link:hover {
  border-color: #10b981 !important;
  color: #047857;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.nav-tabs.best-selling-grocery .nav-link.active {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  color: #ffffff !important;
  border-color: #10b981 !important;
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
  transform: translateY(-2px);
}

.nav-tabs.best-selling-grocery .nav-link.active::before {
  left: 0;
}

/* Filter Area */
.filter-select-area {
  margin-bottom: 30px;
}

.top-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #f0fdf4;
}

.top-filter span {
  color: #047857;
  font-weight: 600;
  font-size: 16px;
}

.sort-dropdown-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sort-dropdown-wrapper span {
  color: #6b7280;
  font-weight: 500;
  font-size: 15px;
}

.sort-dropdown-wrapper select {
  padding: 10px 16px !important;
  border: 2px solid #e5e7eb !important;
  border-radius: 12px !important;
  background: #ffffff !important;
  min-width: 180px !important;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sort-dropdown-wrapper select:hover {
  border-color: #10b981 !important;
}

.sort-dropdown-wrapper select:focus {
  outline: none;
  border-color: #10b981 !important;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

/* Product Cards */
.single-shopping-card-one {
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.4s ease;
  border: 2px solid #f0fdf4;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.single-shopping-card-one:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(16, 185, 129, 0.2);
  border-color: #10b981;
}

/* Pagination */
.pagination-area-main-wrappper ul {
  display: flex;
  gap: 8px;
  justify-content: center;
  list-style: none;
  padding: 0;
  margin: 0;
}

.pagination-area-main-wrappper ul li button {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  background: #ffffff;
  color: #6b7280;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-area-main-wrappper ul li button:hover {
  background: #f0fdf4;
  border-color: #10b981;
  color: #047857;
  transform: translateY(-2px);
}

.pagination-area-main-wrappper ul li button.active {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  border-color: #10b981;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* Empty State */
.col-12.text-center.py-5 h2 {
  color: #6b7280;
  font-size: 24px;
  font-weight: 500;
}

/* Loading State */
.text-danger {
  color: #ef4444 !important;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .vendor-search-area-wrapper h1.title {
    font-size: 36px;
  }
  
  .search-vendor-form {
    flex-direction: column;
    border-radius: 16px;
    padding: 12px;
  }
  
  .search-vendor-form input[type="text"],
  .search-vendor-form button[type="submit"] {
    width: 100%;
  }
  
  .nav-tabs.best-selling-grocery {
    padding: 15px;
  }
  
  .nav-tabs.best-selling-grocery .nav-link {
    padding: 10px 20px;
    font-size: 14px;
  }
  
  .top-filter {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .sort-dropdown-wrapper {
    width: 100%;
  }
  
  .sort-dropdown-wrapper select {
    width: 100%;
  }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.product-area-wrapper-shopgrid-list {
  animation: fadeIn 0.6s ease-out;
}

/* Health Icons & Badges */
.discount-offer::after {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

/* Section Separator */
.section-seperator {
  border-color: #e5e7eb !important;
  opacity: 0.5;
}

/* Additional Health-themed Accents */
.shop-grid-sidebar-area {
  background: #ffffff;
}

/* Smooth Scrolling */
html {
  scroll-behavior: smooth;
}

/* Focus States for Accessibility */
*:focus {
  outline: 2px solid #10b981;
  outline-offset: 2px;
}

button:focus,
input:focus,
select:focus {
  outline: 2px solid #10b981;
  outline-offset: 2px;
}
            `}</style>

      <FooterOne />
    </div>
  );
}
