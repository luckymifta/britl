"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface HeroBanner {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  button_text?: string;
  button_link?: string;
  image_url?: string;
  is_active: boolean;
  order_position: number;
  created_at: string;
  updated_at?: string;
}

export function HeroBannerList() {
  // Mock data - replace with actual API call
  const [banners] = useState<HeroBanner[]>([
    {
      id: 1,
      title: "Welcome to Our Platform",
      subtitle: "Experience Excellence",
      description: "Discover amazing features and services that will transform your business.",
      button_text: "Get Started",
      button_link: "/get-started",
      image_url: "/images/best-value-banner.png",
      is_active: true,
      order_position: 1,
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-16T14:30:00Z",
    },
    {
      id: 2,
      title: "Amazing Features",
      subtitle: "Discover Innovation",
      description: "Explore our cutting-edge technology and innovative solutions.",
      button_text: "Learn More",
      button_link: "/features",
      image_url: undefined,
      is_active: true,
      order_position: 2,
      created_at: "2024-01-14T09:00:00Z",
    },
    {
      id: 3,
      title: "Summer Sale 2024",
      subtitle: "Limited Time Offer",
      description: "Don't miss out on our biggest sale of the year with up to 50% off.",
      button_text: "Shop Now",
      button_link: "/sale",
      image_url: "/images/best-value-banner.png",
      is_active: false,
      order_position: 3,
      created_at: "2024-01-13T08:00:00Z",
    },
  ]);

  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: number) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: number) => {
    e.preventDefault();
    if (draggedItem && draggedItem !== targetId) {
      // Handle reordering logic here
      console.log(`Moving item ${draggedItem} to position of ${targetId}`);
    }
    setDraggedItem(null);
  };

  const toggleActive = (id: number) => {
    // Handle toggle active status
    console.log(`Toggle active status for banner ${id}`);
  };

  const deleteBanner = (id: number) => {
    if (confirm("Are you sure you want to delete this banner?")) {
      // Handle delete
      console.log(`Delete banner ${id}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      {banners.length === 0 ? (
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
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-dark dark:text-white mb-2">
            No Hero Banners Yet
          </h3>
          <p className="text-dark-4 dark:text-dark-6 mb-4">
            Create your first hero banner to showcase on your website
          </p>
          <a
            href="/hero-banners/new"
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
            Add New Banner
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {banners.map((banner) => (
            <div
              key={banner.id}
              draggable
              onDragStart={(e) => handleDragStart(e, banner.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, banner.id)}
              className={cn(
                "rounded-xl border border-stroke bg-white p-6 shadow-lg transition-all hover:shadow-xl dark:border-dark-3 dark:bg-gray-dark dark:shadow-card cursor-move",
                draggedItem === banner.id && "opacity-50"
              )}
            >
              <div className="flex items-start gap-6">
                {/* Drag Handle */}
                <div className="mt-2 cursor-move">
                  <svg
                    className="h-5 w-5 text-dark-4 dark:text-dark-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8h16M4 16h16"
                    />
                  </svg>
                </div>

                {/* Banner Image */}
                <div className="flex-shrink-0">
                  {banner.image_url ? (
                    <div className="relative h-20 w-32 overflow-hidden rounded-lg">
                      <Image
                        src={banner.image_url}
                        alt={banner.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-20 w-32 items-center justify-center rounded-lg bg-gray-100 dark:bg-dark-2">
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
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Banner Content */}
                <div className="flex-1">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-dark dark:text-white">
                        {banner.title}
                      </h3>
                      {banner.subtitle && (
                        <p className="text-sm font-medium text-dark-4 dark:text-dark-6">
                          {banner.subtitle}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2 py-1 text-xs font-medium",
                          banner.is_active
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        )}
                      >
                        {banner.is_active ? "Active" : "Inactive"}
                      </span>
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        #{banner.order_position}
                      </span>
                    </div>
                  </div>
                  
                  {banner.description && (
                    <p className="text-sm text-dark-4 dark:text-dark-6 mb-3 line-clamp-2">
                      {banner.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-dark-4 dark:text-dark-6">
                      <span>Created: {formatDate(banner.created_at)}</span>
                      {banner.updated_at && (
                        <span>Updated: {formatDate(banner.updated_at)}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleActive(banner.id)}
                        className={cn(
                          "rounded-lg px-3 py-1 text-xs font-medium transition-colors",
                          banner.is_active
                            ? "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            : "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
                        )}
                      >
                        {banner.is_active ? "Deactivate" : "Activate"}
                      </button>
                      
                      <a
                        href={`/hero-banners/${banner.id}/edit`}
                        className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 transition-colors hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                      >
                        Edit
                      </a>
                      
                      <button
                        onClick={() => deleteBanner(banner.id)}
                        className="rounded-lg bg-red-100 px-3 py-1 text-xs font-medium text-red-800 transition-colors hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
