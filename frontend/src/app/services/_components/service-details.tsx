'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { servicesAPI, Service, parseServiceFeatures } from '@/lib/api/services';

interface ServiceDetailsProps {
  serviceId: number;
  onEdit: (service: Service) => void;
  onClose: () => void;
}

export default function ServiceDetails({ serviceId, onEdit, onClose }: ServiceDetailsProps) {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        setError(null);
        const serviceData = await servicesAPI.getService(serviceId);
        setService(serviceData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch service');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId]);

  const handleDelete = async () => {
    if (!service || !confirm(`Are you sure you want to delete "${service.name}"?`)) {
      return;
    }

    try {
      await servicesAPI.deleteService(service.id);
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete service');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="rounded-lg bg-white p-8 shadow-xl dark:bg-gray-dark">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-dark">
          <div className="mb-4 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-dark dark:text-white">Error</h3>
            <p className="text-dark-4 dark:text-dark-6">{error || 'Service not found'}</p>
          </div>
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/90"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const features = parseServiceFeatures(service.features);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-dark">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stroke p-6 dark:border-dark-3">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-dark dark:text-white">Service Details</h2>
            <div className="flex gap-2">
              {service.is_featured && (
                <span className="rounded-full bg-yellow-500 px-3 py-1 text-xs font-medium text-white">
                  Featured
                </span>
              )}
              <span className={`rounded-full px-3 py-1 text-xs font-medium text-white ${
                service.is_active ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {service.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-dark-4 hover:text-dark dark:text-dark-6 dark:hover:text-white"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto">
          <div className="p-6">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Image Section */}
              <div>
                <div className="relative h-64 w-full overflow-hidden rounded-lg border border-stroke bg-gray-100 dark:border-dark-3 dark:bg-dark-2">
                  {service.image_url ? (
                    <Image
                      src={servicesAPI.getImageUrl(service.image_url)}
                      alt={service.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/placeholder-service.png';
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <svg
                        className="h-16 w-16 text-dark-4 dark:text-dark-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Service Info */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-dark dark:text-white mb-2">
                    {service.name}
                  </h1>
                  {service.category && (
                    <span className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                      {service.category}
                    </span>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {service.price && (
                    <div className="rounded-lg border border-stroke bg-gray-50 p-4 dark:border-dark-3 dark:bg-dark-2">
                      <div className="text-sm text-dark-4 dark:text-dark-6">Price</div>
                      <div className="text-xl font-bold text-primary">${service.price}</div>
                    </div>
                  )}
                  {service.duration && (
                    <div className="rounded-lg border border-stroke bg-gray-50 p-4 dark:border-dark-3 dark:bg-dark-2">
                      <div className="text-sm text-dark-4 dark:text-dark-6">Duration</div>
                      <div className="font-medium text-dark dark:text-white">{service.duration}</div>
                    </div>
                  )}
                </div>

                {service.short_description && (
                  <div>
                    <h3 className="mb-2 text-lg font-semibold text-dark dark:text-white">
                      Summary
                    </h3>
                    <p className="text-dark-4 dark:text-dark-6">
                      {service.short_description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Full Description */}
            {service.description && (
              <div className="mt-8">
                <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
                  Description
                </h3>
                <div className="rounded-lg border border-stroke bg-gray-50 p-6 dark:border-dark-3 dark:bg-dark-2">
                  <p className="whitespace-pre-wrap text-dark dark:text-white">
                    {service.description}
                  </p>
                </div>
              </div>
            )}

            {/* Features */}
            {features.length > 0 && (
              <div className="mt-8">
                <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
                  Features
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {features.map((feature: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-lg border border-stroke bg-gray-50 p-3 dark:border-dark-3 dark:bg-dark-2"
                    >
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <span className="text-dark dark:text-white">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="mt-8 grid gap-4 rounded-lg border border-stroke bg-gray-50 p-6 sm:grid-cols-2 dark:border-dark-3 dark:bg-dark-2">
              <div>
                <div className="text-sm text-dark-4 dark:text-dark-6">Created At</div>
                <div className="font-medium text-dark dark:text-white">
                  {new Date(service.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
              {service.updated_at && (
                <div>
                  <div className="text-sm text-dark-4 dark:text-dark-6">Last Updated</div>
                  <div className="font-medium text-dark dark:text-white">
                    {new Date(service.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-stroke bg-gray-50 px-6 py-4 dark:border-dark-3 dark:bg-dark-2">
          <div className="flex justify-between">
            <button
              onClick={handleDelete}
              className="rounded-lg border border-red-200 px-6 py-2.5 text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              Delete Service
            </button>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="rounded-lg border border-stroke px-6 py-2.5 text-dark transition-colors hover:bg-gray-50 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
              >
                Close
              </button>
              <button
                onClick={() => onEdit(service)}
                className="rounded-lg bg-primary px-6 py-2.5 text-white transition-colors hover:bg-primary/90"
              >
                Edit Service
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
