"use client";

import React, { useState, useEffect } from "react";
import Nav from "./Nav";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "./CartContext";

const Header: React.FC = () => {
  const { cartItems } = useCart();
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 150);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMenuClick = () => {
    document
      .querySelector<HTMLElement>(".side-bar.header-two")
      ?.classList.toggle("show");
  };

  const handleSearchOpen = () => {
    document
      .querySelector<HTMLElement>(".search-input-area")
      ?.classList.toggle("show");
  };

  const subTotal = cartItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const freeShippingThreshold = 125;
  const progress = Math.min((subTotal / freeShippingThreshold) * 100, 100);

  return (
    <div
      className={`rts-header-nav-area-one header--sticky ${
        isSticky ? "sticky" : ""
      }`}
    >
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="nav-and-btn-wrapper">
              <div className="nav-area">
                <Nav />
              </div>
              <div className="right-btn-area">
                <button className="rts-btn btn-primary">
                  Mua ngay để nhận giảm giá cực ưu đãi <span>Sale</span>
                </button>
              </div>
            </div>
          </div>
          <div className="col-lg-12">
            <div className="logo-search-category-wrapper after-md-device-header">
              <Link href="/" className="logo-area">
                <Image
                  src="/assets/images/logo/logo-01.png"
                  alt="logo-main"
                  width={100}
                  height={40}
                />
              </Link>
              <div className="category-search-wrapper">
                <form action="#" className="search-header">
                  <input
                    type="text"
                    placeholder="Search for products, categories or brands"
                    required
                  />
                  <button className="rts-btn btn-primary radious-sm with-icon">
                    <span className="btn-text">Search</span>
                    <span className="arrow-icon">
                      <i className="fa-light fa-magnifying-glass" />
                    </span>
                  </button>
                </form>
              </div>
              <div className="main-wrapper-action-2 d-flex">
                <div className="accont-wishlist-cart-area-header">
                  <Link href="/wishlist" className="btn-border-only wishlist">
                    <i className="fa-regular fa-heart" />
                  </Link>
                </div>
                <div className="actions-area">
                  <div className="search-btn" onClick={handleSearchOpen}>
                    <i className="fa-light fa-magnifying-glass" />
                  </div>
                  <div className="menu-btn" onClick={handleMenuClick}>
                    <i className="fa-light fa-bars" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
