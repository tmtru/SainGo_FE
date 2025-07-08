'use client';

import React, { useState, useEffect } from 'react';
import Nav from './Nav';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from './CartContext'; 

const Header: React.FC = () => {
    const { cartItems } = useCart();
    const [isSticky, setIsSticky] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsSticky(window.scrollY > 150);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleMenuClick = () => {
        document.querySelector<HTMLElement>('.side-bar.header-two')?.classList.toggle('show');
    };

    const handleSearchOpen = () => {
        document.querySelector<HTMLElement>('.search-input-area')?.classList.toggle('show');
    };

    const subTotal = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const freeShippingThreshold = 125;
    const progress = Math.min((subTotal / freeShippingThreshold) * 100, 100);

    return (
        <div className={`rts-header-nav-area-one header--sticky ${isSticky ? 'sticky' : ''}`}>
            <div className="container">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="nav-and-btn-wrapper">
                            <div className="nav-area">
                                <Nav />
                            </div>
                            <div className="right-btn-area">
                                <button className="rts-btn btn-primary">Mua ngay để nhận giảm giá cực ưu đãi <span>Sale</span></button>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-12">
                        <div className="logo-search-category-wrapper after-md-device-header">
                            <Link href="/" className="logo-area">
                                <Image src="/assets/images/logo/logo-01.svg" alt="logo-main" width={100} height={40} />
                            </Link>
                            <div className="category-search-wrapper">
                                <form action="#" className="search-header">
                                    <input type="text" placeholder="Search for products, categories or brands" required />
                                    <button className="rts-btn btn-primary radious-sm with-icon">
                                        <span className="btn-text">Search</span>
                                        <span className="arrow-icon"><i className="fa-light fa-magnifying-glass" /></span>
                                    </button>
                                </form>
                            </div>
                            <div className="main-wrapper-action-2 d-flex">
                                <div className="accont-wishlist-cart-area-header">
                                    {/* <Link href="/account" className="btn-border-only account">
                                        <i className="fa-light fa-user" />
                                    </Link> */}
                                    <Link href="/wishlist" className="btn-border-only wishlist">
                                        <i className="fa-regular fa-heart" />
                                    </Link>
                                    {/* <div className="btn-border-only cart category-hover-header">
                                        <i className="fa-sharp fa-regular fa-cart-shopping" />
                                        <span className="text">My Cart</span>
                                        <span className="number">{cartItems.length}</span>
                                        <div className="category-sub-menu card-number-show">
                                            <h5 className="shopping-cart-number">Shopping Cart ({cartItems.length.toString().padStart(2, '0')})</h5>
                                            {cartItems.map((item) => (
                                                <div key={item.id} className="cart-item-1 border-top">
                                                    <div className="img-name">
                                                        <div className="thumbanil">
                                                            <Image src={item.productImage || '/placeholder.png'} alt={item.productName || ""} width={50} height={50} />
                                                        </div>
                                                        <div className="details">
                                                            <Link href="/shop-details">
                                                                <h5 className="title">{item.productName}</h5>
                                                            </Link>
                                                            <div className="number">
                                                                {item.quantity} x <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="sub-total-cart-balance">
                                                <div className="bottom-content-deals mt--10">
                                                    <div className="top">
                                                        <span>Sub Total:</span>
                                                        <span className="number-c">${subTotal.toFixed(2)}</span>
                                                    </div>
                                                    <div className="single-progress-area-incard">
                                                        <div className="progress">
                                                            <div className="progress-bar" role="progressbar" style={{ width: `${progress}%` }} />
                                                        </div>
                                                    </div>
                                                    {subTotal < freeShippingThreshold && (
                                                        <p>
                                                            Spend More <span>${(freeShippingThreshold - subTotal).toFixed(2)}</span> to reach <span>Free Shipping</span>
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="button-wrapper d-flex align-items-center justify-content-between">
                                                    <Link href="/cart" className="rts-btn btn-primary">View Cart</Link>
                                                    <Link href="/checkout" className="rts-btn btn-primary border-only">CheckOut</Link>
                                                </div>
                                            </div>
                                        </div>
                                        <Link href="/cart" className="over_link" />
                                    </div> */}
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
