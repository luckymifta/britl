import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="rounded-xl border border-stroke bg-white p-8 shadow-lg dark:border-dark-3 dark:bg-gray-dark">
        <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-red-100 flex items-center justify-center dark:bg-red-900">
          <svg
            className="h-12 w-12 text-red-600 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-dark dark:text-white mb-4">
          Hero Banner Not Found
        </h1>
        
        <p className="text-dark-4 dark:text-dark-6 mb-6">
          The hero banner you're looking for doesn't exist or may have been deleted.
        </p>
        
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/hero-banners"
            className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            Back to Hero Banners
          </Link>
          
          <Link
            href="/hero-banners/new"
            className="rounded-lg border border-stroke px-6 py-3 text-sm font-medium text-dark transition-colors hover:bg-gray-50 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
          >
            Create New Banner
          </Link>
        </div>
      </div>
    </div>
  );
}
