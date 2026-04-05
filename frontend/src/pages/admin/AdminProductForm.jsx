import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { adminApi } from '../../api/api';
import { ArrowLeft, Save, Image as ImageIcon, Upload, X, Star } from 'lucide-react';

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    origin: '',
    categoryId: '',
    weights: [{ weight: 100, price: 0, stock: 0 }]
  });

  const [productImages, setProductImages] = useState([]); // List of {imageUrl, isMain, sortOrder}
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Fetch categories first
    adminApi.getCategories()
      .then(res => setCategories(res.data))
      .catch(err => console.error("Failed to load categories", err));

    if (isEditMode) {
      adminApi.getProduct(id)
        .then(res => {
          const product = res.data;
          setFormData({
            name: product.name || '',
            description: product.description || '',
            origin: product.origin || '',
            categoryId: product.categoryId?._id || product.categoryId || '', // MongoDB populate hoặc ObjectId string
            weights: product.weights && product.weights.length > 0
              ? product.weights.map(w => ({ weight: w.weight, price: w.price, stock: w.stock }))
              : [{ weight: 100, price: 0, stock: 0 }]
          });
          // Nếu có imageUrl, tạo mảng ảnh từ nó
          if (product.imageUrl) {
            setProductImages([{ imageUrl: product.imageUrl, isMain: true }]);
          } else {
            setProductImages([]);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to load product", err);
          alert("Không tìm thấy sản phẩm");
          navigate('/admin/products');
        });
    }
  }, [id, navigate, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleWeightChange = (index, field, value) => {
    const newWeights = [...formData.weights];
    newWeights[index][field] = value;
    setFormData(prev => ({ ...prev, weights: newWeights }));
  };

  const addWeight = () => {
    setFormData(prev => ({
      ...prev,
      weights: [...prev.weights, { weight: 100, price: 0, stock: 0 }]
    }));
  };

  const removeWeight = (index) => {
    if (formData.weights.length <= 1) return;
    const newWeights = formData.weights.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, weights: newWeights }));
  };

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const res = await adminApi.uploadFiles(files);
      
      // Backend trả về: { message, files: [{url, filename, originalName, size}] }
      // Hoặc nếu 1 file: { message, url, filename, ... }
      let uploadedUrls = [];
      if (res.data.files && Array.isArray(res.data.files)) {
        uploadedUrls = res.data.files.map(f => f.url); // multiple images
      } else if (res.data.url) {
        uploadedUrls = [res.data.url]; // single image
      }

      const newImages = uploadedUrls.map((url, index) => ({
        imageUrl: url,
        isMain: productImages.length === 0 && index === 0,
        sortOrder: productImages.length + index
      }));

      setProductImages(prev => [...prev, ...newImages]);
    } catch (err) {
      console.error("Upload failed", err);
      const msg = err.response?.data?.message || 'Lỗi không xác định';
      alert(`Tải ảnh thất bại! ${msg}`);
    } finally {
      setUploading(false);
      // Reset input để có thể chọn lại cùng file
      e.target.value = '';
    }
  };

  const removeImage = (index) => {
    setProductImages(prev => {
      const newList = prev.filter((_, i) => i !== index);
      // If removed the main image, set another one as main if exists
      if (prev[index].isMain && newList.length > 0) {
        newList[0].isMain = true;
      }
      return newList;
    });
  };

  const setMainImage = (index) => {
    setProductImages(prev => prev.map((img, i) => ({
      ...img,
      isMain: i === index
    })));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Use the main image URL for the product's primary imageUrl field
      const mainImg = productImages.find(img => img.isMain) || productImages[0];
      
      // Node.js / MongoDB format
      const payload = {
        name: formData.name,
        description: formData.description,
        origin: formData.origin,
        imageUrl: mainImg ? mainImg.imageUrl : '',
        categoryId: formData.categoryId || null,    // ObjectId string
        price: formData.weights[0]?.price || 0,     // Giá cơ bản lấy từ loại đầu tiên
        stock: formData.weights.reduce((sum, w) => sum + (parseInt(w.stock) || 0), 0), // Tổng tồn kho
        weights: JSON.stringify(formData.weights.map(w => ({
          weight: parseInt(w.weight) || 0,
          price: parseFloat(w.price) || 0,
          stock: parseInt(w.stock) || 0
        }))),
        images: JSON.stringify(productImages.map(img => ({
          imageUrl: img.imageUrl,
          isMain: img.isMain || false,
          sortOrder: img.sortOrder || 0
        })))
      };
      
      if (isEditMode) {
        payload._id = id; // MongoDB _id string
      }
      
      await adminApi.saveProduct(payload);
      navigate('/admin/products');
    } catch (err) {
      console.error("Save product failed", err);
      const errorMessage = err.response?.data?.error || "Lỗi không xác định";
      const errorDetails = err.response?.data?.details || "";
      alert(`Không thể lưu sản phẩm!\nLỗi: ${errorMessage}\nChi tiết: ${errorDetails}`);
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
        <Link to="/admin/products" className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-100 dark:border-slate-800 hover:scale-105 transition-transform">
          <ArrowLeft className="size-5 text-slate-500" />
        </Link>
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">
            {isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h2>
          <p className="text-slate-500 font-medium">Nhập thông tin chi tiết cho sản phẩm trà của bạn.</p>
        </div>
      </div>

      {/* Form Area */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <form onSubmit={handleSave} className="p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tên sản phẩm *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary font-medium" placeholder="Trà Đinh Tân Cương..." />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Danh mục</label>
              <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer font-medium">
                <option value="">Chọn danh mục</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hình ảnh sản phẩm</label>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {/* Existing Images */}
              {productImages.map((img, idx) => (
                <div key={idx} className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${img.isMain ? 'border-primary ring-2 ring-primary/20' : 'border-slate-100 dark:border-slate-800'}`}>
                  <img src={img.imageUrl} alt="Product" className="w-full h-full object-cover" />
                  
                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button type="button" onClick={() => setMainImage(idx)} className={`p-2 rounded-lg transition-colors ${img.isMain ? 'bg-primary text-white' : 'bg-white/20 text-white hover:bg-white/40'}`} title="Đặt làm ảnh chính">
                      <Star className={`size-4 ${img.isMain ? 'fill-current' : ''}`} />
                    </button>
                    <button type="button" onClick={() => removeImage(idx)} className="p-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors" title="Xóa ảnh">
                      <X className="size-4" />
                    </button>
                  </div>
                  
                  {img.isMain && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-[10px] font-black text-white uppercase rounded-md shadow-lg">Ảnh chính</div>
                  )}
                </div>
              ))}

              {/* Upload Button */}
              <label className="cursor-pointer aspect-square rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center hover:border-primary hover:bg-primary/5 transition-all text-slate-400 hover:text-primary group">
                {uploading ? (
                  <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full"></div>
                ) : (
                  <>
                    <Upload className="size-8 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold uppercase">Tải ảnh lên</span>
                  </>
                )}
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nguồn gốc / Xuất xứ</label>
            <input type="text" name="origin" value={formData.origin} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary font-medium" placeholder="Thái Nguyên, Việt Nam" />
          </div>

          {/* Weights Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Trọng lượng & Giá bán *</label>
              <button type="button" onClick={addWeight} className="text-xs font-black text-primary uppercase tracking-tighter hover:underline">
                + Thêm định lượng
              </button>
            </div>

            <div className="space-y-3">
              {formData.weights.map((w, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 relative group">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Trọng lượng (g)</span>
                    <input type="number" value={w.weight} onChange={(e) => handleWeightChange(idx, 'weight', e.target.value)} min="0" className="w-full bg-transparent border-none focus:ring-0 font-bold" placeholder="100" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Giá bán (VNĐ)</span>
                    <input type="number" value={w.price} onChange={(e) => handleWeightChange(idx, 'price', e.target.value)} min="0" className="w-full bg-transparent border-none focus:ring-0 font-bold text-primary text-lg" placeholder="50000" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Tồn kho</span>
                    <input type="number" value={w.stock} onChange={(e) => handleWeightChange(idx, 'stock', e.target.value)} min="0" className="w-full bg-transparent border-none focus:ring-0 font-bold" placeholder="50" />
                  </div>
                  <div className="flex items-center justify-end">
                    {formData.weights.length > 1 && (
                      <button type="button" onClick={() => removeWeight(idx)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors md:opacity-0 group-hover:opacity-100">
                        <X className="size-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Mô tả chi tiết</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="6" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary resize-none font-medium leading-relaxed" placeholder="Viết mô tả chi tiết cho sản phẩm..."></textarea>
          </div>
          
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4">
            <Link to="/admin/products" className="px-8 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors">
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

export default AdminProductForm;
