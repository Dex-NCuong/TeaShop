import axios from 'axios';

// =============================================
// Axios instance chính - tự động gắn JWT token
// =============================================
const api = axios.create({
  baseURL: '/api',
});

// Request interceptor: tự động thêm Authorization header
api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsed = JSON.parse(user);
      const token = parsed.token;
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: xử lý lỗi 401 (hết hạn token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('authChange'));
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// =============================================
// Admin API — gọi đúng endpoint Node.js mới
// =============================================
export const adminApi = {
  // Dashboard
  getDashboard: () => api.get('/orders/dashboard'),

  // Products
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  saveProduct: (product) => {
    if (product._id) {
      return api.put(`/products/${product._id}`, product); // Edit mode
    }
    return api.post('/products', product); // Create mode
  },
  updateProduct: (id, product) => api.put(`/products/${id}`, product),
  deleteProduct: (id) => api.delete(`/products/${id}`),

  // Categories
  getCategories: () => api.get('/categories'),
  getCategory: (id) => api.get(`/categories/${id}`),
  saveCategory: (category) => {
    if (category._id || category.id) {
      const id = category._id || category.id;
      return api.put(`/categories/${id}`, category);
    }
    return api.post('/categories', category);
  },
  updateCategory: (id, category) => api.put(`/categories/${id}`, category),
  deleteCategory: (id) => api.delete(`/categories/${id}`),

  // Upload ảnh
  uploadImage: (file, folder = 'products') => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post(`/upload/${folder === 'products' ? 'product-image' : 'image'}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadFiles: (files) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]); // phải khớp với multer field name
    }
    return api.post('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Orders
  getOrders: (params) => api.get('/orders', { params }),
  getOrderDetail: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  exportOrders: () => api.get('/orders/export', { responseType: 'blob' }),

  // Customers (Users)
  getCustomers: (params) => api.get('/auth/users', { params }),
  getCustomer: (id) => api.get(`/auth/users/${id}`),
  saveCustomer: (user) => api.post('/auth/register', user),
  updateCustomerRole: (id, roles) => api.put(`/auth/users/${id}/role`, { roles }),
  deleteCustomer: (id) => api.delete(`/auth/users/${id}`),

  // Blogs (nếu có)
  getBlogs: () => api.get('/blogs').catch(() => ({ data: [] })),
  getBlog: (id) => api.get(`/blogs/${id}`),
  saveBlog: (blog) => {
    if (blog._id || blog.id) {
      const id = blog._id || blog.id;
      return api.put(`/blogs/${id}`, blog);
    }
    return api.post('/blogs', blog);
  },
  deleteBlog: (id) => api.delete(`/blogs/${id}`),
  getBlogCategories: () => api.get('/blog-categories').catch(() => ({ data: [] })),
  saveBlogCategory: (category) => {
    if (category._id || category.id) {
      const id = category._id || category.id;
      return api.put(`/blog-categories/${id}`, category);
    }
    return api.post('/blog-categories', category);
  },
  updateBlogCategory: (id, category) => api.put(`/blog-categories/${id}`, category),
  deleteBlogCategory: (id) => api.delete(`/blog-categories/${id}`),

  // Reviews
  getReviews: () => api.get('/reviews').catch(() => ({ data: [] })),
  deleteReview: (id) => api.delete(`/reviews/${id}`),

  // Brewing Guides
  getBrewingGuides: () => api.get('/brewing-guides').catch(() => ({ data: [] })),
  saveBrewingGuide: (guide) => {
    if (guide._id || guide.id) {
      const id = guide._id || guide.id;
      return api.put(`/brewing-guides/${id}`, guide);
    }
    return api.post('/brewing-guides', guide);
  },
  deleteBrewingGuide: (id) => api.delete(`/brewing-guides/${id}`),
};

// =============================================
// Customer API
// =============================================
export const customerApi = {
  getProducts: (categoryId) => api.get('/products', { params: { categoryId } }),
  getProductDetail: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/categories'),
  getBlogCategories: () => api.get('/blog-categories').catch(() => ({ data: [] })),
  getBlogs: (categoryId) => api.get('/blogs', { params: { categoryId } }).catch(() => ({ data: [] })),
  getBlogDetail: (id) => api.get(`/blogs/${id}`),
  getProductReviews: (productId) => api.get(`/products/${productId}/reviews`).catch(() => ({ data: [] })),
  submitReview: (productId, review) => api.post(`/products/${productId}/reviews`, review),
  updateProfile: (data) => api.put('/auth/me', data),
  getMyOrders: () => api.get('/orders/my-orders'),
  getOrders: (userId) => api.get('/orders/my-orders'), // dùng my-orders thay vì theo userId
  getOrderDetail: (id) => api.get(`/orders/${id}`),
  changePassword: (data) => api.put('/auth/change-password', data),
  getBrewingGuides: () => api.get('/brewing-guides').catch(() => ({ data: [] })),
  searchChatbot: (query, userId, lastProductId) => api.get('/chatbot', { params: { query, userId, lastProductId } }),
};

// =============================================
// Auth API
// =============================================
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// =============================================
// Province API (external)
// =============================================
export const provinceApi = {
  getProvinces: () => axios.get('https://provinces.open-api.vn/api/?depth=1'),
  getDistricts: (provinceCode) => axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`),
  getWards: (districtCode) => axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`),
};

export default api;
