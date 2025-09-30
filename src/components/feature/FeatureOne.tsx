"use client";
import React from "react";

function FeatureOne() {
    const features = [
        {
            icon: (
                <svg width={48} height={48} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 4C20.5 4 17.5 5.5 15.5 8C13.5 10.5 12.5 13.5 12.5 17C12.5 20.5 13.5 23.5 15.5 26C17.5 28.5 20.5 30 24 30C27.5 30 30.5 28.5 32.5 26C34.5 23.5 35.5 20.5 35.5 17C35.5 13.5 34.5 10.5 32.5 8C30.5 5.5 27.5 4 24 4Z" stroke="#629D23" strokeWidth="2.5" fill="none" />
                    <path d="M12 34C12 32 13 30 15 29C17 28 19.5 27.5 24 27.5C28.5 27.5 31 28 33 29C35 30 36 32 36 34V42C36 43 35 44 34 44H14C13 44 12 43 12 42V34Z" stroke="#629D23" strokeWidth="2.5" fill="none" />
                    <circle cx="24" cy="17" r="2" fill="#629D23" />
                </svg>
            ),
            title: "Tùy chỉnh theo nhu cầu",
            desc: "Thực đơn được cá nhân hóa theo mục tiêu: giảm cân, tăng cơ, ăn sạch hoặc kiểm soát đường huyết. Mỗi suất ăn đều có chi tiết Protein, Carb, Fat và Calo."
        },
        {
            icon: (
                <svg width={48} height={48} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="8" y="12" width="32" height="28" rx="3" stroke="#629D23" strokeWidth="2.5" fill="none" />
                    <path d="M8 18H40" stroke="#629D23" strokeWidth="2.5" />
                    <path d="M16 8V12" stroke="#629D23" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M32 8V12" stroke="#629D23" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="16" cy="26" r="1.5" fill="#629D23" />
                    <circle cx="24" cy="26" r="1.5" fill="#629D23" />
                    <circle cx="32" cy="26" r="1.5" fill="#629D23" />
                    <circle cx="16" cy="33" r="1.5" fill="#629D23" />
                    <circle cx="24" cy="33" r="1.5" fill="#629D23" />
                </svg>
            ),
            title: "Giao hàng theo lịch",
            desc: "Đặt trước suất ăn cho cả tuần, chúng tôi giao đúng giờ mỗi ngày. Bạn chỉ cần hâm nóng và thưởng thức bữa ăn healthy ngay lập tức."
        },
        {
            icon: (
                <svg width={48} height={48} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 24L22 32L34 16" stroke="#629D23" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="24" cy="24" r="18" stroke="#629D23" strokeWidth="2.5" fill="none" />
                </svg>
            ),
            title: "100% nguyên liệu sạch",
            desc: "Thịt, rau củ, gạo lứt được chọn lọc kỹ lưỡng. Không chất bảo quản, không MSG. Đảm bảo an toàn vệ sinh thực phẩm tuyệt đối."
        },
        {
            icon: (
                <svg width={48} height={48} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 8V24L32 28" stroke="#629D23" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="24" cy="24" r="16" stroke="#629D23" strokeWidth="2.5" fill="none" />
                    <path d="M38 14C39.5 16 40.5 18.5 41 21" stroke="#629D23" strokeWidth="2" strokeLinecap="round" />
                    <path d="M10 14C8.5 16 7.5 18.5 7 21" stroke="#629D23" strokeWidth="2" strokeLinecap="round" />
                </svg>
            ),
            title: "Hỗ trợ tư vấn 24/7",
            desc: "Đội ngũ chuyên gia dinh dưỡng sẵn sàng tư vấn thực đơn phù hợp, giải đáp thắc mắc về chế độ ăn và theo dõi tiến độ của bạn."
        }
    ];

    return (
        <div className="rts-feature-area rts-section-gap">
            <div className="container">
                <div className="row g-4">
                    {features.map((f, i) => (
                        <div key={i} className="col-xl-3 col-lg-3 col-md-6 col-sm-6 col-12">
                            <div className="single-feature-area">
                                <div className="icon">{f.icon}</div>
                                <div className="content">
                                    <h4 className="title">{f.title}</h4>
                                    <p>{f.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .single-feature-area {
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    text-align: center !important;
                    padding: 30px 20px !important;
                    background: #fff !important;
                    border-radius: 12px !important;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.06) !important;
                    transition: all 0.3s ease !important;
                    height: 100% !important;
                }
                
                .single-feature-area:hover {
                    transform: translateY(-8px) !important;
                    box-shadow: 0 8px 24px rgba(98, 157, 35, 0.15) !important;
                }
                
                .single-feature-area .icon {
                    width: 72px !important;
                    height: 72px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    background: #f0f7e8 !important;
                    border-radius: 50% !important;
                    margin-bottom: 20px !important;
                    transition: all 0.3s ease !important;
                }
                
                .single-feature-area:hover .icon {
                    background: #629D23 !important;
                }
                
                .single-feature-area:hover .icon svg path,
                .single-feature-area:hover .icon svg circle,
                .single-feature-area:hover .icon svg rect {
                    stroke: #fff !important;
                }
                
                .single-feature-area:hover .icon svg circle[fill],
                .single-feature-area:hover .icon svg path[fill] {
                    fill: #fff !important;
                }
                
                .single-feature-area .content {
                    flex: 1 !important;
                }
                
                .single-feature-area .content .title {
                    font-size: 18px !important;
                    font-weight: 600 !important;
                    color: #2c3e50 !important;
                    margin-bottom: 12px !important;
                    line-height: 1.4 !important;
                }
                
                .single-feature-area .content p {
                    font-size: 14px !important;
                    color: #666 !important;
                    line-height: 1.7 !important;
                    margin: 0 !important;
                }
                
                @media (max-width: 768px) {
                    .single-feature-area {
                        padding: 25px 15px !important;
                    }
                    
                    .single-feature-area .icon {
                        width: 60px !important;
                        height: 60px !important;
                        margin-bottom: 15px !important;
                    }
                    
                    .single-feature-area .icon svg {
                        width: 36px !important;
                        height: 36px !important;
                    }
                    
                    .single-feature-area .content .title {
                        font-size: 16px !important;
                    }
                }
            `}</style>
        </div>
    );
}

export default FeatureOne;