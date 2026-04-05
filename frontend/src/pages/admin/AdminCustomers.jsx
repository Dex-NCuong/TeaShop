import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/api';
import { Users, Search, Mail, Phone, MapPin, MoreVertical, Trash2, Edit, Shield, Calendar, Plus } from 'lucide-react';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    setLoading(true);
    adminApi.getCustomers()
      .then(res => {
        setCustomers(res.data.data || res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa khách hàng "${name}"?`)) {
      try {
        await adminApi.deleteCustomer(id);
        loadCustomers();
      } catch (err) {
        console.error("Delete failed", err);
        alert("Không thể xóa khách hàng này.");
      }
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white flex items-center gap-3">
            <Users className="size-8 text-primary" />
            Cộng đồng khách hàng
          </h2>
          <p className="text-slate-500 font-medium">Quản lý tài khoản, thông tin liên hệ và phân quyền người dùng.</p>
        </div>
        <Link to="/admin/customers/new" className="btn-primary px-6 py-3 shadow-lg shadow-primary/25">
          <Plus className="size-5" />
          Thêm khách hàng
        </Link>
      </div>

      {/* Stats Quick Look - Only Real Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Tổng khách hàng</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{customers.length}</p>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Tìm theo tên, email hoặc SĐT..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-medium focus:ring-4 focus:ring-primary/10 transition-all text-sm" 
                />
            </div>
        </div>

        {/* Horizontal Table Layout */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Khách hàng</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Liên hệ</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Địa chỉ</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Gia nhập</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCustomers.length > 0 ? filteredCustomers.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-100 dark:border-slate-800 flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform duration-500">
                        {user.profileImage ? (
                          <img src={user.profileImage} alt="" className="size-full object-cover rounded-lg" />
                        ) : (
                          <div className="size-full rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-black italic">
                            {user.fullName?.[0] || 'U'}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white leading-tight">{user.fullName || 'Người dùng mới'}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Shield className="size-3 text-orange-500" />
                          <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Khách hàng</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                        <Mail className="size-3" />
                        {user.email || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                        <Phone className="size-3" />
                        {user.phone || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                      <MapPin className="size-3 shrink-0" />
                      <span className="line-clamp-1 max-w-[200px]">{user.address || 'Hồ Chí Minh, Việt Nam'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-900 dark:text-white">Sep 2024</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Hội viên</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                      <Link 
                        to={`/admin/customers/${user._id}/edit`}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                      >
                        <Edit className="size-5" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(user._id, user.fullName)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl transition-all"
                      >
                        <Trash2 className="size-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <Users className="size-16 mx-auto mb-4 text-slate-100" />
                    <p className="text-slate-500 font-bold">Không tìm thấy khách hàng nào</p>
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

export default AdminCustomers;
