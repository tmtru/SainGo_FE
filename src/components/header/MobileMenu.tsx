'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const MobileMenu = () => {
    const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
    const [openThirdLevelKey, setOpenThirdLevelKey] = useState<string | null>(null);

    const toggleMenu = (index: number) => {
        setOpenMenuIndex(prev => (prev === index ? null : index));
    };

    const toggleThirdMenu = (key: string) => {
        setOpenThirdLevelKey(prev => (prev === key ? null : key));
    };

    return (
        <nav className="nav-main mainmenu-nav mt--30">
            <ul className="mainmenu metismenu" id="mobile-menu-active">

                {/* Trang chủ */}
                <li>
                    <Link className="main" href="/">Trang chủ</Link>
                    {/* <ul className={`submenu mm-collapse ${openMenuIndex === 0 ? 'mm-show' : ''}`}>
                        <li><Link className="mobile-menu-link" href="/">Trang chủ 1</Link></li>
                        <li><Link className="mobile-menu-link" href="/index-two">Trang chủ 2</Link></li>
                        <li><Link className="mobile-menu-link" href="/index-three">Trang chủ 3</Link></li>
                        <li><Link className="mobile-menu-link" href="/index-four">Trang chủ 4</Link></li>
                        <li><Link className="mobile-menu-link" href="/index-five">Trang chủ 5</Link></li>
                    </ul> */}
                </li>

                {/* Giới thiệu */}
                <li><Link className="main" href="/about">Giới thiệu</Link></li>

                {/* Trang */}
                {/* <li className={`has-droupdown ${openMenuIndex === 1 ? 'mm-active' : ''}`}>
                    <a href="#" className="main" onClick={() => toggleMenu(1)}>Trang</a>
                    <ul className={`submenu mm-collapse ${openMenuIndex === 1 ? 'mm-show' : ''}`}>
                        <li><Link className="mobile-menu-link" href="/about">Giới thiệu</Link></li>
                        <li><Link className="mobile-menu-link" href="/faq">Câu hỏi thường gặp</Link></li>
                        <li><Link className="mobile-menu-link" href="/invoice">Hóa đơn</Link></li>
                        <li><Link className="mobile-menu-link" href="/contact">Liên hệ</Link></li>
                        <li><Link className="mobile-menu-link" href="/register">Đăng ký</Link></li>
                        <li><Link className="mobile-menu-link" href="/login">Đăng nhập</Link></li>
                        <li><Link className="mobile-menu-link" href="/privacy-policy">Chính sách bảo mật</Link></li>
                        <li><Link className="mobile-menu-link" href="/cookies-policy">Chính sách Cookie</Link></li>
                        <li><Link className="mobile-menu-link" href="/terms-condition">Điều khoản sử dụng</Link></li>
                        <li><Link className="mobile-menu-link" href="/404">Trang lỗi</Link></li>
                    </ul>
                </li> */}

                {/* Cửa hàng */}
                {/* <li className={`has-droupdown ${openMenuIndex === 2 ? 'mm-active' : ''}`}>
                    <a href="#" className="main" onClick={() => toggleMenu(2)}>Cửa hàng</a>
                    <ul className={`submenu mm-collapse ${openMenuIndex === 2 ? 'mm-show' : ''}`}>

         
                        <li className="has-droupdown third-lvl">
                            <a href="#" className="main" onClick={() => toggleThirdMenu('shopLayout')}>Giao diện cửa hàng</a>
                            <ul className={`submenu-third-lvl mm-collapse ${openThirdLevelKey === 'shopLayout' ? 'mm-show' : ''}`}>
                                <li><Link href="/shop-grid-sidebar">Lưới + Sidebar</Link></li>
                                <li><Link href="/shop-list-sidebar">Danh sách + Sidebar</Link></li>
                                <li><Link href="/shop-grid-top-filter">Lưới + Bộ lọc trên</Link></li>
                                <li><Link href="/shop-list-top-filter">Danh sách + Bộ lọc trên</Link></li>
                            </ul>
                        </li>

    
                        <li className="has-droupdown third-lvl">
                            <a href="#" className="main" onClick={() => toggleThirdMenu('shopDetails')}>Chi tiết sản phẩm</a>
                            <ul className={`submenu-third-lvl mm-collapse ${openThirdLevelKey === 'shopDetails' ? 'mm-show' : ''}`}>
                                <li><Link href="/shop-details">Chi tiết 1</Link></li>
                                <li><Link href="/shop-details-2">Chi tiết 2</Link></li>
                            </ul>
                        </li>

     
                        <li className="has-droupdown third-lvl">
                            <a href="#" className="main" onClick={() => toggleThirdMenu('productFeature')}>Tính năng sản phẩm</a>
                            <ul className={`submenu-third-lvl mm-collapse ${openThirdLevelKey === 'productFeature' ? 'mm-show' : ''}`}>
                                <li><Link href="/shop-details-variable">Biến thể</Link></li>
                                <li><Link href="/shop-details-affiliats">Liên kết</Link></li>
                                <li><Link href="/shop-details-group">Nhóm sản phẩm</Link></li>
                                <li><Link href="/shop-compare">So sánh</Link></li>
                            </ul>
                        </li>

           
                        <li className="has-droupdown third-lvl">
                            <a href="#" className="main" onClick={() => toggleThirdMenu('shopOthers')}>Khác</a>
                            <ul className={`submenu-third-lvl mm-collapse ${openThirdLevelKey === 'shopOthers' ? 'mm-show' : ''}`}>
                                <li><Link href="/cart">Giỏ hàng</Link></li>
                                <li><Link href="/checkout">Thanh toán</Link></li>
                                <li><Link href="/trackorder">Theo dõi đơn</Link></li>
                            </ul>
                        </li>
                    </ul>
                </li> */}
                <li><Link className="main" href="/shop">Danh mục hàng hóa</Link></li>
                {/* Blog */}
                {/* <li className={`has-droupdown ${openMenuIndex === 3 ? 'mm-active' : ''}`}>
                    <a href="#" className="main" onClick={() => toggleMenu(3)}>Blog</a>
                    <ul className={`submenu mm-collapse ${openMenuIndex === 3 ? 'mm-show' : ''}`}>
                        <li><Link className="mobile-menu-link" href="/blog">Tất cả blog</Link></li>
                        <li><Link className="mobile-menu-link" href="/blog-list-left-sidebar">Sidebar trái</Link></li>
                        <li><Link className="mobile-menu-link" href="/blog-list-right-sidebar">Sidebar phải</Link></li>
                    </ul>
                </li> */}

                {/* Liên hệ */}
                <li><Link className="main" href="/contact">Liên hệ</Link></li>
            </ul>
        </nav>
    );
};

export default MobileMenu;
