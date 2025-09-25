"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

function NavItem() {
  return (
    <div>
      <nav>
        <ul className="parent-nav">
          <li className="parent has-dropdown">
            <Link className="" href="/">
              Trang chủ
            </Link>
          </li>
          <li className="parent">
            <a href="/about">Giới thiệu</a>
          </li>
          <li className="parent with-megamenu">
            <a href="/shop">Các món ăn</a>
          </li>
          <li className="parent has-dropdown">
            <a className="nav-link" href="/vendor-list">
              Đối tác
            </a>
          </li>
          <li className="parent has-dropdown">
            <a className="nav-link" href="#">
              Chính sách &amp; Điều khoản
            </a>
            <ul className="submenu">
              <li>
                <a className="sub-b" href="/cookies-policy">
                  Chính sách đầu bếp
                </a>
              </li>
              <li>
                <a className="sub-b" href="/terms-condition">
                  Chính sách khách hàng
                </a>
              </li>
            </ul>
          </li>
          <li className="parent has-dropdown">
            <a className="nav-link" href="/blog">
              Blog
            </a>
          </li>
          <li className="parent">
            <a href="/contact">Liên hệ</a>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default NavItem;
