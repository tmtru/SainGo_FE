'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HeaderOne from '@/components/header/HeaderOne';
import FooterOne from '@/components/footer/FooterOne';
import { useAuth } from '@/components/Context/AuthContext';
import { toast } from 'react-toastify';
import CustomLoader from '@/components/common/CustomLoader';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithEmail, isAuthenticated, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Nếu đã login → redirect
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/');
    }
  }, [authLoading, isAuthenticated, router]);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email không hợp lệ';

    if (!password) newErrors.password = 'Vui lòng nhập mật khẩu';
    else if (password.length < 6) newErrors.password = 'Mật khẩu tối thiểu 6 ký tự';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormLoading(true);
    setFormError('');

    try {
      await loginWithEmail(email, password);
      toast.success('Đăng nhập thành công!');
      router.replace('/');
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Đăng nhập thất bại. Vui lòng thử lại sau.';
      toast.error(message);
      setFormError(message);
    } finally {
      setFormLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (authLoading) return <div className="text-center py-10"><CustomLoader /></div>;

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
                <a className="current" href="/login">Log In</a>
              </div>
            </div>
          </div>
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
                <h3 className="title">Đăng nhập tài khoản</h3>
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
                    {errors.email && <small className="text-danger">{errors.email}</small>}
                  </div>
                  <div className="input-wrapper">
                    <label htmlFor="password">Mật khẩu*</label>
                    <div className="password-input-wrapper" style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ paddingRight: '45px', width: '100%' }}
                      />
                      <span
                        onClick={togglePasswordVisibility}
                        className="password-toggle-btn"
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          cursor: 'pointer',
                          padding: '5px',
                          fontSize: '16px',
                          color: '#666',
                          zIndex: 10,
                          userSelect: 'none',
                          lineHeight: '1'
                        }}
                        title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        <i className={showPassword ? "fa-regular fa-eye-slash" : "fa-regular fa-eye"}></i>
                      </span>
                    </div>
                    {errors.password && <small className="text-danger">{errors.password}</small>}
                  </div>

                  {formError && <div className="text-danger mb-3 d-flex">{formError}</div>}

                  <button
                    type="submit"
                    className="rts-btn btn-primary"
                    disabled={formLoading || authLoading}
                  >
                    {formLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                  </button>

                  <div className="another-way-to-registration mt-4">
                    <div className="registradion-top-text">
                      {/* <span>Hoặc đăng nhập bằng</span> */}
                    </div>
                    {/* <div className="login-with-brand">
                      <a href="#" className="single">
                        <img src="/assets/images/form/google.svg" alt="google" />
                      </a>
                      <a href="#" className="single">
                        <img src="/assets/images/form/facebook.svg" alt="facebook" />
                      </a>
                    </div> */}
                    <p className="mt-3">
                      Chưa có tài khoản? <Link href="/register">Đăng ký</Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FooterOne />
    </div>
  );
}
