"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import ProductDetails from "@/components/modal/ProductDetails";
import CompareModal from "@/components/modal/CompareModal";
import { useCart } from "@/components/header/CartContext";
import { useWishlist } from "@/components/header/WishlistContext";
import { useCompare } from "@/components/header/CompareContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ProductHomeProps {
  Id: string;
  Slug: string;
  ProductImage?: string;
  ProductTitle?: string;
  Price?: string;
  BasePrice?: string;
  UnitSize?: string;
}

type ModalType = "one" | "two" | "three" | null;

const ProductHome: React.FC<ProductHomeProps> = ({
  Id,
  Slug,
  ProductImage,
  ProductTitle = "Default Product Title",
  Price = "0",
  BasePrice = "0",
  UnitSize = "",
}) => {
  const [productSale, setProductSale] = useState(0);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
  const { addToCompare } = useCompare();

  const handleSalePercentage = (basePrice: string, currentPrice: string) => {
    const base = parseFloat(basePrice);
    const current = parseFloat(currentPrice);
    if (base > 0 && current > 0 && base > current) {
      return Math.round(((base - current) / base) * 100);
    }
    return 0;
  };

  const imageSrc =
    ProductImage && ProductImage.trim() !== ""
      ? ProductImage
      : "/assets/images/grocery/default-image.jpg";

  const handleAdd = async () => {
    try {
      await addToCart({
        productId: Id,
        productVariantId: "",
        quantity: 1,
        unitPrice: parseFloat(Price),
        cartId: "",
      });
      setAdded(true);
      toast.success("Đã thêm vào giỏ hàng!");
      setTimeout(() => setAdded(false), 3000);
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi xảy ra khi thêm vào giỏ hàng.");
    }
  };

  const handleWishlist = () => {
    addToWishlist({
      id: Id,
      image: imageSrc,
      title: ProductTitle,
      price: parseFloat(Price),
      quantity: 1,
    });
    setWishlisted(true);
    toast.success("Đã thêm vào danh sách yêu thích!");
    setTimeout(() => setWishlisted(false), 3000);
  };

  useEffect(() => {
    setProductSale(handleSalePercentage(BasePrice || "0", Price || "0"));
  }, [BasePrice, Price]);

  const formatCurrency = (value: string | number): string =>
    parseFloat(value.toString()).toLocaleString("vi-VN") + "₫";

  return (
    <>
      <style jsx>{`
        .product-home-card {
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .product-home-card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          transform: translateY(-4px);
        }

        .image-section {
          position: relative;
          width: 100%;
          height: 0;
          padding-bottom: 100%; /* 1:1 Aspect Ratio */
          overflow: hidden;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .image-wrapper {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .product-image {
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: auto;
          object-fit: contain;
          transition: transform 0.4s ease;
        }

        .product-home-card:hover .product-image {
          transform: scale(1.1);
        }

        .sale-badge {
          position: absolute;
          top: 14px;
          left: 14px;
          background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
          color: white;
          padding: 8px 14px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 13px;
          box-shadow: 0 4px 12px rgba(255, 82, 82, 0.3);
          z-index: 2;
          line-height: 1.4;
        }

        .wishlist-btn {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.95);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 2;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .wishlist-btn:hover {
          background: #fff;
          transform: scale(1.15);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
        }

        .wishlist-btn.active {
          background: #ff6b6b;
        }

        .wishlist-btn.active i {
          color: white;
        }

        .wishlist-btn i {
          color: #ff6b6b;
          font-size: 17px;
          transition: color 0.3s ease;
        }

        .card-body {
          padding: 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .product-title {
          font-size: 17px;
          font-weight: 600;
          color: #2c3e50;
          margin: 0 0 8px 0;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          min-height: 51px;
          transition: color 0.3s ease;
        }

        .product-title:hover {
          color: #27ae60;
        }

        .unit-size {
          display: inline-block;
          background: #e8f5e9;
          color: #2e7d32;
          padding: 5px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 14px;
        }

        .price-section {
          margin-top: auto;
          padding-top: 14px;
        }

        .price-container {
          display: flex;
          align-items: baseline;
          gap: 10px;
          margin-bottom: 14px;
        }

        .current-price {
          font-size: 22px;
          font-weight: 800;
          color: #27ae60;
        }

        .original-price {
          font-size: 15px;
          color: #95a5a6;
          text-decoration: line-through;
          font-weight: 500;
        }

        .add-to-cart-btn {
          width: 100%;
          background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
          color: white;
          border: none;
          padding: 13px 20px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
        }

        .add-to-cart-btn:hover {
          background: linear-gradient(135deg, #229954 0%, #1e8449 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(39, 174, 96, 0.4);
        }

        .add-to-cart-btn:active {
          transform: translateY(0);
        }

        .add-to-cart-btn.added {
          background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
        }

        .cart-icon {
          font-size: 16px;
        }

        @media (max-width: 768px) {
          .card-body {
            padding: 16px;
          }

          .product-title {
            font-size: 15px;
            min-height: 45px;
          }

          .current-price {
            font-size: 20px;
          }

          .image-wrapper {
            padding: 16px;
          }
        }
      `}</style>

      <div className="product-home-card">
        <div className="image-section">
          {productSale > 0 && (
            <div className="sale-badge">
              -{productSale}%
            </div>
          )}

          <button
            className={`wishlist-btn ${wishlisted ? 'active' : ''}`}
            title="Yêu thích"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleWishlist();
            }}
          >
            <i className={wishlisted ? "fa-solid fa-heart" : "fa-light fa-heart"} />
          </button>

          <Link href={`/shop/${Id}`}>
            <div className="image-wrapper">
              <img
                src={imageSrc}
                alt={ProductTitle}
                className="product-image"
              />
            </div>
          </Link>
        </div>

        <div className="card-body">
          <Link href={`/shop/${Id}`}>
            <h4 className="product-title">{ProductTitle}</h4>
          </Link>

          {UnitSize && (
            <span className="unit-size">{UnitSize}</span>
          )}

          <div className="price-section">
            <div className="price-container">
              <span className="current-price">
                {formatCurrency(productSale > 0 ? Price : BasePrice)}
              </span>
              {productSale > 0 && (
                <span className="original-price">
                  {formatCurrency(BasePrice)}
                </span>
              )}
            </div>
            <button
              type="button"
              className={`add-to-cart-btn ${added ? 'added' : ''}`}
              onClick={handleAdd}
              disabled={added}
            >
              <span>{added ? 'Đã thêm' : 'Thêm vào giỏ hàng'}</span>
              <i className={`${added ? 'fa-solid fa-check' : 'fa-regular fa-cart-shopping'} cart-icon`} />
            </button>
          </div>
        </div>
      </div>

      <ProductDetails
        show={activeModal === "two"}
        handleClose={() => setActiveModal(null)}
        productImage={imageSrc}
        productTitle={ProductTitle}
        productPrice={Price}
      />
    </>
  );
};

export default ProductHome;