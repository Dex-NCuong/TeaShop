import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminApi } from '../../api/api';
import { ArrowLeft, Edit, Star, ShoppingBag, Leaf, Droplets, Image as ImageIcon } from 'lucide-react';

const AdminProductView = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    adminApi.getProduct(id)
      .then(res => {
        setProduct(res.data);
        setActiveImage(res.data.imageUrl || '');
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  );

  if (!product) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-black">Không tìm thấy sản phẩm</h2>
      <Link to="/admin/products" className="text-primary mt-4 inline-block hover:underline">Quay lại danh sách</Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Area */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/admin/products" className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-100 dark:border-slate-800 hover:scale-105 transition-transform">
            <ArrowLeft className="size-5 text-slate-500" />
          </Link>
          <div>
            <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">Chi tiết sản phẩm</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-slate-500 font-medium tracking-widest text-[10px] uppercase">ID: #{product._id?.slice(-6)}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="text-primary font-bold tracking-widest text-[10px] uppercase bg-primary/10 px-2 py-0.5 rounded-md">
                {product.categoryId?.name || 'Chưa phân loại'}
              </span>
            </div>
          </div>
        </div>
        <Link to={`/admin/products/${product._id}/edit`} className="btn-primary bg-slate-900 shadow-slate-900/20 hover:bg-slate-800 dark:bg-white dark:text-slate-900">
          <Edit className="size-4" />
          Chỉnh sửa ngay
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Layout ảnh */}
          <div className="space-y-4">
            <div className="aspect-square bg-slate-50 dark:bg-slate-800 rounded-3xl overflow-hidden relative group border border-slate-100 dark:border-slate-800">
              {activeImage ? (
                <img src={activeImage} alt={product.name} className="w-full h-full object-cover transition-all duration-500" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                  <ImageIcon className="size-16 mb-4 opacity-50" />
                  <p className="font-bold">Sản phẩm chưa có ảnh minh họa</p>
                </div>
              )}
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                 {product.weights?.[0]?.stock < 5 && (
                   <span className="px-4 py-1.5 rounded-full bg-rose-500 text-white text-[10px] font-black tracking-widest uppercase shadow-lg shadow-rose-500/30">
                     Sắp hết hàng ({product.weights[0].stock})
                   </span>
                 )}
              </div>
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img, idx) => (
                  <button 
                    key={idx} 
                    type="button"
                    onClick={() => setActiveImage(img.imageUrl)}
                    className={`relative size-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${activeImage === img.imageUrl ? 'border-primary ring-2 ring-primary/20 scale-95' : 'border-slate-100 dark:border-slate-800 opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img.imageUrl} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Thông tin */}
          <div className="space-y-8 py-4">
            <div>
              <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-slate-900 dark:text-white leading-[1.1] mb-4">
                {product.name}
              </h1>
              <p className="text-3xl font-black text-primary">
                {product.weights?.[0]?.price?.toLocaleString() || 0}đ
              </p>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed font-medium">
              {product.description || 'Chưa có mô tả cho sản phẩm này.'}
            </p>

            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nguồn gốc</p>
                  <p className="font-bold flex items-center gap-2">
                    <Leaf className="size-4 text-primary" />
                    {product.origin || 'Đang cập nhật'}
                  </p>
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Quy cách</p>
                  <p className="font-bold flex items-center gap-2">
                    <ShoppingBag className="size-4 text-primary" />
                    {product.weights?.[0]?.weight || 0}g / hộp
                  </p>
               </div>
               <div className="col-span-2">
                 <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Số lượng hiện tại</p>
                      <p className="text-xl font-black">{product.weights?.reduce((a,b) => a+b.stock, 0) || 0} sản phẩm</p>
                    </div>
                    <div className={`size-3 rounded-full animate-ping ${product.weights?.[0]?.stock > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductView;
