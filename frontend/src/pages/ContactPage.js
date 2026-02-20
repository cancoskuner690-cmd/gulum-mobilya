import React, { useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ContactPage = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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
      await axios.post(`${API}/contact`, formData);
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.detail || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      label: t('contact.address'),
      value: '18 chemin des Brudeaux\n26540 Mours Saint Eusèbe\nFrance'
    },
    {
      icon: Phone,
      label: 'Téléphone',
      value: '06 01 44 31 15',
      href: 'tel:+33601443115'
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'contact@gulmobilya.fr',
      href: 'mailto:contact@gulmobilya.fr'
    },
    {
      icon: Clock,
      label: t('contact.hours'),
      value: t('contact.hoursValue')
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD]" data-testid="contact-page">
      {/* Header */}
      <div className="border-b border-[#E5E5E5] bg-white">
        <div className="container mx-auto px-4 md:px-8 max-w-screen-2xl py-12 md:py-16">
          <h1 className="font-heading text-4xl md:text-5xl font-medium tracking-tight text-[#1C1C1C]">
            {t('contact.title')}
          </h1>
          <p className="text-[#8C8C8C] mt-2 text-lg">
            {t('contact.subtitle')}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 max-w-screen-2xl py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Form */}
          <div>
            {success ? (
              <div className="border border-green-200 bg-green-50 p-8 text-center" data-testid="success-message">
                <CheckCircle size={48} className="mx-auto text-green-600 mb-4" />
                <h3 className="font-heading text-xl font-medium text-[#1C1C1C] mb-2">
                  {t('contact.success')}
                </h3>
                <p className="text-[#8C8C8C]">
                  Nous vous répondrons dans les plus brefs délais.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-6 h-12 px-6 border border-[#E5E5E5] text-[#1C1C1C] uppercase tracking-widest text-xs font-bold hover:border-[#1C1C1C] transition-colors"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-2">
                    {t('contact.name')} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full h-12 px-4 border border-[#E5E5E5] focus:border-[#1C1C1C] focus:outline-none bg-transparent"
                    data-testid="contact-name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-2">
                    {t('contact.email')} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full h-12 px-4 border border-[#E5E5E5] focus:border-[#1C1C1C] focus:outline-none bg-transparent"
                    data-testid="contact-email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-2">
                    {t('contact.phone')}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full h-12 px-4 border border-[#E5E5E5] focus:border-[#1C1C1C] focus:outline-none bg-transparent"
                    data-testid="contact-phone"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-2">
                    {t('contact.message')} *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-[#E5E5E5] focus:border-[#1C1C1C] focus:outline-none bg-transparent resize-none"
                    data-testid="contact-message"
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-[#1C1C1C] text-white uppercase tracking-widest text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#333333] transition-colors disabled:opacity-50"
                  data-testid="contact-submit"
                >
                  <Send size={16} />
                  {t('contact.send')}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div>
            <div className="border border-[#E5E5E5] bg-white p-8">
              <h2 className="font-heading text-xl font-medium text-[#1C1C1C] mb-8">
                {t('contact.storeInfo')}
              </h2>

              <div className="space-y-6">
                {contactInfo.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-10 h-10 bg-[#F5F5F5] flex items-center justify-center flex-shrink-0">
                      <item.icon size={18} className="text-[#1C1C1C]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-[#8C8C8C] mb-1">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a 
                          href={item.href} 
                          className="text-[#1C1C1C] hover:underline whitespace-pre-line"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-[#1C1C1C] whitespace-pre-line">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map Embed */}
            <div className="mt-6 aspect-video bg-[#F5F5F5] border border-[#E5E5E5] overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2784.5!2d5.03!3d45.05!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDXCsDAzJzAwLjAiTiA1wrAwMS00OC4wIkU!5e0!3m2!1sfr!2sfr!4v1600000000000!5m2!1sfr!2sfr"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Gül Mobilya Location"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
