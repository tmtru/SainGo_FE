"use client";

import React, { useState, useEffect } from "react";
import HeaderOne from "@/components/header/HeaderOne";
import ShortService from "@/components/service/ShortService";
import FooterOne from "@/components/footer/FooterOne";
import { useParams } from "next/navigation";

import { useCart } from "@/components/header/CartContext";
import { useWishlist } from "@/components/header/WishlistContext";
import { useCompare } from "@/components/header/CompareContext";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProductService, { Product } from "@/data/Services/ProductService";
import ProductDetails from "@/components/modal/ProductDetails";
import CustomLoader from "@/components/common/CustomLoader";
import "./ProductDetailsCustom.css";

export interface RecipeStep {
  step: number;
  text: string;
}

type ModalType = "productDetails" | "compare" | null;

const CompareElements: React.FC = () => {
  const params = useParams();
  const productId = params.id as string;

  const [blogPost, setBlogPost] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
  const { addToCompare } = useCompare();

  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [activeTab, setActiveTab] = useState<string>("tab1");

  const [activeImage, setActiveImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await ProductService.getProductById(productId);
        setBlogPost(response.data);
        setActiveImage(
          response.data.imageUrl || "/assets/images/default-product.jpg"
        );
        setQuantity(1);
      } catch (err: any) {
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError("Lỗi khi tải sản phẩm. Vui lòng thử lại sau.");
        }
        console.error("Lỗi khi lấy sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleSalePercentage = (basePrice: number, salePrice?: number) => {
    if (basePrice > 0 && salePrice && salePrice > 0 && basePrice > salePrice) {
      const sale = ((basePrice - salePrice) / basePrice) * 100;
      return Math.round(sale);
    }
    return 0;
  };

  const productSale =
    blogPost?.basePrice && blogPost.salePrice
      ? handleSalePercentage(blogPost.basePrice, blogPost.salePrice)
      : 0;

  const handleCloseModal = () => setActiveModal(null);

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (isNaN(value) || value < 1) {
      setQuantity(1);
    } else {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };

  const decrementQuantity = () => {
    setQuantity((prevQuantity) => Math.max(1, prevQuantity - 1));
  };

  const handleAdd = async () => {
    if (!blogPost) {
      toast.error(
        "Không thể thêm sản phẩm vào giỏ hàng. Dữ liệu sản phẩm không có."
      );
      return;
    }

    if (quantity <= 0) {
      toast.error("Số lượng sản phẩm phải lớn hơn 0.");
      return;
    }

    const storeId = blogPost.brandId || "";
    const itemToAdd = {
      productId: blogPost.id,
      productVariantId: null,
      unitPrice: currentPrice,
      quantity: quantity,
      storeId: storeId,
      cartId: "",
    };

    try {
      await addToCart(itemToAdd);
      setAdded(true);
      setTimeout(() => setAdded(false), 3000);
    } catch (err) {
      console.error("Lỗi khi thêm sản phẩm vào giỏ hàng:", err);
    }
  };

  const handleWishlist = () => {
    if (!blogPost) {
      toast.error(
        "Không thể thêm sản phẩm vào danh sách yêu thích. Dữ liệu sản phẩm không có."
      );
      return;
    }

    addToWishlist({
      id: blogPost.id,
      title: blogPost.name,
      image: blogPost.imageUrl || "/assets/images/default-product.jpg",
      price: currentPrice,
      quantity: 1,
    });
    setWishlisted(true);
    toast.success("Đã thêm vào danh sách yêu thích!");
    setTimeout(() => setWishlisted(false), 3000);
  };

  const handleCompare = () => {
    if (!blogPost) {
      toast.error(
        "Không thể thêm sản phẩm vào danh sách so sánh. Dữ liệu sản phẩm không có."
      );
      return;
    }

    addToCompare({
      id: blogPost.id,
      image: blogPost.imageUrl || "/assets/images/default-product.jpg",
      name: blogPost.name,
      price: currentPrice.toString(),
      description: blogPost.description || "",
      rating: 0, // Không có thông tin rating trong interface mới
      ratingCount: 0, // Không có thông tin rating count trong interface mới
      weight: blogPost.weight ? blogPost.weight.toString() : "N/A",
      inStock: blogPost.isAvailable || false,
    });
    toast.success("Đã thêm vào danh sách so sánh!");
  };

  if (loading) {
    return <CustomLoader />;
  }

  if (error) {
    return <div className="text-center py-5 text-red-500">Lỗi: {error}</div>;
  }

  if (!blogPost) {
    return <div className="text-center py-5">Không tìm thấy sản phẩm!</div>;
  }

  const currentPrice =
    blogPost.salePrice && blogPost.salePrice < blogPost.basePrice
      ? blogPost.salePrice
      : blogPost.basePrice;

  // Tạo thumbnails array với imageUrl chính
  const thumbnails = [
    {
      id: "main",
      src: blogPost.imageUrl || "/assets/images/default-product.jpg",
      alt: blogPost.name,
    },
  ];

  const formatCurrency = (value: number): string =>
    value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  return (
    <div>
      <HeaderOne />
      <div className="rts-navigation-area-breadcrumb bg_light-1">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="navigator-breadcrumb-wrapper">
                <a href="/">Trang chủ</a>
                <i className="fa-regular fa-chevron-right" />
                <a href="/shop">Menu</a>
                <i className="fa-regular fa-chevron-right" />
                <a className="current" href="#">
                  Chi tiết sản phẩm
                </a>
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

      <div className="rts-chop-details-area rts-section-gap bg_light-1">
        <div className="container">
          <div className="shopdetails-style-1-wrapper">
            <div className="row g-5">
              <div className="col-xl-8 col-lg-8 col-md-12">
                <div className="product-details-popup-wrapper in-shopdetails">
                  <div className="custom-product-section">
                    <div className="custom-product-popup">
                      <div className="custom-product-area">
                        {/* Hình ảnh + thumbnails */}
                        <div className="custom-thumb-area">
                          <div className="custom-thumb-main">
                            <img src={activeImage} alt={blogPost.name} />
                          </div>
                          <div className="custom-thumb-list">
                            {thumbnails.map((thumb) => (
                              <div
                                key={thumb.id}
                                className={`custom-thumb-item ${
                                  activeImage === thumb.src ? "active" : ""
                                }`}
                                onClick={() => setActiveImage(thumb.src)}
                              >
                                <img src={thumb.src} alt={thumb.alt} />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Nội dung sản phẩm */}
                        <div className="custom-contents">
                          <div className="custom-status">
                            <div className="custom-rating">
                              <i className="fas fa-star" />
                              <i className="fas fa-star" />
                              <i className="fas fa-star" />
                              <i className="fas fa-star-half-alt" />
                              <span>Chưa có đánh giá</span>
                            </div>
                          </div>
                          <h2 className="custom-title">{blogPost.name}</h2>
                          <p className="custom-shortdesc">
                            {blogPost.shortDescription}
                          </p>
                          <span className="custom-price">
                            {formatCurrency(currentPrice)}
                            {blogPost.salePrice &&
                              blogPost.salePrice < blogPost.basePrice && (
                                <span className="custom-oldprice">
                                  {formatCurrency(blogPost.basePrice)}
                                </span>
                              )}
                          </span>

                          {/* Số lượng */}
                          <div className="custom-quantity">
                            <label htmlFor="quantity">Số lượng:</label>
                            <div className="custom-quantity-input">
                              <button
                                onClick={decrementQuantity}
                                disabled={quantity <= 1}
                              >
                                <i className="far fa-minus" />
                              </button>
                              <input
                                type="number"
                                id="quantity"
                                value={quantity}
                                onChange={handleQuantityChange}
                                min="1"
                              />
                              <button onClick={incrementQuantity}>
                                <i className="far fa-plus" />
                              </button>
                            </div>
                          </div>

                          {/* Nút hành động */}
                          <div className="custom-actions">
                            <button
                              className="custom-btn"
                              onClick={handleAdd}
                              disabled={!blogPost.isAvailable}
                            >
                              {!blogPost.isAvailable
                                ? "Hết hàng"
                                : "Thêm vào giỏ hàng"}
                            </button>
                          </div>

                          {/* Thông tin chi tiết */}
                          <div className="custom-details">
                            <span>
                              <strong>Trọng lượng:</strong> {blogPost.weight}{" "}
                              {blogPost.unit}
                            </span>
                            <span>
                              <strong>Kích cỡ đơn vị:</strong>{" "}
                              {blogPost.unitSize}
                            </span>
                            <span>
                              <strong>SKU:</strong> {blogPost.sku}
                            </span>
                            <span>
                              <strong>Có sẵn:</strong>{" "}
                              {blogPost.isAvailable ? "Có" : "Không"}
                            </span>
                            <span>
                              <strong>Hữu cơ:</strong>{" "}
                              {blogPost.isOrganic ? "Có" : "Không"}
                            </span>
                            <span>
                              <strong>Chay:</strong>{" "}
                              {blogPost.isVegetarian ? "Có" : "Không"}
                            </span>
                            {blogPost.isGlutenFree && (
                              <span>
                                <strong>Không gluten:</strong> Có
                              </span>
                            )}
                          </div>

                          {/* Wishlist & Share */}
                          <div className="custom-share">
                            <div
                              className="custom-share-item"
                              onClick={handleWishlist}
                            >
                              <i className="fa-regular fa-heart" /> Thêm vào yêu
                              thích
                            </div>
                            <div className="custom-share-item">
                              <i className="fa-solid fa-share" /> Chia sẻ
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="product-discription-tab-shop mt--50">
                  <ul className="nav nav-tabs" id="myTab" role="tablist">
                    <li className="nav-item" role="presentation">
                      <button
                        onClick={() => setActiveTab("tab1")}
                        className={`nav-link ${
                          activeTab === "tab1" ? "active" : ""
                        }`}
                      >
                        Chi tiết sản phẩm
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button
                        onClick={() => setActiveTab("tab2")}
                        className={`nav-link ${
                          activeTab === "tab2" ? "active" : ""
                        }`}
                      >
                        Thông tin dinh dưỡng
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button
                        onClick={() => setActiveTab("tab3")}
                        className={`nav-link ${
                          activeTab === "tab3" ? "active" : ""
                        }`}
                      >
                        Thành phần & Công thức
                      </button>
                    </li>
                  </ul>
                  <div className="tab-content" id="myTabContent">
                    {activeTab === "tab1" && (
                      <div>
                        <div className="single-tab-content-shop-details">
                          <p className="disc">
                            {blogPost.description
                              ?.split("\n")
                              .map((line, index) => (
                                <React.Fragment key={index}>
                                  {line}
                                  <br />
                                </React.Fragment>
                              ))}
                          </p>

                          {blogPost.healthBenefits &&
                            blogPost.healthBenefits.length > 0 && (
                              <div>
                                <h5>Lợi ích sức khỏe:</h5>
                                <ul>
                                  {blogPost.healthBenefits.map(
                                    (benefit, index) => (
                                      <li key={index}>{benefit}</li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}

                          {blogPost.reheatingInstructions && (
                            <div className="mt--30">
                              <h5>Hướng dẫn hâm nóng:</h5>
                              <p>{blogPost.reheatingInstructions}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === "tab2" && (
                      <div>
                        <div className="single-tab-content-shop-details">
                          <div className="table-responsive table-shop-details-pd">
                            <table className="table">
                              <thead>
                                <tr>
                                  <th>Thành phần dinh dưỡng (trên 100g)</th>
                                  <th>Giá trị</th>
                                </tr>
                              </thead>
                              <tbody>
                                {blogPost.caloriesPer100g && (
                                  <tr>
                                    <td>Calories</td>
                                    <td>{blogPost.caloriesPer100g} kcal</td>
                                  </tr>
                                )}
                                {blogPost.proteinPer100g && (
                                  <tr>
                                    <td>Protein</td>
                                    <td>{blogPost.proteinPer100g}g</td>
                                  </tr>
                                )}
                                {blogPost.carbsPer100g && (
                                  <tr>
                                    <td>Carbohydrate</td>
                                    <td>{blogPost.carbsPer100g}g</td>
                                  </tr>
                                )}
                                {blogPost.fatPer100g && (
                                  <tr>
                                    <td>Chất béo</td>
                                    <td>{blogPost.fatPer100g}g</td>
                                  </tr>
                                )}
                                <tr>
                                  <td>Khối lượng</td>
                                  <td>
                                    {blogPost.weight} {blogPost.unit}
                                  </td>
                                </tr>
                                <tr>
                                  <td>Đơn vị</td>
                                  <td>{blogPost.unitSize}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          {blogPost.allergens && (
                            <div className="mt--20">
                              <p className="allergens">
                                <span>Chất gây dị ứng:</span>{" "}
                                {blogPost.allergens}
                              </p>
                            </div>
                          )}

                          {blogPost.nutritionHighlights && (
                            <div className="mt--20">
                              <p className="nutrition-highlights">
                                <span>Điểm nổi bật về dinh dưỡng:</span>{" "}
                                {blogPost.nutritionHighlights}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === "tab3" && (
                      <div>
                        <div className="single-tab-content-shop-details">
                          {blogPost.ingredients &&
                            blogPost.ingredients.length > 0 && (
                              <div className="mb--30">
                                <h5>Thành phần:</h5>
                                <ul>
                                  {blogPost.ingredients.map(
                                    (ingredient, index) => (
                                      <li key={index}>{ingredient}</li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}

                          {blogPost.recipeSteps &&
                            blogPost.recipeSteps.length > 0 && (
                              <div className="mb--30">
                                <h5>Công thức chế biến:</h5>
                                <ol>
                                  {blogPost.recipeSteps
                                    .sort((a, b) => a.step - b.step)
                                    .map((step) => (
                                      <li key={step.step}>
                                        <strong>Bước {step.step}:</strong>{" "}
                                        {step.text}
                                      </li>
                                    ))}
                                </ol>
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-xl-3 col-lg-4 col-md-12 offset-xl-1 rts-sticky-column-item">
                <div className="theiaStickySidebar">
                  <div className="shop-sight-sticky-sidevbar mb--20">
                    <h6 className="title">Ưu đãi có sẵn</h6>
                    <div className="single-offer-area">
                      <div className="icon">
                        <img src="/assets/images/shop/01.svg" alt="icon" />
                      </div>
                      <div className="details">
                        <p>Món ăn được đảm bảo chế biến từ đầu bếp chuyên nghiệp</p>
                      </div>
                    </div>
                    <div className="single-offer-area">
                      <div className="icon">
                        <img src="/assets/images/shop/02.svg" alt="icon" />
                      </div>
                      <div className="details">
                        <p>
                          Mã giảm giá đặc biệt cho các thành viên đăng ký
                        </p>
                      </div>
                    </div>
                    <div className="single-offer-area">
                      <div className="icon">
                        <img src="/assets/images/shop/03.svg" alt="icon" />
                      </div>
                      <div className="details">
                        <p>
                          Vận chuyển nhanh chóng và an toàn
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="our-payment-method">
                    <h5 className="title">Thanh toán an toàn được đảm bảo</h5>
                    <img src="/assets/images/shop/03.png" alt="" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FooterOne />
      <ToastContainer />

      <ProductDetails
        show={activeModal === "productDetails"}
        handleClose={handleCloseModal}
        productImage={blogPost.imageUrl || "/assets/images/default-product.jpg"}
        productTitle={blogPost.name}
        productPrice={currentPrice.toString()}
      />
    </div>
  );
};

export default CompareElements;
