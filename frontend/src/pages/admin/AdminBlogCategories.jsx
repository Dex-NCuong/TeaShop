import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/api';
import { Tag, Plus, Search, Edit2, Trash2, X, Info, CheckCircle2 } from 'lucide-react';

const AdminBlogCategories = () => {
  const [categories, setCategories] = useState([]); // Danh sách danh mục bài viết
  const [loading, setLoading] = useState(true); // Trạng thái tải dữ liệu
  const [searchTerm, setSearchTerm] = useState(''); // Từ khóa tìm kiếm
  
  // Trạng thái cho Modal (Cửa sổ nổi)
  const [isModalOpen, setIsModalOpen] = useState(false); // Trạng thái đóng/mở modal
  const [editingCategory, setEditingCategory] = useState(null); // Danh mục đang được chỉnh sửa (null nếu là thêm mới)
  const [catFormData, setCatFormData] = useState({ name: '', description: '' }); // Dữ liệu trong form
  const [isSaving, setIsSaving] = useState(false); // Trạng thái đang lưu dữ liệu

  useEffect(() => {
    fetchCategories();
  }, []);

  // Hàm lấy danh sách danh mục bài viết từ máy chủ
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getBlogCategories();
      setCategories(res.data.data || res.data || []);
    } catch (err) {
      console.error('Lỗi khi tải danh mục:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mở modal để thêm mới hoặc chỉnh sửa danh mục
  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCatFormData({ name: category.name, description: category.description || '' });
    } else {
      setEditingCategory(null);
      setCatFormData({ name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  // Xử lý lưu thông tin danh mục (Thêm mới hoặc Cập nhật)
  const handleSave = async (e) => {
    e.preventDefault();
    if (!catFormData.name.trim()) return;

    try {
      setIsSaving(true);
      const dataToSave = editingCategory 
        ? { ...editingCategory, ...catFormData }
        : catFormData;
      
      await adminApi.saveBlogCategory(dataToSave);
      await fetchCategories();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Lỗi khi lưu danh mục:', err);
      alert('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  // Xóa một danh mục bài viết
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này? Các bài viết liên quan có thể bị ảnh hưởng.')) return;

    try {
      await adminApi.deleteBlogCategory(id);
      setCategories(categories.filter(c => c._id !== id));
    } catch (err) {
      console.error('Lỗi khi xóa danh mục:', err);
      alert('Không thể xóa danh mục này.');
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
       <div className="animate-spin size-10 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Danh mục Blog</h2>
          <p className="text-sm text-slate-500 font-medium">Tổ chức và quản lý các chủ đề cho bài viết của bạn.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Tìm kiếm danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all w-full md:w-64"
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-[#2d5a27] text-white px-6 py-4 rounded-2xl font-black text-sm hover:-translate-y-1 transition-all shadow-lg shadow-[#2d5a27]/20 uppercase tracking-widest"
          >
            <Plus className="size-5" />
            Thêm mới
          </button>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {filteredCategories.map((cat) => (
           <div key={cat._id} className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-primary/20 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 size-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
              
              <div className="flex items-center gap-6 relative z-10">
                 <div className="size-16 rounded-[24px] bg-[#f1f8f0] dark:bg-[#2d5a27]/10 flex items-center justify-center text-[#2d5a27] border border-[#2d5a27]/10 shadow-inner group-hover:rotate-12 transition-transform duration-500">
                    <Tag className="size-7" />
                 </div>
                 <div className="space-y-1">
                    <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{cat.name}</h3>
                    <p className="text-xs text-slate-400 font-medium line-clamp-1 max-w-[200px]">{cat.description || 'Không có mô tả'}</p>
                 </div>
              </div>

              <div className="flex items-center gap-3 relative z-10 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                  <button 
                    onClick={() => handleOpenModal(cat)}
                    className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-[#2d5a27] hover:bg-[#f1f8f0] dark:hover:bg-[#2d5a27]/20 rounded-2xl transition-all shadow-sm"
                  >
                     <Edit2 className="size-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(cat._id)}
                    className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-2xl transition-all shadow-sm"
                  >
                     <Trash2 className="size-5" />
                  </button>
              </div>
           </div>
         ))}
         
         {/* Empty State / Add Card */}
         <button 
            onClick={() => handleOpenModal()}
            className="bg-slate-50/50 dark:bg-slate-900/50 rounded-[32px] p-8 border-4 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-4 text-slate-300 hover:text-[#2d5a27] hover:border-[#2d5a27]/20 hover:bg-[#f1f8f0]/30 transition-all duration-500 group min-h-[140px]"
         >
            <Plus className="size-10 group-hover:scale-110 transition-transform duration-500" />
            <span className="text-lg font-black tracking-tight uppercase">Tạo chủ đề bài viết mới</span>
         </button>
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[40px] p-10 relative z-10 shadow-2xl border border-slate-100 dark:border-slate-800">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-8 right-8 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl text-slate-400 transition-all"
            >
              <X className="size-6" />
            </button>

            <div className="space-y-8">
              <div className="space-y-1">
                <div className="size-14 rounded-2xl bg-[#f1f8f0] dark:bg-[#2d5a27]/20 flex items-center justify-center text-[#2d5a27] mb-4">
                  <Tag className="size-7" />
                </div>
                <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  {editingCategory ? 'Cập nhật chủ đề' : 'Thêm chủ đề mới'}
                </h2>
                <p className="text-sm text-slate-500 font-medium">Thông tin danh mục này sẽ giúp phân loại bài viết blog.</p>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Tên chủ đề</label>
                  <input 
                    type="text" 
                    required
                    value={catFormData.name}
                    onChange={(e) => setCatFormData({...catFormData, name: e.target.value})}
                    placeholder="Vd: Văn hóa trà, Sức khỏe..."
                    className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-none rounded-[24px] focus:ring-4 focus:ring-[#2d5a27]/10 font-bold text-slate-900 dark:text-white transition-all outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">Mô tả (không bắt buộc)</label>
                  <textarea 
                    rows="3"
                    value={catFormData.description}
                    onChange={(e) => setCatFormData({...catFormData, description: e.target.value})}
                    placeholder="Nhập mô tả ngắn cho chủ đề này..."
                    className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-none rounded-[24px] focus:ring-4 focus:ring-[#2d5a27]/10 font-bold text-slate-900 dark:text-white transition-all outline-none resize-none"
                  ></textarea>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 font-black rounded-[24px] hover:bg-slate-200 dark:hover:bg-slate-700 transition-all uppercase tracking-widest text-xs"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-5 bg-[#2d5a27] text-white font-black rounded-[24px] shadow-xl shadow-[#2d5a27]/20 hover:-translate-y-1 transition-all uppercase tracking-widest text-xs disabled:opacity-50"
                  >
                    {isSaving ? 'Đang lưu...' : (editingCategory ? 'Lưu thay đổi' : 'Tạo chủ đề')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlogCategories;
