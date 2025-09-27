"use client";

import React, { useEffect, useState } from "react";
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
  ProductImage?: string; // từ API (URL đầy đủ hoặc relative)
  ProductTitle?: string;
  Price?: string;
  BasePrice?: string;
  StockAvailable?: number;
}

const ShopMain: React.FC<ShopMainProps> = ({
  Id,
  Slug,
  ProductImage,
  ProductTitle,
  Price,
  BasePrice,
  StockAvailable = 0,
}) => {
  type ModalType = "one" | "two" | "three" | null;
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [added, setAdded] = useState(false);

  const { addToCart } = useCart();
  const { addToCompare } = useCompare();
  const { addToWishlist } = useWishlist();

  const handleClose = () => setActiveModal(null);

  // ảnh fallback
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
        unitPrice: parseFloat(Price ?? "0"),
        cartId: "",
      });

      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error(err);
      toast.error("Không thể thêm vào giỏ hàng.");
    }
  };

  const handleCompare = () => {
    addToCompare({
      id: Id,
      image: imageSrc,
      name: ProductTitle ?? "Default Product Title",
      price: Price ?? "0",
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      rating: 5,
      ratingCount: 25,
      weight: "500g",
      inStock: true,
    });
    toast("Successfully Add To Compare!");
  };

  const handleWishlist = () => {
    addToWishlist({
      id: Id,
      image: imageSrc,
      title: ProductTitle ?? "Default Product Title",
      price: parseFloat(Price ?? "0"),
      quantity: 1,
    });
    toast("Successfully Add To Wishlist!");
  };

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
