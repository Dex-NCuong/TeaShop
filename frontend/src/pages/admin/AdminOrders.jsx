import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/api';
import { Search, Filter, Eye, CheckCircle2, Clock, Truck, XCircle, ChevronDown } from 'lucide-react';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    adminApi.getOrders()
      .then(res => {
        setOrders(res.data.data || res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái:', err);
      alert('Không thể cập nhật trạng thái đơn hàng');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      case 'Pending': return 'bg-amber-100 text-amber-600 border-amber-200';
      case 'Processing': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'Cancelled': return 'bg-rose-100 text-rose-600 border-rose-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return CheckCircle2;
      case 'Pending': return Clock;
      case 'Processing': return Truck;
      case 'Cancelled': return XCircle;
      default: return Clock;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order._id?.includes(searchTerm) ||
      order.userId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.vnpTxnRef && order.vnpTxnRef.includes(searchTerm));
    
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin size-8 border-4 border-[#2d5a27] border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="space-y-8 font-['Public_Sans']">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">Quản lý đơn hàng</h2>
          <p className="text-slate-500 font-medium tracking-tight">Cập nhật tiến độ giao hàng và xử lý thanh toán cho khách.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Tổng đơn hàng', value: orders.length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Chờ xử lý', value: orders.filter(o => o.status === 'Pending').length, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Đang xử lý', value: orders.filter(o => o.status === 'Processing').length, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Hoàn thành', value: orders.filter(o => o.status === 'Completed').length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/50">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{stat.label}</p>
            <div className="flex items-end justify-between">
               <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
               <div className={`size-10 rounded-2xl ${stat.bg} opacity-50`}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col lg:flex-row gap-6 bg-slate-50/20 dark:bg-slate-800/20">
           <div className="flex-1 relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-[#2d5a27] transition-colors" />
              <input 
                type="text" 
                placeholder="Tìm kiếm theo mã đơn, email khách hàng..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 rounded-[1.5rem] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 outline-none text-sm shadow-sm focus:ring-4 focus:ring-[#2d5a27]/5 focus:border-[#2d5a27]/30 transition-all font-medium" 
              />
           </div>
           <div className="flex gap-4">
              <div className="relative group">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none pl-8 pr-12 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all outline-none cursor-pointer"
                >
                  <option value="All">Tất cả trạng thái</option>
                  <option value="Pending">Chờ duyệt</option>
                  <option value="Processing">Đang xử lý</option>
                  <option value="Completed">Hoàn tất</option>
                  <option value="Cancelled">Đã hủy</option>
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 size-3 text-white dark:text-slate-900 pointer-events-none" />
              </div>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 whitespace-nowrap">
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Đơn hàng</th>
                <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Khách hàng</th>
                <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Chi tiết</th>
                <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Thanh toán</th>
                <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Trạng thái</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredOrders.map((order) => {
                const StatusIcon = getStatusIcon(order.status);
                return (
                  <tr key={order._id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-10 py-8">
                      <div className="space-y-1">
                        <p className="font-black text-sm text-[#2d5a27] tracking-tighter">#ORD-{order._id?.slice(-6)}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                          {new Date(order.orderDate).toLocaleString('vi-VN')}
                        </p>
                        {order.vnpTxnRef && (
                           <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-lg font-black text-[9px] uppercase tracking-tighter border border-indigo-100 dark:border-indigo-500/20">
                              <span className="size-1 bg-indigo-500 rounded-full"></span>
                              VNPAY: {order.vnpTxnRef}
                           </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-8">
                      <div className="flex items-center gap-4">
                         <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-sm shadow-inner group-hover:scale-110 transition-transform">
                            {(order.userId?.fullName || 'U')[0]}
                          </div>
                          <div>
                            <p className="font-black text-sm text-slate-900 dark:text-white leading-tight">{order.userId?.fullName || 'Ẩn danh'}</p>
                            <p className="text-[10px] text-slate-400 font-bold">{order.userId?.email}</p>
                          </div>
                      </div>
                    </td>
                    <td className="px-6 py-8">
                       <div className="max-w-[180px] space-y-1">
                          {order.details?.map((d, index) => (
                             <p key={index} className="text-[11px] text-slate-600 dark:text-slate-400 font-bold truncate">
                                <span className="text-[#2d5a27]">●</span> {d.product?.name} <span className="opacity-50 text-[10px]">x{d.quantity}</span>
                             </p>
                          ))}
                       </div>
                    </td>
                    <td className="px-6 py-8">
                       <div className="space-y-1">
                          <p className="font-black text-sm text-slate-900 dark:text-white tracking-tighter">{(order.totalAmount || 0).toLocaleString()}đ</p>
                          <div className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border transition-all ${order.vnpTxnRef ? 'bg-indigo-50 border-indigo-100 text-indigo-500' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                             {order.vnpTxnRef ? 'Đã thanh toán' : 'COD - Tiền mặt'}
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-8">
                       <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-[9px] font-black uppercase tracking-[0.15em] shadow-sm ${getStatusStyle(order.status)}`}>
                          <StatusIcon className="size-3.5" />
                          {order.status}
                       </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                       <div className="flex items-center justify-end gap-3">
                          <div className="relative group/select">
                             <select 
                               value={order.status}
                               onChange={(e) => handleStatusChange(order._id, e.target.value)}
                               className="appearance-none text-[10px] font-black uppercase tracking-widest border-2 border-slate-100 dark:border-slate-800 rounded-2xl pl-4 pr-10 py-3 bg-white dark:bg-slate-900 outline-none focus:border-[#2d5a27] transition-all cursor-pointer shadow-sm"
                             >
                                <option value="Pending">Chờ duyệt</option>
                                <option value="Processing">Đang xử lý</option>
                                <option value="Completed">Hoàn tất</option>
                                <option value="Cancelled">Hủy bỏ</option>
                             </select>
                             <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-3 text-slate-400 pointer-events-none group-hover/select:text-primary transition-colors" />
                          </div>
                          <button 
                            onClick={() => navigate(`/order/${order._id}`)}
                            className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-[#2d5a27] hover:bg-[#2d5a27]/10 rounded-[1.25rem] transition-all hover:rotate-12"
                          >
                             <Eye className="size-5" />
                          </button>
                       </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="p-10 border-t border-slate-50 dark:border-slate-800 bg-slate-50/10 text-center">
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">Hết danh sách đơn hàng</p>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
