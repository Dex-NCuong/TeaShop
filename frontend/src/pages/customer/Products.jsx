import React, { useState, useEffect } from 'react';
import { customerApi } from '../../api/api';
import { Link } from 'react-router-dom';
import { ShoppingBag, Filter, ChevronRight, Leaf, Search } from 'lucide-react';

import { useCart } from '../../context/CartContext';

const Products = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('Mới nhất');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter States
  const [tempSelectedCategories, setTempSelectedCategories] = useState([]);
  const [tempPriceRange, setTempPriceRange] = useState({ min: '', max: '' });
  const [appliedFilters, setAppliedFilters] = useState({
    categories: [],
    priceRange: { min: null, max: null }
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    Promise.all([
      customerApi.getProducts(),
      customerApi.getCategories()
    ]).then(([prodRes, catRes]) => {
      // Backend trả về { data: [...], pagination: {...} }
      setProducts(prodRes.data.data || prodRes.data || []);
      setCategories(catRes.data || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  // Filter and Sort
  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      // categoryId có thể được populate (object) hoặc là string ObjectId
      const productCategoryId = p.categoryId?._id || p.categoryId;
      const matchesCategory = appliedFilters.categories.length === 0 || 
                             appliedFilters.categories.includes(productCategoryId?.toString());
      const price = p.weights?.[0]?.price || p.price || 0;
      const matchesMinPrice = appliedFilters.priceRange.min === null || price >= appliedFilters.priceRange.min;
      const matchesMaxPrice = appliedFilters.priceRange.max === null || price <= appliedFilters.priceRange.max;
      return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice;
    })
    .sort((a, b) => {
      const priceA = a.weights?.[0]?.price || a.price || 0;
      const priceB = b.weights?.[0]?.price || b.price || 0;
      if (sortBy === 'Giá thấp → cao') return priceA - priceB;
      if (sortBy === 'Giá cao → thấp') return priceB - priceA;
      if (sortBy === 'Mới nhất') return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

  // Calculate Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilters, sortBy, searchTerm]);

  const handleApplyFilters = () => {
    setAppliedFilters({
      categories: tempSelectedCategories,
      priceRange: {
        min: tempPriceRange.min !== '' ? parseInt(tempPriceRange.min) : null,
        max: tempPriceRange.max !== '' ? parseInt(tempPriceRange.max) : null
      }
    });
  };

  const handleResetFilters = () => {
    setTempSelectedCategories([]);
    setTempPriceRange({ min: '', max: '' });
    setAppliedFilters({
      categories: [],
      priceRange: { min: null, max: null }
    });
  };

  const handleCategoryToggle = (categoryId) => {
    setTempSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
  };

  return (
    <div className="pt-[50px] pb-20 font-display min-h-screen">
      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb & Sorting */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-12 gap-6">
          <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
            <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
            <span className="size-1 rounded-full bg-slate-300"></span>
            <span className="text-slate-900 dark:text-white">Sản phẩm</span>
          </nav>
          
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 flex-1 max-w-4xl">
            {/* Search Bar */}
            <div className="relative flex-1 group">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-slate-300 group-focus-within:text-primary transition-colors" />
               <input 
                  type="text"
                  placeholder="Tìm kiếm sản phẩm trà bạn yêu thích..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-14 pl-14 pr-6 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all outline-none shadow-inner"
               />
            </div>

            <div className="flex items-center gap-4 shrink-0 bg-white dark:bg-slate-900 px-6 py-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <span className="text-xs text-slate-400 whitespace-nowrap font-black uppercase tracking-widest">Sắp xếp:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none text-sm font-black focus:ring-0 py-2 outline-none cursor-pointer text-slate-900 dark:text-white uppercase tracking-tight"
              >
                <option>Mới nhất</option>
                <option>Giá thấp → cao</option>
                <option>Giá cao → thấp</option>
                <option>Phổ biến nhất</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filter */}
          <aside className="w-full lg:w-72 shrink-0 space-y-12">
            {/* Price Range Section */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-primary">payments</span>
                Khoảng giá (vnđ)
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="number" 
                    placeholder="Từ..."
                    value={tempPriceRange.min}
                    onChange={(e) => setTempPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                  <input 
                    type="number" 
                    placeholder="Đến..."
                    value={tempPriceRange.max}
                    onChange={(e) => setTempPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Category Section */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-2">
                <Filter className="size-4 text-primary" />
                Danh mục
              </h3>
              <div className="space-y-4 pl-1">
                {categories.map((cat) => (
                  <label key={cat._id} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox" 
                        checked={tempSelectedCategories.includes(cat._id)}
                        onChange={() => handleCategoryToggle(cat._id)}
                        className="peer hidden" 
                      />
                      <div className="size-5 border-2 border-slate-200 dark:border-slate-700 rounded-md peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-xs font-black scale-0 peer-checked:scale-100 transition-transform">check</span>
                      </div>
                    </div>
                    <span className={`text-base transition-colors ${tempSelectedCategories.includes(cat._id) ? 'text-primary font-black' : 'group-hover:text-primary text-slate-600 dark:text-slate-400 font-bold'}`}>
                      {cat.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 space-y-3">
              <button 
                onClick={handleApplyFilters}
                className="w-full h-14 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all shadow-xl shadow-slate-900/10 hover:shadow-primary/30"
              >
                Áp dụng bộ lọc
              </button>
              <button 
                onClick={handleResetFilters}
                className="w-full h-14 bg-white dark:bg-slate-800 text-slate-400 hover:text-primary border border-slate-100 dark:border-slate-700 rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
              >
                Xóa tất cả
              </button>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1 space-y-12">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
                 {[1,2,3,4,5,6,7,8,9,10].map((i) => (
                   <div key={i} className="aspect-[4/5] bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse"></div>
                 ))}
              </div>
            ) : paginatedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-8 gap-y-12">
                  {paginatedProducts.map((p) => {
                    const price = p.weights?.[0]?.price || 0;
                    const isOutOfStock = p.weights?.every(w => w.stock === 0);

                    return (
                      <Link key={p._id} to={`/product/${p._id}`} className={`group flex flex-col space-y-6 ${isOutOfStock ? 'opacity-75' : ''}`}>
                        <div className="aspect-[4/5] w-full overflow-hidden bg-slate-100 dark:bg-slate-900 relative rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-500 hover:shadow-2xl">
                          <img 
                            alt={p.name} 
                            className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 ${isOutOfStock ? 'grayscale' : ''}`} 
                            src={p.imageUrl || 'https://placehold.co/400x500/png?text=Tra+Thom'} 
                          />
                          {isOutOfStock && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                              <span className="px-5 py-2 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl">Hết hàng</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-3 px-1">
                          <div className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">{p.categoryId?.name}</div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1 leading-tight">{p.name}</h3>
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-lg font-bold text-primary drop-shadow-sm">{price.toLocaleString()}đ</p>
                            <button 
                              disabled={isOutOfStock}
                              className={`size-11 rounded-2xl flex items-center justify-center transition-all shadow-lg cursor-pointer ${
                                isOutOfStock 
                                  ? 'bg-slate-100 text-slate-400 border border-slate-200 shadow-none cursor-not-allowed' 
                                  : 'bg-slate-900 text-white hover:bg-primary shadow-slate-900/10 hover:shadow-primary/30 hover:-translate-y-1'
                              }`}
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
                              <ShoppingBag className="size-5" />
                            </button>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-12 border-t border-slate-100 dark:border-slate-800">
                    <button 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      className="size-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary disabled:opacity-30 transition-all font-bold"
                    >
                      <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <div className="flex gap-2">
                       {[...Array(totalPages)].map((_, i) => (
                         <button 
                           key={i}
                           onClick={() => setCurrentPage(i + 1)}
                           className={`size-10 rounded-xl text-xs font-black transition-all ${
                             currentPage === i + 1 
                               ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                               : 'bg-slate-50 dark:bg-slate-900 text-slate-500 hover:bg-white dark:hover:bg-slate-800'
                           }`}
                         >
                           {i + 1}
                         </button>
                       ))}
                    </div>
                    <button 
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      className="size-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary disabled:opacity-30 transition-all font-bold"
                    >
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
               <div className="flex flex-col flex-1 items-center justify-center py-24 text-slate-500">
                  <p className="text-xl font-bold">Không tìm thấy sản phẩm phù hợp.</p>
                  <button onClick={handleResetFilters} className="mt-4 text-primary hover:underline font-bold uppercase tracking-widest text-xs">Làm mới bộ lọc</button>
               </div>
            )}
          </div>
        </div>
      </main>

      {/* Decorative Floating Leaves */}
      <div className="fixed pointer-events-none opacity-10 dark:opacity-5 inset-0 overflow-hidden -z-10">
        <Leaf className="absolute text-primary size-10 top-[15%] left-[5%] rotate-45" />
        <Leaf className="absolute text-primary size-6 top-[45%] right-[8%] -rotate-12" />
        <Leaf className="absolute text-primary size-12 bottom-[20%] left-[10%] rotate-[120deg]" />
        <Leaf className="absolute text-primary size-8 bottom-[10%] right-[15%] -rotate-45" />
      </div>
    </div>
  );
};

export default Products;
