'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Product } from '@/lib/api/products';
import { ProductDetails, ProductForm } from '../_components';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  const productId = parseInt(params.id as string, 10);

  const handleEdit = (product: Product) => {
    setCurrentProduct(product);
    setIsEditing(true);
  };

  const handleFormSuccess = (updatedProduct: Product) => {
    setCurrentProduct(updatedProduct);
    setIsEditing(false);
  };

  const handleFormCancel = () => {
    setIsEditing(false);
  };

  if (isNaN(productId)) {
    router.push('/products');
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl">
      {isEditing && currentProduct ? (
        <ProductForm
          product={currentProduct}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      ) : (
        <ProductDetails
          productId={productId}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
}
