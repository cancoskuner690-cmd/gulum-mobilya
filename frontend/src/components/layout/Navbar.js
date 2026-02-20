import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../auth/AuthModal';
import { ShoppingCart, Menu, X, MapPin, Phone, User, Heart, Clock, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { language, setLanguage, t } = useLanguage();
  const { getItemCount } = useCart();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/products', label: t('nav.products') },
    { path: '/products?category=cat-furniture', label: t('nav.furniture') },
    { path: '/products?category=cat-bedroom', label: t('nav.bedroom') },
    { path: '/products?category=cat-appliances', label: t('nav.appliances') },
    { path: '/contact', label: t('nav.contact') },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname + location.search === path || location.pathname === path;
  };

  return (
    <>
      {/* Top Bar - Alkapida style */}
      <div className="bg-[#E53935] text-white py-2 text-xs">
        <div className="container mx-auto px-4 md:px-8 max-w-screen-2xl flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              <span className="hidden sm:inline">Rhône-Alpes, France</span>
            </span>
            <span className="flex items-center gap-1">
              <Phone size={12} />
              06 01 44 31 15
            </span>
          </div>
          
          {/* Language Switcher */}
          <div className="flex items-center gap-1 font-medium" data-testid="language-switcher">
            {['FR', 'TR', 'EN'].map((lang, idx) => (
              <React.Fragment key={lang}>
                <button
                  onClick={() => setLanguage(lang.toLowerCase())}
                  className={`px-2 py-1 transition-colors ${
                    language === lang.toLowerCase() 
                      ? 'text-white font-bold' 
                      : 'text-white/70 hover:text-white'
                  }`}
                  data-testid={`lang-${lang.toLowerCase()}`}
                >
                  {lang}
                </button>
                {idx < 2 && <span className="text-white/50">|</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="sticky top-0 z-50 w-full bg-white shadow-md" data-testid="main-nav">
        <div className="container mx-auto px-4 md:px-8 max-w-screen-2xl">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link 
              to="/" 
              className="text-2xl md:text-3xl font-bold text-[#E53935]"
              data-testid="logo-link"
            >
              GÜLÜM<span className="text-[#1C1C1C]"> MOBİLYA</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'text-[#E53935]'
                      : 'text-gray-700 hover:text-[#E53935]'
                  }`}
                  data-testid={`nav-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* User */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-2 text-gray-700 hover:text-[#E53935] transition-colors"
                    data-testid="user-menu-btn"
                  >
                    <User size={22} />
                    <span className="hidden md:inline text-sm font-medium">{user.name.split(' ')[0]}</span>
                    <ChevronDown size={14} />
                  </button>
                  
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-lg rounded-lg overflow-hidden z-50">
                        <Link
                          to="/account"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-3 hover:bg-gray-50 text-sm"
                          data-testid="my-account-link"
                        >
                          Mon Compte
                        </Link>
                        <Link
                          to="/account"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-3 hover:bg-gray-50 text-sm"
                        >
                          Mes Commandes
                        </Link>
                        <button
                          onClick={() => { logout(); setUserMenuOpen(false); }}
                          className="block w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-red-600"
                          data-testid="logout-dropdown-btn"
                        >
                          Déconnexion
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center gap-2 p-2 text-gray-700 hover:text-[#E53935] transition-colors"
                  data-testid="login-btn"
                >
                  <User size={22} />
                  <span className="hidden md:inline text-sm font-medium">Connexion</span>
                </button>
              )}

              {/* Cart */}
              <Link 
                to="/cart" 
                className="relative flex items-center gap-2 p-2 bg-[#E53935] text-white rounded-lg hover:bg-[#C62828] transition-colors"
                data-testid="cart-link"
              >
                <ShoppingCart size={22} />
                <span className="hidden md:inline text-sm font-medium">{t('nav.cart')}</span>
                {getItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#1C1C1C] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                    {getItemCount()}
                  </span>
                )}
              </Link>
              
              {/* Mobile Menu Toggle */}
              <button
                className="lg:hidden p-2 text-gray-700"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="mobile-menu-toggle"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t bg-white">
            <div className="container mx-auto px-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-3 text-sm font-medium ${
                    isActive(link.path)
                      ? 'text-[#E53935]'
                      : 'text-gray-700'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {!user && (
                <button
                  onClick={() => { setMobileMenuOpen(false); setAuthModalOpen(true); }}
                  className="w-full mt-4 py-3 bg-[#E53935] text-white font-medium rounded"
                >
                  Connexion / Inscription
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(userData) => {
          window.location.reload();
        }}
      />
    </>
  );
};

export default Navbar;
