import BannerOne from "@/components/banner/BannerOne";
import FeatureOne from "@/components/feature/FeatureOne";
import HeaderOne from "@/components/header/HeaderOne";
import DiscountProduct from "@/components/product/DiscountProduct";
import FeatureProduct from "@/components/product/FeatureProduct";

import FooterOne from "@/components/footer/FooterOne";
import { CartProvider } from "@/components/header/CartContext";
import { WishlistProvider } from "@/components/header/WishlistContext";
import { ToastContainer, toast } from 'react-toastify';
import SaledProduct from "@/components/product/TrandingProduct";


export default function Home() {
  return (


        <div className="demo-one">
          
        <ToastContainer position="top-right" autoClose={3000} />
          <HeaderOne />
          <BannerOne />
           <FeatureOne />
         <FeatureProduct />
          <DiscountProduct />
          <SaledProduct />
          <FooterOne />
        </div>
  );
}
