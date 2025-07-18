'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { CompanyApi, Company, CompanyFormData } from '@/lib/api/company';

interface CompanyFormProps {
  company?: Company | null;
  onSuccess?: (company: Company) => void;
}

export default function CompanyForm({ company, onSuccess }: CompanyFormProps) {
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    description: '',
    mission: '',
    vision: '',
    values: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    founded_year: '',
  });
  
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [aboutImagePreview, setAboutImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        description: company.description || '',
        mission: company.mission || '',
        vision: company.vision || '',
        values: company.values || '',
        address: company.address || '',
        phone: company.phone || '',
        email: company.email || '',
        website: company.website || '',
        founded_year: company.founded_year || '',
      });
      setLogoPreview(company.logo_url || null);
      setAboutImagePreview(company.about_image_url || null);
    }
  }, [company]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'about_image') => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        [type]: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'logo') {
          setLogoPreview(reader.result as string);
        } else {
          setAboutImagePreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await CompanyApi.createOrUpdateCompanyWithImages(formData);
      toast.success(company ? 'Company information updated successfully!' : 'Company information created successfully!');
      onSuccess?.(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteImage = async (type: 'logo' | 'about_image') => {
    if (!company) return;

    try {
      if (type === 'logo') {
        await CompanyApi.deleteCompanyLogo();
        setLogoPreview(null);
        setFormData(prev => ({ ...prev, logo: undefined }));
      } else {
        await CompanyApi.deleteCompanyAboutImage();
        setAboutImagePreview(null);
        setFormData(prev => ({ ...prev, about_image: undefined }));
      }
      toast.success(`${type === 'logo' ? 'Logo' : 'About image'} deleted successfully!`);
      
      // Refresh company data
      const updatedCompany = await CompanyApi.getCompanyInfo();
      onSuccess?.(updatedCompany);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete image');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="rounded-lg border border-stroke bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-gray-dark">
        <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Company Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark focus:border-primary focus:outline-none dark:border-dark-3 dark:text-white dark:focus:border-primary"
              placeholder="Enter company name"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Founded Year
            </label>
            <input
              type="number"
              name="founded_year"
              value={formData.founded_year}
              onChange={handleInputChange}
              min="1800"
              max={new Date().getFullYear()}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark focus:border-primary focus:outline-none dark:border-dark-3 dark:text-white dark:focus:border-primary"
              placeholder="e.g., 2020"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark focus:border-primary focus:outline-none dark:border-dark-3 dark:text-white dark:focus:border-primary"
            placeholder="Brief description of your company"
          />
        </div>
      </div>

      {/* Mission, Vision, Values */}
      <div className="rounded-lg border border-stroke bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-gray-dark">
        <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
          Mission, Vision & Values
        </h3>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Mission Statement
            </label>
            <textarea
              name="mission"
              value={formData.mission}
              onChange={handleInputChange}
              rows={3}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark focus:border-primary focus:outline-none dark:border-dark-3 dark:text-white dark:focus:border-primary"
              placeholder="What is your company's mission?"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Vision Statement
            </label>
            <textarea
              name="vision"
              value={formData.vision}
              onChange={handleInputChange}
              rows={3}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark focus:border-primary focus:outline-none dark:border-dark-3 dark:text-white dark:focus:border-primary"
              placeholder="What is your company's vision for the future?"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Core Values
            </label>
            <textarea
              name="values"
              value={formData.values}
              onChange={handleInputChange}
              rows={3}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark focus:border-primary focus:outline-none dark:border-dark-3 dark:text-white dark:focus:border-primary"
              placeholder="What are your company's core values?"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="rounded-lg border border-stroke bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-gray-dark">
        <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark focus:border-primary focus:outline-none dark:border-dark-3 dark:text-white dark:focus:border-primary"
              placeholder="contact@company.com"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark focus:border-primary focus:outline-none dark:border-dark-3 dark:text-white dark:focus:border-primary"
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
            Website
          </label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark focus:border-primary focus:outline-none dark:border-dark-3 dark:text-white dark:focus:border-primary"
            placeholder="https://www.company.com"
          />
        </div>
        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
            Address
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            rows={3}
            className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark focus:border-primary focus:outline-none dark:border-dark-3 dark:text-white dark:focus:border-primary"
            placeholder="Company address"
          />
        </div>
      </div>

      {/* Images */}
      <div className="rounded-lg border border-stroke bg-white p-6 shadow-sm dark:border-dark-3 dark:bg-gray-dark">
        <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
          Images
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Logo Upload */}
          <div>
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Company Logo
            </label>
            <div className="space-y-3">
              {logoPreview && (
                <div className="relative">
                  <Image
                    src={logoPreview}
                    alt="Logo preview"
                    width={200}
                    height={200}
                    className="rounded-lg border border-stroke object-cover dark:border-dark-3"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage('logo')}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'logo')}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark focus:border-primary focus:outline-none dark:border-dark-3 dark:text-white dark:focus:border-primary"
              />
              <p className="text-xs text-gray-500">Max file size: 5MB. Formats: JPG, PNG, GIF, WebP</p>
            </div>
          </div>

          {/* About Image Upload */}
          <div>
            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
              About Us Image
            </label>
            <div className="space-y-3">
              {aboutImagePreview && (
                <div className="relative">
                  <Image
                    src={aboutImagePreview}
                    alt="About image preview"
                    width={200}
                    height={200}
                    className="rounded-lg border border-stroke object-cover dark:border-dark-3"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage('about_image')}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'about_image')}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark focus:border-primary focus:outline-none dark:border-dark-3 dark:text-white dark:focus:border-primary"
              />
              <p className="text-xs text-gray-500">Max file size: 5MB. Formats: JPG, PNG, GIF, WebP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading || !formData.name.trim()}
          className="rounded-lg bg-primary px-8 py-3 text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : company ? 'Update Company Information' : 'Create Company Information'}
        </button>
      </div>
    </form>
  );
}
