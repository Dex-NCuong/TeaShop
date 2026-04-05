import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { customerApi } from '../../api/api';
// ... icons imports unchanged
import { 
  Plus, 
  Minus, 
  ShoppingCart, 
  ShoppingBag,
  Heart, 
  Leaf, 
  Clock,
  CheckCircle2,
  Star,
  MessageSquare
} from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const handleAddToCart = () => {
    const user = localStorage.getItem('user');
    if (!user) {
      alert('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng!');
      navigate('/login');
      return;
    }
    if (!selectedWeight) return;
    if (quantity > selectedWeight.stock) {
      alert(`Chỉ còn ${selectedWeight.stock} túi trong kho!`);
      return;
    }
    addToCart(product, selectedWeight, quantity);
    alert(`Đã thêm ${quantity} ${product.name} vào giỏ hàng!`);
  };

  const handleBuyNow = () => {
    const user = localStorage.getItem('user');
    if (!user) {
      alert('Bạn cần đăng nhập để mua hàng!');
      navigate('/login');
      return;
    }
    if (!selectedWeight) return;
    if (quantity > selectedWeight.stock) {
      alert(`Chỉ còn ${selectedWeight.stock} túi trong kho!`);
      return;
    }
    addToCart(product, selectedWeight, quantity);
    navigate('/checkout');
  };
  
  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reviews filtering and pagination state
  const [filterStar, setFilterStar] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  useEffect(() => {
    fetchProductData();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProductData = async () => {
    setLoading(true);
    try {
      const productRes = await customerApi.getProductDetail(id);
      const currentProduct = productRes.data;
      setProduct(currentProduct);
      if (currentProduct.weights?.length > 0) setSelectedWeight(currentProduct.weights[0]);
      setActiveImage(currentProduct.imageUrl);

      const allProductsRes = await customerApi.getProducts();
      const relatedProductsData = allProductsRes.data.data || allProductsRes.data || [];
      const related = relatedProductsData
        .filter(p => p.categoryId?._id === currentProduct.categoryId?._id && p._id !== id)
        .slice(0, 4);
      setRelatedProducts(related);

      const reviewsRes = await customerApi.getProductReviews(id);
      setReviews(reviewsRes.data.data || []);

      const guidesRes = await customerApi.getBrewingGuides();
      const guidesData = guidesRes.data?.data || guidesRes.data || [];
      const productGuides = guidesData.filter((g) => {
        const guideProd = g.productId;
        if (!guideProd) return false;
        
        const isSameProduct = (guideProd._id || guideProd) === id;
        const isSameCategory = guideProd.categoryId && currentProduct.categoryId && 
          (guideProd.categoryId?._id || guideProd.categoryId) === (currentProduct.categoryId?._id || currentProduct.categoryId);
        
        return isSameProduct || isSameCategory;
      });
      setProduct({ ...currentProduct, brewingGuides: productGuides });
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert("Bạn cần đăng nhập để gửi đánh giá!");
      return;
    }
    
    setSubmitting(true);
    try {
      const user = JSON.parse(userStr);
      await customerApi.submitReview(id, {
        rating,
        comment,
        userId: user._id
      });
      setComment('');
      setRating(5);
      // Refresh reviews
      const reviewsRes = await customerApi.getProductReviews(id);
      setReviews(reviewsRes.data.data || []);
      alert("Gửi đánh giá thành công!");
    } catch (err) {
      console.error(err);
      alert("Gửi đánh giá thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen font-inter">
      <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  );

  if (!product) return (
    <div className="pt-32 pb-24 text-center font-inter">
      <h2 className="text-2xl font-black">Không tìm thấy sản phẩm</h2>
      <Link to="/products" className="text-primary font-bold hover:underline mt-4 inline-block">Quay lại cửa hàng</Link>
    </div>
  );

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : 0;

  // Filter and Sort Logic
  const filteredReviews = reviews.filter(rev => 
    filterStar === 'all' ? true : rev.rating === parseInt(filterStar)
  ).sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = filteredReviews.slice(indexOfFirstReview, indexOfLastReview);

  return (
    <div className="pt-[50px] pb-24 font-inter bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="container mx-auto px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-12">
          <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <span className="size-1 rounded-full bg-slate-300"></span>
          <Link to="/products" className="hover:text-primary transition-colors">Sản phẩm</Link>
          <span className="size-1 rounded-full bg-slate-300"></span>
          <span className="text-slate-900 dark:text-white truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Images Section */}
          <div className="space-y-6">
            <div className="aspect-square rounded-[40px] bg-slate-50 dark:bg-slate-900 overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-500 hover:shadow-2xl">
              <img src={activeImage} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
              {[product.imageUrl, ...(product.images?.map(img => img.imageUrl) || [])].map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImage(img)}
                  className={`size-24 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 overflow-hidden shrink-0 transition-all ${
                    activeImage === img ? 'border-primary ring-4 ring-primary/10' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-10">
            <div className="space-y-4">
              <span className="px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/10">
                {product.categoryId?.name}
              </span>
              <h1 className="text-4xl font-bold tracking-tighter leading-tight text-slate-900 dark:text-white">{product.name}</h1>
              <div className="flex items-center gap-4">
                <p className="text-2xl font-bold text-primary">{(selectedWeight?.price || 0).toLocaleString()}đ</p>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="size-4 fill-amber-500" />
                  <span className="text-sm font-bold italic">{averageRating} ({reviews.length} đánh giá)</span>
                </div>
              </div>
            </div>

            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{product.description}</p>

            {/* Weights selection */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Chọn khối lượng</h4>
              <div className="flex flex-wrap gap-3">
                {product.weights?.map((w) => (
                  <button 
                    key={w._id}
                    onClick={() => setSelectedWeight(w)}
                    className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all border-2 relative ${
                      selectedWeight?._id === w._id 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-primary/30'
                    } ${w.stock === 0 ? 'opacity-50' : ''}`}
                  >
                    <span className={w.stock === 0 ? 'line-through' : ''}>{w.weight}g</span>
                    {w.stock === 0 && (
                      <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-rose-500 text-white text-[8px] font-black rounded-full uppercase">Hết</span>
                    )}
                  </button>
                ))}
              </div>
              {selectedWeight && (
                <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedWeight.stock === 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                   {selectedWeight.stock === 0 ? 'Sản phẩm hiện đang hết hàng' : `Còn lại: ${selectedWeight.stock} túi`}
                </p>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <div className="flex items-center p-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <button 
                  disabled={selectedWeight?.stock === 0}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="size-10 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all disabled:opacity-30 dark:text-white"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-12 text-center font-black dark:text-white">{quantity}</span>
                <button 
                  disabled={selectedWeight?.stock === 0}
                  onClick={() => setQuantity(quantity + 1)}
                  className="size-10 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all disabled:opacity-30 dark:text-white"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <button 
                disabled={!selectedWeight || selectedWeight.stock === 0}
                onClick={handleAddToCart}
                className={`flex-1 h-[60px] text-lg btn-primary ${
                  (!selectedWeight || selectedWeight.stock === 0) 
                    ? 'bg-slate-100 text-slate-300 border-slate-200 shadow-none hover:bg-slate-100 hover:-translate-y-0 cursor-not-allowed' 
                    : ''
                }`}
              >
                <ShoppingCart className="size-6" />
                {selectedWeight?.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
              </button>
              <button 
                disabled={!selectedWeight || selectedWeight.stock === 0}
                onClick={handleBuyNow}
                className={`flex-1 h-[60px] text-lg font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3 border-2 ${
                  (!selectedWeight || selectedWeight.stock === 0)
                    ? 'bg-slate-50 text-slate-200 border-slate-100 cursor-not-allowed'
                    : 'bg-slate-900 text-white border-slate-900 hover:bg-black hover:-translate-y-1 shadow-xl shadow-slate-900/20'
                }`}
              >
                Mua ngay
              </button>
              <button className="size-[60px] rounded-2xl border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all dark:bg-slate-900">
                <Heart className="size-6" />
              </button>
            </div>

            {/* Features list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
               {[
                 { icon: CheckCircle2, text: 'Giao hàng nhanh 2H' },
                 { icon: CheckCircle2, text: 'Kiểm tra hàng khi nhận' },
                 { icon: CheckCircle2, text: 'Đổi trả miễn phí 30 ngày' },
                 { icon: CheckCircle2, text: 'Trà chính gốc 100%' },
               ].map((f, i) => (
                 <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                   <f.icon className="size-4 text-primary" />
                   {f.text}
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Brewing Guide Section */}
        <div className="mt-32 space-y-12">
          <div className="max-w-3xl space-y-6">
            <h3 className="text-2xl font-bold tracking-tighter text-slate-900 dark:text-white">Nghệ thuật pha trà</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Làm chủ hương vị thông qua sự kết hợp hoàn hảo giữa nhiệt độ, lượng trà và thời gian ủ. Dưới đây là hướng dẫn từ các bậc thầy trà đạo của chúng tôi.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {product.brewingGuides?.map((guide, i) => (
              <div key={i} className="card group hover:border-primary/30 p-8 space-y-6 bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800">
                <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="font-black italic text-xl">{i + 1}</span>
                </div>
                <h4 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{guide.title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium whitespace-pre-wrap">
                  {guide.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-40 grid grid-cols-1 lg:grid-cols-3 gap-20">
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <h3 className="text-3xl font-bold tracking-tighter text-slate-900 dark:text-white">Đánh giá khách hàng</h3>
                <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`size-5 ${i < Math.round(averageRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-800'}`} />
                    ))}
                  </div>
                  <span className="font-bold text-lg text-amber-600 italic leading-none">{averageRating}/5</span>
                </div>
              </div>

              {/* Filters & Sorting */}
              {reviews.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-8 p-8 rounded-[40px] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-inner">
                  <div className="flex flex-wrap items-center gap-2">
                    {['all', '5', '4', '3', '2', '1'].map((star) => (
                      <button
                        key={star}
                        onClick={() => {
                          setFilterStar(star);
                          setCurrentPage(1);
                        }}
                        className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                          filterStar === star 
                            ? 'border-primary bg-primary text-white shadow-xl shadow-primary/20 scale-105'
                            : 'border-white dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-400 hover:border-primary/30'
                        }`}
                      >
                        {star === 'all' ? 'Tất cả' : `${star} Sao`}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 border-l border-slate-200 dark:border-slate-800 pl-8">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sắp xếp:</span>
                    <select 
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="bg-transparent text-xs font-black uppercase tracking-widest outline-none cursor-pointer text-primary appearance-none border-b-2 border-primary/20 pb-1 hover:border-primary transition-all"
                    >
                      <option value="newest" className="bg-white dark:bg-slate-900">Mới nhất</option>
                      <option value="oldest" className="bg-white dark:bg-slate-900">Cũ nhất</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-8">
              {currentReviews.length > 0 ? (
                <>
                  {currentReviews.map((rev) => (
                    <div key={rev._id} className="p-10 rounded-[40px] bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 hover:border-primary/30 transition-all duration-500 group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-sm shadow-inner group-hover:scale-110 transition-transform">
                            {rev.userId?.fullName?.charAt(0).toUpperCase() || 'K'}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 dark:text-white">{rev.userId?.fullName || 'Khách hàng'}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                              <span className="size-1 rounded-full bg-slate-200"></span>
                              <span className="text-emerald-500">Đã mua hàng</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`size-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-800'}`} />
                          ))}
                        </div>
                      </div>
                      <div className="relative">
                        <span className="absolute -left-6 -top-2 text-4xl text-primary/10 font-serif">"</span>
                        <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic text-lg px-2">
                          {rev.comment}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 pt-12">
                      <button 
                        disabled={currentPage === 1}
                        onClick={() => {
                          setCurrentPage(prev => prev - 1);
                          window.scrollTo({ top: document.getElementById('reviews-anchor')?.offsetTop - 100, behavior: 'smooth' });
                        }}
                        className="size-14 rounded-[20px] bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary disabled:opacity-30 transition-all shadow-sm"
                      >
                        <Plus className="size-6 rotate-[135deg]" />
                      </button>
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setCurrentPage(i + 1);
                            window.scrollTo({ top: document.getElementById('reviews-anchor')?.offsetTop - 100, behavior: 'smooth' });
                          }}
                          className={`size-14 rounded-[20px] font-black text-sm transition-all border-2 ${
                            currentPage === i + 1
                              ? 'border-primary bg-primary text-white shadow-xl shadow-primary/20 scale-110'
                              : 'border-white dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:border-primary/30'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button 
                        disabled={currentPage === totalPages}
                        onClick={() => {
                          setCurrentPage(prev => prev + 1);
                          window.scrollTo({ top: document.getElementById('reviews-anchor')?.offsetTop - 100, behavior: 'smooth' });
                        }}
                        className="size-14 rounded-[20px] bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary disabled:opacity-30 transition-all shadow-sm"
                      >
                        <Plus className="size-6 rotate-45" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-32 text-center border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[50px] space-y-4">
                  <div className="size-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto text-slate-200">
                    <MessageSquare className="size-10" />
                  </div>
                  <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Không tìm thấy đánh giá nào phù hợp</p>
                  <button 
                    onClick={() => { setFilterStar('all'); setCurrentPage(1); }}
                    className="text-primary font-black text-xs uppercase tracking-widest hover:underline"
                  >
                    Xem tất cả đánh giá
                  </button>
                </div>
              )}
            </div>
          </div>

          <div id="reviews-anchor" className="space-y-10 lg:sticky lg:top-24 h-fit">
            <div className="card p-10 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 shadow-2xl rounded-[40px] space-y-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 size-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <div className="space-y-2 relative">
                <h4 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Viết đánh giá</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Chia sẻ trải nghiệm thưởng trà</p>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-8 relative">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Mức độ hài lòng</label>
                  <div className="flex gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`size-12 rounded-2xl flex items-center justify-center transition-all ${
                          rating >= star 
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-500 shadow-lg shadow-amber-500/10 scale-110' 
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <Star className={`size-6 ${rating >= star ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cảm nhận của bạn</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    placeholder="Loại trà này có gì đặc biệt..."
                    rows="6"
                    className="w-full p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 outline-none font-medium resize-none shadow-inner transition-all dark:text-white"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="w-full btn-primary h-16 text-lg shadow-xl shadow-primary/20"
                >
                  {submitting ? (
                    <div className="size-6 border-3 border-white border-t-transparent animate-spin rounded-full"></div>
                  ) : (
                    <>Gửi đánh giá</>
                  )}
                </button>
              </form>
            </div>

            <div className="card bg-emerald-950 text-white border-none p-12 rounded-[40px] space-y-8 relative overflow-hidden group shadow-2xl">
               <div className="absolute -right-20 -bottom-20 size-80 bg-primary/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
               <div className="size-16 rounded-3xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                 <Leaf className="size-8 text-primary" />
               </div>
               <div className="space-y-4 relative z-10">
                 <h3 className="text-3xl font-black tracking-tight leading-tight">Cam kết <br /> chất lượng 100%</h3>
                 <p className="text-slate-400 font-medium leading-relaxed">
                   Chúng tôi tuyển chọn những búp trà tươi nhất, tinh khiết nhất. Nếu không hài lòng, chúng tôi hoàn tiền ngay lập tức.
                 </p>
               </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-48 space-y-16">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Nghệ thuật thưởng thức</h4>
                <h3 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white">Có thể bạn sẽ thích</h3>
              </div>
              <Link to="/products" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all flex items-center gap-3 group border-b-2 border-transparent hover:border-primary pb-2">
                Xem toàn bộ sản phẩm
                <Plus className="size-4 group-hover:rotate-90 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {relatedProducts.map((p) => {
                const price = p.weights?.[0]?.price || 0;
                return (
                  <Link 
                    key={p._id} 
                    to={`/product/${p._id}`} 
                    className="group flex flex-col space-y-8"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  >
                    <div className="aspect-[4/5] rounded-[48px] overflow-hidden bg-slate-100 dark:bg-slate-900 relative shadow-sm border border-slate-100 dark:border-slate-800 transition-all duration-700 group-hover:shadow-2xl group-hover:-translate-y-2">
                      <img src={p.imageUrl || 'https://placehold.co/400x500/png?text=Tra+Thom'} alt={p.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                      <div className="absolute inset-x-0 bottom-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-4 group-hover:translate-y-0">
                         <div className="w-full h-14 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl flex items-center justify-center gap-3 shadow-2xl">
                            <ShoppingBag className="size-5 text-primary" />
                            <span className="text-xs font-black uppercase tracking-widest dark:text-white">Xem chi tiết</span>
                         </div>
                      </div>
                    </div>
                    <div className="space-y-4 px-2">
                       <div className="text-[12px] font-black text-primary uppercase tracking-[0.3em]">{p.categoryId?.name}</div>
                       <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1 leading-tight tracking-tight">{p.name}</h3>
                       <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Giá từ</span>
                          <p className="text-xl font-bold text-primary drop-shadow-sm">{price.toLocaleString()}đ</p>
                        </div>
                        <button 
                          className="size-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center transition-all hover:bg-rose-500 hover:scale-110 shadow-lg cursor-pointer z-20 relative"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
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
                           <ShoppingCart className="size-6" />
                        </button>
                       </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
