'use client';

import Image from 'next/image';
import { Company } from '@/lib/api/company';

interface CompanyDetailsProps {
  company: Company;
  onEdit?: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

const getFullImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${API_BASE_URL}${imageUrl}`;
};

export default function CompanyDetails({ company, onEdit }: CompanyDetailsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Logo */}
      <div className="rounded-lg border border-stroke bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-gray-dark">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            {company.logo_url && (
              <div className="h-16 w-16 flex-shrink-0">
                <Image
                  src={getFullImageUrl(company.logo_url) || '/images/logo/logo.svg'}
                  alt={`${company.name} logo`}
                  width={64}
                  height={64}
                  className="h-full w-full rounded-lg object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/logo/logo.svg';
                  }}
                />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-dark dark:text-white">
                {company.name}
              </h1>
              {company.founded_year && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Founded in {company.founded_year}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onEdit}
            className="rounded-lg bg-primary px-4 py-2 text-sm text-white transition-colors hover:bg-primary/90"
          >
            Edit Information
          </button>
        </div>
        
        {company.description && (
          <div className="mt-4">
            <p className="text-gray-600 dark:text-gray-300">
              {company.description}
            </p>
          </div>
        )}
      </div>

      {/* Mission, Vision, Values */}
      {(company.mission || company.vision || company.values) && (
        <div className="rounded-lg border border-stroke bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-gray-dark">
          <h2 className="mb-4 text-lg font-semibold text-dark dark:text-white">
            Mission, Vision & Values
          </h2>
          <div className="space-y-4">
            {company.mission && (
              <div>
                <h3 className="mb-2 font-medium text-dark dark:text-white">Mission</h3>
                <p className="text-gray-600 dark:text-gray-300">{company.mission}</p>
              </div>
            )}
            {company.vision && (
              <div>
                <h3 className="mb-2 font-medium text-dark dark:text-white">Vision</h3>
                <p className="text-gray-600 dark:text-gray-300">{company.vision}</p>
              </div>
            )}
            {company.values && (
              <div>
                <h3 className="mb-2 font-medium text-dark dark:text-white">Values</h3>
                <p className="text-gray-600 dark:text-gray-300">{company.values}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contact Information */}
      <div className="rounded-lg border border-stroke bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-gray-dark">
        <h2 className="mb-4 text-lg font-semibold text-dark dark:text-white">
          Contact Information
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {company.email && (
            <div>
              <h3 className="mb-1 font-medium text-dark dark:text-white">Email</h3>
              <a
                href={`mailto:${company.email}`}
                className="text-primary hover:underline"
              >
                {company.email}
              </a>
            </div>
          )}
          {company.phone && (
            <div>
              <h3 className="mb-1 font-medium text-dark dark:text-white">Phone</h3>
              <a
                href={`tel:${company.phone}`}
                className="text-primary hover:underline"
              >
                {company.phone}
              </a>
            </div>
          )}
          {company.website && (
            <div>
              <h3 className="mb-1 font-medium text-dark dark:text-white">Website</h3>
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {company.website}
              </a>
            </div>
          )}
          {company.address && (
            <div>
              <h3 className="mb-1 font-medium text-dark dark:text-white">Address</h3>
              <p className="text-gray-600 dark:text-gray-300">{company.address}</p>
            </div>
          )}
        </div>
      </div>

      {/* About Image */}
      {company.about_image_url && (
        <div className="rounded-lg border border-stroke bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-gray-dark">
          <h2 className="mb-4 text-lg font-semibold text-dark dark:text-white">
            About Us
          </h2>
          <div className="relative h-64 w-full overflow-hidden rounded-lg">
            <Image
              src={getFullImageUrl(company.about_image_url) || '/images/logo/logo.svg'}
              alt="About us"
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/logo/logo.svg';
              }}
            />
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="rounded-lg border border-stroke bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-gray-dark">
        <h2 className="mb-4 text-lg font-semibold text-dark dark:text-white">
          Information
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h3 className="mb-1 font-medium text-dark dark:text-white">Created</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {formatDate(company.created_at)}
            </p>
          </div>
          {company.updated_at && (
            <div>
              <h3 className="mb-1 font-medium text-dark dark:text-white">Last Updated</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {formatDate(company.updated_at)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
