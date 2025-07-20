"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { NewsList, NewsStats } from "./_components";

function NewsPageContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('type') || 'dashboard');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Update URL without page reload
    const url = new URL(window.location.href);
    if (tab === 'dashboard') {
      url.searchParams.delete('type');
    } else {
      url.searchParams.set('type', tab);
    }
    window.history.pushState({}, '', url.toString());
  };

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          News & Announcements Management
        </h2>
        <nav>
          <ol className="flex items-center gap-2">
            <li>
              <a className="font-medium" href="/admin">
                Dashboard /
              </a>
            </li>
            <li className="font-medium text-primary">
              News & Announcements
            </li>
          </ol>
        </nav>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-stroke dark:border-strokedark">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => handleTabChange('dashboard')}
              className={`whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium ${
                activeTab === 'dashboard'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => handleTabChange('news')}
              className={`whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium ${
                activeTab === 'news'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              News Articles
            </button>
            <button
              onClick={() => handleTabChange('announcements')}
              className={`whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium ${
                activeTab === 'announcements'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Announcements
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'dashboard' && <NewsStats />}
        {activeTab === 'news' && <NewsList type="news" />}
        {activeTab === 'announcements' && <NewsList type="announcements" />}
      </div>
    </div>
  );
}

export default function NewsPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    }>
      <NewsPageContent />
    </Suspense>
  );
}
