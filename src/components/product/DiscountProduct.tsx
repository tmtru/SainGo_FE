"use client"
import React, { useState } from 'react';

function DiscountProduct() {
    const [copiedCode, setCopiedCode] = useState(null);

    const handleCopyCode = (code :any) => {
        navigator.clipboard.writeText(code).then(() => {
            setCopiedCode(code);
            setTimeout(() => {
                setCopiedCode(null);
            }, 2000);
        }).catch(err => {
            console.error('Không thể sao chép:', err);
        });
    };

    const promotions = [
        {
            code: "HEALTHY15",
            title: "Giảm 15% cho khách mới",
            subtitle: "Áp dụng cho đơn đầu tiên",
            minOrder: "300.000đ",
            bgClass: "bg-1",
            icon: (
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 20L24 8L36 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 20V38C12 39 13 40 14 40H34C35 40 36 39 36 38V20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M18 40V28C18 27 19 26 20 26H28C29 26 30 27 30 28V40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )
        },
        {
            code: "FREESHIP",
            title: "Miễn phí giao hàng",
            subtitle: "Nhận suất ăn tận nhà",
            minOrder: "200.000đ",
            bgClass: "bg-2",
            icon: (
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 16H28V32H8V16Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M28 22H32L36 26V32H28V22Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="14" cy="32" r="3" stroke="currentColor" strokeWidth="3" />
                    <circle cx="32" cy="32" r="3" stroke="currentColor" strokeWidth="3" />
                    <path d="M4 16H8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
            )
        },
        {
            code: "COMBO7",
            title: "Giảm 20% combo tuần",
            subtitle: "Đặt 7 ngày trọn gói",
            minOrder: "1.000.000đ",
            bgClass: "bg-3",
            icon: (
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="8" y="12" width="32" height="28" rx="3" stroke="currentColor" strokeWidth="3" />
                    <path d="M8 18H40" stroke="currentColor" strokeWidth="3" />
                    <path d="M16 8V12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    <path d="M32 8V12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="16" cy="26" r="2" fill="currentColor" />
                    <circle cx="24" cy="26" r="2" fill="currentColor" />
                    <circle cx="32" cy="26" r="2" fill="currentColor" />
                    <circle cx="16" cy="33" r="2" fill="currentColor" />
                    <circle cx="24" cy="33" r="2" fill="currentColor" />
                </svg>
            )
        },
        {
            code: "GYM30",
            title: "Ưu đãi gym lover",
            subtitle: "Dành cho người tập thể hình",
            minOrder: "500.000đ",
            bgClass: "bg-4",
            icon: (
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 24H16M32 24H40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    <rect x="14" y="20" width="4" height="8" rx="1" stroke="currentColor" strokeWidth="3" />
                    <rect x="30" y="20" width="4" height="8" rx="1" stroke="currentColor" strokeWidth="3" />
                    <rect x="18" y="22" width="12" height="4" rx="1" stroke="currentColor" strokeWidth="3" />
                    <circle cx="8" cy="24" r="3" stroke="currentColor" strokeWidth="3" />
                    <circle cx="40" cy="24" r="3" stroke="currentColor" strokeWidth="3" />
                </svg>
            )
        }
    ];

    return (
        <div className="rts-grocery-feature-area rts-section-gapBottom">
            <div className="container">
                <div className="section-title-area text-center mb--40">
                    <h3 className="title">
                        Ưu đãi <span className="highlight">đặc biệt</span> dành cho bạn
                    </h3>
                    <p className="subtitle">Tiết kiệm hơn khi ăn healthy hơn</p>
                </div>

                <div className="row">
                    <div className="col-lg-12">
                        <div className="product-with-discount">
                            <div className="row g-4">
                                {promotions.map((promo, index) => (
                                    <div key={index} className="col-lg-3 col-md-6 col-sm-6 col-12">
                                        <div className={`single-discount-card ${promo.bgClass}`}>
                                            <div className="discount-icon">
                                                {promo.icon}
                                            </div>
                                            <div className="discount-content">
                                                <div className="code-badge">
                                                    <span className="code-label">MÃ</span>
                                                    <strong className="code-text">{promo.code}</strong>
                                                </div>
                                                <h4 className="discount-title">{promo.title}</h4>
                                                <p className="discount-subtitle">{promo.subtitle}</p>
                                                <div className="price-condition">
                                                    <span className="condition-label">Đơn tối thiểu</span>
                                                    <span className="condition-price">{promo.minOrder}</span>
                                                </div>
                                                <button
                                                    className="copy-code-btn"
                                                    onClick={() => handleCopyCode(promo.code)}
                                                >
                                                    {copiedCode === promo.code ? (
                                                        <>
                                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                                <path d="M3 8L6 11L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                            Đã sao chép!
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                                <rect x="2" y="5" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" />
                                                                <path d="M5 5V3C5 2.4 5.4 2 6 2H13C13.6 2 14 2.4 14 3V10C14 10.6 13.6 11 13 11H11" stroke="currentColor" strokeWidth="1.5" />
                                                            </svg>
                                                            Sao chép
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .section-title-area .title {
                    font-size: 32px !important;
                    font-weight: 700 !important;
                    color: #2c3e50 !important;
                    margin-bottom: 8px !important;
                }
                
                .section-title-area .highlight {
                    color: #629D23 !important;
                }
                
                .section-title-area .subtitle {
                    font-size: 16px !important;
                    color: #666 !important;
                    margin: 0 !important;
                }
                
                .single-discount-card {
                    background: linear-gradient(135deg, #f8faf5 0%, #ffffff 100%) !important;
                    border: 2px solid #e8f4dc !important;
                    border-radius: 16px !important;
                    padding: 28px 24px !important;
                    text-align: center !important;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    height: 100% !important;
                    display: flex !important;
                    flex-direction: column !important;
                    position: relative !important;
                    overflow: hidden !important;
                }
                
                .single-discount-card::before {
                    content: '' !important;
                    position: absolute !important;
                    top: -50% !important;
                    right: -50% !important;
                    width: 200% !important;
                    height: 200% !important;
                    background: radial-gradient(circle, rgba(98, 157, 35, 0.05) 0%, transparent 70%) !important;
                    transition: all 0.6s ease !important;
                    opacity: 0 !important;
                }
                
                .single-discount-card:hover::before {
                    opacity: 1 !important;
                    top: -25% !important;
                    right: -25% !important;
                }
                
                .single-discount-card:hover {
                    transform: translateY(-12px) !important;
                    border-color: #629D23 !important;
                    box-shadow: 0 20px 40px rgba(98, 157, 35, 0.15) !important;
                }
                
                .single-discount-card.bg-2 {
                    background: linear-gradient(135deg, #fff8f0 0%, #ffffff 100%) !important;
                    border-color: #ffe4cc !important;
                }
                
                .single-discount-card.bg-3 {
                    background: linear-gradient(135deg, #f0f8ff 0%, #ffffff 100%) !important;
                    border-color: #cce5ff !important;
                }
                
                .single-discount-card.bg-4 {
                    background: linear-gradient(135deg, #fff0f8 0%, #ffffff 100%) !important;
                    border-color: #ffcce5 !important;
                }
                
                .discount-icon {
                    width: 72px !important;
                    height: 72px !important;
                    margin: 0 auto 20px !important;
                    background: white !important;
                    border-radius: 50% !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    color: #629D23 !important;
                    box-shadow: 0 4px 12px rgba(98, 157, 35, 0.1) !important;
                    transition: all 0.3s ease !important;
                    position: relative !important;
                    z-index: 1 !important;
                }
                
                .single-discount-card:hover .discount-icon {
                    transform: scale(1.1) rotate(5deg) !important;
                    box-shadow: 0 8px 20px rgba(98, 157, 35, 0.2) !important;
                }
                
                .discount-content {
                    flex: 1 !important;
                    display: flex !important;
                    flex-direction: column !important;
                    position: relative !important;
                    z-index: 1 !important;
                }
                
                .code-badge {
                    background: #629D23 !important;
                    color: white !important;
                    padding: 8px 16px !important;
                    border-radius: 8px !important;
                    margin-bottom: 16px !important;
                    display: inline-flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    gap: 6px !important;
                    align-self: center !important;
                }
                
                .code-label {
                    font-size: 11px !important;
                    font-weight: 600 !important;
                    opacity: 0.9 !important;
                }
                
                .code-text {
                    font-size: 14px !important;
                    font-weight: 700 !important;
                    letter-spacing: 0.5px !important;
                }
                
                .discount-title {
                    font-size: 18px !important;
                    font-weight: 700 !important;
                    color: #2c3e50 !important;
                    margin-bottom: 8px !important;
                    line-height: 1.4 !important;
                }
                
                .discount-subtitle {
                    font-size: 13px !important;
                    color: #666 !important;
                    margin-bottom: 16px !important;
                    line-height: 1.5 !important;
                }
                
                .price-condition {
                    background: #f8f9fa !important;
                    padding: 12px 16px !important;
                    border-radius: 8px !important;
                    margin-bottom: 16px !important;
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 4px !important;
                }
                
                .condition-label {
                    font-size: 12px !important;
                    color: #888 !important;
                }
                
                .condition-price {
                    font-size: 20px !important;
                    font-weight: 700 !important;
                    color: #629D23 !important;
                }
                
                .copy-code-btn {
                    background: white !important;
                    border: 2px solid #629D23 !important;
                    color: #629D23 !important;
                    padding: 10px 20px !important;
                    border-radius: 8px !important;
                    font-size: 14px !important;
                    font-weight: 600 !important;
                    cursor: pointer !important;
                    transition: all 0.3s ease !important;
                    display: inline-flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    gap: 8px !important;
                    margin-top: auto !important;
                }
                
                .copy-code-btn:hover {
                    background: #629D23 !important;
                    color: white !important;
                    transform: translateY(-2px) !important;
                    box-shadow: 0 4px 12px rgba(98, 157, 35, 0.3) !important;
                }
                
                .copy-code-btn svg {
                    transition: transform 0.3s ease !important;
                }
                
                .copy-code-btn:hover svg {
                    transform: scale(1.1) !important;
                }
                
                .copy-code-btn:active {
                    transform: translateY(0) !important;
                }
                
                @media (max-width: 991px) {
                    .single-discount-card {
                        padding: 24px 20px !important;
                    }
                    
                    .discount-icon {
                        width: 60px !important;
                        height: 60px !important;
                    }
                    
                    .discount-icon svg {
                        width: 36px !important;
                        height: 36px !important;
                    }
                }
                
                @media (max-width: 575px) {
                    .section-title-area .title {
                        font-size: 24px !important;
                    }
                    
                    .discount-title {
                        font-size: 16px !important;
                    }
                    
                    .condition-price {
                        font-size: 18px !important;
                    }
                }
            `}</style>
        </div>
    );
}

export default DiscountProduct;