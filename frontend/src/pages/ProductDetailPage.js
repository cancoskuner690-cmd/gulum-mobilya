import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Minus, Plus, ArrowLeft, Check } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProductDetailPage = () => {
  const { productId } = useParams();
  const { t, getProductField } = useLanguage();
  const { addToCart, loading: cartLoading } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${API}/products/${productId}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    await addToCart(product.id, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#8C8C8C]">{t('common.loading')}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-[#8C8C8C] mb-4">Produit non trouvé</p>
        <Link to="/products" className="text-[#1C1C1C] underline">
          Retour aux produits
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD]" data-testid="product-detail-page">
      <div className="container mx-auto px-4 md:px-8 max-w-screen-2xl py-8">
        {/* Breadcrumb */}
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm text-[#8C8C8C] hover:text-[#1C1C1C] mb-8 transition-colors"
          data-testid="back-to-products"
        >
          <ArrowLeft size={16} />
          {t('products.all')}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-[3/4] bg-[#F5F5F5] overflow-hidden">
              <img
                src={product.images?.[selectedImage] || 'https://via.placeholder.com/600x800'}
                alt={getProductField(product, 'name')}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 overflow-hidden border-2 transition-colors ${
                      selectedImage === idx ? 'border-[#1C1C1C]' : 'border-[#E5E5E5]'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:py-8">
            <h1 className="font-heading text-3xl md:text-4xl font-medium tracking-tight text-[#1C1C1C] mb-4">
              {getProductField(product, 'name')}
            </h1>

            <p className="text-[#8C8C8C] text-lg leading-relaxed mb-8">
              {getProductField(product, 'description')}
            </p>

            <div className="border-t border-b border-[#E5E5E5] py-6 mb-8">
              <span className="font-heading text-4xl font-medium text-[#1C1C1C]">
                {product.price?.toFixed(2)}€
              </span>
              <div className="mt-2">
                {product.stock > 0 ? (
                  <span className="text-sm text-green-600 flex items-center gap-1">
                    <Check size={14} />
                    {t('products.stock')} ({product.stock})
                  </span>
                ) : (
                  <span className="text-sm text-red-500">
                    {t('products.outOfStock')}
                  </span>
                )}
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-[#1C1C1C]">
                  {t('cart.quantity')}
                </span>
                <div className="flex items-center border border-[#E5E5E5]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-[#F5F5F5] transition-colors"
                    data-testid="qty-decrease"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-16 h-12 flex items-center justify-center font-medium border-x border-[#E5E5E5]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-[#F5F5F5] transition-colors"
                    data-testid="qty-increase"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={cartLoading || product.stock === 0}
                className={`w-full h-14 uppercase tracking-widest text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                  added
                    ? 'bg-green-600 text-white'
                    : 'bg-[#1C1C1C] text-white hover:bg-[#333333]'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                data-testid="add-to-cart-detail"
              >
                {added ? (
                  <>
                    <Check size={18} />
                    Ajouté!
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} />
                    {t('products.addToCart')}
                  </>
                )}
              </button>
            </div>

            {/* Info */}
            <div className="mt-12 space-y-4 text-sm text-[#8C8C8C]">
              <p>✓ Livraison dans la région Rhône-Alpes</p>
              <p>✓ Garantie 2 ans</p>
              <p>✓ Paiement sécurisé</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
