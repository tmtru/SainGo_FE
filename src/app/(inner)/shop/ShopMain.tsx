'use client';

import React, { useEffect, useState } from 'react';
import { useCart } from '@/components/header/CartContext';
import { useCompare } from '@/components/header/CompareContext';
import { useWishlist } from '@/components/header/WishlistContext';
import Link from 'next/link';
import CompareModal from '@/components/modal/CompareModal';
import ProductDetails from '@/components/modal/ProductDetails';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import WeeklyBestSellingMain from '@/components/product-main/WeeklyBestSellingMain';

interface BlogGridMainProps {
    Id: string;
    Slug: string;
    ProductImage: string;
    ProductTitle?: string;
    Price?: string;
    BasePrice?: string;
    StockAvailable?: number; // Số lượng hàng có sẵn
}

const BlogGridMain: React.FC<BlogGridMainProps> = ({
    Id,
    Slug,
    ProductImage,
    ProductTitle,
    Price,
    BasePrice,
    StockAvailable = 0, // Mặc định là 0 nếu không có giá trị
}) => {
    type ModalType = 'one' | 'two' | 'three' | null;
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [added, setAdded] = useState(false);

    const handleClose = () => setActiveModal(null);

    const { addToCart } = useCart();
    const { addToCompare } = useCompare();
    const { addToWishlist } = useWishlist();

    useEffect(() => {
        const handleQuantityClick = (e: Event) => {
            const button = e.currentTarget as HTMLElement;
            const parent = button.closest('.quantity-edit') as HTMLElement | null;
            if (!parent) return;

            const input = parent.querySelector('.input') as HTMLInputElement | null;
            const addToCart = parent.querySelector('a.add-to-cart') as HTMLElement | null;
            if (!input) return;

            let oldValue = parseInt(input.value || '1', 10);
            let newVal = oldValue;

            if (button.classList.contains('plus')) {
                newVal = oldValue + 1;
            } else if (button.classList.contains('minus')) {
                newVal = oldValue > 1 ? oldValue - 1 : 1;
            }

            input.value = newVal.toString();
            if (addToCart) {
                addToCart.setAttribute('data-quantity', newVal.toString());
            }
        };

        const buttons = document.querySelectorAll('.quantity-edit .button');
        buttons.forEach(button => {
            button.removeEventListener('click', handleQuantityClick);
            button.addEventListener('click', handleQuantityClick);
        });

        return () => {
            buttons.forEach(button => {
                button.removeEventListener('click', handleQuantityClick);
            });
        };
    }, []);

    const handleAdd = async () => {
        try {
            
            await addToCart({
                productId: Id,
                productVariantId: '', // hoặc null nếu không dùng
                quantity: 1,
                unitPrice: parseFloat(Price ?? '0'),
                cartId: '', // hoặc null nếu backend lấy từ user
            });


            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
        } catch (err) {
            console.error(err);
            toast.error('Không thể thêm vào giỏ hàng.');
        }
    };
    

    const handleCompare = () => {
        addToCompare({
            id: Id,
            image: `/assets/images/grocery/${ProductImage}`,
            name: ProductTitle ?? 'Default Product Title',
            price: Price ?? '0',
            description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
            rating: 5,
            ratingCount: 25,
            weight: '500g',
            inStock: true,
        });
        toast('Successfully Add To Compare!');
    };

    const handleWishlist = () => {
        addToWishlist({
            id: Id,
            image: `/assets/images/grocery/${ProductImage}`,
            title: ProductTitle ?? 'Default Product Title',
            price: parseFloat(Price ?? '0'),
            quantity: 1,
        });
        toast('Successfully Add To Wishlist!');
    };

    return (
        <>
            <div className="body-content">
                <WeeklyBestSellingMain
                    Id={Id}
                    Slug={Slug}
                    ProductImage={ProductImage}
                    ProductTitle={ProductTitle}
                    Price={Price}
                    BasePrice={BasePrice}
                    StockAvailable={StockAvailable}
                />
            </div>

            <CompareModal show={activeModal === 'one'} handleClose={handleClose} />
            <ProductDetails
                show={activeModal === 'two'}
                handleClose={handleClose}
                productImage={`/assets/images/grocery/${ProductImage}`}
                productTitle={ProductTitle ?? 'Default Product Title'}
                productPrice={Price ?? '0'}
            />

            <ToastContainer />
        </>
    );
};

export default BlogGridMain;
