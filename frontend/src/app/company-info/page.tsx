'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Metadata } from "next";
import { CompanyApi, Company } from '@/lib/api/company';
import { CompanyForm, CompanyDetails } from './_components';

export default function CompanyInfoPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadCompanyInfo();
  }, []);

  const loadCompanyInfo = async () => {
    try {
      setIsLoading(true);
      const companyData = await CompanyApi.getCompanyInfo();
      setCompany(companyData);
      setShowForm(false);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        // No company info exists yet, show form
        setShowForm(true);
      } else {
        toast.error('Failed to load company information');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSuccess = (updatedCompany: Company) => {
    setCompany(updatedCompany);
    setShowForm(false);
    toast.success('Company information saved successfully!');
  };

  const handleEdit = () => {
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-dark dark:text-white">
            Company Information
          </h1>
          <p className="text-sm text-dark-4 dark:text-dark-6">
            Manage your company details, contact information, and business settings
          </p>
        </div>
        
        <div className="rounded-xl border border-stroke bg-white p-8 shadow-lg dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-l-transparent"></div>
            <span className="ml-2 text-dark dark:text-white">Loading company information...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-dark dark:text-white">
            Company Information
          </h1>
          <p className="text-sm text-dark-4 dark:text-dark-6">
            Manage your company details, contact information, and business settings
          </p>
        </div>
        
        {showForm && company && (
          <button
            onClick={handleCancelEdit}
            className="rounded-lg border border-stroke px-4 py-2 text-dark transition-colors hover:bg-gray-50 dark:border-dark-3 dark:text-white dark:hover:bg-dark-3"
          >
            Cancel Edit
          </button>
        )}
      </div>

      {showForm ? (
        <div className="rounded-xl border border-stroke bg-white p-6 shadow-lg dark:border-dark-3 dark:bg-gray-dark">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-dark dark:text-white">
              {company ? 'Edit Company Information' : 'Create Company Information'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {company ? 'Update your company details below' : 'Enter your company details below'}
            </p>
          </div>
          <CompanyForm company={company} onSuccess={handleFormSuccess} />
        </div>
      ) : company ? (
        <CompanyDetails company={company} onEdit={handleEdit} />
      ) : (
        <div className="rounded-xl border border-stroke bg-white p-8 text-center shadow-lg dark:border-dark-3 dark:bg-gray-dark">
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
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-dark dark:text-white mb-2">
            No Company Information Found
          </h3>
          <p className="text-dark-4 dark:text-dark-6 mb-6">
            Get started by creating your company profile with all the essential information.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-primary px-6 py-3 text-white transition-colors hover:bg-primary/90"
          >
            Create Company Information
          </button>
        </div>
      )}
    </div>
  );
}
