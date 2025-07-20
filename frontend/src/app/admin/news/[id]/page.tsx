"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { newsAPI } from "@/lib/api/news";
import type { NewsArticle, Announcement, Attachment } from "@/lib/api/news";

// Custom components
const Button = ({ 
  children, 
  onClick, 
  variant = 'default', 
  size = 'default', 
  className = '',
  href
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  href?: string;
}) => {
  const baseStyles = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
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
    <button onClick={onClick} className={classes}>
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
  variant?: 'default' | 'secondary' | 'outline' | 'success';
  className?: string;
}) => {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/80',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'text-foreground border border-input bg-background',
    success: 'bg-green-500 text-white hover:bg-green-600'
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

const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

export default function ViewNewsPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string);
  
  const [article, setArticle] = useState<NewsArticle | Announcement | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadArticle();
  }, [id]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await newsAPI.getNewsById(id, true); // Increment views
      setArticle(data);

      // Load attachments
      try {
        const attachmentsData = await newsAPI.getAttachments(id);
        setAttachments(attachmentsData);
      } catch (attachmentError) {
        // Attachments are optional, don't fail if they can't be loaded
        console.warn('Could not load attachments:', attachmentError);
      }
    } catch (error: any) {
      console.error('Error loading article:', error);
      setError(error.message || 'Failed to load article');
    } finally {
      setLoading(false);
    }
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

  const isAnnouncement = 'priority' in article;
  const announcement = article as Announcement;
  const type = isAnnouncement ? 'announcements' : 'news';

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          View {isAnnouncement ? 'Announcement' : 'News Article'}
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
              View {isAnnouncement ? 'Announcement' : 'Article'}
            </li>
          </ol>
        </nav>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Button variant="outline" href={`/admin/news?type=${type}`}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to List
        </Button>
        <Button href={`/admin/news/${article.id}/edit`}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit {isAnnouncement ? 'Announcement' : 'Article'}
        </Button>
      </div>

      {/* Article Content */}
      <Card>
        <CardContent>
          {/* Status Badges */}
          <div className="mb-6 flex flex-wrap gap-2">
            <Badge variant={article.is_published ? "success" : "secondary"}>
              {article.is_published ? "Published" : "Draft"}
            </Badge>
            
            {article.is_featured && (
              <Badge variant="default">Featured</Badge>
            )}
            
            {isAnnouncement && announcement.is_sticky && (
              <Badge variant="outline">Sticky</Badge>
            )}
            
            {isAnnouncement && (
              <Badge variant="outline">Priority: {announcement.priority}</Badge>
            )}
            
            {article.category && (
              <Badge variant="outline">{article.category}</Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-black dark:text-white mb-4">
            {article.title}
          </h1>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              {article.excerpt}
            </p>
          )}

          {/* Meta Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 text-sm text-gray-500 dark:text-gray-400">
            {article.author && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>By {article.author}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{format(new Date(article.created_at), "MMM dd, yyyy")}</span>
            </div>

            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{article.views_count} views</span>
            </div>

            {isAnnouncement && announcement.expires_at && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Expires: {format(new Date(announcement.expires_at), "MMM dd, yyyy")}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {article.tags && (
            <div className="mb-6">
              <div className="flex items-center gap-2 flex-wrap">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {article.tags.split(',').map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Featured Image */}
          {article.featured_image_url && (
            <div className="mb-6">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <Image
                  src={article.featured_image_url}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="prose prose-gray max-w-none dark:prose-invert mb-8">
            <div 
              className="text-black dark:text-white leading-relaxed"
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {article.content}
            </div>
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="border-t border-stroke pt-6 dark:border-strokedark">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                Attachments
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center gap-3 p-4 border border-stroke rounded-lg dark:border-strokedark">
                    <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-primary">
                        {attachment.filename.split('.').pop()?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-black dark:text-white truncate">
                        {attachment.original_filename}
                      </p>
                      <p className="text-sm text-gray-500">
                        {attachment.content_type} • {(attachment.file_size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(attachment.url, '_blank')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="border-t border-stroke pt-6 mt-8 dark:border-strokedark">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-500 dark:text-gray-400">
              <div>
                <h4 className="font-semibold text-black dark:text-white mb-2">Publication Info</h4>
                <p>Created: {format(new Date(article.created_at), "MMM dd, yyyy 'at' HH:mm")}</p>
                {article.updated_at && (
                  <p>Updated: {format(new Date(article.updated_at), "MMM dd, yyyy 'at' HH:mm")}</p>
                )}
                {article.published_at && (
                  <p>Published: {format(new Date(article.published_at), "MMM dd, yyyy 'at' HH:mm")}</p>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-black dark:text-white mb-2">Article Details</h4>
                <p>Slug: {article.slug}</p>
                <p>ID: {article.id}</p>
                <p>Views: {article.views_count}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
