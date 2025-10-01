"use client";

import React from "react";
import Image from "next/image";

// Component 1: Nutrition Highlights (Enhanced scientific + modern style)
export function NutritionHighlights() {
    const highlights = [
        {
            icon: "/assets/images/nutrition/protein.png", // Giả định icon đã được đổi thành vector đen trắng hoặc màu tối
            title: "Protein Tinh Khiết",
            desc: "Nguồn đạm chất lượng cao, thiết yếu cho phục hồi cơ bắp, tạo cảm giác no lâu & duy trì năng lượng bền bỉ.",
        },
        {
            icon: "/assets/images/nutrition/fiber.png",
            title: "Chất xơ Dồi Dào",
            desc: "Tối ưu hóa tiêu hóa, nuôi dưỡng hệ vi sinh vật đường ruột và hỗ trợ kiểm soát đường huyết hiệu quả.",
        },
        {
            icon: "/assets/images/nutrition/vitamin.png",
            title: "Vi Chất Toàn Diện",
            desc: "Cung cấp đầy đủ Vitamin & Khoáng chất thiết yếu, giúp tăng cường hệ miễn dịch và cải thiện sức khỏe tổng thể.",
        },
        {
            icon: "/assets/images/nutrition/balance.png",
            title: "Tỷ Lệ Vàng Chuẩn Khoa Học",
            desc: "Công thức dinh dưỡng **Macronutrients cân bằng**, phù hợp với mọi mục tiêu sức khỏe và lứa tuổi.",
        },
    ];

    return (
        <section className="relative bg-white py-28 md:py-40 overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto mb-20">
                    <p className="text-sm font-light text-center text-gray-500 uppercase tracking-[0.3em] mb-4">
                        CORE VALUES
                    </p>
                    <h3 className="text-5xl md:text-7xl font-extrabold text-center text-gray-900 tracking-tighter leading-none">
                        THÀNH PHẦN <span className="text-olive-600">ĐỘC QUYỀN.</span> HIỆU QUẢ CAO.
                    </h3>
                </div>

                {/* Bố cục lưới với viền mỏng */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-b border-gray-200 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
                    {highlights.map((item, idx) => (
                        <div
                            key={idx}
                            className="group relative flex flex-col items-start text-left bg-white p-8 md:p-10 transition-all duration-300 hover:bg-gray-50/50"
                        >
                            {/* Vị trí Icon ở góc trái trên, tạo sự tập trung */}
                            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-olive-500/10 mb-6 transition-all duration-500 group-hover:bg-olive-500/20">
                                <Image
                                    src={item.icon}
                                    alt={item.title}
                                    width={30}
                                    height={30}
                                    className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300" // Icon chuyển màu khi hover
                                />
                            </div>
                            <h4 className="font-extrabold text-2xl text-gray-900 mb-2 tracking-tight">
                                {item.title}
                            </h4>
                            <p className="text-base text-gray-600 leading-relaxed min-h-[4rem] font-light">
                                {item.desc}
                            </p>
                            {/* Detail line on hover */}
                            <div className="absolute top-0 left-0 h-full w-0.5 bg-olive-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Component 2: Why Choose Us (ĐÃ TINH CHỈNH)
export function WhyChooseUs() {
    const reasons = [
        {
            icon: "/assets/images/icons/clean.png",
            title: "Nguyên Liệu Hữu Cơ & Sạch",
            desc: "100% nguồn gốc traceable, đạt chứng nhận an toàn thực phẩm. Nói không với chất bảo quản, đường tinh luyện.", // Nâng cấp mô tả
        },
        {
            icon: "/assets/images/icons/goal.png",
            title: "Thực Đơn Cá Nhân Hóa",
            desc: "Công thức được điều chỉnh bởi chuyên gia, phù hợp tuyệt đối với mục tiêu cụ thể: Giảm cân, Tăng cơ, Bữa ăn Eat Clean.", // Nâng cấp mô tả
        },
        {
            icon: "/assets/images/icons/delivery.png",
            title: "Giao Hàng Siêu Tốc & Tươi",
            desc: "Hệ thống logistics chuyên biệt cho thực phẩm tươi, đảm bảo giao hàng tận nơi trong khung giờ vàng, giữ trọn hương vị.", // Nâng cấp mô tả
        },
        {
            icon: "/assets/images/icons/support.png",
            title: "Đồng Hành Cùng Chuyên Gia",
            desc: "Đội ngũ chuyên gia dinh dưỡng sẵn sàng hỗ trợ, tư vấn và điều chỉnh kế hoạch ăn uống 24/7.", // Nâng cấp mô tả
        },
    ];

    return (
        <section className="relative py-24 md:py-32 bg-green-50/70">
            <div className="container mx-auto px-6">
                <h3 className="text-3xl md:text-5xl font-extrabold text-center mb-5 text-gray-800 tracking-tight">
                    <span className="text-green-600">Sự Khác Biệt</span> Tạo Nên Giá Trị
                </h3>
                <p className="text-center text-lg text-gray-500 mb-16 max-w-2xl mx-auto">
                    Chúng tôi không chỉ cung cấp bữa ăn, chúng tôi mang đến một giải pháp dinh dưỡng toàn diện, tiện lợi và đáng tin cậy.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 xl:gap-10">
                    {reasons.map((item, idx) => (
                        <div
                            key={idx}
                            className="group relative flex flex-col items-center text-center p-8 bg-white rounded-3xl border-t-4 border-green-200 shadow-lg hover:shadow-green-300/60 transition-all duration-500 hover:scale-[1.03] hover:border-green-500"
                        >
                            {/* Icon nổi bật */}
                            <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-green-600 mb-6 shadow-xl">
                                <Image
                                    src={item.icon}
                                    alt={item.title}
                                    width={32}
                                    height={32}
                                    className="object-contain filter invert"
                                />
                            </div>
                            <h4 className="font-bold text-xl text-green-800 mb-3">
                                {item.title}
                            </h4>
                            <p className="text-sm text-gray-500 leading-relaxed min-h-[4rem]">
                                {item.desc}
                            </p>
                            {/* Hover effect - arrow/pointer at the bottom */}
                            <div className="absolute -bottom-3 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
