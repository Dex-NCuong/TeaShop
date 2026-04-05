import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { adminApi } from '../../api/api';
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Lock, Shield } from 'lucide-react';

const AdminCustomerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: '',
    profileImage: '',
    roles: []
  });

  useEffect(() => {
    if (isEditMode) {
      adminApi.getCustomer(id)
        .then(res => {
          const user = res.data;
          setFormData({
            fullName: user.fullName || '',
            email: user.email || '',
            password: '', // Don't pre-fill password
            phoneNumber: user.phoneNumber || '',
            address: user.address || '',
            profileImage: user.profileImage || '',
            roles: user.roles || []
          });
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to load customer", err);
          alert("Không tìm thấy khách hàng");
          navigate('/admin/customers');
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
      const payload = { ...formData };
      if (isEditMode) {
        payload._id = id;
        // If password is empty in edit mode, don't send it or handle it in backend
        if (!payload.password) delete payload.password;
      }
      
      await adminApi.saveCustomer(payload);
      navigate('/admin/customers');
    } catch (err) {
      console.error("Save customer failed", err);
      alert("Không thể lưu khách hàng. Vui lòng thử lại!");
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
      {/* Header Area */}
      <div className="flex items-center gap-4">
        <Link to="/admin/customers" className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-100 dark:border-slate-800 hover:scale-105 transition-transform">
          <ArrowLeft className="size-5 text-slate-500" />
        </Link>
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">
            {isEditMode ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
          </h2>
          <p className="text-slate-500 font-medium">Cập nhật thông tin chi tiết cho tài khoản khách hàng.</p>
        </div>
      </div>

      {/* Form Area */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <form onSubmit={handleSave} className="p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <User className="size-3" /> Họ và tên *
              </label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary font-medium" placeholder="Nguyễn Văn A" />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Mail className="size-3" /> Email *
              </label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary font-medium" placeholder="example@gmail.com" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Lock className="size-3" /> Mật khẩu {isEditMode ? '(Để trống nếu không đổi)' : '*'}
              </label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required={!isEditMode} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary font-medium" placeholder="••••••••" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Phone className="size-3" /> Số điện thoại
              </label>
              <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary font-medium" placeholder="090x xxx xxx" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <MapPin className="size-3" /> Địa chỉ
            </label>
            <textarea name="address" value={formData.address} onChange={handleChange} rows="3" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary resize-none font-medium" placeholder="Nhập địa chỉ đầy đủ..."></textarea>
          </div>
          
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4">
            <Link to="/admin/customers" className="px-8 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors">
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

export default AdminCustomerForm;
