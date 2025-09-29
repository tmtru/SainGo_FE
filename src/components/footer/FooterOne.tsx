import React from "react";

function FooterOne() {
  return (
    <div>
      <>
        {/* rts footer one area start */}
        <div className="rts-footer-area pt--80 bg_light-1">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="footer-main-content-wrapper pb--70 pb_sm--30">
                  {/* single footer area wrapper */}
                  <div className="single-footer-wized">
                    <h3 className="footer-title">Về chúng tôi</h3>
                    <div className="call-area">
                      <div className="icon">
                        <i className="fa-solid fa-phone-rotary" />
                      </div>
                      <div className="info">
                        <span>Hotline</span>
                        <a href="#" className="number">
                          0123456789
                        </a>
                      </div>
                    </div>
                    <div className="opening-hour">
                      <div className="single">
                        <p>
                          Thứ hai - Chủ nhật: <span>8:00am - 9:00pm</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* single footer area wrapper */}

                  <div className="single-footer-wized mid">
                    <h3 className="footer-title">Đối tác</h3>
                    <div className="footer-nav">
                      <ul>
                        <li>
                          <a href="#">Quyền lợi ưu đãi</a>
                        </li>
                        <li>
                          <a href="#">Chính sách bảo mật</a>
                        </li>
                        <li>
                          <a href="#">Điều khoản sử dụng</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="single-footer-wized mid">
                    <h3 className="footer-title">Khách hàng</h3>
                    <div className="footer-nav">
                      <ul>
                        <li>
                          <a href="#">Quyền lợi ưu đãi</a>
                        </li>
                        <li>
                          <a href="#">Chính sách bảo mật</a>
                        </li>
                        <li>
                          <a href="#">Điều khoản sử dụng</a>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* single footer area wrapper */}
                  <div className="single-footer-wized">
                    <h3 className="footer-title">Giải đáp thắc mắc</h3>
                    <div className="footer-nav">
                      <ul>
                        <li>
                          <a href="#">Live Chat</a>
                        </li>
                        <li>
                          <a href="#">FAQ</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  {/* single footer area wrapper */}
                  {/* single footer area wrapper */}
                  <div className="single-footer-wized">
                    <h3 className="footer-title">Nhận thông báo</h3>
                    <p className="disc-news-letter">
                      Đăng ký để nhận thông tin về các ưu đãi mới nhất, sản phẩm
                    </p>
                    <form className="footersubscribe-form" action="#">
                      <input type="email" placeholder="Email" required />
                      <button className="rts-btn btn-primary">Đăng ký</button>
                    </form>
                  </div>
                  {/* single footer area wrapper */}
                </div>
                <div className="social-and-payment-area-wrapper">
                  <div className="social-one-wrapper">
                    <span>Theo dõi chúng tôi:</span>
                    <ul>
                      <li>
                        <a
                          href="https://www.facebook.com/profile.php?id=61581198878054&locale=vi_VN"
                          target="_blank"
                        >
                          <i className="fa-brands fa-facebook-f" />
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <i className="fa-brands fa-instagram" />
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <i className="fa-brands fa-tiktok" />
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div className="payment-access copyright-between-1">
                    <p className="disc">
                      Copyright 2025 <a href="#">©SainGo</a>. All rights
                      reserved.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    </div>
  );
}

export default FooterOne;
