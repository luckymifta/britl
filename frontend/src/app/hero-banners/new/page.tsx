import { Metadata } from "next";
import { HeroBannerForm } from "../_components";

export const metadata: Metadata = {
  title: "Add New Hero Banner",
  description: "Create a new hero banner for your website",
};

export default function NewHeroBannerPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark dark:text-white">
          Add New Hero Banner
        </h1>
        <p className="text-dark-4 dark:text-dark-6">
          Create a new hero banner to showcase on your website
        </p>
      </div>
      <HeroBannerForm />
    </div>
  );
}
