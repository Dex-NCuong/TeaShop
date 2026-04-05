import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  User, 
  Search, 
  Menu, 
  X, 
  Heart,
  ChevronDown,
  LogOut,
  LayoutDashboard
} from 'lucide-react';

import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const { cartCount, clearCart } = useCart();
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    // Get initial user
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));

    // Listen to custom event for login/logout updates
    const handleAuthChange = () => {
      const updatedUser = localStorage.getItem('user');
      setUser(updatedUser ? JSON.parse(updatedUser) : null);
    };
    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('authChange')); // trigger CartContext to reload guest cart
    navigate('/');
  };

  const navLinks = [
    { to: "/", label: "Trang chủ" },
    { to: "/products", label: "Sản phẩm" },
    { to: "/story", label: "Câu chuyện" },
    { to: "/blog", label: "Blog" },
  ];

  // Backend Node.js trả về roles là mảng string VD: ["ADMIN", "USER"]
  const isAdmin = user?.roles?.some(role => 
    role === 'ADMIN' || role === 'ROLE_ADMIN' ||          // string format (Node.js)
    role?.name === 'ADMIN' || role?.name === 'ROLE_ADMIN' // object format (legacy)
  );

  return (
    <nav className={`sticky top-0 left-0 w-full z-50 bg-slate-900 border-b border-white/5 transition-all duration-500 ${
      scrolled ? 'py-3 shadow-2xl' : 'py-5'
    }`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="material-symbols-outlined text-3xl text-primary group-hover:rotate-12 transition-transform">spa</span>
          <span className="text-xl font-bold tracking-tight uppercase text-white">
            Trà Thơm
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <NavLink 
              key={link.to} 
              to={link.to}
              className={({ isActive }) => `
                text-[13px] font-bold uppercase tracking-widest transition-all relative group
                ${isActive ? 'text-primary' : 'text-slate-300 hover:text-white'}
              `}
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Icons */}
        <div className="flex items-center gap-2">
          
          <Link to="/cart" className="p-2.5 rounded-2xl text-slate-300 hover:bg-white/5 transition-all relative group">
            <ShoppingBag className={`size-7 transition-transform group-hover:scale-110 ${cartCount > 0 ? 'text-primary' : ''}`} />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 size-6 bg-rose-500 text-white text-[11px] font-black rounded-full flex items-center justify-center border-2 border-slate-900 shadow-lg animate-in zoom-in-50 duration-300">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="hidden sm:flex items-center gap-2 group relative">
              <div className="flex items-center gap-3 p-1.5 pl-4 rounded-2xl border border-white/10 hover:border-primary/50 transition-all cursor-pointer bg-white/5">
                <span className="text-xs font-black text-slate-200 uppercase tracking-widest group-hover:text-primary transition-colors whitespace-nowrap">
                  {user.fullName}
                </span>
                <div className="size-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <User className="size-4" />
                </div>
              </div>
              
              {/* Dropdown Menu */}
              <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col p-2 transform origin-top-right group-hover:scale-100 scale-95 z-50">
                 {isAdmin && (
                   <Link to="/admin" className="px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary/10 rounded-xl transition-colors flex items-center gap-2">
                     <LayoutDashboard className="size-4" /> Trang quản trị
                   </Link>
                 )}
                 <Link to="/profile" className="px-4 py-2.5 text-sm font-bold text-slate-300 hover:bg-white/5 rounded-xl transition-colors flex items-center gap-2">
                   <User className="size-4" /> Trang cá nhân
                 </Link>
                 <button onClick={handleLogout} className="px-4 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors text-left flex items-center gap-2 border-t border-white/5 mt-1 pt-3">
                   <LogOut className="size-4" /> Đăng xuất
                 </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="hidden sm:flex items-center gap-3 p-1.5 pl-4 rounded-2xl border border-white/10 hover:border-primary/50 transition-all group bg-white/5">
              <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest group-hover:text-primary transition-colors">Tài khoản</span>
              <div className="size-8 rounded-xl bg-white/10 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all">
                <User className="size-4" />
              </div>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2.5 rounded-2xl bg-white/5 text-slate-300"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-slate-900 border-b border-white/10 p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4">
          {navLinks.map((link) => (
            <Link 
              key={link.to} 
              to={link.to} 
              onClick={() => setIsOpen(false)}
              className="text-lg font-black text-white uppercase tracking-widest hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="h-px bg-white/5 w-full my-2"></div>
          <Link to="/login" onClick={() => setIsOpen(false)} className="btn-primary justify-center h-14 uppercase tracking-[0.2em]">
            Đăng nhập / Đăng ký
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
