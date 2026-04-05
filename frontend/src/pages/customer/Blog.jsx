import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customerApi } from '../../api/api';
import { 
  Search, 
  Calendar, 
  Clock, 
  ArrowRight, 
  ChevronRight, 
  ChevronLeft, 
  History, 
  Mail,
  Coffee,
  Tag
} from 'lucide-react';
import blogBanner from '../../assets/images/blog.jpg';

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [blogCategories, setBlogCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const postsPerPage = 6;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [blogsRes, catsRes] = await Promise.all([
          customerApi.getBlogs(),
          customerApi.getBlogCategories()
        ]);
        setBlogs(blogsRes.data?.data || blogsRes.data || []);
        setBlogCategories(catsRes.data?.data || catsRes.data || []);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu blog:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Logic lọc và tìm kiếm
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? (blog.categoryId?._id || blog.categoryId)?.toString() === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  // Logic sắp xếp
  const sortedBlogs = [...filteredBlogs].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'popular') return (b.views || 0) - (a.views || 0) || (b._id > a._id ? 1 : -1);
    return 0;
  });

  // Bài viết mới nhất (để hiển thị ở sidebar)
  const recentPosts = [...blogs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);

  // Phân trang
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = sortedBlogs.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(sortedBlogs.length / postsPerPage);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin size-12 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="bg-[#fcfcfc] dark:bg-[#1a110c] min-h-screen font-['Public_Sans'] text-slate-900 dark:text-slate-100">
      
      {/* Refined Hero Section with Background Image */}
      <section 
        className="relative pt-40 pb-28 overflow-hidden min-h-[500px] flex items-center bg-[#1a110c]"
        style={{ 
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.4), transparent), url(${blogBanner})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-7xl px-4 sm:px-6 lg:px-20 relative">
          <div className="max-w-4xl">
            <nav className="flex mb-8 text-[10px] font-black uppercase tracking-[0.3em] !text-white/60 animate-in fade-in slide-in-from-bottom-2 duration-700">
              <ol className="flex items-center space-x-3">
                <li><Link to="/" className="hover:!text-primary transition-colors">Trang chủ</Link></li>
                <li><ChevronRight className="size-3 opacity-50" /></li>
                <li className="!text-primary italic">Blog & Tin tức</li>
              </ol>
            </nav>
            <h1 className="text-5xl md:text-8xl font-black !text-white mb-8 leading-[0.95] tracking-[-0.04em] uppercase animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              Khám phá văn hóa <br />
              <span className="text-primary italic font-serif normal-case tracking-normal">Trà Việt tinh hoa</span>
            </h1>
            <p className="text-xl md:text-2xl !text-white/80 leading-relaxed font-medium max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
              Nơi hội tụ những câu chuyện tâm huyết, bí quyết pha trà và kiến thức sâu sắc từ những nghệ nhân trà hàng đầu.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Left Side: Blog Content */}
          <div className="flex-1 space-y-12">
            
            {/* Horizontal Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {setSortBy('newest'); setSelectedCategory(null); setCurrentPage(1);}}
                  className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${(!selectedCategory && sortBy === 'newest') ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary'}`}
                >
                  Tất cả bài viết
                </button>
                <button 
                  onClick={() => {setSortBy('newest'); setCurrentPage(1);}}
                  className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${(sortBy === 'newest' && selectedCategory) ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary'}`}
                >
                  Mới nhất
                </button>
                <button 
                  onClick={() => {setSortBy('popular'); setCurrentPage(1);}}
                  className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${sortBy === 'popular' ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary'}`}
                >
                  Phổ biến
                </button>
              </div>
              <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-lg">
                Hiển thị: {sortedBlogs.length > 0 ? indexOfFirstPost + 1 : 0} - {Math.min(indexOfLastPost, sortedBlogs.length)} trong {sortedBlogs.length} bài viết
              </div>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-16">
              {currentPosts.length > 0 ? currentPosts.map((blog) => (
                <article key={blog._id} className="group flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <Link to={`/blog/${blog._id}`} className="relative aspect-[4/3] rounded-[40px] overflow-hidden mb-6 shadow-xl shadow-slate-200/50 dark:shadow-none block">
                    <img 
                      src={blog.imageUrl || 'https://images.unsplash.com/photo-1594631252845-29fc458639a0?q=80&w=1887&auto=format&fit=crop'} 
                      alt={blog.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-6 left-6 px-4 py-1.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                      {blog.categoryId?.name || 'Trà Thơm'}
                    </div>
                  </Link>
                  
                  <div className="space-y-4 px-2">
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span className="flex items-center gap-1.5"><Calendar className="size-3.5" /> {new Date(blog.createdAt).toLocaleDateString('vi-VN')}</span>
                      <span className="flex items-center gap-1.5"><Clock className="size-3.5" /> 5 phút đọc</span>
                    </div>
                    
                    <h3 className="text-2xl font-black leading-tight text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 uppercase tracking-tighter">
                      <Link to={`/blog/${blog._id}`}>{blog.title}</Link>
                    </h3>
                    
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium line-clamp-2 leading-relaxed">
                      {blog.summary || (blog.content ? blog.content.substring(0, 100).replace(/<[^>]*>?/gm, '') + '...' : '')}
                    </p>
                    
                    <Link to={`/blog/${blog._id}`} className="inline-flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest group/link pt-2 underline underline-offset-4">
                      Đọc tiếp 
                      <ArrowRight className="size-4 group-hover/link:translate-x-2 transition-transform" />
                    </Link>
                  </div>
                </article>
              )) : (
                <div className="col-span-full py-20 text-center space-y-4">
                  <div className="size-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-300">
                    <Coffee className="size-10" />
                  </div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Chưa có bài viết nào trong mục này</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pt-16 flex justify-center items-center gap-4">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => {setCurrentPage(prev => prev - 1); window.scrollTo(0, 0);}}
                  className="size-14 flex items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:border-primary hover:text-primary transition-all"
                >
                  <ChevronLeft className="size-6" />
                </button>
                
                <div className="flex items-center gap-3">
                  {[...Array(totalPages)].map((_, i) => (
                    <button 
                      key={i}
                      onClick={() => {setCurrentPage(i + 1); window.scrollTo(0, 0);}}
                      className={`size-14 rounded-2xl flex items-center justify-center font-black text-sm transition-all ${currentPage === i + 1 ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-primary'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => {setCurrentPage(prev => prev + 1); window.scrollTo(0, 0);}}
                  className="size-14 flex items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:border-primary hover:text-primary transition-all"
                >
                  <ChevronRight className="size-6" />
                </button>
              </div>
            )}
          </div>

          {/* Right Side: Sidebar */}
          <aside className="w-full lg:w-[400px] space-y-12">
            
            {/* Search Widget */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
               <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm bài viết..."
                  value={searchTerm}
                  onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-[24px] text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                />
              </div>
            </div>

            {/* Categories Widget */}
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
              <h4 className="text-xl font-black mb-8 flex items-center gap-3 tracking-tighter uppercase">
                <Tag className="size-6 text-primary" />
                Danh mục
              </h4>
              <ul className="space-y-4">
                <li>
                  <button 
                    onClick={() => {setSelectedCategory(null); setCurrentPage(1);}}
                    className={`flex items-center justify-between w-full group ${!selectedCategory ? 'text-primary' : 'text-slate-600 dark:text-slate-400'}`}
                  >
                    <span className="font-bold uppercase tracking-tight text-sm group-hover:text-primary transition-colors">Tất cả bài viết</span>
                    <span className="size-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black group-hover:bg-primary/10 transition-all">
                      {blogs.length}
                    </span>
                  </button>
                </li>
                {blogCategories.map(cat => (
                  <li key={cat._id}>
                    <button 
                      onClick={() => {setSelectedCategory(cat._id); setCurrentPage(1);}}
                      className={`flex items-center justify-between w-full group ${selectedCategory === cat._id ? 'text-primary' : 'text-slate-600 dark:text-slate-400'}`}
                    >
                      <span className="font-bold uppercase tracking-tight text-sm group-hover:text-primary transition-colors">{cat.name}</span>
                      <span className="size-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black group-hover:bg-primary/10 transition-all">
                        {blogs.filter(b => (b.categoryId?._id || b.categoryId)?.toString() === cat._id).length}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recent Posts Widget */}
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
              <h4 className="text-xl font-black mb-8 flex items-center gap-3 tracking-tighter uppercase">
                <History className="size-6 text-primary" />
                Bài viết mới nhất
              </h4>
              <div className="space-y-8">
                {recentPosts.length > 0 ? recentPosts.map(post => (
                  <Link key={post._id} to={`/blog/${post._id}`} className="flex gap-5 group">
                    <div className="size-20 shrink-0 rounded-[20px] overflow-hidden shadow-lg shadow-slate-200/50 dark:shadow-none bg-slate-100">
                      <img src={post.imageUrl || 'https://images.unsplash.com/photo-1594631252845-29fc458639a0?q=80&w=1887&auto=format&fit=crop'} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
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

          </aside>

        </div>
      </main>
    </div>
  );
};

export default Blog;
