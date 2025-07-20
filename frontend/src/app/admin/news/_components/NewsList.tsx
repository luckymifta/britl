"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { newsAPI, CATEGORIES, PRIORITIES } from "@/lib/api/news";
import type { NewsArticle, Announcement, NewsFilters, AnnouncementFilters } from "@/lib/api/news";

interface NewsListProps {
  type: 'news' | 'announcements';
}

// Custom components
const Button = ({ 
  children, 
  onClick, 
  variant = 'default', 
  size = 'default', 
  className = '',
  disabled = false,
  href
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  disabled?: boolean;
  href?: string;
}) => {
  const baseStyles = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const variants = {
    default: 'bg-primary text-white hover:bg-primary/90 font-bold shadow-lg',
    outline: 'border-2 border-primary bg-primary/10 text-primary hover:bg-primary hover:text-white font-semibold',
    secondary: 'bg-secondary text-white hover:bg-secondary/80 font-semibold',
    destructive: 'bg-red-600 text-white hover:bg-red-700 font-semibold',
    ghost: 'hover:bg-accent hover:text-accent-foreground'
  };
  
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8'
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={classes} disabled={disabled}>
      {children}
    </button>
  );
};

const Badge = ({ 
  children, 
  variant = 'default',
  className = ''
}: {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success';
  className?: string;
}) => {
  const variants = {
    default: 'bg-primary text-white font-bold hover:bg-primary/80',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'text-foreground border border-input bg-background',
    destructive: 'bg-destructive text-white font-bold hover:bg-destructive/80',
    success: 'bg-green-500 text-white font-bold hover:bg-green-600'
  };

  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex items-center justify-between p-6 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

export default function NewsList({ type }: NewsListProps) {
  const [items, setItems] = useState<(NewsArticle | Announcement)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<NewsFilters | AnnouncementFilters>({
    limit: 10,
    skip: 0
  });

  useEffect(() => {
    loadItems();
  }, [type, filters]);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (type === 'news') {
        response = await newsAPI.getNews(filters as NewsFilters);
      } else {
        response = await newsAPI.getAnnouncements(filters as AnnouncementFilters);
      }
      
      setItems(response.items);
      setTotalItems(response.total);
    } catch (error) {
      console.error('Error loading items:', error);
      setError('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      skip: 0 // Reset to first page
    }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    const skip = (page - 1) * (filters.limit || 10);
    setFilters(prev => ({ ...prev, skip }));
    setCurrentPage(page);
  };

  const handlePublishToggle = async (id: number, isPublished: boolean) => {
    try {
      if (isPublished) {
        await newsAPI.unpublishNews(id);
      } else {
        await newsAPI.publishNews(id);
      }
      loadItems(); // Reload the list
    } catch (error) {
      console.error('Error toggling publish status:', error);
      alert('Failed to update publish status');
    }
  };

  const handleFeaturedToggle = async (id: number) => {
    try {
      await newsAPI.toggleFeatured(id);
      loadItems(); // Reload the list
    } catch (error) {
      console.error('Error toggling featured status:', error);
      alert('Failed to update featured status');
    }
  };

  const handleStickyToggle = async (id: number) => {
    try {
      await newsAPI.toggleSticky(id);
      loadItems(); // Reload the list
    } catch (error) {
      console.error('Error toggling sticky status:', error);
      alert('Failed to update sticky status');
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      await newsAPI.deleteNews(id);
      loadItems(); // Reload the list
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const totalPages = Math.ceil(totalItems / (filters.limit || 10));

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-bold text-black dark:text-white">
            {type === 'news' ? 'News Articles' : 'Announcements'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} total
          </p>
        </div>
        <Button href={`/admin/news/create?type=${type}`} size="lg" className="shadow-md">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create {type === 'news' ? 'Article' : 'Announcement'}
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <h4 className="text-lg font-semibold text-black dark:text-white flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
            </svg>
            Filters
          </h4>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search title, content..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stroke bg-transparent text-black outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
              <select
                className="w-full py-2.5 px-3 rounded-lg border border-stroke bg-transparent text-black outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
              >
                <option value="">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat.replace('-', ' ')}</option>
                ))}
              </select>
            </div>

            {/* Published Status */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select
                className="w-full py-2.5 px-3 rounded-lg border border-stroke bg-transparent text-black outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                value={filters.is_published === undefined ? '' : filters.is_published.toString()}
                onChange={(e) => handleFilterChange('is_published', e.target.value === '' ? undefined : e.target.value === 'true')}
              >
                <option value="">All Status</option>
                <option value="true">Published</option>
                <option value="false">Draft</option>
              </select>
            </div>

            {/* Priority (for announcements) */}
            {type === 'announcements' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
                <select
                  className="w-full py-2.5 px-3 rounded-lg border border-stroke bg-transparent text-black outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  value={(filters as AnnouncementFilters).priority || ''}
                  onChange={(e) => handleFilterChange('priority', e.target.value || undefined)}
                >
                  <option value="">All Priorities</option>
                  {PRIORITIES.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : error ? (
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={loadItems} variant="outline">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="p-12">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-black dark:text-white mb-3">
                No {type === 'news' ? 'news articles' : 'announcements'} found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {filters.search || filters.category || filters.is_published !== undefined 
                  ? `No ${type === 'news' ? 'articles' : 'announcements'} match your current filters. Try adjusting your search criteria.`
                  : `Get started by creating your first ${type === 'news' ? 'news article' : 'announcement'} to share important information.`
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button href={`/admin/news/create?type=${type}`} size="lg" className="shadow-md">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create {type === 'news' ? 'Article' : 'Announcement'}
                </Button>
                {(filters.search || filters.category || filters.is_published !== undefined) && (
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => {
                      setFilters({ limit: 10, skip: 0 });
                      setCurrentPage(1);
                    }}
                    className="shadow-sm"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Items List */}
          <div className="space-y-4">
            {items.map((item) => {
              const isAnnouncement = 'priority' in item;
              const announcement = item as Announcement;
              
              return (
                <Card key={item.id} className="shadow-sm hover:shadow-md transition-shadow duration-200">
                  <CardContent className="px-8 pt-10 pb-8">
                    <div className="flex items-start gap-6">
                      {/* Featured Image */}
                      {item.featured_image_url && (
                        <div className="flex-shrink-0">
                          <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                            <Image
                              src={item.featured_image_url}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-6">
                          <div className="flex-1">
                            {/* Title Row */}
                            <div className="mb-5">
                              <h4 className="text-xl font-semibold text-black dark:text-white line-clamp-2 mb-4 leading-relaxed">
                                {item.title}
                              </h4>
                              
                              {/* Status badges - positioned below title */}
                              <div className="flex gap-2">
                                <Badge variant={item.is_published ? "success" : "secondary"} className="text-xs">
                                  {item.is_published ? "Published" : "Draft"}
                                </Badge>
                                
                                {item.is_featured && (
                                  <Badge variant="default" className="text-xs">Featured</Badge>
                                )}
                                
                                {isAnnouncement && announcement.is_sticky && (
                                  <Badge variant="outline" className="text-xs">Sticky</Badge>
                                )}
                              </div>
                            </div>
                            
                            {item.excerpt && (
                              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                                {item.excerpt}
                              </p>
                            )}

                            {/* Category and Priority badges - separate row */}
                            <div className="flex flex-wrap gap-2 mb-5">
                              {isAnnouncement && (
                                <Badge variant="outline" className="text-xs capitalize">
                                  {announcement.priority} Priority
                                </Badge>
                              )}
                              
                              {item.category && (
                                <Badge variant="outline" className="text-xs capitalize">
                                  {item.category.replace('-', ' ')}
                                </Badge>
                              )}
                            </div>

                            {/* Meta Info and Actions Row */}
                            <div className="flex items-center justify-between gap-4 pt-2">
                              {/* Meta Info */}
                              <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                                {item.author && (
                                  <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    {item.author}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {format(new Date(item.created_at), "MMM dd, yyyy")}
                                </span>
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  {item.views_count} views
                                </span>
                                {isAnnouncement && announcement.expires_at && (
                                  <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Expires {format(new Date(announcement.expires_at), "MMM dd, yyyy")}
                                  </span>
                                )}
                              </div>

                              {/* Action Buttons - horizontal layout */}
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {/* Primary Actions */}
                                <div className="flex gap-1">
                                  <Button 
                                    href={`/admin/news/${item.id}`} 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 px-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    View
                                  </Button>
                                  
                                  <Button 
                                    href={`/admin/news/${item.id}/edit`} 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 px-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit
                                  </Button>
                                  
                                  <Button 
                                    onClick={() => handleDelete(item.id, item.title)} 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                  </Button>
                                </div>

                                {/* Divider */}
                                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700"></div>

                                {/* Secondary Actions */}
                                <div className="flex gap-1">
                                  <Button 
                                    onClick={() => handlePublishToggle(item.id, item.is_published)} 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-8 px-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800"
                                  >
                                    {item.is_published ? 'Unpublish' : 'Publish'}
                                  </Button>
                                  
                                  <Button 
                                    onClick={() => handleFeaturedToggle(item.id)} 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-8 px-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800"
                                  >
                                    {item.is_featured ? 'Unfeature' : 'Feature'}
                                  </Button>
                                  
                                  {isAnnouncement && (
                                    <Button 
                                      onClick={() => handleStickyToggle(item.id)} 
                                      variant="ghost" 
                                      size="sm"
                                      className="h-8 px-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800"
                                    >
                                      {announcement.is_sticky ? 'Unstick' : 'Stick'}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing <span className="font-medium text-black dark:text-white">{((currentPage - 1) * (filters.limit || 10)) + 1}</span> to <span className="font-medium text-black dark:text-white">{Math.min(currentPage * (filters.limit || 10), totalItems)}</span> of <span className="font-medium text-black dark:text-white">{totalItems}</span> results
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      variant="outline"
                      size="sm"
                      className="shadow-sm"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </Button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            className={`w-10 h-10 shadow-sm ${currentPage === page ? 'shadow-md' : ''}`}
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      variant="outline"
                      size="sm"
                      className="shadow-sm"
                    >
                      Next
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
