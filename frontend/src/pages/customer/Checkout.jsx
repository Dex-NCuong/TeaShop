import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { 
  ChevronLeft, 
  MapPin, 
  Truck, 
  CreditCard, 
  ShieldCheck, 
  Lock,
  ArrowRight
} from 'lucide-react';
import api, { provinceApi } from '../../api/api';

// Re-defining icons using Lucide to match the mockup's spirit
const Checkout = () => {
  const { cartItems, subtotal, cartCount } = useCart();
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('vnpay');

  // Province API states
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // Form states with auto-fill logic
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    province: '',
    district: '',
    ward: '',
    address: ''
  });

  React.useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const res = await provinceApi.getProvinces();
      setProvinces(res.data);

      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setFormData({
          fullName: user.fullName || '',
          phone: user.phone || '',
          email: user.email || '',
          province: user.province || '',
          district: user.district || '',
          ward: user.ward || '',
          address: user.address || ''
        });

        // Cascading auto-fill
        if (user.province) {
          const province = res.data.find(p => p.name === user.province);
          if (province) {
            const distRes = await provinceApi.getDistricts(province.code);
            setDistricts(distRes.data.districts);
            
            if (user.district) {
              const district = distRes.data.districts.find(d => d.name === user.district);
              if (district) {
                const wardRes = await provinceApi.getWards(district.code);
                setWards(wardRes.data.wards);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching provinces:', err);
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

  const handleCheckout = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert('Vui lòng đăng nhập để thanh toán');
        return;
    }

    try {
        const response = await api.post('/payment/create-payment', {
            amount: total,
            orderData: {
                userId: user.id || user._id, // Ưu tiên .id mới, fallback ._id cũ
                amount: total,
                items: cartItems.map(item => ({
                    productId: item._id,
                    quantity: item.quantity,
                    price: item.price,
                    weight: item.weight
                })),
                shippingInfo: {
                    fullName: formData.fullName,
                    phone: formData.phone,
                    email: formData.email,
                    address: fullAddress,
                    shippingFee: shippingFee,
                    paymentMethod: paymentMethod
                }
            }
        });
        
        if (response.data.url) {
            window.location.href = response.data.url;
        }
    } catch (error) {
        console.error('Lỗi tạo thanh toán:', error);
        alert('Có lỗi xảy ra, vui lòng thử lại sau');
    }
  };

  const shippingFee = shippingMethod === 'standard' ? 30000 : 55000;
  const total = subtotal + shippingFee;

  return (
    <div className="bg-[#f8f6f6] dark:bg-[#221610] min-h-screen font-['Public_Sans'] text-slate-900 dark:text-slate-100 pb-24">
      {/* Page Header / Breadcrumb - following mockup style */}
      <div className="pt-32 pb-8">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-[#2d5a27]">Thanh toán</h2>
            <span className="text-xs font-medium text-slate-500">Bước 2 trên 4</span>
          </div>

          {/* Progress Bar */}
          <div className="relative mb-12">
            <div className="overflow-hidden h-1.5 mb-4 text-xs flex rounded-full bg-[#f1f8f0] dark:bg-slate-800">
              <div className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#2d5a27]" style={{ width: '50%' }}></div>
            </div>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <div className="text-[#2d5a27]">1. Giỏ hàng</div>
              <div className="text-[#2d5a27] font-black">2. Thông tin giao hàng</div>
              <div>3. Thanh toán</div>
              <div>4. Hoàn tất</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Main Form Area */}
            <div className="lg:col-span-7 space-y-12">
              
              {/* Shipping Info */}
              <section className="space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span className="p-1.5 bg-[#f1f8f0] dark:bg-[#2d5a27]/20 rounded-lg">
                    <MapPin className="size-4 text-[#2d5a27]" />
                  </span>
                  Thông tin nhận hàng
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Họ và tên</label>
                    <input 
                      type="text" 
                      placeholder="Nguyễn Văn A" 
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full p-4 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[#2d5a27] focus:border-transparent outline-none transition-all shadow-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Số điện thoại</label>
                    <input 
                      type="tel" 
                      placeholder="0901 234 567" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full p-4 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[#2d5a27] focus:border-transparent outline-none transition-all shadow-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Email</label>
                    <input 
                      type="email" 
                      placeholder="vi-du@email.com" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full p-4 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[#2d5a27] focus:border-transparent outline-none transition-all shadow-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Tỉnh / Thành phố</label>
                    <select 
                      value={formData.province}
                      onChange={handleProvinceChange}
                      className="w-full p-4 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[#2d5a27] outline-none shadow-sm text-sm"
                    >
                      <option value="">Chọn Tỉnh / Thành phố</option>
                      {provinces.map(p => (
                        <option key={p.code} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Quận / Huyện</label>
                    <select 
                      value={formData.district}
                      onChange={handleDistrictChange}
                      disabled={!formData.province}
                      className="w-full p-4 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[#2d5a27] outline-none shadow-sm text-sm disabled:opacity-50"
                    >
                      <option value="">Chọn Quận / Huyện</option>
                      {districts.map(d => (
                        <option key={d.code} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Phường / Xã</label>
                    <select 
                      value={formData.ward}
                      onChange={(e) => setFormData({...formData, ward: e.target.value})}
                      disabled={!formData.district}
                      className="w-full p-4 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[#2d5a27] outline-none shadow-sm text-sm disabled:opacity-50"
                    >
                      <option value="">Chọn Phường / Xã</option>
                      {wards.map(w => (
                        <option key={w.code} value={w.name}>{w.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Địa chỉ chi tiết</label>
                    <input 
                      type="text" 
                      placeholder="Số nhà, tên đường..." 
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full p-4 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-[#2d5a27] focus:border-transparent outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>
              </section>

              {/* Shipping Method */}
              <section className="space-y-8">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="p-2 bg-[#f1f8f0] dark:bg-[#2d5a27]/20 rounded-xl">
                    <Truck className="size-5 text-[#2d5a27]" />
                  </span>
                  Phương thức vận chuyển
                </h3>
                
                <div className="space-y-4">
                  <label 
                    className={`flex items-center justify-between p-5 border-2 rounded-2xl cursor-pointer transition-all ${
                      shippingMethod === 'standard' ? 'border-[#2d5a27] bg-[#f1f8f0]/40 shadow-md' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#2d5a27]/30'
                    }`}
                    onClick={() => setShippingMethod('standard')}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`size-5 rounded-full border-2 flex items-center justify-center transition-all ${shippingMethod === 'standard' ? 'border-[#2d5a27] bg-[#2d5a27]' : 'border-slate-300'}`}>
                        {shippingMethod === 'standard' && <div className="size-2 bg-white rounded-full"></div>}
                      </div>
                      <div>
                        <p className="font-bold">Giao hàng tiêu chuẩn</p>
                        <p className="text-xs text-slate-500 font-medium italic mt-0.5">Dự kiến nhận hàng sau 3-5 ngày</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#2d5a27]">30.000đ</span>
                  </label>

                  <label 
                    className={`flex items-center justify-between p-5 border-2 rounded-2xl cursor-pointer transition-all ${
                      shippingMethod === 'fast' ? 'border-[#2d5a27] bg-[#f1f8f0]/40 shadow-md' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#2d5a27]/30'
                    }`}
                    onClick={() => setShippingMethod('fast')}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`size-5 rounded-full border-2 flex items-center justify-center transition-all ${shippingMethod === 'fast' ? 'border-[#2d5a27] bg-[#2d5a27]' : 'border-slate-300'}`}>
                        {shippingMethod === 'fast' && <div className="size-2 bg-white rounded-full"></div>}
                      </div>
                      <div>
                        <p className="font-bold">Giao hàng nhanh (Hỏa tốc)</p>
                        <p className="text-xs text-slate-500 font-medium italic mt-0.5">Dự kiến nhận hàng sau 1-2 ngày</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#2d5a27]">55.000đ</span>
                  </label>
                </div>
              </section>

              {/* Payment Method */}
              <section className="space-y-8">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="p-2 bg-[#f1f8f0] dark:bg-[#2d5a27]/20 rounded-xl">
                    <CreditCard className="size-5 text-[#2d5a27]" />
                  </span>
                  Phương thức thanh toán
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { id: 'vnpay', name: 'Thanh toán qua VNPAY', icon: 'vnpay', desc: 'Thanh toán bằng thẻ ATM, Visa, Master, QR Code qua cổng VNPAY' },
                  ].map(method => (
                    <label 
                      key={method.id}
                      className={`flex items-center gap-4 p-5 border-2 rounded-2xl cursor-pointer transition-all border-[#2d5a27] bg-[#f1f8f0]/40 shadow-md`}
                    >
                      <div className={`size-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all border-[#2d5a27] bg-[#2d5a27]`}>
                        <div className="size-2 bg-white rounded-full"></div>
                      </div>
                      <div className="flex items-center gap-4">
                        <img src="https://sandbox.vnpayment.vn/paymentv2/Images/brands/logo-vnpay.png" alt="VNPAY" className="h-6" />
                        <div>
                          <p className="font-bold text-sm">{method.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{method.desc}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar Summary */}
            <div className="lg:col-span-5 h-fit lg:sticky lg:top-32">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden">
                <div className="p-8 space-y-8">
                  <h3 className="text-lg font-bold border-b border-slate-100 dark:border-slate-800 pb-4">Tóm tắt đơn hàng</h3>
                  
                  <div className="space-y-6 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
                    {cartItems.map(item => (
                      <div key={item.itemKey} className="flex gap-4">
                        <div className="size-16 rounded-xl bg-[#f1f8f0] dark:bg-slate-800 overflow-hidden shrink-0">
                          <img src={item.image} alt={item.name} className="size-full object-cover" />
                        </div>
                        <div className="flex-grow space-y-1">
                          <p className="text-sm font-bold line-clamp-1">{item.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{item.weight}g x {item.quantity}</p>
                          <p className="text-sm font-bold text-[#2d5a27] mt-1">{(item.price * item.quantity).toLocaleString()}đ</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-slate-500">Tạm tính</span>
                      <span className="font-bold">{subtotal.toLocaleString()}đ</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-slate-500">Phí vận chuyển</span>
                      <span className="font-bold text-emerald-600">+{shippingFee.toLocaleString()}đ</span>
                    </div>
                    <div className="pt-4 flex justify-between items-center">
                      <span className="font-bold text-base uppercase tracking-tight text-slate-500">Tổng cộng</span>
                      <span className="text-2xl font-bold text-[#2d5a27]">{total.toLocaleString()}đ</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleCheckout}
                    className="w-full bg-[#2d5a27] hover:bg-[#1e3d1a] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#2d5a27]/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs hover:-translate-y-1"
                  >
                    ĐẶT HÀNG QUA VNPAY
                    <ArrowRight className="size-4" />
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] pt-4">
                    <Lock className="size-4 text-emerald-500" />
                    Thanh toán bảo mật 256-bit
                  </div>
                </div>
              </div>

              {/* Motto card */}
              <div className="mt-6 p-6 bg-[#f1f8f0] dark:bg-[#2d5a27]/10 rounded-2xl border border-[#2d5a27]/10 shadow-sm transition-all hover:shadow-md">
                <p className="text-xs text-[#2d5a27] font-medium italic text-center leading-relaxed">
                  "Từng búp trà xanh mướt được hái thủ công từ vùng cao nguyên lộng gió, mang hương vị thuần khiết nhất đến tách trà của bạn."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
