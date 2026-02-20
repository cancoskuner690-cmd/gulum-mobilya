import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/products/ProductCard';
import { ArrowRight, Truck, Shield, CreditCard, Phone, ChevronLeft, ChevronRight, Star } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const HomePage = () => {
  const { t, getCategoryField, language } = useLanguage();
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await axios.post(`${API}/seed`).catch(() => {});
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const [productsRes, categoriesRes] = await Promise.all([
          axios.get(`${API}/products`),
          axios.get(`${API}/categories`)
        ]);
        const products = productsRes.data;
        setAllProducts(products);
        setFeaturedProducts(products.filter(p => p.featured));
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slides = [
    {
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920&q=80",
      title: language === 'tr' ? "Mobilyada Kalite" : language === 'en' ? "Quality Furniture" : "Qualité en Mobilier",
      subtitle: language === 'tr' ? "Eviniz için en iyi mobilyalar" : language === 'en' ? "Best furniture for your home" : "Les meilleurs meubles pour votre maison",
      color: "from-black/70"
    },
    {
      image: "https://images.pexels.com/photos/6903157/pexels-photo-6903157.jpeg?w=1920&q=80",
      title: language === 'tr' ? "Yatak Odası Takımları" : language === 'en' ? "Bedroom Sets" : "Chambres à Coucher",
      subtitle: language === 'tr' ? "Konforlu uyku için" : language === 'en' ? "For comfortable sleep" : "Pour un sommeil confortable",
      color: "from-black/60"
    },
    {
      image: "https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?w=1920&q=80",
      title: language === 'tr' ? "Yemek Odası" : language === 'en' ? "Dining Room" : "Salle à Manger",
      subtitle: language === 'tr' ? "Ailenizle güzel anılar" : language === 'en' ? "Beautiful memories with family" : "Beaux moments en famille",
      color: "from-black/60"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" data-testid="home-page">
      {/* Hero Slider */}
      <section className="relative h-[500px] md:h-[600px] overflow-hidden" data-testid="hero-section">
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-700 ${currentSlide === idx ? 'opacity-100' : 'opacity-0'}`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} to-transparent`} />
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4 md:px-8 max-w-screen-xl">
                <div className="max-w-xl text-white">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fadeIn">
                    {slide.title}
                  </h1>
                  <p className="text-lg md:text-xl mb-8 opacity-90">
                    {slide.subtitle}
                  </p>
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 bg-[#E53935] text-white px-8 py-4 font-bold hover:bg-[#C62828] transition-colors"
                    data-testid="hero-cta"
                  >
                    {t('hero.cta')}
                    <ArrowRight size={20} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Slider Controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-3 h-3 rounded-full transition-all ${currentSlide === idx ? 'bg-white w-8' : 'bg-white/50'}`}
            />
          ))}
        </div>
        
        <button
          onClick={() => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <ChevronRight size={24} />
        </button>
      </section>

      {/* Features Bar */}
      <section className="bg-[#1C1C1C] text-white py-4">
        <div className="container mx-auto px-4 md:px-8 max-w-screen-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
            <div className="flex items-center justify-center gap-2">
              <Truck size={20} className="text-[#E53935]" />
              <span>{language === 'tr' ? 'Ücretsiz Teslimat' : language === 'en' ? 'Free Delivery' : 'Livraison Gratuite'}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Shield size={20} className="text-[#E53935]" />
              <span>{language === 'tr' ? '2 Yıl Garanti' : language === 'en' ? '2 Year Warranty' : 'Garantie 2 Ans'}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CreditCard size={20} className="text-[#E53935]" />
              <span>{language === 'tr' ? 'Güvenli Ödeme' : language === 'en' ? 'Secure Payment' : 'Paiement Sécurisé'}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Phone size={20} className="text-[#E53935]" />
              <span>06 01 44 31 15</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 md:py-16 bg-gray-50" data-testid="categories-section">
        <div className="container mx-auto px-4 md:px-8 max-w-screen-xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            {t('products.categories')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="group relative h-64 md:h-80 overflow-hidden rounded-lg shadow-lg"
                data-testid={`category-${category.slug}`}
              >
                <img
                  src={category.image_url || 'https://via.placeholder.com/600x400'}
                  alt={getCategoryField(category, 'name')}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                    {getCategoryField(category, 'name')}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-white/80 text-sm group-hover:text-[#E53935] transition-colors">
                    {language === 'tr' ? 'Ürünleri Gör' : language === 'en' ? 'View Products' : 'Voir les Produits'}
                    <ArrowRight size={16} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 md:py-16" data-testid="featured-section">
        <div className="container mx-auto px-4 md:px-8 max-w-screen-xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">{t('products.featured')}</h2>
              <p className="text-gray-500 mt-1">
                {language === 'tr' ? 'En çok tercih edilen ürünler' : language === 'en' ? 'Most popular products' : 'Produits les plus populaires'}
              </p>
            </div>
            <Link
              to="/products"
              className="hidden md:flex items-center gap-2 text-[#E53935] font-semibold hover:underline"
            >
              {t('products.all')}
              <ArrowRight size={18} />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="mt-8 text-center md:hidden">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-[#E53935] text-white px-6 py-3 font-semibold"
            >
              {t('products.all')}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* All Products Preview */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-8 max-w-screen-xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">
            {language === 'tr' ? 'Tüm Ürünler' : language === 'en' ? 'All Products' : 'Tous les Produits'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {allProducts.slice(0, 10).map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        </div>
      </section>

      {/* Store Info */}
      <section className="py-12 md:py-16 bg-[#E53935] text-white">
        <div className="container mx-auto px-4 md:px-8 max-w-screen-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {language === 'tr' ? 'Mağazamızı Ziyaret Edin' : language === 'en' ? 'Visit Our Store' : 'Visitez Notre Magasin'}
              </h2>
              <p className="text-white/80 mb-6 text-lg">
                {language === 'tr' 
                  ? 'Ürünlerimizi yakından görmek için mağazamıza bekleriz.' 
                  : language === 'en' 
                    ? 'Visit our store to see our products up close.'
                    : 'Visitez notre magasin pour voir nos produits de près.'}
              </p>
              <div className="space-y-3 text-lg">
                <p><strong>{language === 'tr' ? 'Adres:' : language === 'en' ? 'Address:' : 'Adresse:'}</strong> 18 chemin des Brudeaux, 26540 Mours Saint Eusèbe</p>
                <p><strong>{language === 'tr' ? 'Telefon:' : language === 'en' ? 'Phone:' : 'Téléphone:'}</strong> 06 01 44 31 15</p>
                <p><strong>{language === 'tr' ? 'Çalışma Saatleri:' : language === 'en' ? 'Hours:' : 'Horaires:'}</strong> {language === 'tr' ? 'Pzt-Cmt: 9:00-19:00' : 'Lun-Sam: 9h-19h'}</p>
              </div>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-white text-[#E53935] px-8 py-4 font-bold mt-8 hover:bg-gray-100 transition-colors"
              >
                {t('nav.contact')}
                <ArrowRight size={20} />
              </Link>
            </div>
            <div className="hidden md:block">
              <img
                src="https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?w=600"
                alt="Store"
                className="w-full h-80 object-cover rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-8 border-t">
        <div className="container mx-auto px-4 md:px-8 max-w-screen-xl">
          <div className="flex flex-wrap items-center justify-center gap-8 text-gray-400">
            <div className="flex items-center gap-2">
              <Star className="text-yellow-500" size={20} fill="currentColor" />
              <Star className="text-yellow-500" size={20} fill="currentColor" />
              <Star className="text-yellow-500" size={20} fill="currentColor" />
              <Star className="text-yellow-500" size={20} fill="currentColor" />
              <Star className="text-yellow-500" size={20} fill="currentColor" />
              <span className="ml-2 text-gray-600 font-medium">4.9/5</span>
            </div>
            <span className="text-gray-300">|</span>
            <span className="font-medium text-gray-600">Rhône-Alpes, France</span>
            <span className="text-gray-300">|</span>
            <span className="font-medium text-gray-600">{language === 'tr' ? 'Güvenilir Satıcı' : 'Vendeur de Confiance'}</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
