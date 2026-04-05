import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { adminApi } from '../../api/api';
import { ArrowLeft, Save, Map } from 'lucide-react';

const AdminBrewingGuideForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    productId: ''
  });

  useEffect(() => {
    Promise.all([
      adminApi.getProducts({ limit: 100 }), // Get all products
      adminApi.getCategories()
    ]).then(([prodRes, catRes]) => {
      const pData = prodRes.data?.data || prodRes.data || [];
      const cData = catRes.data?.data || catRes.data || [];
      setProducts(pData);
      setCategories(cData);
    }).catch(err => console.error("Failed to load products/categories", err));

    if (isEditMode) {
      adminApi.getBrewingGuides()
        .then(res => {
          if (Array.isArray(res.data)) {
            const guide = res.data.find(g => g._id === id);
            if (guide) {
              setFormData({
                title: guide.title || '',
                content: guide.content || '',
                productId: guide.productId?._id || guide.productId || ''
              });
            } else {
              alert("Không tìm thấy hướng dẫn");
              navigate('/admin/brewing-guides');
            }
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to load guide", err);
          setLoading(false);
        });
    }
  }, [id, navigate, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        productId: formData.productId || null
      };
      
      if (isEditMode) {
        payload._id = id;
      }
      
      await adminApi.saveBrewingGuide(payload);
      navigate('/admin/brewing-guides');
    } catch (err) {
      console.error("Save guide failed", err);
      alert("Không thể lưu hướng dẫn!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/brewing-guides" className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-100 dark:border-slate-800 hover:scale-105 transition-transform">
          <ArrowLeft className="size-5 text-slate-500" />
        </Link>
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">
            {isEditMode ? 'Chỉnh sửa hướng dẫn' : 'Thêm hướng dẫn mới'}
          </h2>
          <p className="text-slate-500 font-medium">Cung cấp các bước pha trà chuẩn vị nhất.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <form onSubmit={handleSave} className="p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tiêu đề bản hướng dẫn *</label>
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary font-medium" 
                placeholder="Cách pha Trà Đinh chuẩn vị..." 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sản phẩm áp dụng</label>
              <select 
                name="productId" 
                value={formData.productId} 
                onChange={handleChange} 
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer font-medium"
              >
                <option value="">Chọn sản phẩm</option>
                {categories.map(cat => {
                  const catProducts = Array.isArray(products) ? products.filter(p => (p.categoryId?._id || p.categoryId) === cat._id) : [];
                  if (catProducts.length === 0) return null;
                  return (
                    <optgroup key={cat._id} label={cat.name}>
                      {catProducts.map(p => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nội dung hướng dẫn *</label>
            <textarea 
              name="content" 
              value={formData.content} 
              onChange={handleChange} 
              required
              rows="12" 
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary resize-none font-medium leading-relaxed" 
              placeholder="Bước 1: Tráng ấm trà...&#10;Bước 2: Cho 5g trà vào ấm...&#10;Bước 3: Rót nước sôi 85 độ C..."
            ></textarea>
          </div>
          
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4">
            <Link to="/admin/brewing-guides" className="px-8 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors">
              Hủy bỏ
            </Link>
            <button type="submit" disabled={saving} className="btn-primary px-8 py-3 text-base">
              {saving ? <div className="animate-spin size-5 border-2 border-white border-t-transparent rounded-full mx-2"></div> : <Save className="size-5" />}
              {isEditMode ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminBrewingGuideForm;
