import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { adminApi } from '../../api/api';
import { ArrowLeft, Save, Folder } from 'lucide-react';

const AdminCategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: ''
  });

  useEffect(() => {
    if (isEditMode) {
      adminApi.getCategory(id)
        .then(res => {
          setFormData({
            name: res.data.name || ''
          });
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to load category", err);
          alert("Không tìm thấy danh mục");
          navigate('/admin/categories');
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
        name: formData.name
      };
      
      if (isEditMode) {
        payload._id = id; // MongoDB dùng _id string, không parseInt
      }
      
      await adminApi.saveCategory(payload);
      navigate('/admin/categories');
    } catch (err) {
      console.error("Save category failed", err);
      alert("Khổng thể lưu danh mục. Vui lòng thử lại!");
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/categories" className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-100 dark:border-slate-800 hover:scale-105 transition-transform">
          <ArrowLeft className="size-5 text-slate-500" />
        </Link>
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">
            {isEditMode ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
          </h2>
          <p className="text-slate-500 font-medium">Đặt tên cho nhóm sản phẩm để quản lý dễ dàng hơn.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <form onSubmit={handleSave} className="p-8 space-y-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tên danh mục *</label>
              <div className="relative">
                <Folder className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary font-bold text-lg" 
                  placeholder="Ví dụ: Trà Xanh, Trà Ô Long..." 
                />
              </div>
            </div>
            
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <span className="font-bold text-primary">Lưu ý:</span> Danh mục giúp khách hàng lọc sản phẩm nhanh hơn trên trang cửa hàng. Hãy chọn những cái tên phổ biến và dễ nhớ.
              </p>
            </div>
          </div>
          
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4">
            <Link to="/admin/categories" className="px-8 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors">
              Hủy bỏ
            </Link>
            <button type="submit" disabled={saving} className="btn-primary px-10 py-3 text-base">
              {saving ? <div className="animate-spin size-5 border-2 border-white border-t-transparent rounded-full mx-2"></div> : <Save className="size-5" />}
              {isEditMode ? 'Cập nhật danh mục' : 'Tạo danh mục'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCategoryForm;
