import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Package, 
  Lock, 
  LogOut, 
  Camera, 
  MapPin, 
  Phone, 
  Mail, 
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Truck
} from 'lucide-react';
import { customerApi, provinceApi } from '../../api/api';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('info');
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Province API states
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  
  const navigate = useNavigate();

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    province: '',
    district: '',
    ward: '',
    address: ''
  });
  const [passData, setPassData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const res = await provinceApi.getProvinces();
      setProvinces(res.data);

      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        navigate('/login');
        return;
      }
      const userData = JSON.parse(storedUser);
      setUser(userData);

      const initialForm = {
        fullName: userData.fullName || '',
        phone: userData.phone || '',
        email: userData.email || '',
        province: userData.province || '',
        district: userData.district || '',
        ward: userData.ward || '',
        address: userData.address || ''
      };
      setFormData(initialForm);
      if (userData) {
        fetchOrders(userData._id);
      }

      // If existing province, load districts
      if (userData.province) {
        const province = res.data.find(p => p.name === userData.province);
        if (province) {
          const distRes = await provinceApi.getDistricts(province.code);
          setDistricts(distRes.data.districts);

          if (userData.district) {
            const district = distRes.data.districts.find(d => d.name === userData.district);
            if (district) {
              const wardRes = await provinceApi.getWards(district.code);
              setWards(wardRes.data.wards);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  };

  const handleProvinceChange = async (e) => {
    const provinceName = e.target.value;
    const province = provinces.find(p => p.name === provinceName);

    setFormData({
      ...formData,
      province: provinceName,
      district: '',
      ward: ''
    });
    setDistricts([]);
    setWards([]);

    if (province) {
      const res = await provinceApi.getDistricts(province.code);
      setDistricts(res.data.districts);
    }
  };

  const handleDistrictChange = async (e) => {
    const districtName = e.target.value;
    const district = districts.find(d => d.name === districtName);

    setFormData({
      ...formData,
      district: districtName,
      ward: ''
    });
    setWards([]);

    if (district) {
      const res = await provinceApi.getWards(district.code);
      setWards(res.data.wards);
    }
  };

  const fetchOrders = async (userId) => {
    try {
      const res = await customerApi.getOrders(userId);
      setOrders(res.data || []);
    } catch (err) {
      console.error('Lỗi lấy đơn hàng:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await customerApi.updateProfile(formData);
      const updatedUser = { ...user, ...formData, ...res.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      alert('Cập nhật hồ sơ thành công!');
    } catch (err) {
      alert('Cập nhật thất bại, vui lòng thử lại.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!passData.oldPassword || !passData.newPassword || !passData.confirmPassword) {
      alert('Vui lòng điền đầy đủ các trường mật khẩu!');
      return;
    }

    if (passData.newPassword !== passData.confirmPassword) {
      alert('Mật khẩu mới và xác nhận mật khẩu không khớp!');
      return;
    }

    if (passData.newPassword.length < 6) {
      alert('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    try {
      console.log('Đang đổi mật khẩu cho user:', user._id);
      
      await customerApi.changePassword({
        oldPassword: passData.oldPassword,
        newPassword: passData.newPassword
      });
      
      alert('Đổi mật khẩu thành công! Bạn có thể sử dụng mật khẩu mới cho lần đăng nhập sau.');
      setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      alert('Lỗi: Mật khẩu cũ không chính xác hoặc có lỗi hệ thống.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };

  if (!user) return null;

  const tabs = [
    { id: 'info', label: 'Thông tin cá nhân', icon: User },
    { id: 'orders', label: 'Lịch sử đơn hàng', icon: Package },
    { id: 'security', label: 'Bảo mật & Mật khẩu', icon: Lock },
  ];

  return (
    <div className="bg-[#f8f6f6] dark:bg-[#221610] min-h-screen pt-32 pb-24 font-['Public_Sans']">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
              <div className="relative group">
                <div className="size-24 rounded-[32px] bg-[#f1f8f0] dark:bg-[#221610] flex items-center justify-center overflow-hidden border-2 border-primary/20">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.fullName} className="size-full object-cover" />
                  ) : (
                    <User className="size-10 text-primary opacity-40" />
                  )}
                </div>
                <button className="absolute -bottom-2 -right-2 size-8 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900 group-hover:scale-110 transition-transform">
                  <Camera className="size-4" />
                </button>
              </div>
              <div className="mt-6 space-y-1">
                <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white line-clamp-1">{user.fullName}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none italic pb-1">
                  Thành viên cao cấp
                </p>
              </div>
            </div>

            <nav className="bg-white dark:bg-slate-900 rounded-[32px] p-4 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 space-y-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-sm transition-all ${
                    activeTab === tab.id 
                      ? 'bg-[#f1f8f0] text-[#2d5a27] dark:bg-[#2d5a27]/20 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <tab.icon className={`size-5 ${activeTab === tab.id ? 'text-[#2d5a27]' : ''}`} />
                  {tab.label}
                </button>
              ))}
              <div className="h-px bg-slate-100 dark:bg-slate-800 my-2 mx-4"></div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
              >
                <LogOut className="size-5" />
                Đăng xuất
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 min-h-[600px]">
              
              {activeTab === 'info' && (
                <div className="space-y-10 animate-in fade-in duration-500">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black tracking-tight text-[#2d5a27]">Thông tin cá nhân</h2>
                    <p className="text-xs text-slate-400 font-medium">Cập nhật thông tin của bạn để có trải nghiệm tốt nhất</p>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 pl-1">Họ và tên</label>
                      <input 
                        type="text" 
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        className="w-full p-4 rounded-2xl bg-[#f8f6f6] dark:bg-slate-950 border-none focus:ring-2 focus:ring-[#2d5a27] outline-none font-bold text-sm transition-all"
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 pl-1">Email</label>
                      <input 
                        type="email" 
                        value={formData.email}
                        readOnly
                        className="w-full p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 outline-none font-bold text-sm text-slate-400 cursor-not-allowed shadow-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 pl-1">Số điện thoại</label>
                      <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-[#2d5a27]/30 focus:ring-4 focus:ring-[#2d5a27]/5 outline-none font-bold text-sm transition-all shadow-sm"
                        placeholder="0901 234 567"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 pl-1">Tỉnh / Thành phố</label>
                      <select 
                        value={formData.province}
                        onChange={handleProvinceChange}
                        className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-[#2d5a27]/30 focus:ring-4 focus:ring-[#2d5a27]/5 outline-none font-bold text-sm transition-all shadow-sm"
                      >
                        <option value="">Chọn Tỉnh / Thành phố</option>
                        {provinces.map(p => (
                          <option key={p.code} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 pl-1">Quận / Huyện</label>
                      <select 
                        value={formData.district}
                        onChange={handleDistrictChange}
                        disabled={!formData.province}
                        className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-[#2d5a27]/30 focus:ring-4 focus:ring-[#2d5a27]/5 outline-none font-bold text-sm transition-all shadow-sm disabled:opacity-50 disabled:bg-slate-50"
                      >
                        <option value="">Chọn Quận / Huyện</option>
                        {districts.map(d => (
                          <option key={d.code} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 pl-1">Phường / Xã</label>
                      <select 
                        value={formData.ward}
                        onChange={(e) => setFormData({...formData, ward: e.target.value})}
                        disabled={!formData.district}
                        className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-[#2d5a27]/30 focus:ring-4 focus:ring-[#2d5a27]/5 outline-none font-bold text-sm transition-all shadow-sm disabled:opacity-50 disabled:bg-slate-50"
                      >
                        <option value="">Chọn Phường / Xã</option>
                        {wards.map(w => (
                          <option key={w.code} value={w.name}>{w.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 pl-1">Địa chỉ chi tiết</label>
                      <textarea 
                        rows="2"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-[#2d5a27]/30 focus:ring-4 focus:ring-[#2d5a27]/5 outline-none font-bold text-sm transition-all resize-none shadow-sm"
                        placeholder="Số nhà, tên đường..."
                      ></textarea>
                    </div>

                    <div className="md:col-span-2 pt-4">
                      <button type="submit" className="px-10 py-4 bg-[#2d5a27] text-white font-black rounded-2xl shadow-lg shadow-[#2d5a27]/20 hover:-translate-y-1 transition-all uppercase tracking-widest text-xs">
                        Lưu thay đổi
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="space-y-10 animate-in fade-in duration-500">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black tracking-tight text-[#2d5a27]">Lịch sử đơn hàng</h2>
                    <p className="text-xs text-slate-400 font-medium">Theo dõi các đơn hàng bạn đã đặt tại Trà Thơm</p>
                  </div>

                  {loading ? (
                    <div className="flex justify-center py-20">
                      <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-6">
                      {orders.map(order => (
                        <div key={order._id} className="group p-6 rounded-[32px] bg-[#f8f6f6] dark:bg-slate-950 border border-transparent hover:border-primary/20 transition-all">
                          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-4">
                              <div className="size-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-primary shadow-sm">
                                <Package className="size-6" />
                              </div>
                              <div>
                                <p className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">Đơn hàng #{order._id?.slice(-6)}</p>
                                <p className="text-xs font-bold text-slate-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                              order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                              order.status === 'Cancelled' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                              order.status === 'Processing' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                              'bg-amber-50 text-amber-600 border-amber-100'
                            }`}>
                              {order.status === 'Completed' ? 'Đã hoàn thành' : 
                               order.status === 'Cancelled' ? 'Đã hủy' : 
                               order.status === 'Processing' ? 'Đang xử lý' : 'Chờ xử lý'}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-white dark:border-slate-800">
                            <div className="flex items-center gap-2">
                               <span className="text-xs font-bold text-slate-500">Tổng thanh toán:</span>
                               <span className="text-lg font-black text-primary">{order.totalAmount?.toLocaleString()}đ</span>
                            </div>
                            <button onClick={() => navigate(`/order/${order._id}`)} className="text-xs font-black text-slate-400 hover:text-[#2d5a27] transition-all flex items-center gap-1 uppercase tracking-widest">
                               Chi tiết
                               <ChevronRight className="size-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-[#f8f6f6] dark:bg-slate-950 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-800">
                      <Package className="size-16 text-slate-200 mb-4" />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Bạn chưa có đơn hàng nào</p>
                      <button onClick={() => navigate('/products')} className="mt-6 text-primary font-black uppercase tracking-widest text-xs hover:underline decoration-2 underline-offset-8">
                        Khám phá sản phẩm ngay
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-10 animate-in fade-in duration-500">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black tracking-tight text-[#2d5a27]">Bảo mật & Mật khẩu</h2>
                    <p className="text-xs text-slate-400 font-medium">Quản lý mật khẩu để bảo vệ tài khoản của bạn</p>
                  </div>

                  <form onSubmit={handleChangePassword} className="max-w-md space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 pl-1">Mật khẩu hiện tại</label>
                      <input 
                        type="password" 
                        value={passData.oldPassword}
                        onChange={(e) => setPassData({...passData, oldPassword: e.target.value})}
                        className="w-full p-4 rounded-2xl bg-[#f8f6f6] dark:bg-slate-950 border-none focus:ring-2 focus:ring-[#2d5a27] outline-none font-bold text-sm transition-all"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 pl-1">Mật khẩu mới</label>
                      <input 
                        type="password" 
                        value={passData.newPassword}
                        onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                        className="w-full p-4 rounded-2xl bg-[#f8f6f6] dark:bg-slate-950 border-none focus:ring-2 focus:ring-[#2d5a27] outline-none font-bold text-sm transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 pl-1">Xác nhận mật khẩu mới</label>
                      <input 
                        type="password" 
                        value={passData.confirmPassword}
                        onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
                        className="w-full p-4 rounded-2xl bg-[#f8f6f6] dark:bg-slate-950 border-none focus:ring-2 focus:ring-[#2d5a27] outline-none font-bold text-sm transition-all"
                      />
                    </div>

                    <div className="pt-4">
                      <button type="submit" className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-900/10 hover:-translate-y-1 transition-all uppercase tracking-widest text-xs">
                        Đổi mật khẩu
                      </button>
                    </div>
                  </form>

                  <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 flex gap-4">
                    <Clock className="size-5 text-amber-500 shrink-0" />
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium leading-relaxed italic">
                      Lưu ý: Bạn nên sử dụng mật khẩu có ít nhất 8 ký tự, bao gồm cả chữ và số để đảm bảo tính bảo mật cao nhất.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
