"use client";

import { useEffect, useState } from "react";
import { HeroBannerForm } from "../../_components";
import { notFound } from "next/navigation";
import { heroBannerService, type HeroBanner } from "@/lib/api/hero-banners";

interface EditBannerClientProps {
  id: string;
}

export function EditBannerClient({ id }: EditBannerClientProps) {
  const [banner, setBanner] = useState<HeroBanner | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getBannerData = async () => {
      try {
        setIsLoading(true);
        const bannerData = await heroBannerService.getHeroBanner(parseInt(id));
        setBanner(bannerData);
      } catch (error) {
        console.error('Error loading banner:', error);
        // If banner not found, show 404
        notFound();
      } finally {
        setIsLoading(false);
      }
    };

    getBannerData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-stroke bg-white p-8 text-center shadow-lg dark:border-dark-3 dark:bg-gray-dark">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center dark:bg-dark-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <h3 className="text-lg font-semibold text-dark dark:text-white mb-2">
          Loading Banner...
        </h3>
        <p className="text-dark-4 dark:text-dark-6">
          Please wait while we fetch the banner details.
        </p>
      </div>
    );
  }

  if (!banner) {
    notFound();
    return null;
  }

  return (
    <HeroBannerForm
      initialData={banner}
      isEdit={true}
    />
  );
}