'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface Service {
  id: number;
  name: string;
  description: string;
  short_description: string;
  category: string;
  price: number;
  image_url: string;
  is_active: boolean;
  is_featured: boolean;
  features: string;
  requirements: string | null;
  duration: string | null;
  icon: string | null;
  order_position: number;
  created_at: string;
  updated_at: string | null;
}

export default function ServiceDetailPage() {
  const params = useParams();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/public/services/${params.id}`);
        if (!response.ok) {
          throw new Error('Service not found');
        }
        const data: Service = await response.json();
        setService(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchService();
    }
  }, [params.id]);

  const parseFeatures = (features: string): string[] => {
    if (!features) return [];
    return features.split('\r\n').filter(feature => feature.trim().length > 0);
  };

  const parseRequirements = (requirements: string | null): string[] => {
    if (!requirements) return [];
    return requirements.split('\r\n').filter(req => req.trim().length > 0);
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

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h1>
              <p className="text-gray-600 mb-6">The service you&apos;re looking for doesn&apos;t exist or has been removed.</p>
              <Link 
                href="/#services"
                className="inline-flex items-center px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg transition-colors duration-200"
              >
                ← Back to Services
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
                <Link href="/#services" className="text-blue-700 hover:text-blue-800 transition-colors">
                  Services
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-600 font-medium">{service.name}</li>
            </ol>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Service Image/Icon */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative h-96 overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100">
                {service.image_url ? (
                  <Image
                    src={`http://localhost:8000/static/${service.image_url}`}
                    alt={service.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <svg className="w-24 h-24 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m5 0v-9a1 1 0 011-1h2a1 1 0 011 1v9m-5 0V9a1 1 0 00-1-1H9a1 1 0 00-1 1v12" />
                    </svg>
                  </div>
                )}
                {service.is_featured && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
                      Featured Service
                    </span>
                  </div>
                )}
              </div>

              {/* Service Category Badge */}
              <div className="flex justify-center">
                <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                  {service.category}
                </span>
              </div>
            </div>

            {/* Service Information */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{service.name}</h1>
                <p className="text-lg text-gray-700 leading-relaxed">{service.description}</p>
              </div>

              {/* Pricing */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-700">
                    {service.price === 0 ? 'Free' : `$${service.price.toLocaleString()}`}
                  </span>
                  <span className="text-gray-600">
                    {service.duration ? `Duration: ${service.duration}` : 'One-time service'}
                  </span>
                </div>
              </div>

              {/* Short Description */}
              {service.short_description && service.short_description !== service.description && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Overview</h3>
                  <p className="text-gray-700">{service.short_description}</p>
                </div>
              )}

              {/* Features */}
              {service.features && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Service Features</h3>
                  <ul className="space-y-3">
                    {parseFeatures(service.features).map((feature, index) => (
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

              {/* Requirements */}
              {service.requirements && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Requirements</h3>
                  <ul className="space-y-2">
                    {parseRequirements(service.requirements).map((req, index) => (
                      <li key={index} className="flex items-start">
                        <svg 
                          className="w-4 h-4 text-amber-600 mt-1 mr-3 flex-shrink-0" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" 
                          />
                        </svg>
                        <span className="text-gray-700">{req.trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button className="flex-1 bg-blue-700 hover:bg-blue-800 text-white px-8 py-4 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:shadow-md active:scale-[0.98]">
                  {service.price === 0 ? 'Get Started Free' : 'Request Service'}
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

          {/* Additional Information */}
          {(service.duration || service.requirements) && (
            <div className="mt-12 grid md:grid-cols-2 gap-8">
              {/* Service Duration */}
              {service.duration && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Service Duration
                  </h3>
                  <p className="text-gray-700">{service.duration}</p>
                </div>
              )}

              {/* Service Category */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Service Category
                </h3>
                <p className="text-gray-700">{service.category}</p>
              </div>
            </div>
          )}

          {/* Back to Services */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link 
              href="/#services"
              className="inline-flex items-center text-blue-700 hover:text-blue-800 font-medium transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to All Services
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
