import Link from "next/link";

export function HeroBannerHeader() {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-dark dark:text-white">
          Hero Banners
        </h1>
        <p className="text-sm text-dark-4 dark:text-dark-6">
          Manage your website's hero banners and promotional content
        </p>
      </div>
      <Link
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
      </Link>
    </div>
  );
}
