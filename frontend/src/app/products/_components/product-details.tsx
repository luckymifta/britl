'use client';

import { useState, useEffect } from 'react';
import { Product, ProductsApi } from '@/lib/api/products';
import { getImageUrl } from '@/lib/utils/image';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface ProductDetailsProps {
  productId: number;
  onEdit?: (product: Product) => void;
}

export default function ProductDetails({ productId, onEdit }: ProductDetailsProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProductsApi.getProduct(productId);
      setProduct(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product || !confirm(`Are you sure you want to delete "${product.name}"?`)) return;

    try {
      await ProductsApi.deleteProduct(product.id);
      toast.success('Product deleted successfully');
      router.push('/products');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-stroke bg-white p-8 shadow-sm dark:border-dark-3 dark:bg-gray-dark">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="aspect-square w-full rounded-lg bg-gray-200 dark:bg-dark-3"></div>
            <div className="space-y-6">
              <div className="h-8 w-3/4 rounded bg-gray-200 dark:bg-dark-3"></div>
              <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-dark-3"></div>
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-gray-200 dark:bg-dark-3"></div>
                <div className="h-4 w-full rounded bg-gray-200 dark:bg-dark-3"></div>
                <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-dark-3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-900/20">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center dark:bg-red-800">
          <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">Error Loading Product</h3>
        <p className="text-red-600 dark:text-red-300 mb-4">{error || 'Product not found'}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={fetchProduct}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry
          </button>
          <button
            onClick={() => router.push('/products')}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const galleryImages = product.gallery_images ? product.gallery_images.split(',').filter(img => img.trim()) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/products')}
            className="inline-flex items-center gap-2 text-dark-4 hover:text-dark dark:text-dark-6 dark:hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Products
          </button>
          <div className="h-6 w-px bg-stroke dark:bg-dark-3"></div>
          <h1 className="text-2xl font-semibold text-dark dark:text-white">Product Details</h1>
        </div>
        <div className="flex items-center gap-3">
          {onEdit && (
            <button
              onClick={() => onEdit(product)}
              className="inline-flex items-center gap-2 rounded-lg bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-800 dark:text-yellow-100 dark:hover:bg-yellow-700"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Product
            </button>
          )}
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 dark:bg-red-800 dark:text-red-100 dark:hover:bg-red-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="rounded-lg border border-stroke bg-white p-8 shadow-sm dark:border-dark-3 dark:bg-gray-dark">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Product Image */}
          <div>
            <div className="aspect-square w-full rounded-lg overflow-hidden border border-stroke bg-gray-100 dark:border-dark-3 dark:bg-dark-2">
              {product.image_url ? (
                <Image
                  src={getImageUrl(product.image_url) || '/images/placeholder.png'}
                  alt={product.name}
                  width={500}
                  height={500}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <svg className="h-16 w-16 text-dark-4 dark:text-dark-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Gallery Images */}
            {galleryImages.length > 0 && (
              <div className="mt-4">
                <h3 className="mb-3 text-sm font-medium text-dark dark:text-white">Gallery</h3>
                <div className="grid grid-cols-4 gap-2">
                  {galleryImages.map((imageUrl, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden border border-stroke bg-gray-100 dark:border-dark-3 dark:bg-dark-2">
                      <Image
                        src={getImageUrl(imageUrl.trim()) || '/images/placeholder.png'}
                        alt={`${product.name} gallery ${index + 1}`}
                        width={100}
                        height={100}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-dark dark:text-white">{product.name}</h1>
                {product.is_featured && (
                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">
                    Featured
                  </span>
                )}
                {!product.is_active && (
                  <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800 dark:bg-red-800 dark:text-red-100">
                    Inactive
                  </span>
                )}
              </div>
              {product.short_description && (
                <p className="text-lg text-dark-4 dark:text-dark-6">{product.short_description}</p>
              )}
            </div>

            {product.price && (
              <div className="rounded-lg bg-primary/10 p-4">
                <p className="text-2xl font-bold text-primary">{formatPrice(product.price)}</p>
              </div>
            )}

            {product.description && (
              <div>
                <h3 className="mb-3 text-lg font-semibold text-dark dark:text-white">Description</h3>
                <p className="whitespace-pre-wrap text-dark-4 dark:text-dark-6">{product.description}</p>
              </div>
            )}

            {product.features && (
              <div>
                <h3 className="mb-3 text-lg font-semibold text-dark dark:text-white">Features</h3>
                <div className="space-y-2">
                  {product.features.split('\n').filter(feature => feature.trim()).map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <svg className="mt-1.5 h-2 w-2 flex-shrink-0 text-primary" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                      <span className="text-dark-4 dark:text-dark-6">{feature.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {product.specifications && (
              <div>
                <h3 className="mb-3 text-lg font-semibold text-dark dark:text-white">Specifications</h3>
                <p className="whitespace-pre-wrap text-dark-4 dark:text-dark-6">{product.specifications}</p>
              </div>
            )}

            {/* Product Meta */}
            <div className="space-y-3 border-t border-stroke pt-6 dark:border-dark-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {product.category && (
                  <div>
                    <span className="font-medium text-dark dark:text-white">Category:</span>
                    <span className="ml-2 text-dark-4 dark:text-dark-6">{product.category}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-dark dark:text-white">Order Position:</span>
                  <span className="ml-2 text-dark-4 dark:text-dark-6">{product.order_position}</span>
                </div>
                <div>
                  <span className="font-medium text-dark dark:text-white">Created:</span>
                  <span className="ml-2 text-dark-4 dark:text-dark-6">{formatDate(product.created_at)}</span>
                </div>
                {product.updated_at && (
                  <div>
                    <span className="font-medium text-dark dark:text-white">Updated:</span>
                    <span className="ml-2 text-dark-4 dark:text-dark-6">{formatDate(product.updated_at)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
