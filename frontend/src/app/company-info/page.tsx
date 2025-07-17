import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Company Information",
  description: "Manage company information and settings",
};

export default function CompanyInfoPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-dark dark:text-white">
          Company Information
        </h1>
        <p className="text-sm text-dark-4 dark:text-dark-6">
          Manage your company details, contact information, and business settings
        </p>
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
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-dark dark:text-white mb-2">
          Company Information Management
        </h3>
        <p className="text-dark-4 dark:text-dark-6 mb-4">
          This feature is coming soon. You'll be able to manage your company information here.
        </p>
        <div className="space-y-2 text-sm text-dark-4 dark:text-dark-6">
          <p>• Company name and description</p>
          <p>• Contact information and addresses</p>
          <p>• Business hours and locations</p>
          <p>• Social media links</p>
          <p>• Logo and brand assets</p>
        </div>
      </div>
    </div>
  );
}
