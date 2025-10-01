"use client";

import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import CategoryService, { Category } from "@/data/Services/CategoryService";

function CategoryBannerBottom() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await CategoryService.getAllCategory();
        setCategories(response.data || []);
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="rts-caregory-area-one nutrition-theme">
      <div className="container">
        <div className="section-title text-center mb--20">
          <h3 className="title">
            Khám phá danh mục <span className="highlight">dinh dưỡng</span>
          </h3>
        </div>
        <div className="row">
          <div className="col-lg-12">
            <div className="category-list-main-wrapper">
              <Swiper
                modules={[Navigation, Autoplay]}
                loop={true}
                speed={1000}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                }}
                breakpoints={{
                  0: { slidesPerView: 2, spaceBetween: 12 },
                  320: { slidesPerView: 2, spaceBetween: 12 },
                  480: { slidesPerView: 4, spaceBetween: 12 },
                  640: { slidesPerView: 6, spaceBetween: 12 },
                  840: { slidesPerView: 7, spaceBetween: 12 },
                  1140: {
                    slidesPerView: 7, spaceBetween: 20
                  },
                }}
              >
                {categories.map((cat) => (
                  <SwiperSlide key={cat.id}>
                    <Link
                      href={`/shop?categoryId=${cat.id}`}
                      className="single-category-one"
                    >
                      <div className="category-image-wrapper">
                        <Image
                          src={cat.iconUrl || "/assets/images/category/default.png"}
                          alt={cat.name}
                          fill
                          sizes="150px"
                          className="category-image"
                        />
                      </div>
                      <p className="category-name">{cat.name}</p>
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .single-category-one {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: flex-start !important;
          text-align: center !important;
          gap: 8px !important;
          text-decoration: none !important;
          padding: 10px !important;
        }

        .category-image-wrapper {
          width: 160px !important;
          height: 100px !important;
          min-height: 100px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border-radius: 8px !important;
          background: #f5f5f5 !important;
          position: relative !important;
          overflow: hidden !important;
        }

        .category-image {
          object-fit: contain !important;
        }

        .category-name {
          margin: 0 !important;
          margin-top: 8px !important;
          word-break: break-word !important;
        }


      `}</style>
    </div>
  );
}

export default CategoryBannerBottom;