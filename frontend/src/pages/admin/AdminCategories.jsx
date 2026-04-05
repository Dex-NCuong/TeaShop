import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/api';
import { Plus, Search, Edit, Trash2, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await adminApi.getCategories();
      setCategories(res.data.data || res.data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Bạn có chắc muốn xóa danh mục "${name}"? Thao tác này có thể ảnh hưởng đến các sản phẩm thuộc danh mục này.`)) {
      try {
        await adminApi.deleteCategory(id);
        fetchData();
      } catch (err) {
        console.error(err);
        alert("Không thể xóa danh mục. Hãy chắc chắn danh mục không còn sản phẩm nào.");
      }
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">Quản lý danh mục</h2>
          <p className="text-slate-500 font-medium">Tổ chức các sản phẩm của bạn theo nhóm để khách hàng dễ dàng tìm kiếm.</p>
        </div>
        <Link to="/admin/categories/new" className="btn-primary">
          <Plus className="size-5" />
          Thêm danh mục mới
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Tìm danh mục..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none text-sm focus:ring-4 focus:ring-primary/5 transition-all outline-none"
              />
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-400">
               Sắp xếp: Mới nhất
               <ChevronDown className="size-3" />
            </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Danh mục</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">ID hệ thống</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCategories.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                       <div className="size-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center font-black text-xl border border-primary/10 group-hover:scale-110 transition-transform">
                          {c.name.charAt(0)}
                       </div>
                       <div>
                         <p className="font-black text-slate-900 dark:text-white text-lg">{c.name}</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sản phẩm trà</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      #{c._id?.slice(-6)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                      <Link to={`/admin/categories/${c._id}/edit`} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-xl transition-all">
                        <Edit className="size-5" />
                      </Link>
                      <button onClick={() => handleDelete(c._id, c.name)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl transition-all">
                        <Trash2 className="size-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCategories.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-20 text-center">
                    <p className="text-slate-400 font-bold">Không tìm thấy danh mục nào.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
