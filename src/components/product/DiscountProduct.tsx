"use client"
import React from 'react';

function DiscountProduct() {
    return (
        <div>
            {/* khu vực sản phẩm khuyến mãi bắt đầu */}
            <div className="rts-grocery-feature-area rts-section-gapBottom">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="product-with-discount">
                                <div className="row g-5">
                                    <div className="col-6">
                                        <a href="#" className="single-discount-with-bg">
                                            <div className="inner-content">
                                                <h4 className="title">
                                                    Mã <strong>SUMMER2025</strong> <br />
                                                    Giảm ngay 15%
                                                </h4>
                                                <div className="price-area">
                                                    <span>Áp dụng cho đơn từ</span>
                                                    <h4 className="title">300.000đ</h4>
                                                </div>
                                            </div>
                                        </a>
                                    </div>
                                    <div className="col-6">
                                        <a href="#" className="single-discount-with-bg bg-2">
                                            <div className="inner-content">
                                                <h4 className="title">
                                                    Mã <strong>FREESHIP</strong> <br />
                                                    Miễn phí vận chuyển
                                                </h4>
                                                <div className="price-area">
                                                    <span>Cho đơn từ</span>
                                                    <h4 className="title">150.000đ</h4>
                                                </div>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* khu vực sản phẩm khuyến mãi kết thúc */}
        </div>
    )
}

export default DiscountProduct;
