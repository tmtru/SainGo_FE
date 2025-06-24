"use client";

import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import WeeklyBestSellingMain from "@/components/product-main/WeeklyBestSellingMain";
import "swiper/css";
import "swiper/css/navigation";
import ProductService, { Product } from "@/data/Services/ProductService";

const FeatureProduct: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [limit, setLimit] = useState(10); // Giới hạn số lượng sản phẩm hiển thị

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await ProductService.getFeaturedProducts(limit);
                setProducts(res.data);
                console.log("Featured products fetched:", res);
            } catch (error) {
                console.error("Error fetching featured products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [limit]);

    if (loading) return <p>Loading featured products...</p>;

    // Chia sản phẩm thành các nhóm để tạo nhiều slide (tùy logic bạn muốn)
    const groupProducts = (products: Product[], groupSize: number) => {
        const result = [];
        for (let i = 0; i < products.length; i += groupSize) {
            result.push(products.slice(i, i + groupSize));
        }
        return result;
    };

    const productSections = groupProducts(products, 1); // mỗi slide 2 sản phẩm (tuỳ chỉnh)

    return (
        <div className="rts-grocery-feature-area rts-section-gapBottom">
            <div className="container">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="title-area-between">
                            <h2 className="title-left">Featured Grocery</h2>
                            <div className="next-prev-swiper-wrapper">
                                <div className="swiper-button-prev">
                                    <i className="fa-regular fa-chevron-left" />
                                </div>
                                <div className="swiper-button-next">
                                    <i className="fa-regular fa-chevron-right" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="category-area-main-wrapper-one">
                            <Swiper
                                modules={[Navigation, Autoplay]}
                                autoplay={{ delay: 3000, disableOnInteraction: false }}
                                loop={true}
                                navigation={{
                                    nextEl: ".swiper-button-next",
                                    prevEl: ".swiper-button-prev",
                                }}
                                className="mySwiper-category-1"
                                breakpoints={{
                                    0: { slidesPerView: 1, spaceBetween: 30 },
                                    320: { slidesPerView: 2, spaceBetween: 30 },
                                    480: { slidesPerView: 3, spaceBetween: 30 },
                                    640: { slidesPerView: 3, spaceBetween: 30 },
                                    840: { slidesPerView: 4, spaceBetween: 30 },
                                    1140: { slidesPerView: 6, spaceBetween: 30 },
                                }}
                            >
                                {productSections.map((section, idx) => (
                                    <SwiperSlide key={idx}>
                                        {section.map((product) => (
                                            <div key={product.id} className="single-shopping-card-one">
                                                <WeeklyBestSellingMain
                                                    Id={product.id}
                                                    Slug={product.slug}
                                                    ProductImage={"https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Good_Food_Display_-_NCI_Visuals_Online.jpg/1200px-Good_Food_Display_-_NCI_Visuals_Online.jpg"}
                                                    ProductTitle={product.name}
                                                    Price={product.salePrice.toString()}
                                                    BasePrice={product.basePrice.toString()}
                                                    
                                                />
                                            </div>
                                        ))}
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeatureProduct;
