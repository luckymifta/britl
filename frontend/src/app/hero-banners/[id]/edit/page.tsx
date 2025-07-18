import { Metadata } from "next";
import { EditBannerClient } from "./edit-banner-client";

interface EditHeroBannerPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Edit Hero Banner",
  description: "Edit hero banner details",
};

export default async function EditHeroBannerPage({ params }: EditHeroBannerPageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark dark:text-white">
          Edit Hero Banner
        </h1>
        <p className="text-dark-4 dark:text-dark-6">
          Update hero banner details and settings
        </p>
      </div>
      <EditBannerClient id={id} />
    </div>
  );
}
