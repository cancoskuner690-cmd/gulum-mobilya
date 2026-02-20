import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../../context/LanguageContext';
import { X, Eye, EyeOff, Loader2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AuthModal = ({ isOpen, onClose, onSuccess, initialMode = 'login' }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = mode === 'login' 
        ? { email: formData.email, password: formData.password }
        : formData;
      
      const response = await axios.post(`${API}${endpoint}`, payload);
      
      localStorage.setItem('gulum-token', response.data.token);
      localStorage.setItem('gulum-user', JSON.stringify(response.data.user));
      
      if (onSuccess) onSuccess(response.data.user);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" data-testid="auth-modal">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-md p-8 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600"
          data-testid="close-auth-modal"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold text-[#1C1C1C] mb-6">
          {mode === 'login' ? 'Connexion' : 'Créer un compte'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full h-12 px-4 border border-gray-300 focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935] outline-none"
                data-testid="register-name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full h-12 px-4 border border-gray-300 focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935] outline-none"
              data-testid="auth-email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full h-12 px-4 pr-12 border border-gray-300 focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935] outline-none"
                data-testid="auth-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full h-12 px-4 border border-gray-300 focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935] outline-none"
                data-testid="register-phone"
              />
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#E53935] text-white font-bold hover:bg-[#C62828] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            data-testid="auth-submit"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {mode === 'login' ? 'Se connecter' : "S'inscrire"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          {mode === 'login' ? (
            <>
              Pas encore de compte?{' '}
              <button
                onClick={() => { setMode('register'); setError(''); }}
                className="text-[#E53935] font-medium hover:underline"
                data-testid="switch-to-register"
              >
                Créer un compte
              </button>
            </>
          ) : (
            <>
              Déjà un compte?{' '}
              <button
                onClick={() => { setMode('login'); setError(''); }}
                className="text-[#E53935] font-medium hover:underline"
                data-testid="switch-to-login"
              >
                Se connecter
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
