import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Loader2, User, LogIn } from 'lucide-react';
import AuthModal from '../components/auth/AuthModal';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CheckoutPage = () => {
  const { t, getProductField } = useLanguage();
  const { cart, getTotal, sessionId } = useCart();
  const { user, getToken } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Pre-fill form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        customer_name: user.name || '',
        customer_email: user.email || '',
        customer_phone: user.phone || '',
        customer_address: user.address || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const headers = {};
      const token = getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Create order
      const orderResponse = await axios.post(`${API}/orders`, {
        ...formData,
        cart_session_id: sessionId
      }, { headers });

      const order = orderResponse.data;

      // Create checkout session
      const checkoutResponse = await axios.post(`${API}/checkout/session`, {
        order_id: order.id,
        origin_url: window.location.origin
      });

      // Redirect to Stripe
      if (checkoutResponse.data.url) {
        window.location.href = checkoutResponse.data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.detail || 'Une erreur est survenue');
      setLoading(false);
    }
  };

  if (cart.products.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="checkout-page">
      <div className="container mx-auto px-4 md:px-8 max-w-screen-xl py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {t('checkout.title')}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Login Prompt */}
            {!user && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="text-blue-600" size={24} />
                  <div>
                    <p className="font-medium text-blue-900">Vous avez un compte?</p>
                    <p className="text-sm text-blue-700">Connectez-vous pour retrouver vos commandes</p>
                  </div>
                </div>
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  data-testid="checkout-login-btn"
                >
                  <LogIn size={18} />
                  Connexion
                </button>
              </div>
            )}

            {/* User Info Display */}
            {user && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-green-900">Connecté en tant que {user.name}</p>
                    <p className="text-sm text-green-700">Votre commande sera sauvegardée dans votre compte</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                {t('checkout.customerInfo')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('checkout.name')} *
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleChange}
                    required
                    className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935] outline-none"
                    data-testid="input-name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('checkout.email')} *
                  </label>
                  <input
                    type="email"
                    name="customer_email"
                    value={formData.customer_email}
                    onChange={handleChange}
                    required
                    className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935] outline-none"
                    data-testid="input-email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('checkout.phone')} *
                  </label>
                  <input
                    type="tel"
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={handleChange}
                    required
                    className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935] outline-none"
                    data-testid="input-phone"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('checkout.address')} *
                  </label>
                  <textarea
                    name="customer_address"
                    value={formData.customer_address}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935] outline-none resize-none"
                    data-testid="input-address"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg" data-testid="error-message">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 h-14 bg-[#E53935] text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-[#C62828] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="pay-btn"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    {t('checkout.processing')}
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    {t('checkout.pay')} - {getTotal().toFixed(2)}€
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                {t('checkout.orderSummary')}
              </h2>

              <div className="space-y-4 pb-6 border-b">
                {cart.products.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={item.images?.[0] || 'https://via.placeholder.com/100'}
                        alt={getProductField(item, 'name')}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {getProductField(item, 'name')}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.quantity} × {item.price?.toFixed(2)}€
                      </p>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {(item.price * item.quantity).toFixed(2)}€
                    </span>
                  </div>
                ))}
              </div>

              <div className="py-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="text-gray-900">{getTotal().toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Livraison</span>
                  <span className="text-green-600 font-medium">Gratuite</span>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t">
                <span className="text-lg font-bold text-gray-900">
                  {t('cart.total')}
                </span>
                <span className="text-lg font-bold text-[#E53935]">
                  {getTotal().toFixed(2)}€
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setAuthModalOpen(false)}
      />
    </div>
  );
};

export default CheckoutPage;
