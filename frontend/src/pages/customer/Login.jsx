import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/api';
import loginBanner from '../../assets/images/login.jpg';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password || (!isLogin && !formData.fullName)) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    try {
      if (isForgotPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setError('Mật khẩu nhập lại không khớp');
          setLoading(false);
          return;
        }
        const res = await authApi.resetPassword({ 
          email: formData.email, 
          newPassword: formData.newPassword 
        });
        setMessage(res.data.message);
        setTimeout(() => setIsForgotPassword(false), 2000);
      } else if (isLogin) {
        const res = await authApi.login({ email: formData.email, password: formData.password });
        // Lưu cả token lẫn thông tin user vào localStorage
        const userData = { ...res.data.user, token: res.data.token };
        localStorage.setItem('user', JSON.stringify(userData));
        window.dispatchEvent(new Event('authChange'));
        navigate('/');
      } else {
        const res = await authApi.register(formData);
        alert(res.data.message);
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-slate-900 rounded-[48px] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800">
        
        <div className="hidden lg:block relative p-16 overflow-hidden">
            <div className="absolute inset-0 z-0">
               <img 
                 src={loginBanner} 
                 alt="Login Banner" 
                 className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-transparent"></div>
            </div>
           
           <div className="relative z-10 h-full flex flex-col justify-between text-white">
              <div className="space-y-4">
                 <div className="size-16 rounded-[24px] bg-white/10 backdrop-blur-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-primary">spa</span>
                 </div>
                 <h2 className="text-4xl font-black tracking-tighter leading-tight mt-12">
                   Bắt đầu hành trình <br /> <span className="text-primary italic">Thưởng Trà</span> cùng chúng tôi.
                 </h2>
                 <p className="text-slate-400 font-medium leading-relaxed max-w-sm">
                   Trở thành hội viên để nhận ưu đãi đặc biệt và lưu lại những hương vị bạn yêu thích.
                 </p>
              </div>

              <div className="flex items-center gap-4 p-6 bg-white/5 backdrop-blur-md rounded-[32px] border border-white/10">
                 <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <ShieldCheck className="size-6 text-primary" />
                 </div>
                 <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-300">Bảo mật thông tin</p>
                    <p className="text-[10px] font-medium text-slate-500 mt-1">Dữ liệu của bạn được mã hóa theo tiêu chuẩn quốc tế.</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Form Side */}
        <div className="p-8 md:p-16 lg:p-20 flex flex-col justify-center">
           <div className="max-w-md mx-auto w-full">
              <div className="mb-12">
                 <h3 className="text-4xl font-black tracking-tighter mb-2">
                   {isForgotPassword ? 'Khôi phục mật khẩu' : (isLogin ? 'Chào mừng trở lại' : 'Tạo tài khoản mới')}
                 </h3>
                 <p className="text-slate-500 font-medium">
                   {isForgotPassword ? 'Nhập email của bạn để nhận hướng dẫn khôi phục.' : 'Vui lòng nhập thông tin của bạn để tiếp tục.'}
                 </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                 {error && (
                   <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-sm font-bold">
                     {error}
                   </div>
                 )}

                 {message && (
                   <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-bold">
                     {message}
                   </div>
                 )}

                 {!isLogin && !isForgotPassword && (
                   <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Họ và tên</label>
                      <input 
                        type="text" 
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Nguyễn Văn A" 
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-sm" 
                      />
                   </div>
                 )}
                 
                 <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email</label>
                    <div className="relative group">
                       <Mail className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                       <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com" 
                        className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-sm" 
                       />
                    </div>
                 </div>

                 {isForgotPassword ? (
                   <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Mật khẩu mới</label>
                        <div className="relative group">
                           <Lock className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                           <input 
                            type="password" 
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            placeholder="Mật khẩu mới" 
                            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-sm" 
                           />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Xác nhận mật khẩu</label>
                        <div className="relative group">
                           <Lock className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                           <input 
                            type="password" 
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Nhập lại mật khẩu mới" 
                            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-sm" 
                           />
                        </div>
                     </div>
                   </div>
                 ) : (
                   <div className="space-y-2">
                      <div className="flex justify-between items-center ml-1">
                         <label className="text-xs font-black uppercase tracking-widest text-slate-400">Mật khẩu</label>
                         {isLogin && (
                           <button 
                             type="button" 
                             onClick={() => { setIsForgotPassword(true); setError(''); setMessage(''); }} 
                             className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-emerald-400 cursor-pointer transition-colors underline-offset-4 hover:underline"
                           >
                             Quên mật khẩu?
                           </button>
                         )}
                      </div>
                      <div className="relative group">
                         <Lock className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                         <input 
                          type="password" 
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="••••••••" 
                          className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-sm" 
                         />
                      </div>
                   </div>
                 )}

                 <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary w-full h-14 text-lg justify-center shadow-2xl shadow-primary/30 mt-4 disabled:opacity-70"
                 >
                    {loading ? (
                      <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        {isForgotPassword ? 'Gửi yêu cầu khôi phục' : (isLogin ? 'Đăng nhập ngay' : 'Đăng ký tài khoản')}
                        <ArrowRight className="size-5" />
                      </>
                    )}
                 </button>

                 {isForgotPassword && (
                   <button 
                     type="button"
                     onClick={() => { setIsForgotPassword(false); setError(''); setMessage(''); }}
                     className="w-full text-center text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors mt-2"
                   >
                     Quay lại Đăng nhập
                   </button>
                 )}
              </form>


              <div className="mt-12 text-center">
                 <p className="text-sm font-medium text-slate-500">
                    {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
                    <button 
                      onClick={() => { setIsLogin(!isLogin); setIsForgotPassword(false); setError(''); setMessage(''); }}
                      className="ml-2 text-primary font-black uppercase tracking-widest text-xs hover:underline"
                    >
                       {isLogin ? 'Đăng ký miễn phí' : 'Đăng nhập ngay'}
                    </button>
                 </p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
