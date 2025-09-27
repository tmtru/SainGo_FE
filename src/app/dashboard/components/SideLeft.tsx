// components/SideLeft.tsx
"use client";
import Image from 'next/image';
import SideMenu from "./SideMenu";

interface SideLeftProps {
  collapsed: boolean;
}

function SideLeft({ collapsed }: SideLeftProps) {
  return (
    <div className={`sidebar_left ${collapsed ? 'collapsed' : ''}`}>
      <a href="/" className="logo">
        <Image
          src="/assets/images/logo/logo-01.png"
          alt="logo"
          width={131}
          height={32}
        />
      </a>
      <SideMenu />
    </div>
  );
}

export default SideLeft;