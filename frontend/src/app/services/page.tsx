'use client';

import { useState } from 'react';
import { Metadata } from "next";
import { ServicesList, ServiceForm, ServiceDetails } from './_components';
import { Service } from '@/lib/api/services';

export default function ServicesPage() {
  const [currentView, setCurrentView] = useState<'list' | 'form' | 'details'>('list');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateNew = () => {
    setSelectedService(null);
    setCurrentView('form');
  };

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setCurrentView('form');
  };

  const handleView = (service: Service) => {
    setSelectedService(service);
    setCurrentView('details');
  };

  const handleSave = () => {
    setCurrentView('list');
    setSelectedService(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCancel = () => {
    setCurrentView('list');
    setSelectedService(null);
  };

  const handleClose = () => {
    setCurrentView('list');
    setSelectedService(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark dark:text-white">
            Services Management
          </h1>
          <p className="mt-2 text-dark-4 dark:text-dark-6">
            Manage your company's services and offerings
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-white transition-colors hover:bg-primary/90"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Service
        </button>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {currentView === 'list' && (
          <ServicesList
            onEdit={handleEdit}
            onView={handleView}
            refreshTrigger={refreshTrigger}
          />
        )}

        {currentView === 'form' && (
          <ServiceForm
            service={selectedService}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}

        {currentView === 'details' && selectedService && (
          <ServiceDetails
            serviceId={selectedService.id}
            onEdit={handleEdit}
            onClose={handleClose}
          />
        )}
      </div>
    </div>
  );
}
