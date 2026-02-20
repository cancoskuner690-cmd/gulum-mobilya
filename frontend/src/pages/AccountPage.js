import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Package, User, MapPin, Clock, ChevronRight, LogOut } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AccountPage = () => {
  const { t, getProductField } = useLanguage();
  const { user, logout, getToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = getToken();
        const response = await axios.get(`${API}/auth/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [getToken]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'shipped': return 'bg-blue-100 text-blue-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'En attente',
      'paid': 'Payé',
      'shipped': 'Expédié',
      'delivered': 'Livré'
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="account-page">
      <div className="container mx-auto px-4 md:px-8 max-w-screen-xl py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#E53935] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{user?.name}</h1>
                <p className="text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors"
              data-testid="logout-btn"
            >
              <LogOut size={18} />
              Déconnexion
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${
                  activeTab === 'orders' ? 'bg-[#E53935] text-white' : 'hover:bg-gray-50'
                }`}
                data-testid="tab-orders"
              >
                <Package size={20} />
                Mes Commandes
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${
                  activeTab === 'profile' ? 'bg-[#E53935] text-white' : 'hover:bg-gray-50'
                }`}
                data-testid="tab-profile"
              >
                <User size={20} />
                Mon Profil
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'orders' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-bold">Mes Commandes</h2>
                </div>
                
                {loading ? (
                  <div className="p-8 text-center text-gray-500">Chargement...</div>
                ) : orders.length === 0 ? (
                  <div className="p-8 text-center">
                    <Package size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-4">Vous n'avez pas encore de commandes</p>
                    <Link
                      to="/products"
                      className="inline-block px-6 py-3 bg-[#E53935] text-white font-medium hover:bg-[#C62828] transition-colors"
                    >
                      Découvrir nos produits
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y">
                    {orders.map((order) => (
                      <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="font-medium text-gray-900">Commande #{order.id.slice(0, 8)}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                              <Clock size={14} />
                              {formatDate(order.created_at)}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          {order.items?.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 text-sm">
                              <span className="text-gray-600">{item.quantity}x</span>
                              <span className="text-gray-900">{item.name_fr}</span>
                              <span className="text-gray-500 ml-auto">{item.subtotal?.toFixed(2)}€</span>
                            </div>
                          ))}
                          {order.items?.length > 2 && (
                            <p className="text-sm text-gray-500">+{order.items.length - 2} autres articles</p>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t">
                          <span className="font-bold text-lg">{order.total?.toFixed(2)}€</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-bold mb-6">Mon Profil</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded">
                    <User size={20} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Nom</p>
                      <p className="font-medium">{user?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded">
                    <span className="text-gray-400">@</span>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                  </div>
                  {user?.phone && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded">
                      <span className="text-gray-400">📞</span>
                      <div>
                        <p className="text-xs text-gray-500">Téléphone</p>
                        <p className="font-medium">{user?.phone}</p>
                      </div>
                    </div>
                  )}
                  {user?.address && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded">
                      <MapPin size={20} className="text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Adresse</p>
                        <p className="font-medium">{user?.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
