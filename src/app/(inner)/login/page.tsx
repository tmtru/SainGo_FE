"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HeaderOne from "@/components/header/HeaderOne";
import ShortService from "@/components/service/ShortService";
import FooterOne from "@/components/footer/FooterOne";
import { AxiosError } from "axios";
import { useAuth } from "@/components/Context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithEmail, isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      await loginWithEmail(email, password); // Use context's login function
      router.push("/"); // Redirect after successful login
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      const errorMessage = err.response?.data?.message || "Đăng nhập thất bại";
      console.error("Login error:", error);
      // Toast is handled by AuthContext's login function
    } finally {
      setFormLoading(false);
    }
  };

  if (authLoading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="demo-one">
      <HeaderOne />

      <div className="rts-navigation-area-breadcrumb bg_light-1">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="navigator-breadcrumb-wrapper">
                <a href="/">Home</a>
                <i className="fa-regular fa-chevron-right" />
                <a className="current" href="/login">
                  Log In
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-seperator bg_light-1">
        <div className="container">
          <hr className="section-seperator" />
        </div>
      </div>

      <div className="rts-register-area rts-section-gap bg_light-1">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="registration-wrapper-1">
                <div className="logo-area mb--0">
                  <img className="mb--10" src="/assets/images/logo/fav.png" alt="logo" />
                </div>
                <h3 className="title">Login Into Your Account</h3>
                <form onSubmit={handleLogin} className="registration-form">
                  <div className="input-wrapper">
                    <label htmlFor="email">Email*</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-wrapper">
                    <label htmlFor="password">Password*</label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="rts-btn btn-primary"
                    disabled={formLoading || authLoading}
                  >
                    {formLoading ? "Logging in..." : "Login Account"}
                  </button>
                  <div className="another-way-to-registration">
                    <div className="registradion-top-text">
                      <span>Or Register With</span>
                    </div>
                    <div className="login-with-brand">
                      {/* Placeholder for social login - implement or remove */}
                      <a href="#" className="single">
                        <img src="/assets/images/form/google.svg" alt="login" />
                      </a>
                      <a href="#" className="single">
                        <img src="/assets/images/form/facebook.svg" alt="login" />
                      </a>
                    </div>
                    <p>
                      Don't have an account? <a href="/register">Register</a>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ShortService />
      <FooterOne />
    </div>
  );
}