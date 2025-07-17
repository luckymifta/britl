import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team Management",
  description: "Manage your team members",
};

export default function TeamPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-dark dark:text-white">
            Team Management
          </h1>
          <p className="text-sm text-dark-4 dark:text-dark-6">
            Manage your team members and staff profiles
          </p>
        </div>
        <a
          href="/team/new"
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
          Add Team Member
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-dark dark:text-white mb-2">
          Team Management
        </h3>
        <p className="text-dark-4 dark:text-dark-6 mb-4">
          This feature is coming soon. You'll be able to manage your team members here.
        </p>
        <div className="space-y-2 text-sm text-dark-4 dark:text-dark-6">
          <p>• Add and edit team member profiles</p>
          <p>• Upload team member photos</p>
          <p>• Set roles and responsibilities</p>
          <p>• Manage contact information</p>
          <p>• Display team on website</p>
        </div>
      </div>
    </div>
  );
}
