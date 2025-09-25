import HeaderOne from "@/components/header/HeaderOne";
import ShortService from "@/components/service/ShortService";
import FooterOne from "@/components/footer/FooterOne";

export default function Home() {
  return (
    <div className="demo-one">
      <HeaderOne />

      <>
        {/* rts contact main wrapper */}
        <div className="rts-contact-main-wrapper-banner bg_image">
          <div className="container">
            <div className="row">
              <div className="co-lg-12">
                <div className="contact-banner-content">
                  <h1 className="title">Liên hệ hỗ trợ</h1>
                  <p className="disc">
                    Nếu như bạn có khó khăn hay bất cứ điều gì muốn đóng góp cho
                    chúng tôi thì có thể liên hệ với chúng tôi. Chúng tôi rất
                    vui khi được lắng nghe và hỗ trợ các bạn...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* rts contact main wrapper end */}

        <div className="rts-map-contact-area rts-section-gap2">
          <div className="container">
            <div className="row">
              <div className="col-lg-4">
                <div className="contact-left-area-main-wrapper">
                  <h2 className="title">Địa điểm </h2>
                  <p className="disc">
                    Bạn có thể liên hệ trực tiếp với chúng tôi qua địa điểm bên
                    dưới
                  </p>
                  <div className="location-single-card">
                    <div className="icon">
                      <i className="fa-light fa-location-dot" />
                    </div>
                    <div className="information">
                      <h3 className="title">Đại học FPT</h3>
                      <p>Khu công nghệ cao Hòa Lạc.</p>
                      <a href="#" className="number">
                        0123456789
                      </a>
                      <a href="#" className="email">
                        SainGo@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-8 pl--50 pl_sm--5 pl_md--5">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.5062169040593!2d105.52271427596939!3d21.012421688338158!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135abc60e7d3f19%3A0x2be9d7d0b5abcbf4!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBGUFQgSMOgIE7hu5lp!5e0!3m2!1svi!2s!4v1758700514958!5m2!1svi!2s"
                  width="600"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
        {/* rts contact-form area start */}
        <div className="rts-contact-form-area rts-section-gapBottom">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="bg_light-1 contact-form-wrapper-bg">
                  <div className="row">
                    <div className="col-lg-7 pr--30 pr_md--10 pr_sm--5">
                      <div className="contact-form-wrapper-1">
                        <h3 className="title mb--50">
                          Vấn đề của bạn là gì? Hãy cho chúng tôi biết
                        </h3>
                        <form action="#" className="contact-form-1">
                          <div className="contact-form-wrapper--half-area">
                            <div className="single">
                              <input type="text" placeholder="Họ tên*" />
                            </div>
                            <div className="single">
                              <input type="text" placeholder="Email*" />
                            </div>
                          </div>
                          <div className="single-select">
                            <select>
                              <option data-display="Subject*">
                                Bạn gặp vấn đề về mảng gì?
                              </option>
                              <option value={1}>Công nghệ khi sử dụng phần mềm</option>
                              <option value={2}>Khó khăn trong việc sử dụng món ăn</option>
                              <option value={3}>Đóng góp cho hệ thống</option>
                            </select>
                          </div>
                          <textarea
                            name="message"
                            placeholder="Vui lòng mô tả chi tiết vấn đề của bạn..."
                            defaultValue={""}
                          />
                          <button className="rts-btn btn-primary mt--20">
                            Gửi phản hồi
                          </button>
                        </form>
                      </div>
                    </div>
                    <div className="col-lg-5 mt_md--30 mt_sm--30">
                      <div className="thumbnail-area">
                        <img
                          src="assets/images/contact/02.jpg"
                          alt="contact_form"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* rts contact-form area end */}
      </>

      <ShortService />
      <FooterOne />
    </div>
  );
}
