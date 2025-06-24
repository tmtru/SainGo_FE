// 'use client';

// import React, { useState, useEffect } from 'react';
// import Link from 'next/link';
// import Image from 'next/image';
// import { useCart } from '@/components/header/CartContext';

// interface BlogGridMainProps {
//   Slug: string;
//   ProductImage: string;
//   ProductTitle?: string;
//   Price?: string;
//   BasePrice?: string;
// }

// const BlogGridMain: React.FC<BlogGridMainProps> = ({
//   Slug,
//   ProductImage,
//   ProductTitle = 'Sản phẩm mặc định',
//   Price = '0',
//   BasePrice = '0',
// }) => {
//   const [quantity, setQuantity] = useState<number>(1);
//   const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
//   const [productSale, setProductSale] = useState<number>(0);

//   const { addToCart } = useCart();

//   useEffect(() => {
//     // Kiểm tra token trong localStorage (hoặc cookie nếu bạn dùng cookie)
//     const token = localStorage.getItem('token');
//     setIsLoggedIn(!!token);
//   }, []);

//   useEffect(() => {
//     const base = parseFloat(BasePrice);
//     const current = parseFloat(Price);
//     if (base > 0 && current > 0 && current < base) {
//       const sale = ((base - current) / base) * 100;
//       setProductSale(Math.round(sale));
//     } else {
//       setProductSale(0);
//     }
//   }, [BasePrice, Price]);

//   const handleAdd = () => {
//     const item = {
//       id: Date.now(),
//       image: `/assets/images/grocery/${ProductImage}`,
//       title: ProductTitle,
//       price: parseFloat(Price),
//       quantity: quantity,
//       active: true,
//     };

//     if (isLoggedIn) {
//       // ✅ Đã đăng nhập → lưu lên server
//       addToCart(item);
//     } else {
//       // ❌ Chưa đăng nhập → lưu vào localStorage
//       const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
//       guestCart.push(item);
//       localStorage.setItem('guestCart', JSON.stringify(guestCart));
//     }
//   };

//   return (
//     <div className="single-shopping-card-one discount-offer">
//       <Link href={`/shop/${Slug}`} className="thumbnail-preview">
//         {productSale > 0 && (
//           <div className="badge">
//             <span>
//               {productSale}% <br />
//               Off
//             </span>
//             <i className="fa-solid fa-bookmark" />
//           </div>
//         )}
//         <Image
//           src={`/assets/images/grocery/${ProductImage}`}
//           alt={ProductTitle}
//           width={300}
//           height={300}
//         />
//       </Link>

//       <div className="body-content">
//         <div className="title-area-left">
//           <Link href={`/shop/${Slug}`}>
//             <h4 className="title">{ProductTitle}</h4>
//           </Link>
//           <span className="availability">500g Pack</span>
//           <div className="price-area">
//             <span className="current">đ{Price}</span>
//             {productSale > 0 && (
//               <div className="previous">đ{BasePrice}</div>
//             )}
//           </div>

//           <div className="cart-counter-action">
//             <div className="quantity-edit">
//               <input
//                 type="number"
//                 className="input"
//                 value={quantity}
//                 onChange={(e) =>
//                   setQuantity(Math.max(1, Number(e.target.value)))
//                 }
//               />
//               <div className="button-wrapper-action">
//                 <button
//                   className="button minus"
//                   onClick={() => setQuantity((q) => Math.max(1, q - 1))}
//                 >
//                   <i className="fa-regular fa-chevron-down" />
//                 </button>
//                 <button
//                   className="button plus"
//                   onClick={() => setQuantity((q) => q + 1)}
//                 >
//                   <i className="fa-regular fa-chevron-up" />
//                 </button>
//               </div>
//             </div>

//             <button
//               className="rts-btn btn-primary radious-sm with-icon"
//               onClick={handleAdd}
//             >
//               <div className="btn-text">Add To Cart</div>
//               <div className="arrow-icon">
//                 <i className="fa-regular fa-cart-shopping" />
//               </div>
//             </button>
//           </div>
//         </div>

//         <div className="natural-value">
//           <h6 className="title">Nutritional Values</h6>
//           {[
//             'Energy(kcal)',
//             'Protein(g)',
//             'Magnesium(mg)',
//             'Calories(kcal)',
//             'Vitamin(kcal)',
//           ].map((label, index) => (
//             <div className="single" key={index}>
//               <span>{label}:</span>
//               <span>211</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BlogGridMain;
