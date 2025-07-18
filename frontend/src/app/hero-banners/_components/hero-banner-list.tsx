"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getImageUrl, getPlaceholderImage } from "@/lib/utils/image";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useToast } from "@/components/ui/toast";
import { heroBannerService, type HeroBanner } from "@/lib/api/hero-banners";

export function HeroBannerList() {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [isLoading, setIsLoading] = useState<Record<number, boolean>>({});
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; banner: HeroBanner | null }>({
    isOpen: false,
    banner: null
  });

  // Load hero banners from API
  useEffect(() => {
    const loadBanners = async () => {
      try {
        setIsInitialLoading(true);
        const data = await heroBannerService.getHeroBanners();
        setBanners(data);
      } catch (error) {
        console.error('Error loading banners:', error);
        showToast({
          title: "Error",
          message: "Failed to load hero banners. Please try again.",
          type: "error",
          duration: 5000
        });
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadBanners();
  }, [showToast]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: number) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetId: number) => {
    e.preventDefault();
    if (draggedItem && draggedItem !== targetId) {
      try {
        // Optimistically update the UI
        const draggedBanner = banners.find(b => b.id === draggedItem);
        const targetBanner = banners.find(b => b.id === targetId);
        
        if (draggedBanner && targetBanner) {
          const newBanners = [...banners];
          const draggedIndex = newBanners.findIndex(b => b.id === draggedItem);
          const targetIndex = newBanners.findIndex(b => b.id === targetId);
          
          // Swap positions
          newBanners[draggedIndex] = { ...draggedBanner, order_position: targetBanner.order_position };
          newBanners[targetIndex] = { ...targetBanner, order_position: draggedBanner.order_position };
          
          // Sort by order position
          newBanners.sort((a, b) => a.order_position - b.order_position);
          setBanners(newBanners);
          
          // Update order on the server
          const orderedIds = newBanners.map(b => b.id);
          await heroBannerService.reorderBanners(orderedIds);
          
          showToast({
            title: "Order Updated",
            message: "Banner order has been updated successfully.",
            type: "success",
            duration: 3000
          });
        }
      } catch (error) {
        console.error("Error reordering banners:", error);
        // Revert optimistic update on error
        const data = await heroBannerService.getHeroBanners();
        setBanners(data);
        
        showToast({
          title: "Error",
          message: "Failed to update banner order. Please try again.",
          type: "error",
          duration: 5000
        });
      }
    }
    setDraggedItem(null);
  };

  const toggleActive = useCallback(async (id: number) => {
    setIsLoading(prev => ({ ...prev, [id]: true }));
    
    try {
      const banner = banners.find(b => b.id === id);
      if (!banner) return;
      
      const newStatus = !banner.is_active;
      
      // Optimistically update the UI
      setBanners(prev => prev.map(banner => 
        banner.id === id 
          ? { ...banner, is_active: newStatus, updated_at: new Date().toISOString() }
          : banner
      ));
      
      // Update on the server
      await heroBannerService.updateHeroBanner(id, { is_active: newStatus });
      
      // Show success toast
      showToast({
        title: "Banner Updated",
        message: `Banner has been ${newStatus ? 'activated' : 'deactivated'} successfully.`,
        type: "success",
        duration: 3000
      });
      
    } catch (error) {
      // Revert the optimistic update on error
      setBanners(prev => prev.map(banner => 
        banner.id === id 
          ? { ...banner, is_active: !banner.is_active }
          : banner
      ));
      console.error("Error toggling banner status:", error);
      
      // Show error toast
      showToast({
        title: "Error",
        message: "Failed to update banner status. Please try again.",
        type: "error",
        duration: 5000
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [id]: false }));
    }
  }, [banners, showToast]);

  const deleteBanner = useCallback(async (id: number) => {
    const banner = banners.find(b => b.id === id);
    if (!banner) return;
    
    setDeleteDialog({ isOpen: true, banner });
  }, [banners]);

  const confirmDelete = useCallback(async () => {
    const banner = deleteDialog.banner;
    if (!banner) return;
    
    setIsLoading(prev => ({ ...prev, [banner.id]: true }));
    setDeleteDialog({ isOpen: false, banner: null });
    
    try {
      // Optimistically remove from UI
      setBanners(prev => prev.filter(b => b.id !== banner.id));
      
      // Delete on the server
      await heroBannerService.deleteHeroBanner(banner.id);
      
      // Show success toast
      showToast({
        title: "Banner Deleted",
        message: `"${banner.title}" has been successfully deleted.`,
        type: "success",
        duration: 3000
      });
      
    } catch (error) {
      // Add the banner back on error
      setBanners(prev => [...prev, banner].sort((a, b) => a.order_position - b.order_position));
      console.error("Error deleting banner:", error);
      
      // Show error toast
      showToast({
        title: "Error",
        message: "Failed to delete banner. Please try again.",
        type: "error",
        duration: 5000
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [banner.id]: false }));
    }
  }, [deleteDialog.banner, showToast]);

  const handleEdit = (id: number) => {
    router.push(`/hero-banners/${id}/edit`);
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
      {isInitialLoading ? (
        <div className="rounded-xl border border-stroke bg-white p-8 text-center shadow-lg dark:border-dark-3 dark:bg-gray-dark">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center dark:bg-dark-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
          <h3 className="text-lg font-semibold text-dark dark:text-white mb-2">
            Loading Hero Banners...
          </h3>
          <p className="text-dark-4 dark:text-dark-6">
            Please wait while we fetch the latest banners.
          </p>
        </div>
      ) : banners.length === 0 ? (
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
                        src={getImageUrl(banner.image_url) || getPlaceholderImage()}
                        alt={banner.title}
                        fill
                        className="object-cover"
                        unoptimized
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
                        disabled={isLoading[banner.id]}
                        className={cn(
                          "rounded-lg px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50",
                          banner.is_active
                            ? "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            : "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
                        )}
                      >
                        {isLoading[banner.id] 
                          ? "..." 
                          : (banner.is_active ? "Deactivate" : "Activate")
                        }
                      </button>
                      
                      <button
                        onClick={() => handleEdit(banner.id)}
                        className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 transition-colors hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                      >
                        Edit
                      </button>
                      
                      <button
                        onClick={() => deleteBanner(banner.id)}
                        disabled={isLoading[banner.id]}
                        className="rounded-lg bg-red-100 px-3 py-1 text-xs font-medium text-red-800 transition-colors hover:bg-red-200 disabled:opacity-50 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                      >
                        {isLoading[banner.id] ? "..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Hero Banner"
        message={`Are you sure you want to delete "${deleteDialog.banner?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, banner: null })}
      />
    </div>
  );
}
