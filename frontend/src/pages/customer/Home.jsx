import React, { useState, useEffect } from 'react';
import { customerApi } from '../../api/api';
import { Play, ArrowRight, ShoppingCart, Star, Leaf, Award, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import homeTraImg from '../../assets/images/HomeTra.jpg';

import { useCart } from '../../context/CartContext';

const Home = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    customerApi.getProducts()
      .then(res => {
        // Sau khi chia bảng, dữ liệu nằm trong res.data.data
        const products = res.data.data || [];
        setFeaturedProducts(products.slice(0, 4));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden pt-10">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-slate-50 dark:to-slate-950 z-10"></div>
          <img 
            src={homeTraImg} 
            alt="Beautiful green tea plantation hills" 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="w-full relative z-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e8f3ee]/80 dark:bg-primary/20 backdrop-blur-sm border border-white/20 text-primary text-xs font-bold uppercase tracking-widest shadow-lg">
                <Star className="size-4" />
                Sản phẩm trà cao cấp nhất 2026
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tighter leading-[1.05] drop-shadow-lg">
                Khám phá hương vị <br /> 
                <span className="text-primary italic">Thanh Khiết</span>
              </h1>
              <p className="text-base md:text-lg text-white/90 font-medium max-w-2xl leading-relaxed drop-shadow-md">
                Trà Thơm mang đến tinh hoa từ những búp trà non nhất của các vùng cao nguyên Việt Nam. Mỗi tách trà là một câu chuyện về sự tận tâm và đam mê.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                <Link to="/products" className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-full font-bold transition-all shadow-xl shadow-primary/20 flex items-center gap-2">
                  Mua ngay
                  <ArrowRight className="size-5" />
                </Link>
                <Link to="/story" className="flex items-center gap-4 text-white font-black uppercase tracking-widest text-xs hover:text-primary transition-all group drop-shadow-md">
                  <div className="size-14 rounded-full border-2 border-white/40 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-all bg-black/20 backdrop-blur-sm">
                    <Play className="size-6 fill-white group-hover:fill-primary" />
                  </div>
                  Xem câu chuyện
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Leaf, title: '100% Tự nhiên', desc: 'Trà được hái từ vùng núi cao, không hóa chất.' },
              { icon: Award, title: 'Đạt giải cao nhất', desc: 'Vinh dự nhận giải trà ngon nhất miền Bắc.' },
              { icon: ShieldCheck, title: 'An toàn tuyệt đối', desc: 'Tất cả sản phẩm đều được kiểm định chặt chẽ.' },
            ].map((f, i) => (
              <div key={i} className="flex gap-6 group">
                <div className="size-16 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm text-primary group-hover:scale-110 transition-transform">
                  <f.icon className="size-8" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-black tracking-tight">{f.title}</h4>
                  <p className="text-sm text-slate-500 font-medium">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <p className="text-primary font-bold uppercase tracking-widest text-[10px] mb-2">Danh mục đặc biệt</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">Sản phẩm nổi bật</h2>
            </div>
            <Link to="/products" className="text-slate-900 font-black flex items-center gap-2 hover:text-primary transition-all underline underline-offset-8">
              Tất cả sản phẩm
              <ArrowRight className="size-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-[3/4] rounded-3xl bg-slate-100 animate-pulse"></div>
              ))
            ) : (
              featuredProducts.map((p) => (
                <Link key={p._id} to={`/product/${p._id}`} className="group flex flex-col space-y-6">
                  <div className="aspect-[4/5] rounded-[32px] overflow-hidden bg-slate-50 dark:bg-slate-900 relative border border-slate-100 dark:border-slate-800 transition-all duration-500 hover:shadow-2xl">
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    {p.weights?.[0]?.stock < 5 && (
                      <span className="absolute top-4 left-4 px-3 py-1 bg-rose-600 text-white text-[10px] font-black rounded-full uppercase italic shadow-xl">Sắp hết</span>
                    )}
                  </div>
                  <div className="space-y-3 px-1">
                    <div className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">{p.categoryId?.name}</div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1 leading-tight">{p.name}</h3>
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-lg font-bold text-primary drop-shadow-sm">{(p.weights?.[0]?.price || 0).toLocaleString()}đ</p>
                      <button 
                        className="size-11 rounded-2xl flex items-center justify-center transition-all shadow-lg cursor-pointer bg-slate-900 text-white hover:bg-primary shadow-slate-900/10 hover:shadow-primary/30 hover:-translate-y-1"
                        onClick={(e) => {
                          e.preventDefault();
                          const user = localStorage.getItem('user');
                          if (!user) {
                            alert('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng!');
                            navigate('/login');
                            return;
                          }
                          if (p.weights?.length > 0) {
                            addToCart(p, p.weights[0], 1);
                            alert(`Đã thêm ${p.name} vào giỏ hàng!`);
                          }
                        }}
                      >
                        <ShoppingCart className="size-5" />
                      </button>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
