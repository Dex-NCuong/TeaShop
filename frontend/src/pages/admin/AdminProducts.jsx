import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/api';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2,
  ChevronDown,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Set to 6 to match user request "chỉ hiển thị 6 sản phẩm trên 1 trang"

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Backend trả về { data: [...], pagination: {...} }
      const [prodRes, catRes] = await Promise.all([
        adminApi.getProducts(),
        adminApi.getCategories()
      ]);
      setProducts(prodRes.data.data || []);
      setCategories(catRes.data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Bạn có chắc muốn xóa sản phẩm "${name}"?`)) {
      try {
        await adminApi.deleteProduct(id);
        fetchData();
      } catch (err) {
        console.error(err);
        alert("Không thể xóa sản phẩm.");
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterCategory === '' || (p.categoryId?._id || p.categoryId)?.toString() === filterCategory)
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  if (loading) return (
    <div className="flex items-center justify-center min-[400px]">
      <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">Quản lý sản phẩm</h2>
          <p className="text-slate-500 font-medium">Danh sách tất cả sản phẩm trà và phụ kiện trong hệ thống.</p>
        </div>
        <Link to="/admin/products/new" className="btn-primary">
          <Plus className="size-5" />
          Thêm sản phẩm mới
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Tìm theo tên sản phẩm..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none text-sm focus:ring-4 focus:ring-primary/5 transition-all"
          />
        </div>
        
        <div className="flex gap-4">
          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none text-sm font-bold appearance-none cursor-pointer focus:ring-4 focus:ring-primary/5 min-w-[180px]"
            >
              <option value="">Lọc theo danh mục</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Sản phẩm</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Danh mục</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Giá bán</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Kho</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedProducts.map((p) => {
                const totalStock = p.weights?.reduce((acc, curr) => acc + curr.stock, 0) || 0;
                let stockStatusColor = 'bg-emerald-500';
                if (totalStock === 0) stockStatusColor = 'bg-rose-500';
                else if (totalStock <= 5) stockStatusColor = 'bg-amber-500';

                return (
                  <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="size-14 rounded-2xl bg-slate-50 dark:bg-slate-800 overflow-hidden border border-slate-100 dark:border-slate-800 p-1 group-hover:scale-110 transition-transform">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="size-full object-cover rounded-xl" />
                          ) : (
                            <div className="size-full flex items-center justify-center text-slate-300">
                              <Package className="size-6" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white leading-tight">{p.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">#{p._id?.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-lg bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10">
                        {p.categoryId?.name || 'Chưa phân loại'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                        {p.weights?.[0]?.price?.toLocaleString() || 0}đ
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium whitespace-nowrap">Khởi điểm cho {p.weights?.[0]?.weight || 0}g</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         <span className={`size-2 rounded-full ${stockStatusColor} ${totalStock > 0 ? 'animate-pulse' : ''}`}></span>
                         <span className={`font-bold text-sm ${totalStock === 0 ? 'text-rose-500' : ''}`}>
                            {totalStock}
                         </span>
                         {totalStock === 0 && <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Hết hàng</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                        <Link to={`/admin/products/${p._id}`} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                          <Eye className="size-5" />
                        </Link>
                        <Link to={`/admin/products/${p._id}/edit`} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-xl transition-all">
                          <Edit className="size-5" />
                        </Link>
                        <button onClick={() => handleDelete(p._id, p.name)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl transition-all">
                          <Trash2 className="size-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginatedProducts.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <Package className="size-12 opacity-20" />
                      <p className="font-bold text-sm">Không tìm thấy sản phẩm nào</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Section */}
        {filteredProducts.length > 0 && (
          <div className="p-6 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Hiển thị {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredProducts.length)} trong {filteredProducts.length} sản phẩm
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all ${
                  currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                Trước
              </button>
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNumber = i + 1;
                  // Only show 5 pages if there are many
                  if (totalPages > 5) {
                    if (pageNumber !== 1 && pageNumber !== totalPages && (pageNumber < currentPage - 1 || pageNumber > currentPage + 1)) {
                      if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) return <span key={pageNumber} className="text-slate-400">...</span>;
                      return null;
                    }
                  }
                  return (
                    <button 
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`size-8 rounded-lg text-xs font-bold transition-all ${
                        currentPage === pageNumber ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-white dark:hover:bg-slate-800'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all ${
                  currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                Tiếp theo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
