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
                    Chính sách khách hàng
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
        {/* Terms & Condition area start */}
        <div className="rts-pricavy-policy-area rts-section-gap">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="container-privacy-policy">
                  <h1 className="title mb--40">Chính sách khách hàng</h1>
                  <p className="disc">
                    Để đảm bảo quyền lợi tối đa cho khách hàng khi sử dụng nền
                    tảng của chúng tôi, chúng tôi cam kết bảo vệ và tôn trọng
                    quyền riêng tư của bạn. Chính sách này giải thích cách chúng
                    tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn
                    khi bạn đăng ký và sử dụng dịch vụ của chúng tôi. Bên cạnh
                    những quyền lợi mà khách hàng được hưởng, chúng tôi cũng cần
                    yêu cầu các bạn tuân thủ các quy định nhất định. Dưới đây là
                    quyền lợi, nghĩa vụ và trách nhiệm khi bạn tham gia vào nền
                    tảng
                  </p>

                  <div className="section-list mt--40">
                    <h2 className="title">Quyền lợi</h2>
                    <ul>
                      <li>
                        <p>
                          Được lựa chọn món ăn, gói dịch vụ và nhận đầy đủ thông
                          tin về thành phần, dinh dưỡng, giá cả.
                        </p>
                      </li>
                      <li>
                        <p>
                          Được đảm bảo chất lượng món ăn: vệ sinh an toàn thực
                          phẩm, nguyên liệu rõ nguồn gốc.
                        </p>
                      </li>
                      <li>
                        <p>
                          Được quyền khiếu nại, yêu cầu đổi trả nếu sản phẩm
                          không đúng cam kết (hỏng, sai món, thiếu món).
                        </p>
                      </li>
                      <li>
                        <p>
                          Được bảo mật thông tin cá nhân, thông tin thanh toán.
                        </p>
                      </li>
                      <li>
                        <p>Có quyền chấm dứt sử dụng dịch vụ bất kỳ lúc nào.</p>
                      </li>
                    </ul>
                  </div>
                  <div className="section-list mt--40">
                    <h2 className="title">Nghĩa vụ</h2>
                    <ul>
                      <li>
                        <p>Thanh toán đầy đủ và đúng hạn theo đơn hàng.</p>
                      </li>
                      <li>
                        <p>
                          Cung cấp thông tin chính xác (tên, số điện thoại, địa
                          chỉ).
                        </p>
                      </li>
                      <li>
                        <p>
                          Tiếp nhận hàng theo đúng thời gian đã thỏa thuận, hỗ
                          trợ shipper trong việc giao hàng.
                        </p>
                      </li>
                      <li>
                        <p>
                          Không sử dụng dịch vụ vào mục đích vi phạm pháp luật
                          (buôn bán lại trái phép, gian lận thanh toán).
                        </p>
                      </li>
                    </ul>
                  </div>
                  <div className="section-list mt--40">
                    <h2 className="title">Trách nhiệm pháp lý</h2>
                    <ul>
                      <li>
                        <p>
                          Người dùng vi phạm nghĩa vụ thanh toán hoặc cung cấp
                          thông tin sai → chịu trách nhiệm và bồi thường thiệt
                          hại (nếu có).
                        </p>
                      </li>
                      <li>
                        <p>
                          Người dùng có hành vi gian lận, gây rối, vu khống → bị
                          khóa tài khoản, chấm dứt cung cấp dịch vụ, có thể bị
                          khởi kiện.
                        </p>
                      </li>
                    </ul>
                    <p
                      className="disc mt--30"
                      style={{ color: "#616164", fontWeight: 500 }}
                    >
                      Trong bất kỳ trường hợp nào mà các bạn không tuân thủ
                      chúng tôi sẽ không chịu trách nhiệm về bất kỳ thiệt hại
                      hoặc tổn thất nào phát sinh từ việc vi phạm của các bạn.
                      Mong các bạn có thể hiểu và hợp tác để cùng xây dựng một
                      cộng đồng lành mạnh và phát triển. Cảm ơn các bạn đã tin
                      tưởng lựa chọn chúng tôi. Hy vọng sẽ được phục vụ các bạn
                      trong thời gian dài
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Terms & Condition area end */}
      </>

      <ShortService />
      <FooterOne />
    </div>
  );
}
