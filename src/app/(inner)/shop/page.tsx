"use client";

import HeaderOne from "@/components/header/HeaderOne";
import { useState, useEffect, useCallback } from 'react';
import ShopMain from "./ShopMain";
// import ShopMainList from "./ShopMainList";
import FooterOne from "@/components/footer/FooterOne";
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProductService, { Product, ProductFilterDto } from "@/data/Services/ProductService";
import { Pagination } from "@mui/material";
import CategoryService, { Category } from "@/data/Services/CategoryService";
import CustomLoader from "@/components/common/CustomLoader";



export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('tab1');
  const searchParams = useSearchParams();
  const router = useRouter();
  const [totalPages, setTotalPages] = useState<number>(0);

  // States for filter inputs, initialized from URL search parameters
  const [localSearchQuery, setLocalSearchQuery] = useState<string>(
    searchParams.get('keyword') || '' // Mapped to API's 'keyword'
  );

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('categoryId')?.split(',') || []
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.get('brandId')?.split(',') || []
  );
  const [minPrice, setMinPrice] = useState<number>(
    parseFloat(searchParams.get('minPrice') || '0')
  );
  const [maxPrice, setMaxPrice] = useState<number>(
    parseFloat(searchParams.get('maxPrice') || '150')
  );
  // Add states for PageNumber, PageSize if you want client control
  const [pageNumber, setPageNumber] = useState<number>(parseInt(searchParams.get('pageNumber') || '1', 10));
  const [pageSize, setPageSize] = useState<number>(parseInt(searchParams.get('pageSize') || '15', 10));


  // API response states
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(localSearchQuery);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      const filterDto: ProductFilterDto = {};

      if (debouncedSearchQuery) {
        filterDto.keyword = debouncedSearchQuery;
        params.append('keyword', debouncedSearchQuery);
      }

      if (selectedCategories.length > 0) {
        const joined = selectedCategories.join(',');
        filterDto.categoryId = joined;
        params.append('categoryId', joined);
      }

      if (minPrice !== 0) {
        filterDto.minPrice = minPrice;
        params.append('minPrice', minPrice.toString());
      }

      if (maxPrice !== 150) {
        filterDto.maxPrice = maxPrice;
        params.append('maxPrice', maxPrice.toString());
      }

      filterDto.PageNumber = pageNumber;
      params.append('pageNumber', pageNumber.toString());

      filterDto.pageSize = pageSize;
      params.append('pageSize', pageSize.toString());

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
        setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
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
        setError(err.response?.data?.message || err.message || 'An unexpected error occurred while fetching categories.');
      }
    }

    fetchProducts();
    fetchCategories();
  }, [
    debouncedSearchQuery,
    selectedCategories,
    selectedBrands,
    minPrice,
    maxPrice,
    pageNumber,
    pageSize,
    router
  ]);
  useEffect(() => {
    setPageNumber(1);
  }, [debouncedSearchQuery, selectedCategories, selectedBrands, minPrice, maxPrice]);


  const handleCategoryChange = (category: string): void => {
    setSelectedCategories(prev => {
      const newState = prev.includes(category)
        ? prev.filter((cat: string) => cat !== category)
        : [...prev, category];
      setPageNumber(1);
      return newState;
    });
  };

  const handleBrandChange = (brand: string): void => {
    setSelectedBrands(prev => {
      const newState = prev.includes(brand)
        ? prev.filter((b: string) => b !== brand)
        : [...prev, brand];
      setPageNumber(1);
      return newState;
    });
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const val: number = parseFloat(e.target.value);
    if (!isNaN(val)) setMinPrice(val);
    setPageNumber(1);
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const val: number = parseFloat(e.target.value);
    if (!isNaN(val)) setMaxPrice(val);
    setPageNumber(1);
  };
  const handlePriceRangeCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;

    setSelectedPriceRanges(prev => {
      const updated = checked
        ? [...prev, value]
        : prev.filter(v => v !== value);

      // Cập nhật minPrice và maxPrice dựa trên các khoảng giá được chọn
      if (updated.length === 0) {
        setMinPrice(0);
        setMaxPrice(999999999); // hoặc giá cao nhất
      } else {
        const minValues = updated.map(v => parseInt(v.split("-")[0], 10));
        const maxValues = updated.map(v => parseInt(v.split("-")[1], 10));
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

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setLocalSearchQuery(e.target.value);
    setPageNumber(1);
  };

  const handleSearchSubmit = (e: React.FormEvent): void => {
    e.preventDefault();

    const params = new URLSearchParams(window.location.search);

    // Cập nhật lại keyword trên URL
    if (localSearchQuery.trim()) {
      params.set('keyword', localSearchQuery.trim());
    } else {
      params.delete('keyword');
    }


    params.set('pageNumber', '1');

    router.push(`?${params.toString()}`, { scroll: false });
    setDebouncedSearchQuery(localSearchQuery.trim());
    setPageNumber(1);
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
                <Link href="/">Home</Link>
                <i className="fa-regular fa-chevron-right" />
                <Link className="current" href="#">Shop</Link>
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

            {/* Sidebar */}
            <div className="col-xl-3 col-lg-12 pr--70 pr_lg--10 pr_sm--10 pr_md--5 rts-sticky-column-item">
              <div className="sidebar-filter-main theiaStickySidebar">

                {/* Widget Search */}
                <div className="single-filter-box">
                  <h5 className="title">Tìm kiếm sản phẩm</h5>
                  <div className="filterbox-body">
                    <form onSubmit={handleSearchSubmit} className="search-form-filter">
                      <input
                        type="text"
                        placeholder="Nhập tên sản phẩm..."
                        value={localSearchQuery}
                        onChange={handleSearchInputChange}
                        style={{ marginBottom: '15px' }}
                      />
                      <button type="submit" className="search-button mt-12">
                        <i className="fa-solid fa-magnifying-glass" />
                      </button>
                    </form>
                  </div>
                </div>

                <div className="single-filter-box">
                  <h5 className="title">Khoảng giá</h5>
                  <div className="filterbox-body">
                    <div className="category-wrapper">
                      {[
                        { label: "Dưới 500.000đ", value: "0-500000" },
                        { label: "500.000đ – 1.000.000đ", value: "500000-1000000" },
                        { label: "1.000.000đ – 3.000.000đ", value: "1000000-3000000" },
                        { label: "3.000.000đ – 10.000.000đ", value: "3000000-10000000" },
                        { label: "Trên 10.000.000đ", value: "10000000-999999999" },
                      ].map(({ label, value }) => (
                        <div className="single-category" key={value}>
                          <input
                            id={`price-${value}`}
                            type="checkbox"
                            value={value}
                            onChange={handlePriceRangeCheckbox}
                            checked={selectedPriceRanges.includes(value)}
                          />
                          <label htmlFor={`price-${value}`}>{label}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>


                {/* Categories (Interactive) */}
                <div className="single-filter-box">
                  <h5 className="title">Danh mục sản phẩm</h5>
                  <div className="filterbox-body">
                    <div className="category-wrapper ">
                      {allCategories.map((cat: Category, index: number) => (
                        <div className="single-category" key={cat.id}>
                          <input
                            id={cat.id}
                            type="checkbox"
                            checked={selectedCategories.includes(cat.id)}
                            onChange={() => handleCategoryChange(cat.id)}
                          />
                          <label htmlFor={cat.id}>{cat.name}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Brands */}
                {/* <div className="single-filter-box">
                  <h5 className="title">Select Brands</h5>
                  <div className="filterbox-body">
                    <div className="category-wrapper">
                      {allBrands.map((brand: string, i: number) => (
                        <div className="single-category" key={i}>
                          <input
                            id={`brand${i + 1}`}
                            type="checkbox"
                            checked={selectedBrands.includes(brand)}
                            onChange={() => handleBrandChange(brand)}
                          />
                          <label htmlFor={`brand${i + 1}`}>{brand}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div> */}
              </div>
            </div>

            {/* Main Content */}
            <div className="col-xl-9 col-lg-12">
              <div className="filter-select-area">
                <div className="top-filter">
                  <span>
                    {loading ? "Loading..." : `Showing ${filteredProducts.length} results`}
                  </span>
                  {error && <p className="text-danger">{error}</p>}
                  <div className="right-end">
                    <span>Sort: Short By Latest</span> {/* You can make this dynamic with SortBy/SortDesc states */}
                    <div className="button-tab-area">
                      <ul className="nav nav-tabs" id="myTab" role="tablist">
                        <li className="nav-item" role="presentation">
                          <button
                            onClick={() => setActiveTab('tab1')}
                            className={`nav-link single-button ${activeTab === 'tab1' ? 'active' : ''}`}
                          >
                            <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
                              <rect x="0.5" y="0.5" width={6} height={6} rx="1.5" stroke="#2C3B28" />
                              <rect x="0.5" y="9.5" width={6} height={6} rx="1.5" stroke="#2C3B28" />
                              <rect x="9.5" y="0.5" width={6} height={6} rx="1.5" stroke="#2C3B28" />
                              <rect x="9.5" y="9.5" width={6} height={6} rx="1.5" stroke="#2C3B28" />
                            </svg>
                          </button>
                        </li>
                        {/* <li className="nav-item" role="presentation">
                          <button
                            onClick={() => setActiveTab('tab2')}
                            className={`nav-link single-button ${activeTab === 'tab2' ? 'active' : ''}`}
                          >
                            <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
                              <rect x="0.5" y="0.5" width={6} height={6} rx="1.5" stroke="#2C3C28" />
                              <rect x="0.5" y="9.5" width={6} height={6} rx="1.5" stroke="#2C3C28" />
                              <rect x={9} y={3} width={7} height={1} fill="#2C3C28" />
                              <rect x={9} y={12} width={7} height={1} fill="#2C3C28" />
                            </svg>
                          </button>
                        </li> */}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid or List view */}
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
                ) : activeTab === 'tab1' ? (
                  <div className="product-area-wrapper-shopgrid-list mt--20 tab-pane fade show active">
                    <div className="row g-4">
                      {filteredProducts.map((post: Product) => (
                        <div key={post.id} className="col-lg-20 col-lg-4 col-md-6 col-sm-6 col-12">
                          <div className="single-shopping-card-one">
                            <ShopMain
                              Id ={post.id}
                              Slug={post.slug}
                              ProductImage={post.thumbnailUrl}
                              ProductTitle={post.name}
                              Price={
                                post.salePrice == null
                                  ? post.basePrice.toString()
                                  : post.salePrice.toString()
                              }
                              BasePrice={post.basePrice.toString()}
                              StockAvailable={post.stockQuantity}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : activeTab === 'tab2' ? (
                  <div className="product-area-wrapper-shopgrid-list with-list mt--20 tab-pane fade show active">
                    {/* <div className="row">
                      {filteredProducts.map((post: Product) => (
                        <div key={post.id} className="col-lg-6">
                          <div className="single-shopping-card-one discount-offer">
                            <ShopMainList
                              Slug={post.slug}
                              ProductImage={post.thumbnailUrl}
                              ProductTitle={post.name}
                              Price={
                                post.salePrice == null
                                  ? post.basePrice.toString()
                                  : post.salePrice.toString()
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div> */}
                  </div>
                ) : null}
              </div>

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
            </div>
          </div>
        </div>
      </div>

      <FooterOne />
    </div>
  );
}