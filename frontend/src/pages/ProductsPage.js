import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from '../components/products/ProductCard';
import { Filter, X } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProductsPage = () => {
  const { t, getCategoryField } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const selectedCategory = searchParams.get('category');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = selectedCategory ? `?category_id=${selectedCategory}` : '';
        const [productsRes, categoriesRes] = await Promise.all([
          axios.get(`${API}/products${params}`),
          axios.get(`${API}/categories`)
        ]);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCategory]);

  const handleCategoryFilter = (categoryId) => {
    if (categoryId) {
      setSearchParams({ category: categoryId });
    } else {
      setSearchParams({});
    }
    setFilterOpen(false);
  };

  const selectedCategoryName = categories.find(c => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-[#FDFDFD]" data-testid="products-page">
      {/* Header */}
      <div className="border-b border-[#E5E5E5] bg-white">
        <div className="container mx-auto px-4 md:px-8 max-w-screen-2xl py-8 md:py-12">
          <h1 className="font-heading text-4xl md:text-5xl font-medium tracking-tight text-[#1C1C1C]">
            {selectedCategoryName ? getCategoryField(selectedCategoryName, 'name') : t('products.all')}
          </h1>
          <p className="text-[#8C8C8C] mt-2">
            {products.length} {t('nav.products').toLowerCase()}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 max-w-screen-2xl py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#1C1C1C] mb-6">
                {t('products.categories')}
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleCategoryFilter(null)}
                  className={`block w-full text-left py-2 px-3 text-sm transition-colors ${
                    !selectedCategory
                      ? 'bg-[#1C1C1C] text-white'
                      : 'text-[#8C8C8C] hover:text-[#1C1C1C] hover:bg-[#F5F5F5]'
                  }`}
                  data-testid="filter-all"
                >
                  {t('products.all')}
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryFilter(category.id)}
                    className={`block w-full text-left py-2 px-3 text-sm transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-[#1C1C1C] text-white'
                        : 'text-[#8C8C8C] hover:text-[#1C1C1C] hover:bg-[#F5F5F5]'
                    }`}
                    data-testid={`filter-${category.slug}`}
                  >
                    {getCategoryField(category, 'name')}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 h-12 px-6 border border-[#E5E5E5] text-[#1C1C1C] text-sm font-medium w-fit"
            data-testid="mobile-filter-btn"
          >
            <Filter size={18} />
            {t('products.category')}
            {selectedCategory && (
              <span className="bg-[#1C1C1C] text-white text-xs px-2 py-0.5 ml-2">1</span>
            )}
          </button>

          {/* Mobile Filter Drawer */}
          {filterOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/30" onClick={() => setFilterOpen(false)} />
              <div className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-medium">{t('products.categories')}</h3>
                  <button onClick={() => setFilterOpen(false)}>
                    <X size={24} />
                  </button>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategoryFilter(null)}
                    className={`block w-full text-left py-3 px-4 text-sm border ${
                      !selectedCategory
                        ? 'bg-[#1C1C1C] text-white border-[#1C1C1C]'
                        : 'border-[#E5E5E5] text-[#1C1C1C]'
                    }`}
                  >
                    {t('products.all')}
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryFilter(category.id)}
                      className={`block w-full text-left py-3 px-4 text-sm border ${
                        selectedCategory === category.id
                          ? 'bg-[#1C1C1C] text-white border-[#1C1C1C]'
                          : 'border-[#E5E5E5] text-[#1C1C1C]'
                      }`}
                    >
                      {getCategoryField(category, 'name')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-[#8C8C8C]">{t('common.loading')}</p>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-[#8C8C8C] mb-4">Aucun produit trouvé</p>
                <Link
                  to="/products"
                  className="text-[#1C1C1C] underline hover:no-underline"
                >
                  Voir tous les produits
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-[#E5E5E5] border border-[#E5E5E5]">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
