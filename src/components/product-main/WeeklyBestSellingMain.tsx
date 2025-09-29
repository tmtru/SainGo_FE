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
      <div className="single-shopping-card-one discount-offer">
        <div className="thumbnail-preview relative">
          {productSale > 0 && (
            <div className="badge">
              <span>
                {productSale}% <br />
                Off
              </span>
              <i className="fa-solid fa-bookmark" />
            </div>
          )}

          <Link href={`/shop/${Id}`}>
            <img
              src={ProductImage ?? "/assets/images/grocery/default-image.jpg"}
              alt={ProductTitle}
            />
          </Link>

          {/* Hover actions */}
          <div className="action-share-option absolute top-2 right-2">
            <button
              className="single-action openuptip message-show-action"
              title="Yêu thích"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleWishlist();
              }}
            >
              <i className="fa-light fa-heart" />
            </button>
          </div>
        </div>
        <div className="body-content">
          <div className="title-area-left">
            <Link href={`/shop/${Id}`}>
              <h4 className="title">{ProductTitle}</h4>
            </Link>
            <span className="availability">
              {UnitSize ? UnitSize : "Serving size not specified"}
            </span>
            <div className="natural-value mt-3">
              <h5 className="title">Giá trị dinh dưỡng/100g</h5>
              <div className="single">
                <span>Calories:</span>
                <span>{Calories}</span>
              </div>
              <div className="single">
                <span>Protein (g):</span>
                <span>{Protein}</span>
              </div>
              <div className="single">
                <span>Carbohydrate (g):</span>
                <span>{Carbs}</span>
              </div>
              <div className="single">
                <span>Chất béo (g):</span>
                <span>{Fat}</span>
              </div>
              {NutritionHighlights && (
                <div className="single">
                  <span>Thông tin nổi bật:</span>
                  <span>{NutritionHighlights}</span>
                </div>
              )}
            </div>
            <div className="price-area">
              {productSale > 0 ? (
                <>
                  <span className="current">{formatCurrency(Price)}</span>
                  <div className="previous">{formatCurrency(BasePrice)}</div>
                </>
              ) : (
                <span className="current">{formatCurrency(BasePrice)}</span>
              )}
            </div>
            <div className="button-area">
              <button
                type="button"
                className="rts-btn btn-primary radious-sm with-icon"
                onClick={handleAdd}
              >
                <div className="btn-text">Thêm vào giỏ hàng</div>
                <div className="arrow-icon">
                  <i className="fa-regular fa-cart-shopping" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WeeklyBestSellingMain;
