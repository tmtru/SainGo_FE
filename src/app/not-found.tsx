import HeaderOne from "@/components/header/HeaderOne";
import ShortService from "@/components/service/ShortService";
import FooterOne from "@/components/footer/FooterOne";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="demo-one">
      <HeaderOne />

      <div className="error-area-main-wrapper rts-section-gap2">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="error-main-wrapper">
                <div className="thumbnail">
                  <img src="/assets/images/contact/01.png" alt="Lỗi trang không tồn tại" />
                </div>
                <div className="content-main">
                  <h2 className="title">Trang này không tồn tại</h2>
                  <p>
                    Rất tiếc, chúng tôi không thể tìm thấy trang bạn đang tìm kiếm.
                    Vui lòng quay lại trang chủ để tiếp tục mua sắm.
                  </p>
                  <Link href="/" className="rts-btn btn-primary">
                    Quay về trang chủ
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FooterOne />
    </div>
  );
}
