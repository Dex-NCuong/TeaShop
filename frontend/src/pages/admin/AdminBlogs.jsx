import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/api';
import { 
  BookOpen, Plus, Search, Edit2, Trash2, Tag, 
  Eye, Calendar, User, X, Save, Image as ImageIcon, Upload,
  ChevronLeft, ChevronRight, AlertCircle, CheckCircle2
} from 'lucide-react';

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBlog, setCurrentBlog] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    imageUrl: '',
    categoryId: ''
  });
  
  // Toast notification
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [blogsRes, catsRes] = await Promise.all([
        adminApi.getBlogs(),
        adminApi.getBlogCategories()
      ]);
      setBlogs(blogsRes.data?.data || blogsRes.data || []);
      setCategories(catsRes.data?.data || catsRes.data || []);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu:', err);
      showToast('Không thể tải dữ liệu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = (blog = null) => {
    if (blog) {
      setCurrentBlog(blog);
      setFormData({
        title: blog.title || '',
        summary: blog.summary || '',
        content: blog.content || '',
        imageUrl: blog.imageUrl || '',
        categoryId: blog.categoryId?._id || blog.categoryId || ''
      });
    } else {
      setCurrentBlog(null);
      setFormData({
        title: '',
        summary: '',
        content: '',
        imageUrl: '',
        categoryId: categories[0]?._id || ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        _id: currentBlog?._id,
        categoryId: formData.categoryId
      };
      await adminApi.saveBlog(payload);
      showToast(currentBlog ? 'Cập nhật bài viết thành công' : 'Thêm bài viết mới thành công');
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Lỗi khi lưu bài viết:', err);
      showToast('Có lỗi xảy ra khi lưu', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      try {
        await adminApi.deleteBlog(id);
        showToast('Đã xóa bài viết');
        fetchData();
      } catch (err) {
        console.error('Lỗi khi xóa:', err);
        showToast('Không thể xóa bài viết', 'error');
      }
    }
  };

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const res = await adminApi.uploadFiles(files);
      let url = "";
      if (res.data.files && Array.isArray(res.data.files)) {
        url = res.data.files[0].url;
      } else if (res.data.url) {
        url = res.data.url;
      }
      setFormData(prev => ({ ...prev, imageUrl: url }));
      showToast('Tải ảnh lên thành công');
    } catch (err) {
      console.error("Upload failed", err);
      showToast('Tải ảnh thất bại!', 'error');
    } finally {
      setUploading(false);
    }
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || (blog.categoryId?._id || blog.categoryId)?.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading && blogs.length === 0) return (
    <div className="flex items-center justify-center min-vh-100">
      <div className="animate-spin size-12 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-10 right-10 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right duration-300 ${toast.type === 'error' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
          {toast.type === 'error' ? <AlertCircle className="size-5" /> : <CheckCircle2 className="size-5" />}
          <span className="font-bold text-sm tracking-tight">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">Blog & Tin tức</h2>
          <p className="text-slate-500 font-medium">Quản lý nội dung chia sẻ kinh nghiệm và kiến thức trà.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary text-white h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-3"
        >
          <Plus className="size-5" />
          Viết bài mới
        </button>
      </div>

      {/* Control Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm theo tiêu đề bài viết..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 h-16 pl-14 pr-6 rounded-2xl border-none outline-none text-sm font-bold shadow-sm focus:ring-4 focus:ring-primary/5 transition-all"
          />
        </div>
        <div className="relative">
          <Tag className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 h-16 pl-14 pr-10 rounded-2xl border-none outline-none text-sm font-bold shadow-sm focus:ring-4 focus:ring-primary/5 appearance-none cursor-pointer"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Blog List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredBlogs.map((blog) => (
          <article 
            key={blog._id} 
            className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden group hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-500"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <img 
                src={blog.imageUrl || 'https://images.unsplash.com/photo-1544650039-22886fbb4323?q=80&w=600'} 
                alt={blog.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
              <div className="absolute top-5 left-5 px-4 py-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest">
                {blog.categoryId?.name}
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button 
                  onClick={() => handleOpenModal(blog)}
                  className="size-12 bg-white rounded-full flex items-center justify-center text-slate-900 hover:bg-primary hover:text-white transition-all hover:scale-110"
                >
                  <Edit2 className="size-5" />
                </button>
                <button 
                  onClick={() => handleDelete(blog._id)}
                  className="size-12 bg-white rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all hover:scale-110"
                >
                  <Trash2 className="size-5" />
                </button>
              </div>
            </div>
            
            <div className="p-8 space-y-4">
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span className="flex items-center gap-1.5"><Calendar className="size-3.5" /> {new Date(blog.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
              <h3 className="text-xl font-black leading-snug tracking-tight text-slate-900 dark:text-white line-clamp-2 uppercase group-hover:text-primary transition-colors">
                {blog.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium line-clamp-2 leading-relaxed">
                {blog.summary || (blog.content ? blog.content.substring(0, 100).replace(/<[^>]*>?/gm, '') : 'Chưa có tóm tắt...')}
              </p>
            </div>
          </article>
        ))}
        
        {filteredBlogs.length === 0 && (
          <div className="col-span-full py-20 bg-white dark:bg-slate-900 rounded-[40px] border-2 border-dashed border-slate-100 dark:border-slate-800 text-center space-y-4">
            <div className="size-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <BookOpen className="size-10" />
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Không tìm thấy bài viết nào</p>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 self-center duration-300">
            {/* Modal Header */}
            <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between shrink-0">
               <div>
                  <h3 className="text-2xl font-black tracking-tighter uppercase">{currentBlog ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}</h3>
                  <p className="text-xs text-slate-400 font-bold tracking-widest uppercase mt-1">Nội dung sẽ được hiển thị ngay sau khi lưu</p>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="size-12 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors">
                 <X className="size-6" />
               </button>
            </div>

            {/* Modal Body */}
            <div className="p-10 overflow-y-auto custom-scrollbar">
              <form id="blog-form" onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Tiêu đề bài viết</label>
                      <input 
                        required
                        type="text" 
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="VD: Nghệ thuật thưởng trà đạo..."
                        className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Danh mục</label>
                       <select 
                         required
                         value={formData.categoryId}
                         onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                         className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none text-sm font-bold focus:ring-4 focus:ring-primary/5 appearance-none cursor-pointer shadow-inner"
                       >
                         {categories.map(cat => (
                           <option key={cat._id} value={cat._id}>{cat.name}</option>
                         ))}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Hình ảnh đại diện</label>
                       <div className="flex gap-4">
                          <div className="relative flex-1">
                              <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
                              <input 
                                type="text" 
                                value={formData.imageUrl}
                                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                                placeholder="Dán link ảnh hoặc tải lên..."
                                className="w-full h-14 pl-12 pr-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
                              />
                          </div>
                          <label className={`shrink-0 size-14 rounded-2xl flex items-center justify-center cursor-pointer transition-all ${uploading ? 'bg-slate-100' : 'bg-primary text-white hover:scale-105 shadow-lg shadow-primary/20'}`}>
                             {uploading ? (
                               <div className="animate-spin size-5 border-2 border-primary border-t-transparent rounded-full"></div>
                             ) : (
                               <Upload className="size-5" />
                             )}
                             <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                          </label>
                       </div>
                    </div>
                    {formData.imageUrl && (
                      <div className="relative aspect-video rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-inner group">
                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => setFormData({...formData, imageUrl: ''})}
                          className="absolute top-2 right-2 size-8 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Tóm tắt ngắn</label>
                    <textarea 
                      required
                      value={formData.summary}
                      onChange={(e) => setFormData({...formData, summary: e.target.value})}
                      placeholder="Một vài câu ngắn gọn giới thiệu về bài viết..."
                      className="w-full h-[216px] p-6 bg-slate-50 dark:bg-slate-800 rounded-[24px] border-none outline-none text-sm font-medium focus:ring-4 focus:ring-primary/5 transition-all shadow-inner resize-none"
                    ></textarea>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Nội dung bài viết</label>
                  <textarea 
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="Viết nội dung bài viết tại đây (hỗ trợ văn bản thuần)..."
                    className="w-full h-64 p-8 bg-slate-50 dark:bg-slate-800 rounded-[32px] border-none outline-none text-sm font-medium leading-relaxed focus:ring-4 focus:ring-primary/5 transition-all shadow-inner custom-scrollbar"
                  ></textarea>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-10 py-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-end gap-4 shrink-0">
               <button 
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
               >
                 Hủy bỏ
               </button>
               <button 
                form="blog-form"
                type="submit"
                className="bg-primary text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-3"
               >
                 <Save className="size-4" />
                 {currentBlog ? 'Cập nhật ngay' : 'Đăng bài ngay'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlogs;
