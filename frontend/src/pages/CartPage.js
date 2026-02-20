import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';

const CartPage = () => {
  const { t, getProductField } = useLanguage();
  const { cart, updateQuantity, removeFromCart, getTotal, loading } = useCart();

  if (cart.products.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center px-4" data-testid="cart-page-empty">
        <ShoppingBag size={64} className="text-[#E5E5E5] mb-6" strokeWidth={1} />
        <h1 className="font-heading text-2xl font-medium text-[#1C1C1C] mb-2">
          {t('cart.empty')}
        </h1>
        <p className="text-[#8C8C8C] mb-8">
          Commencez à ajouter des produits à votre panier
        </p>
        <Link
          to="/products"
          className="inline-flex items-center justify-center gap-2 h-14 px-8 bg-[#1C1C1C] text-white uppercase tracking-widest text-xs font-bold hover:bg-[#333333] transition-colors"
          data-testid="continue-shopping"
        >
          {t('cart.continueShopping')}
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD]" data-testid="cart-page">
      <div className="container mx-auto px-4 md:px-8 max-w-screen-2xl py-8 md:py-12">
        <h1 className="font-heading text-4xl md:text-5xl font-medium tracking-tight text-[#1C1C1C] mb-8">
          {t('cart.title')}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.products.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 md:gap-6 p-4 md:p-6 border border-[#E5E5E5] bg-white"
                data-testid={`cart-item-${item.id}`}
              >
                {/* Image */}
                <Link 
                  to={`/products/${item.id}`}
                  className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-[#F5F5F5] overflow-hidden"
                >
                  <img
                    src={item.images?.[0] || 'https://via.placeholder.com/200'}
                    alt={getProductField(item, 'name')}
                    className="w-full h-full object-cover"
                  />
                </Link>

                {/* Info */}
                <div className="flex-1 flex flex-col">
                  <Link 
                    to={`/products/${item.id}`}
                    className="font-heading text-lg font-medium text-[#1C1C1C] hover:underline"
                  >
                    {getProductField(item, 'name')}
                  </Link>
                  
                  <span className="text-[#8C8C8C] text-sm mt-1">
                    {item.price?.toFixed(2)}€
                  </span>

                  <div className="mt-auto flex items-center justify-between">
                    {/* Quantity */}
                    <div className="flex items-center border border-[#E5E5E5]">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={loading}
                        className="w-10 h-10 flex items-center justify-center hover:bg-[#F5F5F5] transition-colors disabled:opacity-50"
                        data-testid={`qty-decrease-${item.id}`}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 h-10 flex items-center justify-center font-medium border-x border-[#E5E5E5] text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={loading}
                        className="w-10 h-10 flex items-center justify-center hover:bg-[#F5F5F5] transition-colors disabled:opacity-50"
                        data-testid={`qty-increase-${item.id}`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Subtotal & Remove */}
                    <div className="flex items-center gap-4">
                      <span className="font-heading text-lg font-medium text-[#1C1C1C]">
                        {(item.price * item.quantity).toFixed(2)}€
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        disabled={loading}
                        className="p-2 text-[#8C8C8C] hover:text-red-500 transition-colors disabled:opacity-50"
                        data-testid={`remove-item-${item.id}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 border border-[#E5E5E5] bg-white p-6 md:p-8">
              <h2 className="font-heading text-xl font-medium text-[#1C1C1C] mb-6">
                {t('checkout.orderSummary')}
              </h2>

              <div className="space-y-4 pb-6 border-b border-[#E5E5E5]">
                {cart.products.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-[#8C8C8C]">
                      {getProductField(item, 'name')} × {item.quantity}
                    </span>
                    <span className="text-[#1C1C1C]">
                      {(item.price * item.quantity).toFixed(2)}€
                    </span>
                  </div>
                ))}
              </div>

              <div className="py-6 border-b border-[#E5E5E5]">
                <div className="flex justify-between">
                  <span className="text-[#8C8C8C]">Sous-total</span>
                  <span className="text-[#1C1C1C]">{getTotal().toFixed(2)}€</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[#8C8C8C]">Livraison</span>
                  <span className="text-[#1C1C1C]">Gratuite</span>
                </div>
              </div>

              <div className="flex justify-between py-6">
                <span className="font-heading text-xl font-medium text-[#1C1C1C]">
                  {t('cart.total')}
                </span>
                <span className="font-heading text-xl font-medium text-[#1C1C1C]">
                  {getTotal().toFixed(2)}€
                </span>
              </div>

              <Link
                to="/checkout"
                className="w-full h-14 bg-[#1C1C1C] text-white uppercase tracking-widest text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#333333] transition-colors"
                data-testid="checkout-btn"
              >
                {t('cart.checkout')}
                <ArrowRight size={16} />
              </Link>

              <Link
                to="/products"
                className="w-full h-12 mt-4 border border-[#E5E5E5] text-[#1C1C1C] uppercase tracking-widest text-xs font-bold flex items-center justify-center hover:border-[#1C1C1C] transition-colors"
              >
                {t('cart.continueShopping')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
