'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
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

type ModalType = 'one' | 'two' | 'three' | null;

const BlogGridMain: React.FC<BlogGridMainProps> = ({
  Id,
  Slug,
  ProductImage,
  ProductTitle = 'Default Product Title',
  Price = '0',
  BasePrice = '0',
}) => {
  const [productSale, setProductSale] = useState(0);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
  const { addToCompare } = useCompare();

  const handleSalePercentage = (basePrice: string, currentPrice: string) => {
    const base = parseFloat(basePrice);
    const current = parseFloat(currentPrice);
    if (base > 0 && current > 0 && base > current) {
      const sale = ((base - current) / base) * 100;
      return Math.round(sale);
    }
    return 0;
  };

  const handleClose = () => setActiveModal(null);

  const handleIncreaseQuantity = () => setQuantity(prev => prev + 1);
  const handleDecreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setQuantity(value > 0 ? value : 1);
  };

  const handleAdd = async () => {
    try {
      await addToCart({
        productId: Id,
        productVariantId: '', // hoặc null nếu backend chấp nhận
        quantity: quantity,
        unitPrice: parseFloat(Price),
        cartId: '', // nếu cần truyền cartId, nếu không thì backend lấy từ userId
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };


  const handleWishlist = () => {
    addToWishlist({
      id: Id,
      image: ProductImage,
      title: ProductTitle,
      price: parseFloat(Price),
      quantity: 1,
    });
    setWishlisted(true);
    toast.success('Đã thêm vào danh sách yêu thích.');
    setTimeout(() => setWishlisted(false), 3000);
  };

  const handleCompare = () => {
    addToCompare({
      id: Id,
      image: ProductImage,
      name: ProductTitle,
      price: Price,
      description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
      rating: 5,
      ratingCount: 25,
      weight: '500g',
      inStock: true,
    });
  };

  useEffect(() => {
    setProductSale(handleSalePercentage(BasePrice || '0', Price || '0'));
  }, [BasePrice, Price]);

  const formatCurrency = (value: string | number): string =>
    parseFloat(value.toString()).toLocaleString('vi-VN') + '₫';

  return (
    <>
      <div className="image-and-action-area-wrapper">
        <Link href={`/shop/${Slug}`} className="thumbnail-preview">
          {productSale > 0 && (
            <div className="badge">
              <span>
                {productSale}% <br />
                Off
              </span>
              <i className="fa-solid fa-bookmark" />
            </div>
          )}
          <img src={ProductImage} alt="product" />
        </Link>

        <div className="action-share-option">
          <span
            className="single-action openuptip"
            data-flow="up"
            title="Add To Wishlist"
            onClick={handleWishlist}
          >
            <i className="fa-light fa-heart" />
          </span>
          <span
            className="single-action openuptip"
            data-flow="up"
            title="Compare"
            onClick={handleCompare}
          >
            <i className="fa-solid fa-arrows-retweet" />
          </span>
          <span
            className="single-action openuptip"
            data-flow="up"
            title="Quick View"
            onClick={() => setActiveModal('two')}
          >
            <i className="fa-regular fa-eye" />
          </span>
        </div>
      </div>

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

        <div className="cart-counter-action">
          <div className="quantity-edit">
            <div className="input quantity-display">{quantity}</div>
            <div className="button-wrapper-action">
              <button className="button minus" onClick={handleDecreaseQuantity} type="button">
                <i className="fa-regular fa-chevron-down" />
              </button>
              <button className="button plus" onClick={handleIncreaseQuantity} type="button">
                <i className="fa-regular fa-chevron-up" />
              </button>
            </div>
          </div>
          <button
            className="rts-btn btn-primary add-to-card radious-sm with-icon add-to-cart"
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

      <CompareModal show={activeModal === 'one'} handleClose={handleClose} />
      <ProductDetails
        show={activeModal === 'two'}
        handleClose={handleClose}
        productImage={ProductImage}
        productTitle={ProductTitle}
        productPrice={Price}
      />
    </>
  );
};

export default BlogGridMain;
