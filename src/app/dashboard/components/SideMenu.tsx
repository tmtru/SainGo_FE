"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/Context/AuthContext";
interface MenuItem {
  title: string;
  icon: any;
  children?: { title: string; href: string }[];
  href?: string;
}

const adminMenuItems: MenuItem[] = [
  // {
  //   title: "Dashboard",
  //   icon: "/assets/images-dashboard/icons/01.svg",
  //   children: [
  //     { title: "Main Demo", href: "/dashboard" },
  //     { title: "Coming Soon", href: "#" },
  //   ],
  // },
  {
    title: "Order",
    icon: "/assets/images-dashboard/icons/09.svg",
    href: "/dashboard/order"
  },
  {
    title: "Product",
    icon: "/assets/images-dashboard/icons/02.svg",
    children: [
      { title: "Product List", href: "/dashboard/product-list" },
      { title: "Add Product", href: "/dashboard/add-product" },
    ],
    // children: [{ title: "Add Product", href: "/dashboard/add-product" }],
  },
  // {
  //   title: "Add Product",
  //   icon: "/assets/images-dashboard/icons/03.svg",
  // },
  {
    title: "Categories",
    icon: "/assets/images-dashboard/icons/07.svg",
    href: "/dashboard/manage-category",
  },
  {
    title: "Coupon",
    icon: "/assets/images-dashboard/icons/coupon.svg",
    href: "/dashboard/manage-coupon",
  },
  // {
  //   title: "Transactions",
  //   icon: "/assets/images-dashboard/icons/06.svg",
  //   href: "/dashboard/transaction",
  // },
  {
    title: "Users Management",
    icon: "/assets/images-dashboard/icons/05.svg",
    href: "/dashboard/manage-user",
  },
];

const shipperMenuItems: MenuItem[] = [
  {
    title: "Đơn giao",
    icon: "/assets/images-dashboard/icons/09.svg",
    href: "/dashboard/shipper/orders",
  },
];

const SidebarMenu = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // 0 means Dashboard open by default
  const pathname = usePathname();
  const { user } = useAuth();
  const role = user?.roleName?.toLowerCase();

  const menuItems = useMemo(() => {
    if (role === "shipper") {
      return shipperMenuItems;
    }
    return adminMenuItems;
  }, [role]);

  useEffect(() => {
    // Find the index of the menu item that has a child matching the current path
    const activeIndex = menuItems.findIndex((item) => {
      return item.children?.some((child) => {
        return pathname === child.href || (child.title === "Main Demo" && pathname === "/index");
      });
    });

    if (activeIndex !== -1) {
      setOpenIndex(activeIndex);
    }
  }, [pathname, menuItems]);

  const handleToggle = (index: number) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  return (
    <ul className="rts-side-nav-area-left menu-active-parent">
      {menuItems.map((item, index) => {
        const hasSubmenu = !!item.children?.length;
        const isOpen = openIndex === index;
        const isDirectActive = pathname.includes(item.href || "");
        return (
          <li className="single-menu-item" key={item.href ?? item.title}>
            {hasSubmenu ? (
              <Link
                href="#"
                className={`with-plus`}
                onClick={(e) => {
                  e.preventDefault();
                  handleToggle(index);
                }}
              >
                <img src={item.icon} alt="icon" className="icon" />
                <p>{item.title}</p>
              </Link>
            ) : (

              <Link
                href={item.href || "#"}
                className={isDirectActive ? "active" : ""}
              >
                <img src={item.icon} alt="icon" style={{ maxWidth: '24px', maxHeight: '24px' }} />
                <p>{item.title}</p>
              </Link>
            )}

            {hasSubmenu && (
              <ul className={`submenu mm-collapse parent-nav ${isOpen ? "mm-show" : ""}`}>
                {item.children!.map((sub) => {
                  const isActive = pathname === sub.href || (sub.title === "Main Demo" && pathname === "/index");
                  return (
                    <li key={sub.href}>
                      <Link
                        href={sub.href}
                        className={`mobile-menu-link ${isActive ? "active" : ""}`}
                      >
                        {sub.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default SidebarMenu;