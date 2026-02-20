import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, Eye } from 'lucide-react';

const ProductCard = ({ product, compact = false }) => {
  const { getProductField, t, language } = useLanguage();
  const { addToCart, loading } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1);
  };

  if (compact) {
    return (
      <Link 
        to={`/products/${product.id}`}
        className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        data-testid={`product-card-${product.id}`}
      >
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          <img
            src={product.images?.[0] || 'https://via.placeholder.com/300'}
            alt={getProductField(product, 'name')}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.featured && (
            <span className="absolute top-2 left-2 bg-[#E53935] text-white text-xs px-2 py-1 font-bold">
              {language === 'tr' ? 'ÖNE ÇIKAN' : 'VEDETTE'}
            </span>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2">
            {getProductField(product, 'name')}
          </h3>
          <p className="text-[#E53935] font-bold">{product.price?.toFixed(2)}€</p>
        </div>
      </Link>
    );
  }

  return (
    <div 
      className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
      data-testid={`product-card-${product.id}`}
    >
      <Link to={`/products/${product.id}`} className="block">
        {/* Image Container */}
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          <img
            src={product.images?.[0] || 'https://via.placeholder.com/400'}
            alt={getProductField(product, 'name')}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.featured && (
              <span className="bg-[#E53935] text-white text-xs px-3 py-1 font-bold rounded">
                {language === 'tr' ? 'ÖNE ÇIKAN' : language === 'en' ? 'FEATURED' : 'VEDETTE'}
              </span>
            )}
            {product.stock < 5 && product.stock > 0 && (
              <span className="bg-orange-500 text-white text-xs px-3 py-1 font-bold rounded">
                {language === 'tr' ? 'SON STOK' : language === 'en' ? 'LOW STOCK' : 'STOCK LIMITÉ'}
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                disabled={loading || product.stock === 0}
                className="flex-1 h-10 bg-[#E53935] text-white text-sm font-bold flex items-center justify-center gap-2 rounded hover:bg-[#C62828] transition-colors disabled:opacity-50"
                data-testid={`add-to-cart-${product.id}`}
              >
                <ShoppingCart size={16} />
                {language === 'tr' ? 'Sepete Ekle' : language === 'en' ? 'Add to Cart' : 'Ajouter'}
              </button>
              <Link
                to={`/products/${product.id}`}
                className="w-10 h-10 bg-white text-gray-700 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
              >
                <Eye size={18} />
              </Link>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-[#E53935] transition-colors">
            {getProductField(product, 'name')}
          </h3>
          
          <p className="text-gray-500 text-sm mb-3 line-clamp-2">
            {getProductField(product, 'description')}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-[#E53935]">
              {product.price?.toFixed(2)}€
            </span>
            
            {product.stock > 0 ? (
              <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                {t('products.stock')}
              </span>
            ) : (
              <span className="text-xs text-red-500 font-medium bg-red-50 px-2 py-1 rounded">
                {t('products.outOfStock')}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
