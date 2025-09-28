"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useWishlist } from "./WishlistContext";

const WishList: React.FC = () => {
  const { wishlistItems, removeFromWishlist } = useWishlist();

  const total = wishlistItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const freeShippingThreshold = 125;
  const remaining = freeShippingThreshold - total;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="btn-border-only cart category-hover-header">
      <i className="fa-regular fa-heart" />
      <span className="text">Yêu thích</span>
      <span className="number">{wishlistItems.length}</span>

      <div className="category-sub-menu card-number-show">
        <h5 className="shopping-cart-number">
          Món ăn yêu thích ({wishlistItems.length.toString().padStart(2, "0")})
        </h5>

        {wishlistItems.map((item) => (
          <div key={item.id} className="cart-item-1 border-top">
            <div className="img-name">
              <div
                className="close section-activation"
                onClick={() => removeFromWishlist(item.id)}
              >
                <i className="fa-regular fa-x" />
              </div>
              <div className="thumbanil">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={60}
                  height={60}
                />
              </div>
              <div className="details">
                <Link href={`/shop/${item.id}`}>
                  <h5 className="title">{item.title}</h5>
                </Link>

                <div className="number">
                  {item.quantity} <i className="fa-regular fa-x" />{" "}
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="sub-total-cart-balance">
          <div className="bottom-content-deals mt--10">
            <div className="top">
              <span>Tổng tiền:</span>
              <span className="number-c">{formatCurrency(total)}</span>
            </div>
            <div className="single-progress-area-incard">
              <div className="progress">
                <div
                  className="progress-bar wow fadeInLeft"
                  role="progressbar"
                  style={{
                    width: `${Math.min(
                      (total / freeShippingThreshold) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="button-wrapper d-flex align-items-center justify-content-between">
            <a href="/wishlist" className="rts-btn btn-primary">
              Xem mục yêu thích
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishList;
