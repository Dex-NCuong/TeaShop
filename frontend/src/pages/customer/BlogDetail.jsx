import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { customerApi } from '../../api/api';
import { 
  Calendar, Clock, User, ChevronRight, ArrowLeft, AlertCircle,
  Search, Tag, History, MessageCircle, Share2, 
  Facebook, Twitter, Link as LinkIcon, Coffee
} from 'lucide-react';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [blogRes, blogsRes, catsRes] = await Promise.all([
          customerApi.getBlogDetail(id),
          customerApi.getBlogs(),
          customerApi.getBlogCategories()
        ]);
        setBlog(blogRes.data);
        setBlogs(blogsRes.data || []);
        setCategories(catsRes.data || []);
      } catch (err) {
        console.error('Lỗi khi tải bài viết:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  const recentPosts = [...blogs]
    .filter(b => b._id !== id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin size-12 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  );

  if (!blog) return (
    <div className="max-w-7xl mx-auto px-4 py-32 text-center space-y-6">
      <div className="size-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
        <AlertCircle className="size-12 text-slate-300" />
      </div>
      <h2 className="text-3xl font-black uppercase tracking-tighter">Không tìm thấy bài viết</h2>
      <Link to="/blog" className="btn-primary px-10">Quay lại Blog</Link>
    </div>
  );

  return (
    <div className="bg-[#fcfcfc] dark:bg-[#1a110c] min-h-screen font-['Public_Sans']">
      
      {/* Article Header & Image */}
      <header className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex mb-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
            <ol className="flex items-center space-x-3">
              <li><Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link></li>
              <li><ChevronRight className="size-3 opacity-50" /></li>
              <li><Link to="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><ChevronRight className="size-3 opacity-50" /></li>
              <li className="text-primary italic truncate max-w-[200px]">{blog.title}</li>
            </ol>
          </nav>

          <div className="max-w-4xl">
            <span className="px-5 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-8 inline-block">
              {blog.categoryId?.name}
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-10 leading-[1.1] tracking-[-0.03em] uppercase">
              {blog.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-8 py-8 border-y border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
                  <img src="https://ui-avatars.com/api/?name=Admin&background=random" alt="Admin" className="size-full object-cover" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">Tác giả</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Trà Thơm Admin</p>
                </div>
              </div>
              
              <div className="flex items-center gap-8">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">Ngày đăng</p>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <Calendar className="size-4 text-primary" />
                    {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">Thời gian đọc</p>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <Clock className="size-4 text-primary" />
                    5 phút đọc
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="flex flex-col lg:flex-row gap-20">
          
          {/* Main Article Content */}
          <main className="flex-1 max-w-4xl">
            <div className="aspect-[21/9] rounded-[48px] overflow-hidden mb-16 shadow-2xl shadow-slate-200/50 dark:shadow-none bg-slate-100">
              <img src={blog.imageUrl || 'https://images.unsplash.com/photo-1594631252845-29fc458639a0?q=80&w=1887'} alt={blog.title} className="w-full h-full object-cover" />
            </div>

            <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
               <p className="text-2xl font-medium text-slate-600 dark:text-slate-400 mb-12 leading-relaxed italic border-l-4 border-primary pl-8 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-r-3xl">
                 {blog.summary}
               </p>
               
               <div className="text-slate-700 dark:text-slate-300 space-y-8 leading-[1.8] font-medium whitespace-pre-line">
                  {blog.content}
               </div>
            </div>

            {/* Tags & Share */}
            <div className="mt-20 pt-10 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-8">
               <div className="flex items-center gap-4">
                  <Tag className="size-5 text-primary" />
                  <div className="flex gap-2">
                    <span className="px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase tracking-widest">{blog.categoryId?.name}</span>
                    <span className="px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase tracking-widest">Trà Việt</span>
                  </div>
               </div>
               
               <div className="flex items-center gap-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Chia sẻ ngay</span>
                  <div className="flex gap-4">
                    <button className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all"><Facebook className="size-4" /></button>
                    <button className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all"><Twitter className="size-4" /></button>
                    <button className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all"><LinkIcon className="size-4" /></button>
                  </div>
               </div>
            </div>

            {/* Navigation (Prev/Next) placeholder if needed */}
          </main>

          {/* Sidebar */}
          <aside className="w-full lg:w-[400px] space-y-12 shrink-0">
             {/* Search Widget */}
             <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm bài viết..."
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-[24px] text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  />
                </div>
             </div>

             {/* Recent Posts Widget */}
             <div className="bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
               <h4 className="text-xl font-black mb-8 flex items-center gap-3 tracking-tighter uppercase">
                 <History className="size-6 text-primary" />
                 Bài viết liên quan
               </h4>
               <div className="space-y-8">
                 {recentPosts.length > 0 ? recentPosts.map(post => (
                   <Link key={post._id} to={`/blog/${post._id}`} className="flex gap-5 group">
                     <div className="size-20 shrink-0 rounded-[20px] overflow-hidden shadow-lg shadow-slate-200/50 dark:shadow-none bg-slate-100">
                       <img src={post.imageUrl || 'https://images.unsplash.com/photo-1594631252845-29fc458639a0?q=80&w=1887'} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                     </div>
                     <div className="space-y-1">
                       <h5 className="text-sm font-black line-clamp-2 leading-snug group-hover:text-primary transition-colors uppercase tracking-tight">
                         {post.title}
                       </h5>
                       <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none">
                         {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                       </p>
                     </div>
                   </Link>
                 )) : (
                   <div className="text-slate-400 text-xs font-bold italic">Đang cập nhật bài viết mới...</div>
                 )}
               </div>
             </div>

             {/* Categories Widget */}
             <div className="bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
               <h4 className="text-xl font-black mb-8 flex items-center gap-3 tracking-tighter uppercase">
                 <Tag className="size-6 text-primary" />
                 Danh mục
               </h4>
               <ul className="space-y-4">
                 {categories.map(cat => (
                   <li key={cat._id}>
                     <Link 
                       to={`/blog?category=${cat._id}`}
                       className="flex items-center justify-between w-full group text-slate-600 dark:text-slate-400"
                     >
                       <span className="font-bold uppercase tracking-tight text-sm group-hover:text-primary transition-colors">{cat.name}</span>
                       <span className="size-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black group-hover:bg-primary/10 transition-all uppercase">
                         Xem
                       </span>
                     </Link>
                   </li>
                 ))}
               </ul>
             </div>
          </aside>

        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
