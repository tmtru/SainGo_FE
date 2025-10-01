"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/header/CartContext";
import { useWishlist } from "@/components/header/WishlistContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface WeeklyBestSellingMainProps {
  Id: string;
  Slug: string;
  ProductImage?: string;
  ProductTitle?: string;
  Price?: string;
  BasePrice?: string;
  Calories?: number;
  Protein?: number;
  Carbs?: number;
  Fat?: number;
  NutritionHighlights?: string;
  UnitSize?: string;
}

const WeeklyBestSellingMain: React.FC<WeeklyBestSellingMainProps> = ({
  Id,
  Slug,
  ProductImage,
  ProductTitle = "Default Product Title",
  Price = "0",
  BasePrice = "0",
  Calories = 0,
  Protein = 0,
  Carbs = 0,
  Fat = 0,
  NutritionHighlights = "",
  UnitSize = "",
}) => {
  const [productSale, setProductSale] = useState(0);

  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

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
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi xảy ra khi thêm vào giỏ hàng.");
    }
  };

  const handleWishlist = () => {
    addToWishlist({
      id: Id,
      image: imageSrc,
      title: ProductTitle ?? "Default Product Title",
      price: parseFloat(Price ?? "0"),
      quantity: 1,
    });
    toast("Thêm vào yêu thích!");
  };

  useEffect(() => {
    setProductSale(handleSalePercentage(BasePrice || "0", Price || "0"));
  }, [BasePrice, Price]);

  const formatCurrency = (value: string | number): string =>
    parseFloat(value.toString()).toLocaleString("vi-VN") + "₫";

  return (
    <>
      <style jsx>{`
        .nutrition-product-card {
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: row;
          gap: 20px;
          padding: 20px;
        }

        .nutrition-product-card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          transform: translateY(-2px);
        }

        .image-section {
          flex-shrink: 0;
          width: 280px;
          position: relative;
        }

        .image-container {
          position: relative;
          width: 100%;
          height: 280px;
          overflow: hidden;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 12px;
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
          padding: 16px;
        }

        .product-image {
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: auto;
          object-fit: cover;
          border-radius: 8px;
          transition: transform 0.3s ease;
        }

        .nutrition-product-card:hover .product-image {
          transform: scale(1.08);
        }

        .sale-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
          color: white;
          padding: 8px 14px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(255, 82, 82, 0.3);
          z-index: 2;
        }

        .wishlist-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 42px;
          height: 42px;
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
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .wishlist-btn i {
          color: #ff6b6b;
          font-size: 18px;
        }

        .content-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .product-header {
          margin-bottom: 16px;
        }

        .product-title {
          font-size: 22px;
          font-weight: 700;
          color: #2c3e50;
          margin: 0 0 10px 0;
          line-height: 1.4;
        }

        .product-title:hover {
          color: #27ae60;
        }

        .unit-size {
          display: inline-block;
          background: #e8f5e9;
          color: #2e7d32;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
        }

        .nutrition-info {
          background: linear-gradient(135deg, #f8fdf9 0%, #e8f5e9 100%);
          border-radius: 12px;
          padding: 18px;
          margin-bottom: 20px;
          border: 1px solid #c8e6c9;
        }

        .nutrition-title {
          font-size: 15px;
          font-weight: 700;
          color: #2e7d32;
          margin: 0 0 14px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nutrition-title::before {
          content: "🥗";
          font-size: 18px;
        }

        .nutrition-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .nutrition-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 8px;
          font-size: 14px;
        }

        .nutrition-label {
          color: #5d6d7e;
          font-weight: 500;
        }

        .nutrition-value {
          color: #2c3e50;
          font-weight: 700;
        }

        .highlight-info {
          background: #fff3e0;
          padding: 12px 14px;
          border-radius: 8px;
          margin-top: 12px;
          border-left: 4px solid #ff9800;
          grid-column: 1 / -1;
        }

        .highlight-info .nutrition-label {
          color: #e65100;
          margin-bottom: 6px;
          display: block;
          font-weight: 600;
        }

        .highlight-info .nutrition-value {
          color: #f57c00;
          font-size: 13px;
          line-height: 1.5;
        }

        .price-section {
          margin-top: auto;
          padding-top: 20px;
          border-top: 2px solid #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .price-container {
          display: flex;
          align-items: baseline;
          gap: 12px;
        }

        .current-price {
          font-size: 28px;
          font-weight: 800;
          color: #27ae60;
        }

        .original-price {
          font-size: 18px;
          color: #95a5a6;
          text-decoration: line-through;
          font-weight: 500;
        }

        .add-to-cart-btn {
          background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
          white-space: nowrap;
        }

        .add-to-cart-btn:hover {
          background: linear-gradient(135deg, #229954 0%, #1e8449 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(39, 174, 96, 0.4);
        }

        .add-to-cart-btn:active {
          transform: translateY(0);
        }

        .cart-icon {
          font-size: 18px;
        }

        @media (max-width: 1024px) {
          .nutrition-product-card {
            flex-direction: column;
            gap: 16px;
          }

          .image-section {
            width: 100%;
          }

          .image-container {
            height: 320px;
          }

          .price-section {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }

          .add-to-cart-btn {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 768px) {
          .nutrition-product-card {
            padding: 16px;
          }

          .product-title {
            font-size: 18px;
          }

          .current-price {
            font-size: 24px;
          }

          .nutrition-grid {
            grid-template-columns: 1fr;
          }

          .image-container {
            height: 280px;
          }
        }
      `}</style>

      <div className="nutrition-product-card">
        <div className="image-section">
          <div className="image-container">
            {productSale > 0 && (
              <div className="sale-badge">
                -{productSale}%
              </div>
            )}

            <button
              className="wishlist-btn"
              title="Yêu thích"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleWishlist();
              }}
            >
              <i className="fa-light fa-heart" />
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
        </div>

        <div className="content-section">
          <div className="product-header">
            <Link href={`/shop/${Id}`}>
              <h4 className="product-title">{ProductTitle}</h4>
            </Link>
            {UnitSize && (
              <span className="unit-size">{UnitSize}</span>
            )}
          </div>

          <div className="nutrition-info">
            <h5 className="nutrition-title">Giá trị dinh dưỡng</h5>
            <div className="nutrition-grid">
              <div className="nutrition-item">
                <span className="nutrition-label">Calories</span>
                <span className="nutrition-value">{Calories} kcal</span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-label">Protein</span>
                <span className="nutrition-value">{Protein}g</span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-label">Carbohydrate</span>
                <span className="nutrition-value">{Carbs}g</span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-label">Chất béo</span>
                <span className="nutrition-value">{Fat}g</span>
              </div>
              {NutritionHighlights && (
                <div className="highlight-info">
                  <span className="nutrition-label">💡 Điểm nổi bật</span>
                  <span className="nutrition-value">{NutritionHighlights}</span>
                </div>
              )}
            </div>
          </div>

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
              className="add-to-cart-btn"
              onClick={handleAdd}
            >
              <span>Thêm vào giỏ hàng</span>
              <i className="fa-regular fa-cart-shopping cart-icon" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default WeeklyBestSellingMain;