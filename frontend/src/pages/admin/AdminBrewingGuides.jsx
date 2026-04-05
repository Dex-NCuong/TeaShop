import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminApi } from '../../api/api';
import { Map, Plus, Edit2, Trash2, ExternalLink } from 'lucide-react';

const AdminBrewingGuides = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadGuides();
  }, []);

  const loadGuides = () => {
    setLoading(true);
    adminApi.getBrewingGuides()
      .then(res => {
        setGuides(res.data.data || res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa hướng dẫn này?")) return;
    try {
      await adminApi.deleteBrewingGuide(id);
      loadGuides();
    } catch (err) {
      console.error(err);
      alert("Xóa thất bại!");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
       <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">Hướng dẫn pha trà</h2>
          <p className="text-slate-500 font-medium">Thiết lập các bước hướng dẫn chi tiết để khách hàng có trải nghiệm tốt nhất.</p>
        </div>
        <Link to="/admin/brewing-guides/new" className="btn-primary">
          <Plus className="size-5" />
          Thêm hướng dẫn mới
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
         {guides.map((guide) => (
           <div key={guide._id} className="card group relative flex flex-col hover:border-primary/20 transition-all overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-primary/20 group-hover:bg-primary transition-colors"></div>
              
              <div className="flex items-center justify-between mb-8">
                 <div className="size-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                    <Map className="size-6" />
                 </div>
                 <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => navigate(`/admin/brewing-guides/${guide._id}/edit`)}
                      className="p-2 text-slate-400 hover:text-primary transition-all"
                    >
                      <Edit2 className="size-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(guide._id)}
                      className="p-2 text-slate-400 hover:text-rose-500 transition-all"
                    >
                      <Trash2 className="size-4" />
                    </button>
                 </div>
              </div>

              <h3 className="text-xl font-black tracking-tight mb-4 group-hover:text-primary transition-colors">{guide.title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed flex-1 mb-8 line-clamp-3">{guide.content}</p>

              <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 p-1 px-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm group-hover:shadow-md transition-all">
                       <div className="size-10 rounded-lg overflow-hidden bg-slate-50 p-1 shrink-0">
                          <img src={guide.product?.imageUrl || 'https://images.unsplash.com/photo-1594631252845-29fc458631b6?q=80&w=50'} alt="" className="size-full object-cover rounded-md" />
                       </div>
                       <div className="min-w-0 pr-2">
                          <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Áp dụng cho</p>
                          <p className="text-[10px] font-black truncate">{guide.productId?.name || guide.product?.name || 'Tất cả trà'}</p>
                       </div>
                    </div>
                 </div>
                 {guide.productId?._id || guide.product?._id || guide.product?.id ? (
                   <Link 
                     to={`/product/${guide.productId?._id || guide.product?._id || guide.product?.id}`}
                     target="_blank"
                     className="size-10 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-primary transition-all"
                   >
                      <ExternalLink className="size-4" />
                   </Link>
                 ) : (
                   <div className="size-10 rounded-xl bg-slate-100 text-slate-300 flex items-center justify-center cursor-not-allowed">
                      <ExternalLink className="size-4" />
                   </div>
                 )}
              </div>
           </div>
         ))}
         
         {/* Add new card placeholder */}
         <Link 
           to="/admin/brewing-guides/new"
           className="border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[32px] p-8 flex flex-col items-center justify-center space-y-4 hover:border-primary/20 hover:bg-primary/5 transition-all text-slate-300 hover:text-primary min-h-[300px] group"
         >
            <div className="size-16 rounded-full border-4 border-current flex items-center justify-center group-hover:scale-110 transition-transform">
               <Plus className="size-8" />
            </div>
            <span className="font-black uppercase tracking-widest text-xs">Thêm hướng dẫn mới</span>
         </Link>
      </div>
    </div>
  );
};

export default AdminBrewingGuides;
