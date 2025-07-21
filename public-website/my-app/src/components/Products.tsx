'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Product {
  id: number;
  name: string;
  description: string;
  short_description: string;
  price: number | null;
  category: string | null;
  features: string;
  specifications: string | null;
  image_url: string;
  gallery_images: string | null;
  is_featured: boolean;
  is_active: boolean;
  order_position: number;
  created_at: string;
  updated_at: string | null;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/products/');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        // Filter active products and sort by order_position
        const activeProducts = data
          .filter((product: Product) => product.is_active)
          .sort((a: Product, b: Product) => a.order_position - b.order_position);
        setProducts(activeProducts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const parseFeatures = (features: string): string[] => {
    if (!features) return [];
    return features.split('\r\n').filter(feature => feature.trim().length > 0);
  };

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-red-600 text-lg">Error loading products: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              <span className="text-gray-900">Our</span> <span className="text-[#0A4E84]">Products</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-blue-400 mx-auto mb-8"></div>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Discover our comprehensive range of banking products designed to meet your financial needs with excellence and innovation.
            </p>
          </div>

          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8 mb-20">
              {products.map((product) => (
                <div 
                  key={product.id} 
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 flex flex-col h-full"
                >
                  {/* Product Image */}
                  <div className="relative h-48 overflow-hidden rounded-xl mb-6">
                    <Image
                      src={`http://localhost:8000${product.image_url}`}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                    
                    {/* Featured Badge */}
                    {product.is_featured && (
                      <div className="absolute top-3 left-3">
                        <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold">
                          Featured
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Content */}
                  <div className="text-center flex-1 flex flex-col">
                    {/* Product Name */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {product.name}
                    </h3>

                    {/* Product Description */}
                    <p className="text-gray-700 leading-relaxed mb-6">
                      {product.description}
                    </p>

                    {/* Features */}
                    {product.features && (
                      <div className="mb-6 flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Key Features:</h4>
                        <ul className="space-y-2 text-left">
                          {parseFeatures(product.features).map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-start">
                              <svg 
                                className="w-4 h-4 text-blue-600 mt-1 mr-2 flex-shrink-0" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M5 13l4 4L19 7" 
                                />
                              </svg>
                              <span className="text-gray-700 text-sm">{feature.trim()}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Category */}
                    {product.category && (
                      <div className="mb-6">
                        <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {product.category}
                        </span>
                      </div>
                    )}

                    {/* Action Button - This will be pushed to the bottom */}
                    <div className="mt-auto">
                      <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm">
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Available</h3>
                <p className="text-gray-600">We&apos;re working on adding new products. Please check back soon!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
