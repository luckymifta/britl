import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacts Management",
  description: "Manage customer contacts and inquiries",
};

export default function ContactsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-dark dark:text-white">
            Contacts Management
          </h1>
          <p className="text-sm text-dark-4 dark:text-dark-6">
            Manage customer inquiries, messages, and contact information
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-dark transition-colors hover:bg-gray-1 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2">
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90">
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
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
              />
            </svg>
            Filter
          </button>
        </div>
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
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-dark dark:text-white mb-2">
          Contacts Management
        </h3>
        <p className="text-dark-4 dark:text-dark-6 mb-4">
          This feature is coming soon. You'll be able to manage all customer contacts here.
        </p>
        <div className="space-y-2 text-sm text-dark-4 dark:text-dark-6">
          <p>• View and respond to inquiries</p>
          <p>• Organize contacts by categories</p>
          <p>• Export contact lists</p>
          <p>• Track communication history</p>
          <p>• Set follow-up reminders</p>
        </div>
      </div>
    </div>
  );
}
