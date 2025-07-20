"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { NewsForm } from "../_components";

function CreateNewsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = (searchParams.get('type') as 'news' | 'announcements') || 'news';

  const handleSuccess = () => {
    router.push(`/admin/news?type=${type}`);
  };

  const handleCancel = () => {
    router.push(`/admin/news?type=${type}`);
  };

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Create {type === 'announcements' ? 'Announcement' : 'News Article'}
        </h2>
        <nav>
          <ol className="flex items-center gap-2">
            <li>
              <a className="font-medium" href="/admin">
                Dashboard /
              </a>
            </li>
            <li>
              <a className="font-medium" href="/admin/news">
                News & Announcements /
              </a>
            </li>
            <li className="font-medium text-primary">
              Create {type === 'announcements' ? 'Announcement' : 'News'}
            </li>
          </ol>
        </nav>
      </div>

      <NewsForm 
        type={type}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}

export default function CreateNewsPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    }>
      <CreateNewsPageContent />
    </Suspense>
  );
}
