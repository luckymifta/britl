"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { getImageUrl, getPlaceholderImage } from "@/lib/utils/image";
import { heroBannerService, type HeroBanner, type HeroBannerCreate, type HeroBannerUpdate } from "@/lib/api/hero-banners";

interface HeroBannerFormProps {
  initialData?: HeroBanner;
  isEdit?: boolean;
}

export function HeroBannerForm({ initialData, isEdit = false }: HeroBannerFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    subtitle: initialData?.subtitle || "",
    description: initialData?.description || "",
    button_text: initialData?.button_text || "",
    button_link: initialData?.button_link || "",
    image_url: initialData?.image_url || "",
    is_active: initialData?.is_active ?? true,
    order_position: initialData?.order_position || 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          image_url: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEdit && initialData) {
        // Update existing banner
        if (imageFile) {
          await heroBannerService.updateHeroBannerImage(initialData.id, imageFile);
        }
        
        const updateData: HeroBannerUpdate = {
          title: formData.title,
          subtitle: formData.subtitle,
          description: formData.description,
          button_text: formData.button_text,
          button_link: formData.button_link,
          is_active: formData.is_active,
        };
        
        await heroBannerService.updateHeroBanner(initialData.id, updateData);
        showToast({
          type: "success",
          title: "Success",
          message: "Hero banner updated successfully!",
        });
      } else {
        // Create new banner
        if (imageFile) {
          await heroBannerService.createHeroBannerWithImage(formData, imageFile);
        } else {
          const createData: HeroBannerCreate = {
            title: formData.title,
            subtitle: formData.subtitle,
            description: formData.description,
            button_text: formData.button_text,
            button_link: formData.button_link,
            image_url: formData.image_url,
            is_active: formData.is_active,
            order_position: formData.order_position,
          };
          await heroBannerService.createHeroBanner(createData);
        }
        showToast({
          type: "success",
          title: "Success",
          message: "Hero banner created successfully!",
        });
      }
      
      router.push("/hero-banners");
    } catch (error) {
      console.error("Error saving banner:", error);
      showToast({
        type: "error",
        title: "Error",
        message: isEdit ? "Failed to update banner" : "Failed to create banner",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-stroke bg-white p-8 shadow-lg dark:border-dark-3 dark:bg-gray-dark">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="mb-2 block text-sm font-medium text-dark dark:text-white">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
            placeholder="Enter banner title"
          />
        </div>

        <div>
          <label htmlFor="subtitle" className="mb-2 block text-sm font-medium text-dark dark:text-white">
            Subtitle
          </label>
          <input
            type="text"
            id="subtitle"
            name="subtitle"
            value={formData.subtitle}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
            placeholder="Enter banner subtitle"
          />
        </div>

        <div>
          <label htmlFor="description" className="mb-2 block text-sm font-medium text-dark dark:text-white">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
            placeholder="Enter banner description"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="button_text" className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Button Text
            </label>
            <input
              type="text"
              id="button_text"
              name="button_text"
              value={formData.button_text}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
              placeholder="Learn More"
            />
          </div>

          <div>
            <label htmlFor="button_link" className="mb-2 block text-sm font-medium text-dark dark:text-white">
              Button Link
            </label>
            <input
              type="url"
              id="button_link"
              name="button_link"
              value={formData.button_link}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
              placeholder="https://example.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="background_image" className="mb-2 block text-sm font-medium text-dark dark:text-white">
            Background Image
          </label>
          <input
            type="file"
            id="background_image"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
          />
          {formData.image_url && (
            <div className="mt-3">
              <img
                src={getImageUrl(formData.image_url) || getPlaceholderImage()}
                alt="Banner preview"
                className="h-32 w-full rounded-lg object-cover"
              />
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="is_active"
            name="is_active"
            checked={formData.is_active}
            onChange={handleInputChange}
            className="h-5 w-5 rounded border border-stroke bg-transparent text-primary focus:ring-primary dark:border-dark-3 dark:bg-dark-2"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-dark dark:text-white">
            Active
          </label>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-center text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                {isEdit ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{isEdit ? "Update Banner" : "Create Banner"}</>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center rounded-lg border border-stroke bg-transparent px-6 py-3 text-center text-sm font-medium text-dark hover:bg-gray-1 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
