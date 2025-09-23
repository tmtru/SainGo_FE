'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import HeaderOne from '@/components/header/HeaderOne';
import FooterOne from '@/components/footer/FooterOne';
import CustomLoader from '@/components/common/CustomLoader';
import { toast } from 'react-toastify';
import AuthService from '@/data/Services/AuthSerivce';
import { useAuth } from '@/components/Context/AuthContext';

export default function VerifyEmailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { loginWithToken } = useAuth();

    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    // Lấy token và email từ URL params hoặc localStorage
    useEffect(() => {
        const urlToken = searchParams.get('token');
        const urlEmail = searchParams.get('email');

        if (urlToken) {
            setToken(urlToken);
        }

        // Lấy email từ URL hoặc localStorage (email đã đăng ký)
        if (urlEmail) {
            setUserEmail(urlEmail);
        } else {
            const savedEmail = localStorage.getItem('pendingVerificationEmail');
            if (savedEmail) {
                setUserEmail(savedEmail);
            }
        }
    }, [searchParams]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token || token.trim().length < 6) {
            toast.error('Token không hợp lệ hoặc quá ngắn');
            return;
        }

        setLoading(true);
        try {
            const result = await AuthService.verifyEmail(token.trim());

            // Kiểm tra response structure
            if (result.data && result.data.accessToken && result.data.refreshToken) {
                const { accessToken, refreshToken } = result.data;
                await loginWithToken(accessToken, refreshToken);
                toast.success('Xác minh email thành công!');
                router.replace('/');
            } else {
                toast.error('Phản hồi từ server không hợp lệ');
            }
        } catch (err: any) {
            console.error('Verification error:', err);

            // Xử lý các loại lỗi khác nhau
            if (err.response?.status === 400) {
                toast.error('Token không hợp lệ hoặc đã hết hạn');
            } else if (err.response?.status === 404) {
                toast.error('Token không tồn tại');
            } else if (err.response?.status === 409) {
                toast.error('Email đã được xác minh trước đó');
            } else {
                toast.error('Lỗi xác minh. Vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        if (!userEmail) {
            toast.error('Không tìm thấy thông tin email. Vui lòng đăng ký lại.');
            router.push('/register');
            return;
        }

        setResendLoading(true);
        try {
            await AuthService.resendVerificationEmail({ email: userEmail });
            toast.success('Mã xác minh mới đã được gửi đến email của bạn');
        } catch (err: any) {
            console.error('Resend verification error:', err);

            if (err.response?.status === 404) {
                toast.error('Email không tồn tại trong hệ thống');
            } else if (err.response?.status === 409) {
                toast.error('Email đã được xác minh');
            } else {
                toast.error('Lỗi gửi mã xác minh. Vui lòng thử lại.');
            }
        } finally {
            setResendLoading(false);
        }
    };

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
                                <a className="current" href="/verify-email">Xác minh Email</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rts-register-area rts-section-gap bg_light-1">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 offset-lg-3">
                            <div className="registration-wrapper-1 text-center">
                                <h3 className="title">Xác minh Email</h3>
                                <p className="mb-3">
                                    Chúng tôi đã gửi mã xác minh đến email:
                                    <strong className="text-primary"> {userEmail || 'email của bạn'}</strong>
                                </p>
                                <p className="mb-4 text-muted">Vui lòng kiểm tra hộp thư và nhập mã xác minh bên dưới.</p>

                                <form onSubmit={handleVerify} className="registration-form">
                                    <div className="input-wrapper">
                                        <label>Mã xác minh (Token)*</label>
                                        <input
                                            type="text"
                                            value={token}
                                            onChange={(e) => setToken(e.target.value)}
                                            placeholder="Nhập mã xác minh"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="rts-btn btn-primary mt-3"
                                        disabled={loading || !token.trim()}
                                    >
                                        {loading ? <CustomLoader /> : 'Xác minh'}
                                    </button>
                                </form>

                                <div className="mt-4 pt-4 border-top">
                                    <p className="mb-3">Không nhận được mã xác minh?</p>

                                    <button
                                        type="button"
                                        onClick={handleResendVerification}
                                        className="rts-btn btn-secondary"
                                        disabled={resendLoading || !userEmail}
                                    >
                                        {resendLoading ? <CustomLoader /> : 'Gửi lại mã xác minh'}
                                    </button>

                                    <p className="mt-3 text-muted small">
                                        Mã xác minh sẽ được gửi đến: <strong>{userEmail || 'email đã đăng ký'}</strong>
                                    </p>
                                </div>

                                <div className="mt-4">
                                    <p>
                                        Sai email? <a href="/register">Đăng ký lại</a> | <a href="/login">Đăng nhập</a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <FooterOne />
        </div>
    );
}