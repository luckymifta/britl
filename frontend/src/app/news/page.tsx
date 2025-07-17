import { Metadata } from "next";

export const metadata: Metadata = {
  title: "News & Announcements",
  description: "Manage news articles and announcements",
};

export default function NewsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-dark dark:text-white">
            News & Announcements
          </h1>
          <p className="text-sm text-dark-4 dark:text-dark-6">
            Manage news articles, blog posts, and company announcements
          </p>
        </div>
        <a
          href="/news/new"
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
          Write Article
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
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-dark dark:text-white mb-2">
          News & Announcements
        </h3>
        <p className="text-dark-4 dark:text-dark-6 mb-4">
          This feature is coming soon. You'll be able to manage all your content here.
        </p>
        <div className="space-y-2 text-sm text-dark-4 dark:text-dark-6">
          <p>• Write and edit articles</p>
          <p>• Rich text editor with media support</p>
          <p>• Schedule publication dates</p>
          <p>• Manage categories and tags</p>
          <p>• SEO optimization tools</p>
        </div>
      </div>
    </div>
  );
}
