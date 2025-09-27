// layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../../public/assets/css/bootstrap.min.css";
import "../../public/assets/css/plugins.css";
import "../../public/assets/css/style.css";

import { CartProvider } from "../components/header/CartContext";
import { WishlistProvider } from "../components/header/WishlistContext";
import { CompareProvider } from "../components/header/CompareContext";
import { ToastContainer } from 'react-toastify';
import { GoogleOAuthProvider } from "@react-oauth/google";
import 'react-toastify/dist/ReactToastify.css';
import { Suspense } from "react";
import { AuthProvider } from "@/components/Context/AuthContext";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SainGo",
  description: "Fast and convention but healthy",
  icons: {
    icon: [
      {
        url: "/assets/images/fav.png",
        type: "image/x-icon",
      },
    ],
  },
};
const CLIENT_ID = "673047498819-mc0couvc6kb1omtiet793s5paps0r27u.apps.googleusercontent.com";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <Suspense>

          <AuthProvider>
            <GoogleOAuthProvider clientId={CLIENT_ID}>
            <CompareProvider>
              <WishlistProvider>
                <CartProvider>
                  {children}
                  <ToastContainer position="top-right" autoClose={3000} />
                </CartProvider>
              </WishlistProvider>
            </CompareProvider>
          </GoogleOAuthProvider>
        </AuthProvider>
      </Suspense>
    </body>
    </html >
  );
}
