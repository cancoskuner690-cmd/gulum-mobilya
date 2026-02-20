import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { CheckCircle, XCircle, Loader2, Home } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const OrderSuccessPage = () => {
  const { t } = useLanguage();
  const { clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('checking');
  const [attempts, setAttempts] = useState(0);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }

    const pollPaymentStatus = async () => {
      if (attempts >= 10) {
        setStatus('timeout');
        return;
      }

      try {
        const response = await axios.get(`${API}/checkout/status/${sessionId}`);
        
        if (response.data.payment_status === 'paid') {
          setStatus('success');
          clearCart();
          return;
        } else if (response.data.status === 'expired') {
          setStatus('expired');
          return;
        }

        // Continue polling
        setAttempts(prev => prev + 1);
        setTimeout(pollPaymentStatus, 2000);
      } catch (error) {
        console.error('Error checking payment status:', error);
        setStatus('error');
      }
    };

    pollPaymentStatus();
  }, [sessionId, attempts, clearCart]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center px-4" data-testid="order-success-page">
      <div className="max-w-md w-full text-center">
        {status === 'checking' && (
          <>
            <Loader2 size={64} className="mx-auto text-[#1C1C1C] animate-spin mb-6" />
            <h1 className="font-heading text-2xl font-medium text-[#1C1C1C] mb-2">
              {t('orderSuccess.checkingPayment')}
            </h1>
            <p className="text-[#8C8C8C]">
              Veuillez patienter...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h1 className="font-heading text-3xl font-medium text-[#1C1C1C] mb-2">
              {t('orderSuccess.title')}
            </h1>
            <p className="text-[#8C8C8C] mb-8">
              {t('orderSuccess.subtitle')}
            </p>
            {sessionId && (
              <p className="text-sm text-[#8C8C8C] mb-8 p-4 bg-[#F5F5F5]">
                <span className="font-medium text-[#1C1C1C]">{t('orderSuccess.orderNumber')}:</span>
                <br />
                <span className="text-xs break-all">{sessionId}</span>
              </p>
            )}
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 h-14 px-8 bg-[#1C1C1C] text-white uppercase tracking-widest text-xs font-bold hover:bg-[#333333] transition-colors"
              data-testid="back-home-btn"
            >
              <Home size={16} />
              {t('orderSuccess.backHome')}
            </Link>
          </>
        )}

        {(status === 'error' || status === 'expired' || status === 'timeout') && (
          <>
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
              <XCircle size={40} className="text-red-600" />
            </div>
            <h1 className="font-heading text-3xl font-medium text-[#1C1C1C] mb-2">
              {t('orderSuccess.paymentFailed')}
            </h1>
            <p className="text-[#8C8C8C] mb-8">
              {status === 'timeout' 
                ? 'La vérification a pris trop de temps. Vérifiez votre email pour la confirmation.'
                : 'Une erreur est survenue. Veuillez réessayer.'}
            </p>
            <Link
              to="/cart"
              className="inline-flex items-center justify-center gap-2 h-14 px-8 bg-[#1C1C1C] text-white uppercase tracking-widest text-xs font-bold hover:bg-[#333333] transition-colors"
            >
              Retour au Panier
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderSuccessPage;
