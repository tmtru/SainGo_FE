"use client";

import { useState, useEffect } from 'react';
import HeaderOne from "@/components/header/HeaderOne";
import ShortService from "@/components/service/ShortService";
import RelatedProduct from "@/components/product/RelatedProduct";
import FooterOne from "@/components/footer/FooterOne";
import { useParams } from 'next/navigation';

import { useCart } from "@/components/header/CartContext";
import { useWishlist } from "@/components/header/WishlistContext";
import { useCompare } from "@/components/header/CompareContext";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProductService, { Product } from '@/data/Services/ProductService';
import ProductDetails from '@/components/modal/ProductDetails';
import CustomLoader from '@/components/common/CustomLoader';
// Import CompareModal nếu bạn sẽ dùng nó
// import CompareModal from '@/components/modal/CompareModal';

type ModalType = 'productDetails' | 'compare' | null;

const CompareElements: React.FC = () => {
  const params = useParams();
  const productId = params.id as string;

  // --- HOOKS PHẢI ĐƯỢC KHAI BÁO UNCONDITIONALLY Ở ĐẦU COMPONENT ---
  const [blogPost, setBlogPost] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
  const { addToCompare } = useCompare();

  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [activeTab, setActiveTab] = useState<string>('tab1');
  // Initialize activeImage to an empty string or a placeholder initially.
  // It will be updated by useEffect once blogPost is fetched.
  const [activeImage, setActiveImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1); // Giữ nguyên state quantity

  // --- END OF HOOKS ---

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await ProductService.getProductById(productId);
        setBlogPost(response.data);
        // Sau khi blogPost được tải, đặt activeImage thành thumbnailUrl
        setActiveImage(response.data.thumbnailUrl);
        setQuantity(1); // Reset quantity về 1 mỗi khi tải sản phẩm mới
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
  }, [productId]); // Chạy lại khi productId thay đổi

  // Hàm tính phần trăm giảm giá
  const handleSalePercentage = (basePrice: number, currentPrice: number) => {
    if (basePrice > 0 && currentPrice > 0 && basePrice > currentPrice) {
      const sale = ((basePrice - currentPrice) / basePrice) * 100;
      return Math.round(sale);
    }
    return 0;
  };

  const productSale = blogPost?.basePrice && blogPost.salePrice
    ? handleSalePercentage(blogPost.basePrice, blogPost.salePrice)
    : 0;

  const handleCloseModal = () => setActiveModal(null);

  // --- LOGIC CHO QUANTITY ---
  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (isNaN(value) || value < 1) {
      setQuantity(1); // Đặt về 1 nếu không phải số hoặc nhỏ hơn 1
    } else if (blogPost && value > blogPost.stockQuantity) {
      setQuantity(blogPost.stockQuantity); // Giới hạn bằng số lượng tồn kho
    } else {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    if (blogPost && quantity < blogPost.stockQuantity) {
      setQuantity((prevQuantity) => prevQuantity + 1);
    } else if (!blogPost) {
      setQuantity((prevQuantity) => prevQuantity + 1); // Cho phép tăng nếu blogPost chưa load (ví dụ: mặc định 1)
    }
  };

  const decrementQuantity = () => {
    setQuantity((prevQuantity) => Math.max(1, prevQuantity - 1));
  };
  // --- END LOGIC CHO QUANTITY ---

  const handleAdd = async () => {
    if (!blogPost) {
      toast.error("Không thể thêm sản phẩm vào giỏ hàng. Dữ liệu sản phẩm không có.");
      return;
    }

    // Đảm bảo số lượng không vượt quá tồn kho trước khi thêm
    const finalQuantity = Math.min(quantity, blogPost.stockQuantity);
    if (finalQuantity <= 0) {
      toast.error("Số lượng sản phẩm phải lớn hơn 0.");
      return;
    }


    const storeId = blogPost.brandId; // Hoặc ID cửa hàng thật sự
    const itemToAdd = {
      productId: blogPost.id,
      productVariantId: null, // Giả định không có biến thể
      unitPrice: currentPrice,
      quantity: finalQuantity,
      storeId: storeId,
      cartId: "" // cartId có thể được quản lý bởi context/service
    };

    try {
      await addToCart(itemToAdd);
      setAdded(true);
      setTimeout(() => setAdded(false), 3000);
    } catch (err) {
      console.error("Lỗi khi thêm sản phẩm vào giỏ hàng:", err);
      // Toast message đã được xử lý trong CartContext, nhưng có thể thêm ở đây nếu cần cho các lỗi cụ thể khác
    }
  };

  const handleWishlist = () => {
    if (!blogPost) {
      toast.error("Không thể thêm sản phẩm vào danh sách yêu thích. Dữ liệu sản phẩm không có.");
      return;
    }

    addToWishlist({
      id: blogPost.id,
      title: blogPost.name,
      image: blogPost.thumbnailUrl,
      price: currentPrice,
      quantity: 1 // Trong wishlist thường là 1, không cần số lượng
    });
    setWishlisted(true);
    toast.success('Đã thêm vào danh sách yêu thích!');
    setTimeout(() => setWishlisted(false), 3000);
  };

  const handleCompare = () => {
    if (!blogPost) {
      toast.error("Không thể thêm sản phẩm vào danh sách so sánh. Dữ liệu sản phẩm không có.");
      return;
    }

    addToCompare({
      id: blogPost.id,
      image: blogPost.thumbnailUrl,
      name: blogPost.name,
      price: currentPrice.toString(),
      description: blogPost.description,
      rating: blogPost.averageRating,
      ratingCount: blogPost.totalReviews,
      weight: blogPost.weight ? blogPost.weight.toString() : 'N/A', // Đảm bảo là string hoặc giá trị mặc định
      inStock: blogPost.isAvailable,
    });
    toast.success('Đã thêm vào danh sách so sánh!');
  };

  // --- CONDITIONAL RENDERING (SAU KHI TẤT CẢ CÁC HOOKS ĐƯỢC GỌI) ---
  if (loading) {
    return <CustomLoader />;
  }

  if (error) {
    return <div className="text-center py-5 text-red-500">Lỗi: {error}</div>;
  }

  if (!blogPost) {
    return <div className="text-center py-5">Không tìm thấy sản phẩm!</div>;
  }

  const currentPrice = blogPost.salePrice && blogPost.salePrice < blogPost.basePrice
    ? blogPost.salePrice
    : blogPost.basePrice;

  const thumbnails = [
    {
      id: 'main',
      src: blogPost.thumbnailUrl,
      alt: blogPost.name,
    },
    ...(blogPost.imageUrls
      ? JSON.parse(blogPost.imageUrls).map((url: string, index: number) => ({
        id: `extra-${index}`,
        src: url,
        alt: `${blogPost.name} ảnh phụ ${index + 1}`,
      }))
      : []),
  ];

  const formatCurrency = (value: number): string =>
    value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

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
                <a className="current" href="#">Chi tiết sản phẩm</a>
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
                  <div className="rts-product-details-section rts-product-details-section2 product-details-popup-section">
                    <div className="product-details-popup">
                      <div className="details-product-area">
                        <div className="product-thumb-area">
                          <div className="cursor" />
                          <div className="thumb-wrapper one filterd-items figure">
                            <div className="product-thumb">
                              <img src={activeImage} alt={blogPost.name} />
                            </div>
                          </div>
                          <div className="product-thumb-filter-group">
                            {thumbnails.map((thumb) => (
                              <div
                                key={thumb.id}
                                className={`thumb-filter filter-btn ${activeImage === thumb.src ? 'active' : ''}`}
                                onClick={() => setActiveImage(thumb.src)}
                                style={{ cursor: 'pointer' }}
                              >
                                <img src={thumb.src} alt={thumb.alt} />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="contents">
                          <div className="product-status">
                            <span className="product-catagory">Category Placeholder</span>
                            <div className="rating-stars-group">
                              <div className="rating-star"><i className="fas fa-star" /></div>
                              <div className="rating-star"><i className="fas fa-star" /></div>
                              <div className="rating-star"><i className="fas fa-star-half-alt" /></div>
                              <span>{blogPost.totalReviews} Đánh giá ({blogPost.averageRating.toFixed(1)}/5)</span>
                            </div>
                          </div>
                          <h2 className="product-title">{blogPost.name}</h2>
                          <p className="mt--20 mb--20">{blogPost.shortDescription}</p>
                          <span className="product-price mb--15 d-block" style={{ color: "#DC2626", fontWeight: 600 }}>
                            {formatCurrency(currentPrice)}
                            {blogPost.salePrice && blogPost.salePrice < blogPost.basePrice && (
                              <span className="old-price ml--15">{formatCurrency(blogPost.basePrice)}</span>
                            )}
                          </span>

                          {/* --- QUANTITY INPUT AND BUTTONS --- */}
                          <div className="quantity-area-shop-details">
                            <label htmlFor="quantity">Số lượng:</label>
                            <div className="product-quantity-input">
                              <button
                                type="button"
                                className="qty-decrease"
                                onClick={decrementQuantity}
                                disabled={quantity <= 1} // Disable nếu số lượng là 1
                              >
                                <i className="far fa-minus" />
                              </button>
                              <input
                                type="number"
                                name="quantity"
                                id="quantity"
                                value={quantity}
                                onChange={handleQuantityChange}
                                min="1"
                                max={blogPost.stockQuantity} // Giới hạn tối đa là tồn kho
                                className="qty-input"
                                readOnly // Tùy chọn: nếu bạn muốn người dùng chỉ dùng nút
                              />
                              <button
                                type="button"
                                className="qty-increase"
                                onClick={incrementQuantity}
                                disabled={quantity >= blogPost.stockQuantity} // Disable nếu đạt tồn kho
                              >
                                <i className="far fa-plus" />
                              </button>
                            </div>
                          </div>
                          {/* --- END QUANTITY INPUT AND BUTTONS --- */}

                          <div className="product-bottom-action">
                            <button
                              className="rts-btn btn-primary radious-sm with-icon"
                              onClick={handleAdd}
                              type="button"
                              disabled={blogPost.stockQuantity === 0} // Disable nếu hết hàng
                            >
                              <div className="btn-text">
                                {blogPost.stockQuantity === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
                              </div>
                              <div className="arrow-icon"><i className="fa-regular fa-cart-shopping" /></div>
                              <div className="arrow-icon"><i className="fa-regular fa-cart-shopping" /></div>
                            </button>
                          </div>

                          <div className="product-uniques">
                            <span className="tags product-unipue mb--10"><strong>Trọng lượng:</strong> {blogPost.weight} </span>
                            <span className="tags product-unipue mb--10"><strong>Kích thước:</strong> {blogPost.dimensions}</span>
                            <span className="tags product-unipue mb--10"><strong>Kích cỡ đơn vị:</strong> {blogPost.unitSize}</span>
                            {blogPost.expiryDate && (
                              <span className="tags product-unipue mb--10"><strong>Ngày hết hạn:</strong> {new Date(blogPost.expiryDate).toLocaleDateString()}</span>
                            )}
                            <span className="tags product-unipue mb--10"><strong>Tồn kho:</strong> {blogPost.stockQuantity}</span>
                            <span className="tags product-unipue mb--10"><strong>Có sẵn:</strong> {blogPost.isAvailable ? 'Có' : 'Không'}</span>
                          </div>

                          <div className="share-option-shop-details">
                            <div className="single-share-option" onClick={handleWishlist} style={{ cursor: 'pointer' }}>
                              <div className="icon"><i className="fa-regular fa-heart" /></div>
                              <span>Thêm vào danh sách yêu thích</span>
                            </div>
                            <div className="single-share-option"><div className="icon"><i className="fa-solid fa-share" /></div><span>Chia sẻ</span></div>
                            <div className="single-share-option" onClick={handleCompare} style={{ cursor: 'pointer' }}>
                              <div className="icon"><i className="fa-light fa-code-compare" /></div>
                              <span>So sánh</span>
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
                        onClick={() => setActiveTab('tab1')}
                        className={`nav-link ${activeTab === 'tab1' ? 'active' : ''}`}>
                        Chi tiết sản phẩm
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button
                        onClick={() => setActiveTab('tab2')}
                        className={`nav-link ${activeTab === 'tab2' ? 'active' : ''}`}>
                        Thông tin bổ sung
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button
                        onClick={() => setActiveTab('tab3')}
                        className={`nav-link ${activeTab === 'tab3' ? 'active' : ''}`}>
                        Đánh giá khách hàng ({blogPost.totalReviews})
                      </button>
                    </li>
                  </ul>
                  <div className="tab-content" id="myTabContent">
                    {activeTab === 'tab1' &&
                      <div>
                        <div className="single-tab-content-shop-details">
                          <p className="disc" dangerouslySetInnerHTML={{ __html: blogPost.description }} />
                          <div className="details-row-2">
                            <div className="left-area">
                              <img src="/assets/images/shop/06.jpg" alt="shop" />
                            </div>
                          </div>
                        </div>
                      </div>}
                    {activeTab === 'tab2' &&
                      <div>
                        <div className="single-tab-content-shop-details">
                          <p className="disc">
                            Uninhibited carnally hired played in whimpered dear gorilla
                            koala depending and much yikes off far quetzal goodness and
                            from for grimaced goodness unaccountably and meadowlark near
                            unblushingly crucial scallop tightly neurotic hungrily some
                            and dear furiously this apart.
                          </p>
                          <div className="table-responsive table-shop-details-pd">
                            <table className="table">
                              <thead>
                                <tr>
                                  <th>Thuộc tính</th>
                                  <th>Giá trị</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>Khối lượng</td>
                                  <td>{blogPost.weight} {blogPost.unit}</td> {/* Giả định `unit` là đơn vị khối lượng */}
                                </tr>
                                <tr>
                                  <td>Kích thước</td>
                                  <td>{blogPost.dimensions}</td>
                                </tr>
                                <tr>
                                  <td>Thương hiệu</td>
                                  <td>{blogPost.brandId}</td>
                                </tr>
                                <tr>
                                  <td>Đơn vị</td>
                                  <td>{blogPost.unitSize}</td>
                                </tr>
                                {blogPost.expiryDate && (
                                  <tr>
                                    <td>Ngày hết hạn</td>
                                    <td>{new Date(blogPost.expiryDate).toLocaleDateString()}</td>
                                  </tr>
                                )}
                                <tr>
                                  <td>Tồn kho</td>
                                  <td>{blogPost.stockQuantity}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <p className="cansellation mt--20">
                            <span> Trả hàng/hủy:</span> Không thay đổi sẽ được
                            áp dụng đối với các sản phẩm đã giao cho khách hàng. Nếu
                            phát hiện vấn đề về chất lượng hoặc số lượng sản phẩm thì khách hàng có thể
                            trả hàng/hủy đơn hàng tại thời điểm giao hàng với sự hiện diện của
                            người giao hàng.
                          </p>
                          <p className="note">
                            <span>Lưu ý:</span> Thời gian giao hàng có thể thay đổi do
                            sản phẩm có sẵn trong kho.
                          </p>
                        </div>
                      </div>}

                    {activeTab === 'tab3' &&
                      <div>
                        <div className="single-tab-content-shop-details">
                          <div className="product-details-review-product-style">
                            <div className="average-stars-area-left">
                              <div className="top-stars-wrapper">
                                <h4 className="review">{blogPost.averageRating.toFixed(1)}</h4>
                                <div className="rating-disc">
                                  <span>Đánh giá trung bình</span>
                                  <div className="stars">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <i key={i} className={`fa-solid fa-star ${i < Math.floor(blogPost.averageRating) ? '' : (i === Math.floor(blogPost.averageRating) && blogPost.averageRating % 1 !== 0 ? 'fa-star-half-alt' : 'fa-regular fa-star')}`} />
                                    ))}
                                    <span>({blogPost.totalReviews} Đánh giá)</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="submit-review-area">
                              <form action="#" className="submit-review-area">
                                <h5 className="title">Gửi đánh giá của bạn</h5>
                                <div className="your-rating">
                                  <span>Đánh giá của bạn về sản phẩm này:</span>
                                  <div className="stars">
                                    <i className="fa-solid fa-star" />
                                    <i className="fa-solid fa-star" />
                                    <i className="fa-solid fa-star" />
                                    <i className="fa-solid fa-star" />
                                    <i className="fa-solid fa-star" />
                                  </div>
                                </div>
                                <div className="half-input-wrapper">
                                  <div className="half-input">
                                    <input type="text" placeholder="Tên của bạn*" />
                                  </div>
                                  <div className="half-input">
                                    <input type="text" placeholder="Email của bạn *" />
                                  </div>
                                </div>
                                <textarea
                                  name="#"
                                  id="#"
                                  placeholder="Viết đánh giá của bạn"
                                  defaultValue={""}
                                />
                                <button className="rts-btn btn-primary">
                                  GỬI ĐÁNH GIÁ
                                </button>
                              </form>
                            </div>
                          </div>
                        </div>
                      </div>}
                  </div>
                </div>
              </div>

              <div className="col-xl-3 col-lg-4 col-md-12 offset-xl-1 rts-sticky-column-item">
                <div className="theiaStickySidebar">
                  <div className="shop-sight-sticky-sidevbar mb--20">
                    <h6 className="title">Ưu đãi có sẵn</h6>
                    <div className="single-offer-area">
                      <div className="icon"><img src="/assets/images/shop/01.svg" alt="icon" /></div>
                      <div className="details"><p>Giảm giá 5% ngay lập tức cho Đơn hàng Flipkart đầu tiên bằng Ekomart UPI</p></div>
                    </div>
                    <div className="single-offer-area">
                      <div className="icon"><img src="/assets/images/shop/02.svg" alt="icon" /></div>
                      <div className="details"><p>Giảm giá cố định $250 cho các Giao dịch trả góp bằng thẻ tín dụng Citi trên $30</p></div>
                    </div>
                    <div className="single-offer-area">
                      <div className="icon"><img src="/assets/images/shop/03.svg" alt="icon" /></div>
                      <div className="details"><p>Miễn phí vận chuyển toàn cầu cho tất cả các đơn hàng trên $100</p></div>
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

      <RelatedProduct />
      <ShortService />
      <FooterOne />
      <ToastContainer />

      <ProductDetails
        show={activeModal === 'productDetails'}
        handleClose={handleCloseModal}
        productImage={blogPost.thumbnailUrl}
        productTitle={blogPost.name}
        productPrice={currentPrice.toString()}
      />
      {/* Uncomment và import CompareModal nếu bạn đã tạo component này */}
      {/* <CompareModal show={activeModal === 'compare'} handleClose={handleCloseModal} /> */}
    </div>
  );
};

export default CompareElements;