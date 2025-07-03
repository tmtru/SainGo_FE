'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import ProductDetails from '@/components/modal/ProductDetails';
import CompareModal from '@/components/modal/CompareModal';
import { useCart } from '@/components/header/CartContext';
import { useWishlist } from '@/components/header/WishlistContext';
import { useCompare } from '@/components/header/CompareContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface BlogGridMainProps {
  Id: string;
  Slug: string;
  ProductImage: string;
  ProductTitle?: string;
  Price?: string;
  BasePrice?: string;
  StockAvailable: number;
}

type ModalType = 'one' | 'two' | 'three' | null;

const BlogGridMain: React.FC<BlogGridMainProps> = ({
  Id,
  Slug,
  ProductImage,
  ProductTitle = 'Default Product Title',
  Price = '0',
  BasePrice = '0',
  StockAvailable,
}) => {
  const [productSale, setProductSale] = useState(0);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
  const { addToCompare } = useCompare();

  const isOutOfStock = StockAvailable <= 0;

  const handleSalePercentage = (basePrice: string, currentPrice: string) => {
    const base = parseFloat(basePrice);
    const current = parseFloat(currentPrice);
    if (base > 0 && current > 0 && base > current) {
      return Math.round(((base - current) / base) * 100);
    }
    return 0;
  };

  const handleAdd = async () => {
    try {
      await addToCart({
        productId: Id,
        productVariantId: '',
        quantity: 1,
        unitPrice: parseFloat(Price),
        cartId: '',
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
      description: 'Mô tả ngắn gọn sản phẩm.',
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
      <div>
      <div className="relative group image-and-action-area-wrapper">
        <Link href={`/shop/${Id}`} className="thumbnail-preview">
          {productSale > 0 && (
            <div className="badge">
              <span>
                {productSale}% <br />
                Off
              </span>
              <i className="fa-solid fa-bookmark" />
            </div>
          )}
          <img
            src={ProductImage}
            alt="product"
            className={isOutOfStock ? 'opacity-60' : ''}
          />
          {isOutOfStock && (
            <div className="sold-out-overlay">
              <div className="overlay-content">Hết hàng</div>
            </div>
          )}

        </Link>
        <div className="action-share-option">
          <span
            className="single-action openuptip"
            title="Add To Wishlist"
            onClick={!isOutOfStock ? handleWishlist : undefined}
            style={{ pointerEvents: isOutOfStock ? 'none' : 'auto', opacity: isOutOfStock ? 0.5 : 1 }}
          >
            <i className="fa-light fa-heart" />
          </span>
          <span
            className="single-action openuptip"
            title="Compare"
            onClick={!isOutOfStock ? handleCompare : undefined}
            style={{ pointerEvents: isOutOfStock ? 'none' : 'auto', opacity: isOutOfStock ? 0.5 : 1 }}
          >
            <i className="fa-solid fa-arrows-retweet" />
          </span>
          <span
            className="single-action openuptip"
            title="Quick View"
            onClick={() => setActiveModal('two')}
          >
            <i className="fa-regular fa-eye" />
          </span>
        </div>

</div>
        <div className="body-content">
          <Link href={`/shop/${Id}`}>
            <h4 className="title">{ProductTitle}</h4>
          </Link>
          <span className="availability">500g Pack</span>
          <div className="price-area">
            <span className="current">{formatCurrency(Price)}</span>
            {productSale > 0 && (
              <div className="previous">{formatCurrency(BasePrice)}</div>
            )}
          </div>
        </div>
      </div>

      <CompareModal show={activeModal === 'one'} handleClose={() => setActiveModal(null)} />
      <ProductDetails
        show={activeModal === 'two'}
        handleClose={() => setActiveModal(null)}
        productImage={ProductImage}
        productTitle={ProductTitle}
        productPrice={Price}
      />
    </>
  );
};

export default BlogGridMain;
