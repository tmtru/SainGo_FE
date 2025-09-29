import HeaderOne from "@/components/header/HeaderOne";
import AboutBanner from "@/components/banner/AboutBanner";
import CounterOne from "@/components/counterup/CounterOne";
import AboutOne from "@/components/about/AboutOne";
import Team from "@/components/about/Team";
import ServiceOne from "@/components/service/ServiceOne";
import TestimonilsOne from "@/components/testimonials/TestimonilsOne";
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
                    Chính sách đầu bếp
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
        {/* Cookies Policy area start */}
        <div className="rts-pricavy-policy-area rts-section-gap">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="container-privacy-policy">
                  <h1 className="title mb--40"> Chính sách đầu bếp</h1>
                  <p className="disc">
                    Để đảm bảo quyền lợi tối đa cho các đầu bếp khi tham gia vào
                    nền tảng của chúng tôi, chúng tôi cam kết bảo vệ và tôn
                    trọng quyền riêng tư của bạn. Chính sách này giải thích cách
                    chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của
                    bạn khi bạn đăng ký và sử dụng dịch vụ của chúng tôi. Bên
                    cạnh đó chúng tôi cũng cần yêu cần các bạn tuân thủ các quy
                    định nhất định. Dưới đây là quyền lợi, nghĩa vụ và trách
                    nhiệm khi bạn tham gia vào nền tảng của chúng tôi. Vui lòng
                    đọc kỹ và tuân thủ. Mọi sai phạm sẽ bị xử lý nghiêm
                  </p>

                  <div className="section-list mt--40">
                    <h2 className="title">Quyền lợi</h2>
                    <ul>
                      <li>
                        <p>
                          Được ký hợp đồng lao động/hợp tác với doanh nghiệp,
                          hưởng thu nhập theo thỏa thuận (lương, % doanh thu
                          hoặc theo ca).
                        </p>
                      </li>
                      <li>
                        <p>
                          Được đào tạo định kỳ về an toàn thực phẩm, kỹ năng chế
                          biến món ăn healthy.
                        </p>
                      </li>
                      <li>
                        <p>
                          Được cấp đồng phục, công cụ, nguyên liệu rõ nguồn gốc
                          để chế biến.
                        </p>
                      </li>
                      <li>
                        <p>
                          Được bảo đảm quyền lợi về bảo hiểm, nghỉ phép theo quy
                          định pháp luật (nếu là nhân viên chính thức).
                        </p>
                      </li>
                    </ul>
                  </div>
                  <div className="section-list mt--40">
                    <h2 className="title">Nghĩa vụ</h2>
                    <ul>
                      <li>
                        <p>
                          Tuân thủ nghiêm ngặt quy định về An toàn vệ sinh thực
                          phẩm (Thông tư 48/2015/TT-BYT, Luật An toàn thực phẩm
                          VN).
                        </p>
                      </li>
                      <li>
                        <p>
                          Chế biến đúng công thức, định lượng và thực đơn đã ban
                          hành, không tự ý thay đổi nguyên liệu.
                        </p>
                      </li>
                      <li>
                        <p>
                          Giữ bí mật công thức, dữ liệu kinh doanh, thông tin
                          khách hàng.
                        </p>
                      </li>
                      <li>
                        <p>
                          Giữ gìn trang phục, tác phong chuyên nghiệp, thái độ
                          tích cực.
                        </p>
                      </li>
                      <li>
                        <p>
                          Báo cáo ngay khi phát hiện nguyên liệu kém chất lượng
                          hoặc sự cố an toàn thực phẩm.
                        </p>
                      </li>
                    </ul>
                  </div>
                  <div className="section-list mt--40">
                    <h2 className="title">Trách nhiệm pháp lý</h2>
                    <ul>
                      <li>
                        <p>
                          Nếu đầu bếp cố ý/thiếu trách nhiệm gây ra ngộ độc thực
                          phẩm, thiệt hại về sức khỏe hoặc tài sản cho khách →
                          phải bồi thường và có thể bị xử lý hình sự theo Luật
                          ATTP 2010.
                        </p>
                      </li>
                      <li>
                        <p>
                          Nếu tiết lộ bí mật kinh doanh hoặc hợp tác trái phép
                          với đối thủ → bị chấm dứt hợp đồng, bồi thường thiệt
                          hại.
                        </p>
                      </li>
                      <li>
                        <p>
                          Nếu vi phạm hợp đồng lao động (nghỉ ngang, phá hoại,
                          không tuân thủ quy trình) → xử lý kỷ luật và có thể bị
                          kiện theo Bộ luật Lao động 2019.
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Cookies Policy area end */}
      </>

      <ShortService />
      <FooterOne />
    </div>
  );
}
