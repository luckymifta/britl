'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { servicesAPI, Service, parseServiceFeatures } from '@/lib/api/services';

interface ServiceFormProps {
  service?: Service | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function ServiceForm({ service, onSave, onCancel }: ServiceFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    short_description: '',
    description: '',
    price: '',
    duration: '',
    features: [] as string[],
    is_active: true,
    is_featured: false,
  });

  const [featureInput, setFeatureInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!service;

  useEffect(() => {
    if (service) {
      const features = parseServiceFeatures(service.features);

      setFormData({
        name: service.name || '',
        category: service.category || '',
        short_description: service.short_description || '',
        description: service.description || '',
        price: service.price?.toString() || '',
        duration: service.duration || '',
        features: features,
        is_active: service.is_active,
        is_featured: service.is_featured,
      });
      if (service.image_url) {
        setImagePreview(servicesAPI.getImageUrl(service.image_url));
      }
    }
  }, [service]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addFeature = () => {
    if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Service name is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.short_description.trim()) newErrors.short_description = 'Short description is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.price && isNaN(parseFloat(formData.price))) newErrors.price = 'Price must be a valid number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('category', formData.category.trim());
      formDataToSend.append('short_description', formData.short_description.trim());
      formDataToSend.append('description', formData.description.trim());
      if (formData.price) formDataToSend.append('price', formData.price);
      if (formData.duration.trim()) formDataToSend.append('duration', formData.duration.trim());
      formDataToSend.append('features', JSON.stringify(formData.features));
      formDataToSend.append('is_active', formData.is_active.toString());
      formDataToSend.append('is_featured', formData.is_featured.toString());
      if (imageFile) formDataToSend.append('image', imageFile);

      if (isEditing && service) {
        await servicesAPI.updateService(service.id, formDataToSend);
      } else {
        await servicesAPI.createServiceWithImage(formDataToSend);
      }
      onSave();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[95vh] w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-dark">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stroke bg-white px-8 py-6 dark:border-dark-3 dark:bg-gray-dark">
          <div>
            <h2 className="text-2xl font-bold text-dark dark:text-white">
              {isEditing ? 'Edit Service' : 'Create New Service'}
            </h2>
            <p className="mt-1 text-sm text-dark-4 dark:text-dark-6">
              Professional service management made simple
            </p>
          </div>
          <button
            onClick={onCancel}
            className="rounded-full p-2 text-dark-4 transition-colors hover:bg-gray-100 hover:text-dark dark:text-dark-6 dark:hover:bg-dark-2 dark:hover:text-white"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(95vh-180px)] overflow-y-auto px-8 py-8">
          <div className="space-y-8">
            
            {/* Service Image Section */}
            <div className="rounded-xl border border-stroke bg-gradient-to-br from-gray-50 to-white p-8 dark:border-dark-3 dark:from-dark-2 dark:to-gray-dark">
              <div className="mb-6 text-center">
                <h3 className="text-xl font-semibold text-dark dark:text-white">Service Image</h3>
                <p className="mt-2 text-sm text-dark-4 dark:text-dark-6">Upload a professional image to showcase your service</p>
              </div>
              
              <div className="flex flex-col items-center space-y-6">
                {imagePreview && (
                  <div className="relative h-64 w-full max-w-lg overflow-hidden rounded-xl border-2 border-stroke shadow-lg dark:border-dark-3">
                    <Image src={imagePreview} alt="Service preview" fill className="object-cover" />
                  </div>
                )}
                
                <label className="cursor-pointer group">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  <div className="rounded-xl border-2 border-dashed border-stroke bg-white px-8 py-6 text-center transition-all group-hover:border-primary group-hover:bg-primary/5 dark:border-dark-3 dark:bg-gray-dark dark:group-hover:border-primary">
                    <svg className="mx-auto h-12 w-12 text-dark-4 group-hover:text-primary dark:text-dark-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mt-3 text-base font-medium text-dark group-hover:text-primary dark:text-white">Click to upload image</p>
                    <p className="mt-1 text-sm text-dark-4 dark:text-dark-6">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Basic Information */}
            <div className="rounded-xl border border-stroke bg-gradient-to-br from-gray-50 to-white p-8 dark:border-dark-3 dark:from-dark-2 dark:to-gray-dark">
              <h3 className="mb-6 text-xl font-semibold text-dark dark:text-white">Basic Information</h3>
              <div className="grid gap-6 lg:grid-cols-2">
                
                <div>
                  <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                    Service Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border-2 px-4 py-3 text-dark transition-colors focus:border-primary focus:outline-none dark:bg-dark-2 dark:text-white ${errors.name ? 'border-red-500' : 'border-stroke dark:border-dark-3'}`}
                    placeholder="Enter a compelling service name"
                  />
                  {errors.name && <p className="mt-2 text-sm text-red-500">{errors.name}</p>}
                </div>
                
                <div>
                  <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border-2 px-4 py-3 text-dark transition-colors focus:border-primary focus:outline-none dark:bg-dark-2 dark:text-white ${errors.category ? 'border-red-500' : 'border-stroke dark:border-dark-3'}`}
                  >
                    <option value="">Select a category</option>
                    <option value="Mobile Banking">Mobile Banking</option>
                    <option value="Transaction">Transaction</option>
                    <option value="Cash Pickup">Cash Pickup</option>
                  </select>
                  {errors.category && <p className="mt-2 text-sm text-red-500">{errors.category}</p>}
                </div>
                
                <div>
                  <label className="mb-3 block text-sm font-medium text-dark dark:text-white">Price (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-primary">$</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className={`w-full rounded-lg border-2 pl-8 pr-4 py-3 text-dark transition-colors focus:border-primary focus:outline-none dark:bg-dark-2 dark:text-white ${errors.price ? 'border-red-500' : 'border-stroke dark:border-dark-3'}`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.price && <p className="mt-2 text-sm text-red-500">{errors.price}</p>}
                </div>
                
                <div>
                  <label className="mb-3 block text-sm font-medium text-dark dark:text-white">Estimated Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-2 border-stroke px-4 py-3 text-dark transition-colors focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                    placeholder="e.g., 2-3 weeks, 1 month"
                  />
                </div>
                
              </div>
            </div>

            {/* Service Description */}
            <div className="rounded-xl border border-stroke bg-gradient-to-br from-gray-50 to-white p-8 dark:border-dark-3 dark:from-dark-2 dark:to-gray-dark">
              <h3 className="mb-6 text-xl font-semibold text-dark dark:text-white">Service Description</h3>
              <div className="space-y-6">
                
                <div>
                  <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                    Short Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleInputChange}
                    rows={3}
                    maxLength={150}
                    className={`w-full rounded-lg border-2 px-4 py-3 text-dark transition-colors focus:border-primary focus:outline-none dark:bg-dark-2 dark:text-white ${errors.short_description ? 'border-red-500' : 'border-stroke dark:border-dark-3'}`}
                    placeholder="A brief, compelling description that will appear in service listings"
                  />
                  <div className="mt-2 flex justify-between">
                    {errors.short_description && <p className="text-sm text-red-500">{errors.short_description}</p>}
                    <p className="text-xs text-dark-4 dark:text-dark-6 ml-auto">
                      {formData.short_description.length}/150 characters
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
                    Detailed Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={8}
                    className={`w-full rounded-lg border-2 px-4 py-3 text-dark transition-colors focus:border-primary focus:outline-none dark:bg-dark-2 dark:text-white ${errors.description ? 'border-red-500' : 'border-stroke dark:border-dark-3'}`}
                    placeholder="Provide a comprehensive description of your service, including what's included, the process, deliverables, and benefits to the client."
                  />
                  {errors.description && <p className="mt-2 text-sm text-red-500">{errors.description}</p>}
                </div>
                
              </div>
            </div>

            {/* Service Features */}
            <div className="rounded-xl border border-stroke bg-gradient-to-br from-gray-50 to-white p-8 dark:border-dark-3 dark:from-dark-2 dark:to-gray-dark">
              <h3 className="mb-6 text-xl font-semibold text-dark dark:text-white">Service Features</h3>
              <div className="space-y-6">
                
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    className="flex-1 rounded-lg border-2 border-stroke px-4 py-3 text-dark transition-colors focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                    placeholder="Add a feature (e.g., 24/7 Support, Free Revisions)"
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="rounded-lg bg-primary px-8 py-3 font-medium text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    Add
                  </button>
                </div>
                
                {formData.features.length > 0 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center justify-between rounded-lg border-2 border-stroke bg-white px-4 py-3 shadow-sm transition-colors hover:border-primary/50 dark:border-dark-3 dark:bg-gray-dark">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                          <span className="font-medium text-dark dark:text-white">{feature}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="rounded-full p-1 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
              </div>
            </div>

            {/* Service Settings */}
            <div className="rounded-xl border border-stroke bg-gradient-to-br from-gray-50 to-white p-8 dark:border-dark-3 dark:from-dark-2 dark:to-gray-dark">
              <h3 className="mb-6 text-xl font-semibold text-dark dark:text-white">Service Settings</h3>
              <div className="grid gap-6 sm:grid-cols-2">
                
                <label className="group flex cursor-pointer items-center gap-4 rounded-xl border-2 border-stroke bg-white p-6 transition-all hover:border-primary hover:bg-primary/5 dark:border-dark-3 dark:bg-gray-dark dark:hover:border-primary">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <div>
                    <div className="text-lg font-semibold text-dark group-hover:text-primary dark:text-white">Active Service</div>
                    <div className="text-sm text-dark-4 dark:text-dark-6">Service is available for clients to purchase</div>
                  </div>
                </label>
                
                <label className="group flex cursor-pointer items-center gap-4 rounded-xl border-2 border-stroke bg-white p-6 transition-all hover:border-primary hover:bg-primary/5 dark:border-dark-3 dark:bg-gray-dark dark:hover:border-primary">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <div>
                    <div className="text-lg font-semibold text-dark group-hover:text-primary dark:text-white">Featured Service</div>
                    <div className="text-sm text-dark-4 dark:text-dark-6">Highlight this service in featured sections</div>
                  </div>
                </label>
                
              </div>
            </div>
            
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-stroke bg-white px-8 py-6 dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="rounded-lg border-2 border-stroke px-8 py-3 font-medium text-dark transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-lg bg-primary px-8 py-3 font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                isEditing ? 'Update Service' : 'Create Service'
              )}
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
