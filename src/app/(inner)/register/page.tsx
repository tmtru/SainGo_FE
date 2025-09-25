
import HeaderOne from "@/components/header/HeaderOne";
import ShortService from "@/components/service/ShortService";

import FooterOne from "@/components/footer/FooterOne";

export default function Home() {
  return (
    <div className="demo-one">
      <HeaderOne />


      <>
        <div className="rts-navigation-area-breadcrumb bg_light-1">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="navigator-breadcrumb-wrapper">
                  <a href="index.html">Trang chủ</a>
                  <i className="fa-regular fa-chevron-right" />
                  <a className="current" href="register.html">
                    Đăng ký
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="section-seperator bg_light-1">
          <div className="container">
            <hr className="section-seperator" />
          </div>
        </div>
        {/* rts register area start */}
        <div className="rts-register-area rts-section-gap bg_light-1">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="registration-wrapper-1">
                  <div className="logo-area mb--0">
                    <img
                      className="mb--10"
                      src="assets/images/logo/fav.png"
                      alt="logo"
                    />
                  </div>
                  <h3 className="title">Đăng ký tài khoản</h3>
                  <form action="#" className="registration-form">
                    <div className="input-wrapper">
                      <label htmlFor="name">Username*</label>
                      <input type="text" id="name" />
                    </div>
                    <div className="input-wrapper">
                      <label htmlFor="email">Email*</label>
                      <input type="email" id="email" />
                    </div>
                    <div className="input-wrapper">
                      <label htmlFor="password">Mật khẩu*</label>
                      <input type="password" id="password" />
                    </div>
                     <div className="input-wrapper">
                      <label htmlFor="password">Nhập lại mật khẩu*</label>
                      <input type="password" id="password" />
                    </div>
                    <button className="rts-btn btn-primary">Đăng ký tài khoản</button>
                    <div className="another-way-to-registration">
                      
                      <p>
                        Đã có tài khoản? <a href="/login">Đăng nhập ngay</a>
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* rts register area end */}
      </>




      <ShortService />
      <FooterOne />

    </div>
  );
}
