import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Package, Plus, Pencil, Trash2, Image, Save, X, 
  LogOut, FolderOpen, Eye, Loader2, Search,
  TrendingUp, ShoppingCart, Users, Euro, 
  ChevronDown, MoreVertical, Check, Clock,
  Grid, List, Filter, RefreshCw
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ADMIN_EMAIL = 'admin@gulum.fr';
const ADMIN_PASSWORD = 'gulum2024';

const AdminPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState({
    name_fr: '', name_tr: '', name_en: '',
    description_fr: '', description_tr: '', description_en: '',
    price: '', category_id: '', stock: '', images: [''], featured: false
  });

  useEffect(() => {
    const adminToken = localStorage.getItem('gulum-admin');
    if (adminToken === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (loginForm.email === ADMIN_EMAIL && loginForm.password === ADMIN_PASSWORD) {
      localStorage.setItem('gulum-admin', 'true');
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Email ou mot de passe incorrect');
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('gulum-admin');
    setIsLoggedIn(false);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes, ordersRes] = await Promise.all([
        axios.get(`${API}/products`),
        axios.get(`${API}/categories`),
        axios.get(`${API}/orders`)
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (index, value) => {
    const newImages = [...productForm.images];
    newImages[index] = value;
    setProductForm(prev => ({ ...prev, images: newImages }));
  };

  const addImageField = () => {
    setProductForm(prev => ({ ...prev, images: [...prev.images, ''] }));
  };

  const removeImageField = (index) => {
    const newImages = productForm.images.filter((_, i) => i !== index);
    setProductForm(prev => ({ ...prev, images: newImages.length ? newImages : [''] }));
  };

  const resetProductForm = () => {
    setProductForm({
      name_fr: '', name_tr: '', name_en: '',
      description_fr: '', description_tr: '', description_en: '',
      price: '', category_id: '', stock: '', images: [''], featured: false
    });
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const handleEditProduct = (product) => {
    setProductForm({
      name_fr: product.name_fr || '',
      name_tr: product.name_tr || '',
      name_en: product.name_en || '',
      description_fr: product.description_fr || '',
      description_tr: product.description_tr || '',
      description_en: product.description_en || '',
      price: product.price?.toString() || '',
      category_id: product.category_id || '',
      stock: product.stock?.toString() || '',
      images: product.images?.length ? product.images : [''],
      featured: product.featured || false
    });
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        images: productForm.images.filter(img => img.trim() !== '')
      };

      if (editingProduct) {
        await axios.put(`${API}/products/${editingProduct.id}`, productData);
      } else {
        await axios.post(`${API}/products`, productData);
      }
      
      await fetchData();
      resetProductForm();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return;
    
    try {
      await axios.delete(`${API}/products/${productId}`);
      await fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      paid: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      shipped: 'bg-blue-100 text-blue-800 border-blue-200',
      delivered: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    const labels = {
      paid: 'Ödendi',
      pending: 'Beklemede',
      shipped: 'Kargoda',
      delivered: 'Teslim Edildi'
    };
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  // Stats
  const totalRevenue = orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock < 5).length;

  const filteredProducts = products.filter(p => 
    p.name_fr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.name_tr?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl mb-4">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">GÜLÜM MOBİLYA</h1>
            <p className="text-gray-500 mt-1">Yönetim Paneli</p>
          </div>
          
          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full h-12 px-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:bg-white outline-none transition-all"
                placeholder="admin@gulum.fr"
                data-testid="admin-email"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Şifre</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                className="w-full h-12 px-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:bg-white outline-none transition-all"
                placeholder="••••••••"
                data-testid="admin-password"
              />
            </div>
            
            {loginError && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                {loginError}
              </div>
            )}
            
            <button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/30"
              data-testid="admin-login-btn"
            >
              Giriş Yap
            </button>
          </form>
          
          <div className="mt-6 p-4 bg-slate-50 rounded-xl text-sm">
            <p className="font-semibold text-slate-700 mb-2">Demo Giriş:</p>
            <p className="text-slate-600">Email: admin@gulum.fr</p>
            <p className="text-slate-600">Şifre: gulum2024</p>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-white z-40">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold">GÜLÜM MOBİLYA</h1>
          <p className="text-slate-400 text-sm mt-1">Yönetim Paneli</p>
        </div>
        
        <nav className="p-4 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
              activeTab === 'dashboard' 
                ? 'bg-red-500 text-white' 
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <TrendingUp size={20} />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
              activeTab === 'products' 
                ? 'bg-red-500 text-white' 
                : 'text-slate-300 hover:bg-slate-800'
            }`}
            data-testid="tab-products"
          >
            <Package size={20} />
            <span>Ürünler</span>
            <span className="ml-auto bg-slate-700 px-2 py-0.5 rounded-lg text-xs">{products.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
              activeTab === 'orders' 
                ? 'bg-red-500 text-white' 
                : 'text-slate-300 hover:bg-slate-800'
            }`}
            data-testid="tab-orders"
          >
            <ShoppingCart size={20} />
            <span>Siparişler</span>
            <span className="ml-auto bg-slate-700 px-2 py-0.5 rounded-lg text-xs">{orders.length}</span>
          </button>
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <button
            onClick={handleAdminLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            data-testid="admin-logout"
          >
            <LogOut size={20} />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'products' && 'Ürün Yönetimi'}
                {activeTab === 'orders' && 'Sipariş Yönetimi'}
              </h2>
              <p className="text-gray-500 text-sm">Hoş geldiniz, yönetici</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchData}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
              <a
                href="/"
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all"
              >
                <Eye size={18} />
                Siteyi Görüntüle
              </a>
            </div>
          </div>
        </header>

        <main className="p-8">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Euro className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-green-600 text-sm font-medium">+12%</span>
                  </div>
                  <p className="text-gray-500 text-sm">Toplam Gelir</p>
                  <p className="text-2xl font-bold text-gray-900">{totalRevenue.toFixed(2)}€</p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm">Toplam Sipariş</p>
                  <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm">Toplam Ürün</p>
                  <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm">Düşük Stok</p>
                  <p className="text-2xl font-bold text-gray-900">{lowStockProducts}</p>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold">Son Siparişler</h3>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="text-red-500 text-sm font-medium hover:text-red-600"
                  >
                    Tümünü Gör
                  </button>
                </div>
                <div className="divide-y divide-gray-100">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-medium">
                          {order.customer_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{order.customer_name}</p>
                          <p className="text-sm text-gray-500">#{order.id.slice(0, 8)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{order.total?.toFixed(2)}€</p>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              {/* Toolbar */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Ürün ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-red-500 focus:bg-white outline-none transition-all"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    <Grid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    <List size={20} />
                  </button>
                </div>
                <button
                  onClick={() => { resetProductForm(); setShowProductForm(true); }}
                  className="flex items-center gap-2 h-12 px-6 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/30"
                  data-testid="add-product-btn"
                >
                  <Plus size={20} />
                  Yeni Ürün
                </button>
              </div>

              {/* Products Grid/List */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-all">
                      <div className="aspect-square bg-gray-100 relative overflow-hidden">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Image size={48} />
                          </div>
                        )}
                        {product.featured && (
                          <span className="absolute top-3 left-3 px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-lg">
                            ÖNE ÇIKAN
                          </span>
                        )}
                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-2 bg-white rounded-lg shadow-lg text-gray-600 hover:text-red-500 transition-colors"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 bg-white rounded-lg shadow-lg text-gray-600 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-gray-500 mb-1">
                          {categories.find(c => c.id === product.category_id)?.name_tr || 'Kategorisiz'}
                        </p>
                        <h4 className="font-semibold text-gray-900 mb-2 line-clamp-1">{product.name_tr}</h4>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-red-500">{product.price?.toFixed(2)}€</span>
                          <span className={`text-sm font-medium ${product.stock < 5 ? 'text-orange-500' : 'text-green-500'}`}>
                            Stok: {product.stock}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left p-4 font-semibold text-gray-600">Ürün</th>
                        <th className="text-left p-4 font-semibold text-gray-600">Kategori</th>
                        <th className="text-left p-4 font-semibold text-gray-600">Fiyat</th>
                        <th className="text-left p-4 font-semibold text-gray-600">Stok</th>
                        <th className="text-right p-4 font-semibold text-gray-600">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="p-4">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden">
                                {product.images?.[0] ? (
                                  <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <Image size={20} />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{product.name_tr}</p>
                                {product.featured && (
                                  <span className="text-xs text-yellow-600 font-medium">Öne Çıkan</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-gray-600">
                            {categories.find(c => c.id === product.category_id)?.name_tr || '-'}
                          </td>
                          <td className="p-4 font-bold text-red-500">{product.price?.toFixed(2)}€</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              product.stock < 5 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {product.stock}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Product Form Modal */}
              {showProductForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                    <div className="p-6 border-b flex items-center justify-between bg-gray-50">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
                        </h3>
                        <p className="text-gray-500 text-sm">Tüm alanları 3 dilde doldurun</p>
                      </div>
                      <button onClick={resetProductForm} className="p-2 hover:bg-gray-200 rounded-xl transition-colors">
                        <X size={24} />
                      </button>
                    </div>
                    
                    <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-6">
                      {/* Language Tabs */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* French */}
                        <div className="space-y-4 p-4 bg-blue-50 rounded-xl">
                          <div className="flex items-center gap-2 text-blue-700 font-semibold">
                            <span className="w-6 h-6 bg-blue-600 text-white text-xs rounded flex items-center justify-center">FR</span>
                            Français
                          </div>
                          <input
                            type="text"
                            name="name_fr"
                            value={productForm.name_fr}
                            onChange={handleProductFormChange}
                            placeholder="Nom du produit"
                            required
                            className="w-full h-11 px-4 bg-white border-2 border-blue-200 rounded-xl focus:border-blue-500 outline-none"
                          />
                          <textarea
                            name="description_fr"
                            value={productForm.description_fr}
                            onChange={handleProductFormChange}
                            placeholder="Description"
                            required
                            rows={3}
                            className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl focus:border-blue-500 outline-none resize-none"
                          />
                        </div>

                        {/* Turkish */}
                        <div className="space-y-4 p-4 bg-red-50 rounded-xl">
                          <div className="flex items-center gap-2 text-red-700 font-semibold">
                            <span className="w-6 h-6 bg-red-600 text-white text-xs rounded flex items-center justify-center">TR</span>
                            Türkçe
                          </div>
                          <input
                            type="text"
                            name="name_tr"
                            value={productForm.name_tr}
                            onChange={handleProductFormChange}
                            placeholder="Ürün adı"
                            required
                            className="w-full h-11 px-4 bg-white border-2 border-red-200 rounded-xl focus:border-red-500 outline-none"
                          />
                          <textarea
                            name="description_tr"
                            value={productForm.description_tr}
                            onChange={handleProductFormChange}
                            placeholder="Açıklama"
                            required
                            rows={3}
                            className="w-full px-4 py-3 bg-white border-2 border-red-200 rounded-xl focus:border-red-500 outline-none resize-none"
                          />
                        </div>

                        {/* English */}
                        <div className="space-y-4 p-4 bg-green-50 rounded-xl">
                          <div className="flex items-center gap-2 text-green-700 font-semibold">
                            <span className="w-6 h-6 bg-green-600 text-white text-xs rounded flex items-center justify-center">EN</span>
                            English
                          </div>
                          <input
                            type="text"
                            name="name_en"
                            value={productForm.name_en}
                            onChange={handleProductFormChange}
                            placeholder="Product name"
                            required
                            className="w-full h-11 px-4 bg-white border-2 border-green-200 rounded-xl focus:border-green-500 outline-none"
                          />
                          <textarea
                            name="description_en"
                            value={productForm.description_en}
                            onChange={handleProductFormChange}
                            placeholder="Description"
                            required
                            rows={3}
                            className="w-full px-4 py-3 bg-white border-2 border-green-200 rounded-xl focus:border-green-500 outline-none resize-none"
                          />
                        </div>
                      </div>

                      {/* Price, Stock, Category */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Fiyat (€) *</label>
                          <input
                            type="number"
                            name="price"
                            value={productForm.price}
                            onChange={handleProductFormChange}
                            required
                            step="0.01"
                            min="0"
                            className="w-full h-12 px-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:bg-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Stok *</label>
                          <input
                            type="number"
                            name="stock"
                            value={productForm.stock}
                            onChange={handleProductFormChange}
                            required
                            min="0"
                            className="w-full h-12 px-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:bg-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori *</label>
                          <select
                            name="category_id"
                            value={productForm.category_id}
                            onChange={handleProductFormChange}
                            required
                            className="w-full h-12 px-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:bg-white outline-none"
                          >
                            <option value="">Seçiniz...</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name_tr}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Images */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Resim URL'leri</label>
                        {productForm.images.map((img, idx) => (
                          <div key={idx} className="flex gap-2 mb-2">
                            <input
                              type="url"
                              value={img}
                              onChange={(e) => handleImageChange(idx, e.target.value)}
                              placeholder="https://example.com/image.jpg"
                              className="flex-1 h-12 px-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:bg-white outline-none"
                            />
                            {productForm.images.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeImageField(idx)}
                                className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                              >
                                <X size={20} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addImageField}
                          className="text-sm text-red-500 font-medium hover:text-red-600"
                        >
                          + Resim Ekle
                        </button>
                      </div>

                      {/* Featured */}
                      <label className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl cursor-pointer">
                        <input
                          type="checkbox"
                          name="featured"
                          checked={productForm.featured}
                          onChange={handleProductFormChange}
                          className="w-5 h-5 text-red-500 rounded"
                        />
                        <div>
                          <span className="font-semibold text-gray-900">Öne Çıkan Ürün</span>
                          <p className="text-sm text-gray-500">Ana sayfada gösterilecek</p>
                        </div>
                      </label>
                    </form>

                    {/* Footer */}
                    <div className="p-6 border-t bg-gray-50 flex gap-4">
                      <button
                        type="button"
                        onClick={resetProductForm}
                        className="flex-1 h-12 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        İptal
                      </button>
                      <button
                        onClick={handleSaveProduct}
                        disabled={loading}
                        className="flex-1 h-12 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-500/30"
                        data-testid="save-product-btn"
                      >
                        {loading && <Loader2 size={20} className="animate-spin" />}
                        <Save size={20} />
                        Kaydet
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold">Tüm Siparişler</h3>
              </div>
              {orders.length === 0 ? (
                <div className="p-12 text-center">
                  <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Henüz sipariş yok</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {orders.map((order) => (
                    <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold">
                            {order.customer_name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{order.customer_name}</p>
                            <p className="text-sm text-gray-500">#{order.id.slice(0, 8)} • {new Date(order.created_at).toLocaleDateString('tr-TR')}</p>
                          </div>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-gray-500">İletişim</p>
                          <p className="text-gray-900">{order.customer_email}</p>
                          <p className="text-gray-900">{order.customer_phone}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Adres</p>
                          <p className="text-gray-900">{order.customer_address}</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm font-medium text-gray-500 mb-2">Ürünler</p>
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm py-1">
                            <span className="text-gray-700">{item.quantity}x {item.name_tr || item.name_fr}</span>
                            <span className="font-medium">{item.subtotal?.toFixed(2)}€</span>
                          </div>
                        ))}
                        <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t border-gray-200">
                          <span>Toplam</span>
                          <span className="text-red-500">{order.total?.toFixed(2)}€</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
