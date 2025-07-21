'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface NewsItem {
  id: number;
  title: string;
  excerpt: string | null;
  content: string;
  author: string | null;
  category: string | null;
  tags: string | null;
  featured_image_url: string | null;
  attachments: string | null;
  is_published: boolean;
  is_featured: boolean;
  published_at: string | null;
  slug: string;
  views_count: number;
  created_at: string;
  updated_at: string | null;
}

export default function News() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/public/news');
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        const data: NewsItem[] = await response.json();
        setNews(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCategory = (category: string | null): string => {
    if (!category) return '';
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const truncateContent = (content: string, maxLength: number = 150): string => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-red-600 text-lg">Error loading news: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="news" className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              <span className="text-gray-900">News &</span> <span className="text-[#0A4E84]">Announcements</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-blue-400 mx-auto mb-8"></div>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Stay updated with our latest news, announcements, and company developments.
            </p>
          </div>

          {/* News Grid */}
          {news.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No News Available</h3>
                <p className="text-gray-600">We&apos;re working on publishing new content. Please check back soon!</p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 mb-20">
              {news.map((newsItem) => (
                <div
                  key={newsItem.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 flex flex-col h-full"
                >
                  {/* News Image */}
                  <div className="relative h-48 overflow-hidden rounded-xl mb-6">
                    {newsItem.featured_image_url ? (
                      <Image
                        src={`http://localhost:8000${newsItem.featured_image_url}`}
                        alt={newsItem.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                    
                    {/* Featured Badge */}
                    {newsItem.is_featured && (
                      <div className="absolute top-3 left-3">
                        <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold">
                          Featured
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* News Content */}
                  <div className="text-center flex-1 flex flex-col">
                    {/* News Title and Category */}
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {newsItem.title}
                      </h3>
                      
                      {/* Category Badge - Always reserve space */}
                      <div className="h-7 flex justify-center items-center">
                        {newsItem.category ? (
                          <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {formatCategory(newsItem.category)}
                          </span>
                        ) : (
                          <div className="h-7"></div>
                        )}
                      </div>
                    </div>

                    {/* News Excerpt/Content */}
                    <p className="text-gray-700 leading-relaxed mb-6">
                      {newsItem.excerpt || truncateContent(newsItem.content)}
                    </p>

                    {/* Author and Date */}
                    <div className="text-sm text-gray-500 mb-6">
                      {newsItem.author && (
                        <p className="mb-1">By {newsItem.author}</p>
                      )}
                      <p>{formatDate(newsItem.published_at || newsItem.created_at)}</p>
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto">
                      <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm">
                        Read More
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
