"use client";

import React, { useEffect, useState } from "react";
import WeeklyBestSellingMain from "@/components/product-main/WeeklyBestSellingMain";
import ProductService, { Product } from "@/data/Services/ProductService";
import CustomLoader from "../common/CustomLoader";

const SaledProduct: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [limit, setLimit] = useState(12); // Giới hạn số lượng sản phẩm hiển thị

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await ProductService.getSaledProducts(limit);
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

    if (loading) return <CustomLoader />;

    return (
        <div className="rts-grocery-feature-area rts-section-gapBottom">
            <div className="container">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="title-area-between">
                            <h2 className="title-left">Món ăn đang được ưu đãi</h2>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="category-area-main-wrapper-one">
                            <div className="row g-3">
                                {products.map((product) => (
                                    <div
                                        key={product.id}
                                        className="col-6 col-sm-6 col-md-4 col-lg-3 col-xl-2"
                                    >
                                        <div className="single-shopping-card-one">
                                            <WeeklyBestSellingMain
                                                Id={product.id}
                                                Slug={product.slug}
                                                ProductImage={product.thumbnailUrl}
                                                ProductTitle={product.name}
                                                Price={product.salePrice.toString()}
                                                BasePrice={product.basePrice.toString()}
                                                StockAvailable={product.stockQuantity}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SaledProduct;