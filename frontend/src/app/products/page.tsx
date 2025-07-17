import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products Management",
  description: "Manage your product catalog",
};

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-dark dark:text-white">
            Products Management
          </h1>
          <p className="text-sm text-dark-4 dark:text-dark-6">
            Manage your product catalog and inventory
          </p>
        </div>
        <a
          href="/products/new"
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
          Add New Product
        </a>
      </div>

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
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-dark dark:text-white mb-2">
          Products Management
        </h3>
        <p className="text-dark-4 dark:text-dark-6 mb-4">
          This feature is coming soon. You'll be able to manage your entire product catalog here.
        </p>
        <div className="space-y-2 text-sm text-dark-4 dark:text-dark-6">
          <p>• Add, edit, and delete products</p>
          <p>• Manage product images and galleries</p>
          <p>• Set pricing and inventory levels</p>
          <p>• Organize products by categories</p>
          <p>• Track product performance</p>
        </div>
      </div>
    </div>
  );
}
