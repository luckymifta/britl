'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

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

interface ServicesResponse {
  services: Service[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/services/');
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        const data: ServicesResponse = await response.json();
        setServices(data.services);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <section className="py-16 md:py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header Skeleton */}
            <div className="text-center mb-12 md:mb-16">
              <div className="animate-pulse bg-gray-200 h-10 rounded-md w-1/3 mx-auto mb-6"></div>
              <div className="animate-pulse bg-gray-200 h-4 rounded-md w-1/2 mx-auto"></div>
            </div>
            
            {/* Cards Skeleton */}
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                  <div className="animate-pulse space-y-4">
                    <div className="bg-gray-200 h-48 rounded-xl"></div>
                    <div className="bg-gray-200 h-6 rounded-md w-3/4"></div>
                    <div className="bg-gray-200 h-4 rounded-md w-full"></div>
                    <div className="bg-gray-200 h-4 rounded-md w-2/3"></div>
                    <div className="bg-gray-200 h-10 rounded-lg w-full mt-6"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-red-600 text-lg">Error loading services: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="py-16 md:py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              <span className="text-gray-900">Our</span> <span className="text-blue-700">Services</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-blue-400 mx-auto mb-8"></div>
            <p className="text-base md:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Discover our comprehensive range of banking and financial services designed to meet your business and personal needs.
            </p>
          </div>

          {/* Services Grid */}
          {services.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Services Available</h3>
                <p className="text-gray-600">We&apos;re working on adding new services. Please check back soon!</p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 mb-20">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 hover:border-gray-200 transition-all duration-200 p-6 md:p-8 flex flex-col h-full transform hover:scale-[1.02] group"
                >
                  {/* Service Image */}
                  <div className="relative h-48 overflow-hidden rounded-xl mb-6">
                    <Image
                      src={`http://localhost:8000/static/${service.image_url}`}
                      alt={service.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/logo/logo-dark.svg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                    
                    {/* Featured Badge */}
                    {service.is_featured && (
                      <div className="absolute top-3 left-3">
                        <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold">
                          Featured
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Service Content */}
                  <div className="text-center flex-1 flex flex-col">
                    {/* Service Name and Category */}
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors duration-200">
                        {service.name}
                      </h3>
                      
                      {/* Category Badge - Always reserve space */}
                      <div className="h-7 flex justify-center items-center">
                        {service.category ? (
                          <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {service.category}
                          </span>
                        ) : (
                          <div className="h-7"></div>
                        )}
                      </div>
                    </div>

                    {/* Service Description */}
                    <p className="text-gray-700 leading-relaxed mb-6">
                      {service.description}
                    </p>

                    {/* Price and Action Button */}
                    <div className="mt-auto">
                      {service.price > 0 ? (
                        <div className="text-lg font-bold text-green-600 mb-4">
                          ${service.price.toLocaleString()}
                        </div>
                      ) : (
                        <div className="text-lg font-bold text-green-600 mb-4">Free</div>
                      )}
                      
                      <button className="w-full bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:shadow-md active:scale-[0.98]">
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
