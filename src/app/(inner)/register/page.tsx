'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HeaderOne from '@/components/header/HeaderOne';
import FooterOne from '@/components/footer/FooterOne';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import { useAuth } from '@/components/Context/AuthContext';
import CustomLoader from '@/components/common/CustomLoader';
import AuthService, { RegisterPayload } from '@/data/Services/AuthSerivce';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  const [formData, setFormData] = useState<RegisterPayload>({
    userName: '',
    email: '',
    password: '',
    dob: '',
    fullName: '',
    phone: '',
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterPayload | 'confirmPassword', string>>>({});

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/');
    }
  }, [loading, isAuthenticated, router]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.userName) newErrors.userName = 'Vui lòng nhập tên người dùng';
    if (!formData.fullName) newErrors.fullName = 'Vui lòng nhập họ và tên';
    if (!formData.email) newErrors.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ';

    if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu';
    else if (formData.password.length < 6) newErrors.password = 'Mật khẩu tối thiểu 6 ký tự';

    if (!confirmPassword) newErrors.confirmPassword = 'Vui lòng nhập lại mật khẩu';
    else if (formData.password !== confirmPassword) newErrors.confirmPassword = 'Mật khẩu không khớp';

    if (!formData.dob) newErrors.dob = 'Vui lòng nhập ngày sinh';
    if (!formData.phone) newErrors.phone = 'Vui lòng nhập số điện thoại';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormLoading(true);
    try {
      await AuthService.register(formData);
      toast.success('Đăng ký thành công. Vui lòng kiểm tra email để xác minh!');
      // Lưu email để dùng cho verification
      localStorage.setItem('pendingVerificationEmail', formData.email);
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      router.push('/registerToken');
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      const msg = err.response?.data?.message || 'Đăng ký thất bại';
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (loading) return <div className="text-center py-10"><CustomLoader /></div>;

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
                <a className="current" href="/register">Register</a>
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
                <h3 className="title">Đăng ký tài khoản</h3>
                <form onSubmit={handleRegister} className="registration-form">
                  <div className="input-wrapper">
                    <label>Tên người dùng*</label>
                    <input name="userName" value={formData.userName} onChange={handleChange} />
                    {errors.userName && <small className="text-danger">{errors.userName}</small>}
                  </div>

                  <div className="input-wrapper">
                    <label>Họ và tên*</label>
                    <input name="fullName" value={formData.fullName} onChange={handleChange} />
                    {errors.fullName && <small className="text-danger">{errors.fullName}</small>}
                  </div>

                  <div className="input-wrapper">
                    <label>Email*</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} />
                    {errors.email && <small className="text-danger">{errors.email}</small>}
                  </div>

                  <div className="input-wrapper">
                    <label>Mật khẩu*</label>
                    <div className="password-input-wrapper" style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
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

                  <div className="input-wrapper">
                    <label>Nhập lại mật khẩu*</label>
                    <div className="password-input-wrapper" style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={{ paddingRight: '45px', width: '100%' }}
                      />
                      <span
                        onClick={toggleConfirmPasswordVisibility}
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
                        title={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        <i className={showConfirmPassword ? "fa-regular fa-eye-slash" : "fa-regular fa-eye"}></i>
                      </span>
                    </div>
                    {errors.confirmPassword && <small className="text-danger">{errors.confirmPassword}</small>}
                  </div>

                  <div className="input-wrapper">
                    <label>Ngày sinh*</label>
                    <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
                    {errors.dob && <small className="text-danger">{errors.dob}</small>}
                  </div>

                  <div className="input-wrapper">
                    <label>Số điện thoại*</label>
                    <input name="phone" value={formData.phone} onChange={handleChange} />
                    {errors.phone && <small className="text-danger">{errors.phone}</small>}
                  </div>

                  <button type="submit" className="rts-btn btn-primary" disabled={formLoading}>
                    {formLoading ? 'Đang đăng ký...' : 'Đăng ký'}
                  </button>

                  <div className="another-way-to-registration mt-4">
                    <p>Đã có tài khoản? <Link href="/login">Đăng nhập</Link></p>
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