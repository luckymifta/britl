'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

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

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/public/products/${params.id}`);
        if (!response.ok) {
          throw new Error('Product not found');
        }
        const data: Product = await response.json();
        setProduct(data);
        
        // Parse gallery images
        const images = [data.image_url];
        if (data.gallery_images) {
          const additionalImages = data.gallery_images.split(',').map(img => img.trim());
          images.push(...additionalImages);
        }
        setGalleryImages(images);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const parseFeatures = (features: string): string[] => {
    if (!features) return [];
    return features.split('\r\n').filter(feature => feature.trim().length > 0);
  };

  const parseSpecifications = (specifications: string | null): string[] => {
    if (!specifications) return [];
    return specifications.split('\r\n').filter(spec => spec.trim().length > 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="grid lg:grid-cols-2 gap-12">
                <div className="bg-gray-200 h-96 rounded-xl"></div>
                <div className="space-y-6">
                  <div className="bg-gray-200 h-8 rounded-md w-3/4"></div>
                  <div className="bg-gray-200 h-4 rounded-md w-full"></div>
                  <div className="bg-gray-200 h-4 rounded-md w-2/3"></div>
                  <div className="bg-gray-200 h-32 rounded-md w-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
              <p className="text-gray-600 mb-6">The product you&apos;re looking for doesn&apos;t exist or has been removed.</p>
              <Link 
                href="/#products"
                className="inline-flex items-center px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg transition-colors duration-200"
              >
                ← Back to Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link href="/" className="text-blue-700 hover:text-blue-800 transition-colors">
                  Home
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li>
                <Link href="/#products" className="text-blue-700 hover:text-blue-800 transition-colors">
                  Products
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-600 font-medium">{product.name}</li>
            </ol>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative h-96 overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100">
                <Image
                  src={`http://localhost:8000${galleryImages[selectedImageIndex]}`}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {product.is_featured && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
                      Featured Product
                    </span>
                  </div>
                )}
              </div>

              {/* Image Gallery */}
              {galleryImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {galleryImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative h-20 overflow-hidden rounded-lg border-2 transition-colors duration-200 ${
                        selectedImageIndex === index 
                          ? 'border-blue-500' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={`http://localhost:8000${image}`}
                        alt={`${product.name} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="20vw"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{product.name}</h1>
                  {product.category && (
                    <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {product.category}
                    </span>
                  )}
                </div>
                <p className="text-lg text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              {/* Price */}
              {product.price && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <span className="text-2xl font-bold text-blue-700">
                    ${product.price.toLocaleString()}
                  </span>
                  <span className="text-gray-600 ml-2">Starting price</span>
                </div>
              )}

              {/* Features */}
              {product.features && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Key Features</h3>
                  <ul className="space-y-3">
                    {parseFeatures(product.features).map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg 
                          className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" 
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
                        <span className="text-gray-700">{feature.trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Specifications */}
              {product.specifications && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Specifications</h3>
                  <ul className="space-y-2">
                    {parseSpecifications(product.specifications).map((spec, index) => (
                      <li key={index} className="text-gray-700 border-b border-gray-100 pb-2 last:border-b-0">
                        {spec.trim()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button className="flex-1 bg-blue-700 hover:bg-blue-800 text-white px-8 py-4 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:shadow-md active:scale-[0.98]">
                  Get Started
                </button>
                <Link 
                  href="/#contact"
                  className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-center"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>

          {/* Back to Products */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link 
              href="/#products"
              className="inline-flex items-center text-blue-700 hover:text-blue-800 font-medium transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to All Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
