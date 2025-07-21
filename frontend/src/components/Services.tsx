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
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center">Loading services...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center text-red-600">Error: {error}</div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover our comprehensive range of banking and financial services designed to meet your business and personal needs.
        </p>
      </div>

      {services.length === 0 ? (
        <div className="text-center text-gray-600">No services available.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={`http://localhost:8000/static/${service.image_url}`}
                  alt={service.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/logo/logo-dark.svg';
                  }}
                />
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{service.name}</h3>
                  {service.category && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {service.category}
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {service.short_description}
                </p>
                
                <div className="mt-auto">
                  <p className="text-sm text-gray-700 mb-4">
                    {service.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    {service.price > 0 ? (
                      <div className="text-lg font-bold text-green-600">
                        ${service.price.toLocaleString()}
                      </div>
                    ) : (
                      <div className="text-lg font-bold text-green-600">Free</div>
                    )}
                    
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200">
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
