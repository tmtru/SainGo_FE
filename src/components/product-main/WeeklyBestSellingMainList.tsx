'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductDetails from '@/components/modal/ProductDetails';
import CompareModal from '@/components/modal/CompareModal';
import { useCart } from '@/components/header/CartContext';
import { useWishlist } from '@/components/header/WishlistContext';
import { useCompare } from '@/components/header/CompareContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface BlogGridMainProps {
    Id: string;
    Slug: string;
    ProductImage: string;
    ProductTitle?: string;
    Price?: string;
    BasePrice?: string;
}

const BlogGridMain: React.FC<BlogGridMainProps> = ({
    Id,
    Slug,
    ProductImage,
    ProductTitle = 'Default Product Title',
    Price = '0',
    BasePrice = '0',
}) => {
    const [productSale, setProductSale] = useState(0);
    const [activeModal, setActiveModal] = useState<'one' | 'two' | 'three' | null>(null);
    const [added, setAdded] = useState(false);
    const [wishlisted, setWishlisted] = useState(false);
    const [quantity, setQuantity] = useState(1);

    const { addToCart } = useCart();
    const { addToWishlist } = useWishlist();
    const { addToCompare } = useCompare();

    useEffect(() => {
        const base = parseFloat(BasePrice);
        const current = parseFloat(Price);
        if (base > current && base > 0) {
            const sale = ((base - current) / base) * 100;
            setProductSale(Math.round(sale));
        }
    }, [BasePrice, Price]);

    const formatCurrency = (value: string | number) =>
        parseFloat(value.toString()).toLocaleString('vi-VN') + '₫';

    const handleAdd = async () => {
        try {
            await addToCart({
                productId: Id,
                productVariantId: '',
                quantity: quantity,
                unitPrice: parseFloat(Price),
                cartId: '', // hoặc backend tự lấy theo userId
            });
            setAdded(true);
          
            setTimeout(() => setAdded(false), 3000);
        } catch (err) {
            console.error(err);
            toast.error('Không thể thêm vào giỏ hàng.');
        }
    };

    const handleWishlist = () => {
        addToWishlist({
            id: Date.now(),
            image: ProductImage,
            title: ProductTitle,
            price: parseFloat(Price),
            quantity: 1,
        });
        setWishlisted(true);
        setTimeout(() => setWishlisted(false), 3000);
    };

    const handleCompare = () => {
        addToCompare({
            image: ProductImage,
            name: ProductTitle,
            price: Price,
            description: 'Lorem Ipsum is simply dummy text.',
            rating: 5,
            ratingCount: 25,
            weight: '500g',
            inStock: true,
        });
    };

    return (
        <>
            {/* Hình ảnh & các hành động */}
            <div className="image-and-action-area-wrapper">
                <Link href={`/shop/${Slug}`} className="thumbnail-preview">
                    {productSale > 0 && (
                        <div className="badge">
                            <span>{productSale}% <br />Off</span>
                            <i className="fa-solid fa-bookmark" />
                        </div>
                    )}
                    <img src={ProductImage} alt="product" />
                </Link>

                <div className="action-share-option">
                    <span className="single-action" title="Add To Wishlist" onClick={handleWishlist}>
                        <i className="fa-light fa-heart" />
                    </span>
                    <span className="single-action" title="Compare" onClick={handleCompare}>
                        <i className="fa-solid fa-arrows-retweet" />
                    </span>
                    <span className="single-action" title="Quick View" onClick={() => setActiveModal('two')}>
                        <i className="fa-regular fa-eye" />
                    </span>
                </div>
            </div>

            {/* Nội dung sản phẩm */}
            <div className="body-content">
                <Link href={`/shop/${Slug}`}>
                    <h4 className="title">{ProductTitle}</h4>
                </Link>
                <span className="availability">500g Pack</span>
                <div className="price-area">
                    <span className="current">{formatCurrency(Price)}</span>
                    {productSale > 0 && (
                        <div className="previous">{formatCurrency(BasePrice)}</div>
                    )}
                </div>

                {/* Thêm vào giỏ hàng */}
                <div className="cart-counter-action">
                    <div className="quantity-edit">
                        <div className="input quantity-display">{quantity}</div>
                        <div className="button-wrapper-action">
                            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                                <i className="fa-regular fa-chevron-down" />
                            </button>
                            <button onClick={() => setQuantity((q) => q + 1)}>
                                <i className="fa-regular fa-chevron-up" />
                            </button>
                        </div>
                    </div>
                    <button
                        className="rts-btn btn-primary radious-sm with-icon"
                        onClick={handleAdd}
                        type="button"
                    >
                        <div className="btn-text">{added ? 'Đã thêm' : 'Thêm'}</div>
                        <div className="arrow-icon">
                            <i className={added ? 'fa-solid fa-check' : 'fa-regular fa-cart-shopping'} />
                        </div>
                    </button>
                </div>
            </div>

            {/* Modal và Toast */}
            <CompareModal show={activeModal === 'one'} handleClose={() => setActiveModal(null)} />
            <ProductDetails
                show={activeModal === 'two'}
                handleClose={() => setActiveModal(null)}
                productImage={ProductImage}
                productTitle={ProductTitle}
                productPrice={Price}
            />
            <ToastContainer />
        </>
    );
};

export default BlogGridMain;
