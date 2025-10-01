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
                                className={`custom-thumb-item ${activeImage === thumb.src ? "active" : ""
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
                        className={`nav-link ${activeTab === "tab1" ? "active" : ""
                          }`}
                      >
                        Chi tiết sản phẩm
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button
                        onClick={() => setActiveTab("tab2")}
                        className={`nav-link ${activeTab === "tab2" ? "active" : ""
                          }`}
                      >
                        Thông tin dinh dưỡng
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button
                        onClick={() => setActiveTab("tab3")}
                        className={`nav-link ${activeTab === "tab3" ? "active" : ""
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
      <style jsx>{`
      /* ============================================
   PRODUCT DETAILS - HEALTH & NUTRITION FOCUS
   ============================================ */



/* Custom Product Section */
.custom-product-section {
  background: #ffffff;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 4px 24px rgba(16, 185, 129, 0.08);
  border: 2px solid #f0fdf4;
}

.custom-product-area {
  display: flex;
  gap: 40px;
  align-items: flex-start;
}

/* Thumbnail Area */
.custom-thumb-area {
  flex: 0 0 45%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.custom-thumb-main {
  width: 100%;
  height: 450px;
  border-radius: 16px;
  overflow: hidden;
  background: #f9fafb;
  border: 3px solid #e5e7eb;
  transition: all 0.3s ease;
}

.custom-thumb-main:hover {
  border-color: #10b981;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.15);
}

.custom-thumb-main img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.custom-thumb-list {
  display: flex;
  gap: 12px;
}

.custom-thumb-item {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f9fafb;
}

.custom-thumb-item:hover {
  border-color: #10b981;
  transform: translateY(-2px);
}

.custom-thumb-item.active {
  border-color: #10b981;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
}

.custom-thumb-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Product Content */
.custom-contents {
  flex: 1;
}

.custom-status {
  margin-bottom: 15px;
}

.custom-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fbbf24;
  font-size: 16px;
}

.custom-rating span {
  color: #6b7280;
  font-size: 14px;
  margin-left: 8px;
}

.custom-title {
  font-size: 32px;
  font-weight: 700;
  color: #047857;
  margin: 15px 0;
  line-height: 1.3;
}

.custom-shortdesc {
  color: #4b5563;
  font-size: 16px;
  line-height: 1.7;
  margin-bottom: 25px;
}

/* Price Section */
.custom-price {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 36px;
  font-weight: 700;
  color: #10b981;
  margin-bottom: 30px;
}

.custom-oldprice {
  font-size: 24px;
  color: #9ca3af;
  text-decoration: line-through;
  font-weight: 500;
}

/* Quantity Section */
.custom-quantity {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 25px;
  padding: 20px;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-radius: 12px;
  border: 2px solid #bbf7d0;
}

.custom-quantity label {
  font-weight: 600;
  color: #047857;
  font-size: 16px;
}

.custom-quantity-input {
  display: flex;
  align-items: center;
  gap: 0;
  background: #ffffff;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid #10b981;
}

.custom-quantity-input button {
  width: 40px;
  height: 40px;
  background: #ffffff;
  border: none;
  color: #10b981;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-quantity-input button:hover:not(:disabled) {
  background: #f0fdf4;
  color: #047857;
}

.custom-quantity-input button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.custom-quantity-input input {
  width: 60px;
  height: 40px;
  border: none;
  border-left: 1px solid #e5e7eb;
  border-right: 1px solid #e5e7eb;
  text-align: center;
  font-weight: 600;
  color: #047857;
  font-size: 16px;
}

.custom-quantity-input input:focus {
  outline: none;
}

/* Action Buttons */
.custom-actions {
  margin-bottom: 30px;
}

.custom-btn {
  width: 100%;
  padding: 18px 32px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
}

.custom-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(16, 185, 129, 0.4);
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

.custom-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  box-shadow: none;
}

/* Product Details Grid */
.custom-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  padding: 25px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 12px;
  margin-bottom: 25px;
  border: 2px solid #fcd34d;
}

.custom-details span {
  color: #92400e;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.custom-details span strong {
  color: #78350f;
  font-weight: 600;
}

.custom-details span::before {
  content: "✓";
  color: #10b981;
  font-weight: bold;
  font-size: 16px;
}

/* Share Section */
.custom-share {
  display: flex;
  gap: 15px;
}

.custom-share-item {
  flex: 1;
  padding: 12px 20px;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
  color: #6b7280;
}

.custom-share-item:hover {
  border-color: #10b981;
  background: #f0fdf4;
  color: #047857;
  transform: translateY(-2px);
}

.custom-share-item i {
  font-size: 18px;
}

/* Tabs Navigation */
.product-discription-tab-shop {
  margin-top: 50px;
  background: #ffffff;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 4px 24px rgba(16, 185, 129, 0.08);
  border: 2px solid #f0fdf4;
}

.nav-tabs {
  border-bottom: 3px solid #e5e7eb !important;
  margin-bottom: 30px;
  display: flex;
  gap: 10px;
}

.nav-tabs .nav-item {
  margin: 0;
}

.nav-tabs .nav-link {
  border: none !important;
  background: transparent;
  color: #6b7280;
  padding: 15px 25px;
  font-weight: 600;
  font-size: 16px;
  border-radius: 10px 10px 0 0;
  transition: all 0.3s ease;
  position: relative;
}

.nav-tabs .nav-link::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 0;
  height: 3px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  transition: width 0.3s ease;
}

.nav-tabs .nav-link:hover {
  background: #f0fdf4;
  color: #047857;
}

.nav-tabs .nav-link.active {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  color: #047857;
  font-weight: 700;
}

.nav-tabs .nav-link.active::after {
  width: 100%;
}

/* Tab Content */
.single-tab-content-shop-details {
  padding: 20px 0;
}

.single-tab-content-shop-details h5 {
  color: #047857;
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 10px;
}

.single-tab-content-shop-details h5::before {
  content: "🌿";
  font-size: 24px;
}

.single-tab-content-shop-details p.disc {
  color: #4b5563;
  font-size: 16px;
  line-height: 1.8;
  margin-bottom: 25px;
}

.single-tab-content-shop-details ul {
  list-style: none;
  padding: 0;
}

.single-tab-content-shop-details ul li {
  padding: 12px 0 12px 30px;
  color: #374151;
  font-size: 15px;
  line-height: 1.6;
  position: relative;
  border-bottom: 1px solid #f3f4f6;
}

.single-tab-content-shop-details ul li::before {
  content: "✓";
  position: absolute;
  left: 0;
  color: #10b981;
  font-weight: bold;
  font-size: 18px;
}

.single-tab-content-shop-details ul li:last-child {
  border-bottom: none;
}

.single-tab-content-shop-details ol {
  list-style: none;
  counter-reset: step-counter;
  padding: 0;
}

.single-tab-content-shop-details ol li {
  counter-increment: step-counter;
  padding: 20px;
  margin-bottom: 15px;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-radius: 12px;
  border-left: 4px solid #10b981;
  position: relative;
  padding-left: 70px;
}

.single-tab-content-shop-details ol li::before {
  content: counter(step-counter);
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 35px;
  height: 35px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
}

.single-tab-content-shop-details ol li strong {
  display: none;
}

/* Nutrition Table */
.table-shop-details-pd {
  margin-top: 20px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.table-shop-details-pd table {
  width: 100%;
  background: #ffffff;
  margin: 0;
}

.table-shop-details-pd thead {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.table-shop-details-pd thead th {
  color: #ffffff;
  font-weight: 600;
  padding: 18px 20px;
  font-size: 16px;
  border: none;
}

.table-shop-details-pd tbody tr {
  transition: all 0.3s ease;
  border-bottom: 1px solid #f3f4f6;
}

.table-shop-details-pd tbody tr:hover {
  background: #f0fdf4;
}

.table-shop-details-pd tbody td {
  padding: 16px 20px;
  color: #374151;
  font-size: 15px;
  border: none;
}

.table-shop-details-pd tbody td:first-child {
  font-weight: 600;
  color: #047857;
}

.table-shop-details-pd tbody td:last-child {
  font-weight: 700;
  color: #10b981;
}

/* Allergens & Highlights */
.allergens,
.nutrition-highlights {
  padding: 20px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 12px;
  border-left: 4px solid #f59e0b;
  color: #92400e;
  font-size: 15px;
  line-height: 1.6;
}

.allergens span,
.nutrition-highlights span {
  font-weight: 700;
  color: #78350f;
  display: block;
  margin-bottom: 8px;
  font-size: 16px;
}

/* Sidebar */
.shop-sight-sticky-sidevbar {
  background: #ffffff;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.1);
  border: 2px solid #f0fdf4;
}

.shop-sight-sticky-sidevbar h6.title {
  color: #047857;
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e5e7eb;
}

.single-offer-area {
  display: flex;
  gap: 15px;
  padding: 18px;
  margin-bottom: 15px;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-radius: 12px;
  border: 2px solid #bbf7d0;
  transition: all 0.3s ease;
}

.single-offer-area:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}

.single-offer-area .icon {
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  background: #ffffff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.15);
}

.single-offer-area .icon img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.single-offer-area .details p {
  color: #047857;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
  font-weight: 500;
}

.our-payment-method {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 16px;
  padding: 25px;
  text-align: center;
  border: 2px solid #fcd34d;
}

.our-payment-method h5.title {
  color: #78350f;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 20px;
}

.our-payment-method img {
  max-width: 100%;
  height: auto;
}

/* Responsive */
@media (max-width: 1024px) {
  .custom-product-area {
    flex-direction: column;
  }
  
  .custom-thumb-area {
    flex: 1;
    width: 100%;
  }
  
  .custom-details {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .custom-title {
    font-size: 24px;
  }
  
  .custom-price {
    font-size: 28px;
  }
  
  .custom-thumb-main {
    height: 350px;
  }
  
  .nav-tabs {
    flex-wrap: wrap;
  }
  
  .nav-tabs .nav-link {
    padding: 12px 18px;
    font-size: 14px;
  }
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.custom-product-section {
  animation: fadeInUp 0.6s ease-out;
}

.product-discription-tab-shop {
  animation: fadeInUp 0.6s ease-out 0.2s both;
} 
      `}</style>
    </div>
  );
};

export default CompareElements;
