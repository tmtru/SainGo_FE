import React from 'react';

function FooterOne() {
    return (
        <>
            {/* Khu vực chân trang bắt đầu */}
            <div className="rts-footer-area pt--80 bg_light-1">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="footer-main-content-wrapper pb--70 pb_sm--30">
                                {/* Giới thiệu công ty */}
                                <div className="single-footer-wized">
                                    <h3 className="footer-title">Về Chúng Tôi</h3>
                                    <div className="call-area">
                                        <div className="icon">
                                            <i className="fa-solid fa-phone-rotary" />
                                        </div>
                                        <div className="info">
                                            <span>Có thắc mắc? Gọi ngay 24/7</span>
                                            <span className="number">+258 3692 2569</span>
                                        </div>
                                    </div>
                                    <div className="opening-hour">
                                        <div className="single">
                                            <p>Thứ 2 - Thứ 6: <span>8:00 - 18:00</span></p>
                                        </div>
                                        <div className="single">
                                            <p>Thứ 7: <span>8:00 - 18:00</span></p>
                                        </div>
                                        <div className="single">
                                            <p>Chủ Nhật: <span>Đóng cửa</span></p>
                                        </div>
                                    </div>
                                </div>

                                {/* Danh mục cửa hàng */}
                                <div className="single-footer-wized">
                                    <h3 className="footer-title">Danh Mục Mua Sắm</h3>
                                    <ul className="footer-nav">
                                        <li>Liên hệ</li>
                                        <li>Giới thiệu</li>
                                        <li>Tuyển dụng</li>
                                        <li>Thông tin sản phẩm</li>
                                        <li>Câu chuyện thương hiệu</li>
                                    </ul>
                                </div>

                                {/* Liên kết hữu ích */}
                                <div className="single-footer-wized">
                                    <h3 className="footer-title">Liên Kết Hữu Ích</h3>
                                    <ul className="footer-nav">
                                        <li>Chính sách đổi trả</li>
                                        <li>Chính sách vận chuyển</li>
                                        <li>Phương thức thanh toán</li>
                                        <li>Câu hỏi thường gặp</li>
                                        <li>Trung tâm hỗ trợ</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Mạng xã hội và thanh toán */}
                            <div className="social-and-payment-area-wrapper">
                                <div className="social-one-wrapper">
                                    <span>Theo dõi chúng tôi:</span>
                                    <ul>
                                        <li><i className="fa-brands fa-facebook-f" /></li>
                                        <li><i className="fa-brands fa-twitter" /></li>
                                        <li><i className="fa-brands fa-youtube" /></li>
                                        <li><i className="fa-brands fa-whatsapp" /></li>
                                        <li><i className="fa-brands fa-instagram" /></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default FooterOne;
