import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/api';
import { useNavigate } from 'react-router-dom';
import { Star, Search, Trash2, Eye, MessageSquare, Quote, ShoppingCart, User, ChevronLeft, ChevronRight } from 'lucide-react';

const AdminReviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = () => {
    setLoading(true);
    adminApi.getReviews()
      .then(res => {
        setReviews(res.data?.data || res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleDeleteReview = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này không?')) {
      adminApi.deleteReview(id)
        .then(() => {
          setReviews(reviews.filter(r => r._id !== id));
          alert('Đã xóa đánh giá thành công');
        })
        .catch(err => {
          console.error(err);
          alert('Xóa đánh giá thất bại');
        });
    }
  };

  const filteredReviews = reviews.filter(r => 
    r.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.userId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.comment?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReviews.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
       <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">Đánh giá khách hàng</h2>
          <p className="text-slate-500 font-medium">Lắng nghe phản hồi để cải thiện chất lượng sản phẩm và dịch vụ.</p>
        </div>
        <div className="flex items-center gap-2 px-6 py-3 bg-amber-500/10 text-amber-600 rounded-2xl">
           <Star className="size-5 fill-amber-500 shadow-xl" />
           <span className="text-sm font-black italic">
             Trung bình {(reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / (reviews.length || 1)).toFixed(1)}/5.0
           </span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 dark:border-slate-800">
           <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Lọc theo tên SP hoặc khách hàng..." 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none text-sm focus:ring-4 focus:ring-primary/5 transition-all"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
           </div>
        </div>

        <div className="divide-y divide-slate-50 dark:divide-slate-800">
           {currentItems.map((review) => (
             <div key={review._id} className="p-8 flex flex-col md:flex-row gap-8 hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex-1 space-y-6">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-xs">
                             {(review.userId?.fullName || 'U')[0]}
                         </div>
                         <div>
                            <p className="font-bold text-sm tracking-tight">{review.userId?.fullName || 'Ẩn danh'}</p>
                            <div className="flex gap-0.5 mt-0.5">
                               {[1,2,3,4,5].map(s => (
                                 <Star key={s} className={`size-3 ${s <= (review.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                               ))}
                            </div>
                         </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN')}</span>
                   </div>

                   <div className="relative">
                      <Quote className="absolute -left-4 -top-4 size-10 text-primary/5 -z-0" />
                      <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed relative z-10">"{review.comment}"</p>
                   </div>
                </div>

                <div className="md:w-72 space-y-4">
                   <div 
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center gap-4 group cursor-pointer hover:border-primary/20 transition-all"
                    onClick={() => review.productId && navigate(`/product/${review.productId?._id || review.productId}`)}
                   >
                      <div className="size-12 bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-inner shrink-0 group-hover:scale-110 transition-transform">
                         <img src={review.product?.imageUrl || 'https://placehold.co/100x100/png?text=Tra+Thom'} alt="" className="size-full object-cover" />
                      </div>
                      <div className="min-w-0">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sản phẩm</p>
                         <p className="text-xs font-black truncate">{review.product?.name || 'Chưa rõ sản phẩm'}</p>
                      </div>
                   </div>
                   <div className="flex items-center justify-end gap-2 px-2">
                       <button 
                        className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100 flex items-center gap-2 group/del"
                        onClick={() => handleDeleteReview(review._id)}
                       >
                         <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover/del:opacity-100 transition-all">Xóa vĩnh viễn</span>
                         <Trash2 className="size-5" />
                       </button>
                   </div>
                </div>
             </div>
           ))}
           {currentItems.length === 0 && (
              <div className="py-24 flex flex-col items-center justify-center space-y-4 opacity-30">
                 <MessageSquare className="size-16" />
                 <p className="font-black tracking-tight text-xl">Không có đánh giá nào</p>
              </div>
           )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Trang {currentPage} / {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="size-10 rounded-xl flex items-center justify-center transition-all bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="size-5" />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`size-10 rounded-xl text-xs font-black transition-all ${
                    currentPage === i + 1 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="size-10 rounded-xl flex items-center justify-center transition-all bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviews;
