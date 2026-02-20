import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-[#1C1C1C] text-white" data-testid="footer">
      {/* Main Footer */}
      <div className="container mx-auto px-4 md:px-8 max-w-screen-xl py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-4">
              <span className="text-[#E53935]">GÜLÜM</span> MOBİLYA
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {language === 'tr' 
                ? 'Fransa\'da Türk kalitesinde mobilya. Rhône-Alpes bölgesine teslimat.'
                : language === 'en'
                  ? 'Turkish quality furniture in France. Delivery to Rhône-Alpes region.'
                  : 'Mobilier de qualité turque en France. Livraison en région Rhône-Alpes.'}
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#E53935] transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#E53935] transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#E53935] transition-colors">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-6 text-lg">
              {language === 'tr' ? 'Hızlı Linkler' : language === 'en' ? 'Quick Links' : 'Liens Rapides'}
            </h4>
            <div className="space-y-3">
              <Link to="/" className="block text-gray-400 hover:text-white transition-colors">
                {t('nav.home')}
              </Link>
              <Link to="/products" className="block text-gray-400 hover:text-white transition-colors">
                {t('nav.products')}
              </Link>
              <Link to="/contact" className="block text-gray-400 hover:text-white transition-colors">
                {t('nav.contact')}
              </Link>
              <Link to="/admin" className="block text-gray-400 hover:text-white transition-colors">
                {language === 'tr' ? 'Yönetici Girişi' : 'Admin'}
              </Link>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold mb-6 text-lg">{t('products.categories')}</h4>
            <div className="space-y-3">
              <Link to="/products?category=cat-furniture" className="block text-gray-400 hover:text-white transition-colors">
                {t('nav.furniture')}
              </Link>
              <Link to="/products?category=cat-bedroom" className="block text-gray-400 hover:text-white transition-colors">
                {t('nav.bedroom')}
              </Link>
              <Link to="/products?category=cat-appliances" className="block text-gray-400 hover:text-white transition-colors">
                {t('nav.appliances')}
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold mb-6 text-lg">
              {language === 'tr' ? 'İletişim' : language === 'en' ? 'Contact' : 'Contact'}
            </h4>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-[#E53935] flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">
                  18 chemin des Brudeaux<br />
                  26540 Mours Saint Eusèbe<br />
                  France
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-[#E53935]" />
                <a href="tel:+33601443115" className="text-gray-400 hover:text-white transition-colors">
                  06 01 44 31 15
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-[#E53935]" />
                <span className="text-gray-400">contact@gulmobilya.fr</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-[#E53935]" />
                <span className="text-gray-400">
                  {language === 'tr' ? 'Pzt-Cmt: 9:00-19:00' : 'Lun-Sam: 9h-19h'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 md:px-8 max-w-screen-xl py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm text-center md:text-left">
              © {new Date().getFullYear()} Gülüm Mobilya. {t('footer.rights')}
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span>🇫🇷 France</span>
              <span>🇹🇷 Türk Kalitesi</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
