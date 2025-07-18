'use client';

import { useState } from 'react';
import { Product } from '@/lib/api/products';
import { ProductsList, ProductForm } from './_components';

interface ProductsPageState {
  showForm: boolean;
  editingProduct: Product | null;
}

export default function ProductsPage() {
  const [state, setState] = useState<ProductsPageState>({
    showForm: false,
    editingProduct: null,
  });

  const handleAddNew = () => {
    setState({ showForm: true, editingProduct: null });
  };

  const handleEdit = (product: Product) => {
    setState({ showForm: true, editingProduct: product });
  };

  const handleFormSuccess = () => {
    setState({ showForm: false, editingProduct: null });
    // The ProductsList component will refresh automatically
  };

  const handleFormCancel = () => {
    setState({ showForm: false, editingProduct: null });
  };

  return (
    <div className="mx-auto max-w-7xl">
      {state.showForm ? (
        <ProductForm
          product={state.editingProduct || undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      ) : (
        <>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-dark dark:text-white">
                Products Management
              </h1>
              <p className="text-sm text-dark-4 dark:text-dark-6">
                Manage your product catalog and inventory
              </p>
            </div>
            <button
              onClick={handleAddNew}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add New Product
            </button>
          </div>

          <ProductsList
            onEdit={handleEdit}
            onDelete={() => {}} // Handled within ProductsList component
          />
        </>
      )}
    </div>
  );
}
