'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { servicesAPI, Service, ServiceFilters } from '@/lib/api/services';

interface ServicesListProps {
  onEdit: (service: Service) => void;
  onView: (service: Service) => void;
  refreshTrigger?: number;
}

export default function ServicesList({ onEdit, onView, refreshTrigger }: ServicesListProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ServiceFilters>({
    limit: 20,
    skip: 0,
  });
  const [totalServices, setTotalServices] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filterParams: ServiceFilters = {
        ...filters,
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(statusFilter === 'active' && { is_active: true }),
        ...(statusFilter === 'inactive' && { is_active: false }),
        ...(statusFilter === 'featured' && { is_featured: true }),
      };

      const response = await servicesAPI.getServices(filterParams);
      setServices(response.services);
      setTotalServices(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [filters, searchTerm, categoryFilter, statusFilter, refreshTrigger]);

  const handleDelete = async (service: Service) => {
    if (!confirm(`Are you sure you want to delete "${service.name}"?`)) {
      return;
    }

    try {
      await servicesAPI.deleteService(service.id);
      fetchServices(); // Refresh the list
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete service');
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(1);
    setFilters(prev => ({ ...prev, skip: 0 }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setFilters(prev => ({ ...prev, skip: (page - 1) * (prev.limit || 20) }));
  };

  const totalPages = Math.ceil(totalServices / (filters.limit || 20));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
        <p className="font-medium">Error loading services</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={fetchServices}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="rounded-lg border border-stroke bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-gray-dark">
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-dark focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-primary px-6 py-2.5 text-white transition-colors hover:bg-primary/90"
            >
              Search
            </button>
          </div>
        </form>

        <div className="flex flex-wrap gap-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-stroke bg-transparent px-4 py-2 text-dark focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white"
          >
            <option value="">All Categories</option>
            <option value="Mobile Banking">Mobile Banking</option>
            <option value="Transaction">Transaction</option>
            <option value="Cash Pickup">Cash Pickup</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-stroke bg-transparent px-4 py-2 text-dark focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="featured">Featured</option>
          </select>
        </div>
      </div>

      {/* Services Grid */}
      {services.length === 0 ? (
        <div className="rounded-lg border border-stroke bg-white p-12 text-center shadow-sm dark:border-dark-3 dark:bg-gray-dark">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center dark:bg-dark-2">
            <svg
              className="h-8 w-8 text-dark-4 dark:text-dark-6"
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
          <h3 className="text-lg font-semibold text-dark dark:text-white mb-2">
            No services found
          </h3>
          <p className="text-dark-4 dark:text-dark-6">
            {searchTerm || categoryFilter || statusFilter
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first service'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="rounded-lg border border-stroke bg-white shadow-sm transition-shadow hover:shadow-md dark:border-dark-3 dark:bg-gray-dark"
            >
              {/* Service Image */}
              <div className="relative h-48 w-full overflow-hidden rounded-t-lg bg-gray-100 dark:bg-dark-2">
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
                      className="h-12 w-12 text-dark-4 dark:text-dark-6"
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
                
                {/* Status badges */}
                <div className="absolute top-2 left-2 flex gap-2">
                  {service.is_featured && (
                    <span className="rounded-full bg-yellow-500 px-2 py-1 text-xs font-medium text-white">
                      Featured
                    </span>
                  )}
                  <span className={`rounded-full px-2 py-1 text-xs font-medium text-white ${
                    service.is_active ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {service.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Service Content */}
              <div className="p-6">
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-dark dark:text-white">
                    {service.name}
                  </h3>
                  {service.price && (
                    <span className="text-lg font-bold text-primary">
                      ${service.price}
                    </span>
                  )}
                </div>

                {service.category && (
                  <span className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {service.category}
                  </span>
                )}

                {service.short_description && (
                  <p className="mb-4 text-sm text-dark-4 dark:text-dark-6 line-clamp-2">
                    {service.short_description}
                  </p>
                )}

                {service.duration && (
                  <div className="mb-4 flex items-center text-sm text-dark-4 dark:text-dark-6">
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {service.duration}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onView(service)}
                    className="flex-1 rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-dark transition-colors hover:bg-gray-50 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
                  >
                    View
                  </button>
                  <button
                    onClick={() => onEdit(service)}
                    className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(service)}
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-lg border border-stroke bg-white p-4 shadow-sm dark:border-dark-3 dark:bg-gray-dark">
          <div className="text-sm text-dark-4 dark:text-dark-6">
            Showing {(currentPage - 1) * (filters.limit || 20) + 1} to{' '}
            {Math.min(currentPage * (filters.limit || 20), totalServices)} of {totalServices} services
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-lg border border-stroke px-3 py-2 text-sm font-medium text-dark transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => 
                page === 1 || 
                page === totalPages || 
                (page >= currentPage - 2 && page <= currentPage + 2)
              )
              .map((page, index, array) => (
                <div key={page} className="flex items-center">
                  {index > 0 && array[index - 1] !== page - 1 && (
                    <span className="px-2 text-dark-4 dark:text-dark-6">...</span>
                  )}
                  <button
                    onClick={() => handlePageChange(page)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-primary text-white'
                        : 'border border-stroke text-dark hover:bg-gray-50 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2'
                    }`}
                  >
                    {page}
                  </button>
                </div>
              ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-stroke px-3 py-2 text-sm font-medium text-dark transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
