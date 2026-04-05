import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/api';
import { 
  ShoppingBag, 
  DollarSign, 
  Package, 
  Users, 
  TrendingUp, 
  ArrowUpRight,
  Clock,
  ExternalLink
} from 'lucide-react';

const StatsCard = ({ title, value, icon: Icon, trend, color }) => (
  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
    <div className={`absolute -right-4 -top-4 size-24 bg-${color}-500/5 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
    
    <div className="flex justify-between items-start relative z-10">
      <div className={`p-3 rounded-2xl bg-${color}-500/10 text-${color}-600 group-hover:scale-110 transition-transform`}>
        <Icon className="size-6" />
      </div>
      {trend && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-bold">
          <TrendingUp className="size-3" />
          {trend}%
        </div>
      )}
    </div>
    
    <div className="mt-4 relative z-10">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
      <h3 className="text-2xl font-black mt-1 tracking-tight">{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    adminApi.getDashboard()
      .then(res => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleExport = async () => {
    // Thêm xác nhận chuyên nghiệp
    const isConfirmed = window.confirm(
      "📊 XÁC NHẬN XUẤT BÁO CÁO\n\n" +
      "Hệ thống sẽ tổng hợp toàn bộ dữ liệu đơn hàng và tải xuống dưới dạng file Excel (.xlsx).\n" +
      "Anh có chắc chắn muốn thực hiện hành động này không?"
    );

    if (!isConfirmed) return;

    try {
      const response = await adminApi.exportOrders();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Bao_cao_don_hang.xlsx');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error('Lỗi xuất file:', err);
      alert('⚠️ Không thể xuất báo cáo! Vui lòng thử lại sau.');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">Tổng quan hệ thống</h2>
          <p className="text-slate-500 font-medium">Chào mừng trở lại! Đây là tình hình kinh doanh của Trà Thơm hôm nay.</p>
        </div>
        <button 
          onClick={handleExport}
          className="btn-primary"
        >
          <ArrowUpRight className="size-5" />
          Xuất báo cáo
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Tổng đơn hàng" 
          value={stats?.totalOrders || 0} 
          icon={ShoppingBag} 
          trend={stats?.orderTrend} 
          color="emerald" 
        />
        <StatsCard 
          title="Doanh thu" 
          value={`${(stats?.totalRevenue || 0).toLocaleString()}đ`} 
          icon={DollarSign} 
          trend={stats?.revenueTrend} 
          color="amber" 
        />
        <StatsCard 
          title="Sản phẩm" 
          value={stats?.totalProducts || 0} 
          icon={Package} 
          color="blue" 
        />
        <StatsCard 
          title="Khách hàng" 
          value={stats?.totalUsers || 0} 
          icon={Users} 
          color="rose" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Latest Orders */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h4 className="text-lg font-black tracking-tight flex items-center gap-2">
              <Clock className="size-5 text-primary" />
              Đơn hàng mới nhất
            </h4>
            <button 
              onClick={() => navigate('/admin/orders')}
              className="text-primary text-xs font-bold uppercase tracking-widest hover:underline flex items-center gap-1"
            >
              Xem tất cả
              <ExternalLink className="size-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Khách hàng</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tổng tiền</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {stats?.latestOrders?.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-sm text-primary">#ORD-{order._id?.slice(-6)}</td>
                    <td className="px-6 py-4 font-bold text-sm">{order.userId?.fullName || 'Ẩn danh'}</td>
                    <td className="px-6 py-4 font-bold text-sm">{(order.totalAmount || 0).toLocaleString()}đ</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        order.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 
                        order.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Categories Performance */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
           <h4 className="text-lg font-black tracking-tight mb-6">Hiệu suất danh mục</h4>
           <div className="space-y-6">
             {Object.entries(stats?.categoryPerformance || {}).length > 0 ? (
               Object.entries(stats?.categoryPerformance).map(([name, value], i) => {
                 const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-rose-500', 'bg-indigo-500', 'bg-orange-500'];
                 const color = colors[i % colors.length];
                 return (
                   <div key={i} className="space-y-2">
                     <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                       <span>{name}</span>
                       <span>{value}%</span>
                     </div>
                     <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                       <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${value}%` }}></div>
                     </div>
                   </div>
                 );
               })
             ) : (
               <div className="text-center py-10">
                 <p className="text-slate-400 text-sm font-medium">Chưa có dữ liệu giao dịch</p>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
