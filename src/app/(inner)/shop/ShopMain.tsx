"use client";

import React, { useState } from "react";
import { useCart } from "@/components/header/CartContext";
import { useCompare } from "@/components/header/CompareContext";
import { useWishlist } from "@/components/header/WishlistContext";
import CompareModal from "@/components/modal/CompareModal";
import ProductDetails from "@/components/modal/ProductDetails";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import WeeklyBestSellingMain from "@/components/product-main/WeeklyBestSellingMain";

interface ShopMainProps {
  Id: string;
  Slug: string;
  ProductImage?: string;
  ProductTitle?: string;
  Price?: string;
  BasePrice?: string;
  StockAvailable?: number;
  Calories?: number;
  Protein?: number;
  Carbs?: number;
  Fat?: number;
  NutritionHighlights?: string;
  UnitSize?: string;
}

const ShopMain: React.FC<ShopMainProps> = ({
  Id,
  Slug,
  ProductImage,
  ProductTitle,
  Price,
  BasePrice,
  StockAvailable = 0,
  Calories,
  Protein,
  Carbs,
  Fat,
  NutritionHighlights,
  UnitSize,
}) => {
  type ModalType = "one" | "two" | "three" | null;
  const [activeModal, setActiveModal] = useState<ModalType>(null);
 
  const handleClose = () => setActiveModal(null);

  // ảnh fallback
  const imageSrc =
    ProductImage && ProductImage.trim() !== ""
      ? ProductImage
      : "/assets/images/grocery/default-image.jpg";

  return (
    <>
      <div className="body-content">
        <WeeklyBestSellingMain
          Id={Id}
          Slug={Slug}
          ProductImage={imageSrc}
          ProductTitle={ProductTitle}
          Price={Price}
          BasePrice={BasePrice}
          Calories={Calories}
          Protein={Protein}
          Carbs={Carbs}
          Fat={Fat}
          NutritionHighlights={NutritionHighlights}
          UnitSize={UnitSize}
        />
      </div>

      <CompareModal show={activeModal === "one"} handleClose={handleClose} />
      <ProductDetails
        show={activeModal === "two"}
        handleClose={handleClose}
        productImage={imageSrc}
        productTitle={ProductTitle ?? "Default Product Title"}
        productPrice={Price ?? "0"}
      />

      <ToastContainer />
    </>
  );
};

export default ShopMain;
