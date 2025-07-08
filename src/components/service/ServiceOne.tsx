import React from 'react';

function LyDoChonEkomart() {
  return (
    <div>
      <>
        {/* Khu vực lý do lựa chọn Ekomart bắt đầu */}
        <div className="rts-service-area rts-section-gap2 bg_light-1">
          <div className="container-3">
            <div className="row">
              <div className="col-lg-12">
                <div className="title-center-area-main">
                  <h2 className="title">Tại Sao Bạn Nên Chọn Ekomart?</h2>
                  <p className="disc">
                    Ekomart mang đến cho bạn trải nghiệm mua sắm tiện lợi, sản phẩm chất lượng, giá cả hợp lý và dịch vụ tận tâm – tất cả trong một nền tảng mua sắm trực tuyến đáng tin cậy.
                  </p>
                </div>
              </div>
            </div>
            <div className="row mt--30 g-5">
              <div className="col-lg-4 col-md-6 col-sm-12 col-12">
                <div className="single-service-area-style-one">
                  <div className="icon-area">
                    <span className="bg-text">01</span>
                    <img src="assets/images/service/01.svg" alt="Dịch vụ thực phẩm hữu cơ" />
                  </div>
                  <div className="bottom-content">
                    <h3 className="title">Thực Phẩm Tươi Sạch Mỗi Ngày</h3>
                    <p className="disc">
                      Rau củ, thịt cá và các sản phẩm được tuyển chọn kỹ lưỡng từ nhà cung cấp uy tín, đảm bảo độ tươi và an toàn.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md-6 col-sm-12 col-12">
                <div className="single-service-area-style-one">
                  <div className="icon-area">
                    <span className="bg-text">02</span>
                    <img src="assets/images/service/02.svg" alt="Giao hàng nhanh chóng" />
                  </div>
                  <div className="bottom-content">
                    <h3 className="title">Giao Hàng Nhanh & Đúng Hẹn</h3>
                    <p className="disc">
                      Hệ thống giao hàng chuyên nghiệp giúp bạn nhận được đơn nhanh chóng, bảo quản tốt, đúng thời gian cam kết.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md-6 col-sm-12 col-12">
                <div className="single-service-area-style-one">
                  <div className="icon-area">
                    <span className="bg-text">03</span>
                    <img src="assets/images/service/03.svg" alt="Hỗ trợ khách hàng" />
                  </div>
                  <div className="bottom-content">
                    <h3 className="title">Hỗ Trợ Khách Hàng Tận Tâm</h3>
                    <p className="disc">
                      Đội ngũ tư vấn luôn sẵn sàng giải đáp mọi thắc mắc và đồng hành cùng bạn trong từng đơn hàng.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Khu vực lý do lựa chọn Ekomart kết thúc */}
      </>
    </div>
  );
}

export default LyDoChonEkomart;
