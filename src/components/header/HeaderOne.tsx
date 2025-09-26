"use client";
import React, { useState, useEffect, useRef } from 'react';
import HeaderNav from './HeaderNav';
import CategoryMenu from './CategoryMenu';
import Cart from './Cart';
import WishList from './WishList';
import Sidebar from './Sidebar';
import BackToTop from "@/components/common/BackToTop";
import { useCompare } from '@/components/header/CompareContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../Context/AuthContext';

function HeaderOne() {
    const { isAuthenticated, logout } = useAuth();
    const { compareItems } = useCompare();
    const router = useRouter();

    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);


    const handleSuggestionClick = (suggestion: string) => {
        setSearchTerm(suggestion);
        setShowSuggestions(false);
        router.push(`/shop?search=${encodeURIComponent(suggestion)}`);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            router.push(`/shop?keyword=${encodeURIComponent(searchTerm.trim())}`);
            setShowSuggestions(false);
        } else {
            router.push('/shop');
        }
    };

    return (
        <>
            <div className="rts-header-one-area-one">

                {/* Logo + Tìm kiếm */}
                <div className="search-header-area-main">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="logo-search-category-wrapper">
                                    <Link href="/" className="logo-area">
                                        <img src="/assets/images/logo/logo-01.png" alt="Trang chủ" className="logo" />
                                    </Link>

                                    <div className="category-search-wrapper">

                                        <form onSubmit={handleSubmit} className="search-header" autoComplete="off">
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                placeholder="Tìm kiếm món ăn..."
                                                required
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                onFocus={() => searchTerm.length > 0 && setShowSuggestions(true)}
                                            />
                                            <button type="submit" className="rts-btn btn-primary radious-sm with-icon">
                                                <div className="btn-text">Tìm kiếm</div>
                                                <div className="arrow-icon">
                                                    <i className="fa-light fa-magnifying-glass" />
                                                </div>
                                            </button>
                                        </form>
                                    </div>

                                    <div className="actions-area">
                                        <div className="search-btn" id="searchs">
                                            <i className="fa-light fa-magnifying-glass" />
                                        </div>
                                        <div className="menu-btn" id="menu-btn">
                                            <i className="fa-light fa-bars" />
                                        </div>
                                    </div>

                                    <div className="accont-wishlist-cart-area-header">
                                

                                        <WishList />

                                        {isAuthenticated && <Cart />}

                                        {isAuthenticated ? (
                                            <>
                                                <Link
                                                    href="/account"
                                                    className="btn-border-only account"
                                                >
                                                    <i className="fa-light fa-user" />
                                                </Link>

                                                <button
                                                    onClick={logout}
                                                    className="btn-border-only account"
                                                    style={{
                                                        backgroundColor: '#ffeaea',
                                                        border: '1px solid #e54848',
                                                        color: '#d32626',
                                                        padding: '6px 12px',
                                                        marginLeft: '8px',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    <i className="fa-light fa-arrow-right-from-bracket" />
                                                    <span style={{ marginLeft: '4px' }}>Đăng xuất</span>
                                                </button>
                                            </>
                                        ) : (
                                            <Link
                                                href="/login"
                                                className="btn-border-only account"
                                                style={{
                                                    backgroundColor: '#e6f2ff',
                                                    border: '1px solid #3399ff',
                                                    color: '#0066cc',
                                                    padding: '6px 12px',
                                                    marginLeft: '8px',
                                                    borderRadius: '4px',
                                                }}
                                            >
                                                <i className="fa-light fa-user" />
                                                <span style={{ marginLeft: '4px' }}>Đăng nhập</span>
                                            </Link>
                                        )}

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Điều hướng chính */}
                <HeaderNav />
            </div>

            <Sidebar />
            <BackToTop />
        </>
    );
}

export default HeaderOne;
