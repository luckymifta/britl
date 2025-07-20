"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { newsAPI } from "@/lib/api/news";
import type { NewsArticle, Announcement } from "@/lib/api/news";
import { NewsForm } from "../../_components";

export default function EditNewsPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string);
  
  const [article, setArticle] = useState<NewsArticle | Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadArticle();
  }, [id]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await newsAPI.getNewsById(id);
      setArticle(data);
    } catch (error: any) {
      console.error('Error loading article:', error);
      setError(error.message || 'Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    // Determine type from article data (announcements have priority field)
    const type = article && 'priority' in article ? 'announcements' : 'news';
    router.push(`/admin/news?type=${type}`);
  };

  const handleCancel = () => {
    // Determine type from article data
    const type = article && 'priority' in article ? 'announcements' : 'news';
    router.push(`/admin/news?type=${type}`);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <div className="text-sm text-red-700">{error || 'Article not found'}</div>
          <button 
            onClick={() => router.push('/admin/news')}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Back to News
          </button>
        </div>
      </div>
    );
  }

  // Determine type from article data
  const type = 'priority' in article ? 'announcements' : 'news';

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Edit {type === 'announcements' ? 'Announcement' : 'News Article'}
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
              Edit {type === 'announcements' ? 'Announcement' : 'News'}
            </li>
          </ol>
        </nav>
      </div>

      <NewsForm 
        type={type}
        article={article}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}
