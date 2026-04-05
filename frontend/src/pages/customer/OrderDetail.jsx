import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Package, 
  Truck, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Calendar,
  Phone,
  User,
  Mail
} from 'lucide-react';
import { customerApi } from '../../api/api';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      const res = await customerApi.getOrderDetail(id);
      if (res.data) {
        setOrder(res.data);
      } else {
        alert('Không tìm thấy đơn hàng!');
        navigate('/profile');
      }
    } catch (err) {
      console.error(err);
      alert('Không tìm thấy đơn hàng hoặc bạn không có quyền xem!');
      navigate('/profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin size-8 border-4 border-[#2d5a27] border-t-transparent rounded-full"></div>
    </div>
  );

  if (!order) return null;

  const statusMap = {
    'Pending': { label: 'Chờ xử lý', color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
    'Processing': { label: 'Đang xử lý', color: 'text-blue-600', bg: 'bg-blue-50', icon: Truck },
    'Completed': { label: 'Đã hoàn thành', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
    'Cancelled': { label: 'Đã hủy', color: 'text-rose-600', bg: 'bg-rose-50', icon: XCircle },
  };

  const currentStatus = statusMap[order.status] || statusMap['Pending'];

  return (
    <div className="bg-[#f8f6f6] dark:bg-[#221610] min-h-screen pt-32 pb-24 font-['Public_Sans']">
      <div className="container mx-auto px-6 max-w-4xl">
        <button 
          onClick={() => navigate(-1)} 
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-all mb-8 group"
        >
          <ChevronLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
          Quay lại
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-[40px] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
          {/* Header */}
          <div className="p-10 border-b border-slate-50 dark:border-slate-800 flex flex-wrap items-center justify-between gap-6 bg-slate-50/50 dark:bg-slate-800/20">
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tight text-[#2d5a27]">Đơn hàng #{order._id?.slice(-6)}</h1>
              <div className="flex items-center gap-3 text-sm font-bold mt-2">
                <span className="text-slate-400">{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                <span className="size-1 rounded-full bg-slate-300"></span>
                <span>{order.details?.length || 0} sản phẩm</span>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] border ${currentStatus.bg} ${currentStatus.color} border-current/20`}>
              <currentStatus.icon className="size-4" />
              {currentStatus.label}
            </div>
          </div>

          <div className="p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
              {/* Shipping Info */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2 text-[#2d5a27]">
                  <MapPin className="size-5" />
                  Thông tin nhận hàng
                </h3>
                <div className="p-6 rounded-3xl bg-[#f8f6f6] dark:bg-slate-950 space-y-4">
                  <div className="flex items-start gap-4">
                     <User className="size-4 text-slate-400 mt-1" />
                     <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">Người nhận</p>
                        <p className="font-bold text-sm">{order.shippingName || order.userId?.fullName}</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-4">
                     <Phone className="size-4 text-slate-400 mt-1" />
                     <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">Điện thoại</p>
                        <p className="font-bold text-sm">{order.shippingPhone || order.userId?.phone}</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-4">
                     <Mail className="size-4 text-slate-400 mt-1" />
                     <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">Email</p>
                        <p className="font-bold text-sm">{order.shippingEmail || order.userId?.email}</p>
                     </div>
                  </div>
                  <div className="flex items-start gap-4">
                     <MapPin className="size-4 text-slate-400 mt-1" />
                     <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">Địa chỉ</p>
                        <p className="font-bold text-sm leading-relaxed">{order.shippingAddress || order.userId?.address}</p>
                     </div>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2 text-[#2d5a27]">
                  <CreditCard className="size-5" />
                  Thanh toán
                </h3>
                <div className="p-6 rounded-3xl bg-[#f8f6f6] dark:bg-slate-950 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Phương thức</span>
                    <span className="text-sm font-bold uppercase">{order.paymentMethod === 'cod' ? 'Tiền mặt (COD)' : 'VNPAY'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Trạng thái</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 italic">
                      {order.vnpTxnRef ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </span>
                  </div>
                  {(() => {
                    const itemsSubtotal = order.details?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0;
                    const displayShippingFee = order.shippingFee !== null && order.shippingFee !== undefined ? order.shippingFee : (order.totalAmount - itemsSubtotal);
                    
                    return (
                      <div className="pt-4 mt-4 border-t border-white dark:border-slate-800 space-y-2">
                        <div className="flex justify-between text-sm font-bold">
                           <span className="text-slate-400 uppercase tracking-tight">Tạm tính:</span>
                           <span>{itemsSubtotal.toLocaleString()}đ</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold">
                           <span className="text-slate-400 uppercase tracking-tight">Vận chuyển:</span>
                           <span className="text-emerald-500">+{displayShippingFee.toLocaleString()}đ</span>
                        </div>
                        <div className="flex justify-between text-xl font-black pt-2 text-[#2d5a27]">
                           <span className="uppercase tracking-tighter">Tổng cộng:</span>
                           <span>{order.totalAmount?.toLocaleString()}đ</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Products List */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2 text-[#2d5a27]">
                <Package className="size-5" />
                Sản phẩm đã đặt
              </h3>
              <div className="border border-slate-50 dark:border-slate-800 rounded-3xl overflow-hidden shadow-inner font-['Public_Sans']">
                <table className="w-full text-left">
                  <thead className="bg-[#f8f6f6] dark:bg-slate-950 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-50 dark:border-slate-800">
                    <tr>
                      <th className="px-8 py-6">Sản phẩm</th>
                      <th className="px-8 py-6 text-center">SL</th>
                      <th className="px-8 py-6 text-right">Đơn giá</th>
                      <th className="px-8 py-6 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {order.details?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="size-14 rounded-xl bg-white dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-100 dark:border-slate-700 shadow-sm">
                               <img src={item.product?.imageUrl} alt="" className="size-full object-cover" />
                            </div>
                            <div className="space-y-1">
                               <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{item.product?.name}</p>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.product?.price?.toLocaleString()}đ</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center font-bold text-sm text-slate-600 dark:text-slate-400">x{item.quantity}</td>
                        <td className="px-8 py-6 text-right font-bold text-sm text-slate-600 dark:text-slate-400">{item.price?.toLocaleString()}đ</td>
                        <td className="px-8 py-6 text-right font-black text-sm text-[#2d5a27]">{(item.price * item.quantity).toLocaleString()}đ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
