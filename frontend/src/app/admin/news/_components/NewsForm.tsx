"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { newsAPI, CATEGORIES, PRIORITIES } from "@/lib/api/news";
import type { NewsArticle, Announcement, NewsCreateData, AnnouncementCreateData, NewsUpdateData, AnnouncementUpdateData, Attachment } from "@/lib/api/news";

interface NewsFormProps {
  type: 'news' | 'announcements';
  article?: NewsArticle | Announcement;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Custom components
const Button = ({ 
  children, 
  onClick, 
  variant = 'default', 
  size = 'default', 
  className = '',
  disabled = false,
  type = 'button'
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}) => {
  const baseStyles = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const variants = {
    default: 'bg-primary text-white hover:bg-primary/90 font-semibold',
    outline: 'border-2 border-primary bg-primary/10 text-primary hover:bg-primary hover:text-white font-semibold',
    secondary: 'bg-secondary text-white hover:bg-secondary/80 font-semibold',
    destructive: 'bg-red-600 text-white hover:bg-red-700 font-semibold'
  };
  
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8'
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button type={type} onClick={onClick} className={classes} disabled={disabled}>
      {children}
    </button>
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

export default function NewsForm({ type, article, onSuccess, onCancel }: NewsFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingDocuments, setUploadingDocuments] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentsInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<NewsCreateData | AnnouncementCreateData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    author: '',
    category: '',
    tags: '',
    is_published: false,
    is_featured: false,
    published_at: '',
    ...(type === 'announcements' && {
      priority: 'normal',
      expires_at: '',
      is_sticky: false
    })
  });

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt || '',
        content: article.content,
        author: article.author || '',
        category: article.category || '',
        tags: article.tags || '',
        is_published: article.is_published,
        is_featured: article.is_featured,
        published_at: article.published_at ? new Date(article.published_at).toISOString().slice(0, 16) : '',
        ...(type === 'announcements' && 'priority' in article && {
          priority: (article as Announcement).priority,
          expires_at: (article as Announcement).expires_at ? new Date((article as Announcement).expires_at!).toISOString().slice(0, 16) : '',
          is_sticky: (article as Announcement).is_sticky
        })
      });

      // Load attachments if editing
      if (article.id) {
        loadAttachments(article.id);
      }
    }
  }, [article, type]);

  const loadAttachments = async (id: number) => {
    try {
      const data = await newsAPI.getAttachments(id);
      setAttachments(data);
    } catch (error) {
      console.error('Error loading attachments:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Auto-generate slug from title
    if (field === 'title' && value && (!formData.slug || !article)) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let result;
      if (article?.id) {
        // Update existing
        if (type === 'announcements') {
          result = await newsAPI.updateAnnouncement(article.id, formData as AnnouncementUpdateData);
        } else {
          result = await newsAPI.updateNews(article.id, formData as NewsUpdateData);
        }
      } else {
        // Create new
        if (type === 'announcements') {
          result = await newsAPI.createAnnouncement(formData as AnnouncementCreateData);
        } else {
          result = await newsAPI.createNews(formData as NewsCreateData);
        }
      }

      onSuccess?.();
    } catch (error: any) {
      console.error('Error saving:', error);
      setError(error.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !article?.id) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      setError(null);
      
      const result = await newsAPI.uploadImage(article.id, file);
      
      // Update form data with new image URL
      setFormData(prev => ({
        ...prev,
        featured_image_url: result.featured_image_url
      }));
      
      // Reset file input
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setError(error.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !article?.id) return;

    // Validate file types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setError(`Invalid file type: ${file.name}. Only PDF, Word, Excel, and PowerPoint files are allowed.`);
        return;
      }
      
      // Validate file size (max 10MB per file)
      if (file.size > 10 * 1024 * 1024) {
        setError(`File ${file.name} is too large. Maximum size is 10MB per file.`);
        return;
      }
    }

    try {
      setUploadingDocuments(true);
      setError(null);
      
      if (files.length === 1) {
        await newsAPI.uploadDocument(article.id, files[0]);
      } else {
        await newsAPI.uploadMultipleDocuments(article.id, files);
      }
      
      // Reload attachments
      await loadAttachments(article.id);
      
      // Reset file input
      if (documentsInputRef.current) {
        documentsInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error uploading documents:', error);
      setError(error.message || 'Failed to upload documents');
    } finally {
      setUploadingDocuments(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!article?.id || !confirm('Are you sure you want to delete this attachment?')) {
      return;
    }

    try {
      await newsAPI.deleteAttachment(article.id, attachmentId);
      await loadAttachments(article.id);
    } catch (error: any) {
      console.error('Error deleting attachment:', error);
      setError(error.message || 'Failed to delete attachment');
    }
  };

  const isAnnouncement = type === 'announcements';
  const announcementData = formData as AnnouncementCreateData;

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-black dark:text-white">
              Basic Information
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2 text-black dark:text-white">
                Title *
              </label>
              <input
                type="text"
                required
                className="w-full rounded-md border border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter title"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium mb-2 text-black dark:text-white">
                URL Slug
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                placeholder="url-slug"
              />
              <p className="text-xs text-gray-500 mt-1">Auto-generated from title if left empty</p>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium mb-2 text-black dark:text-white">
                Excerpt
              </label>
              <textarea
                rows={3}
                className="w-full rounded-md border border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                value={formData.excerpt}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                placeholder="Brief description"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium mb-2 text-black dark:text-white">
                Content *
              </label>
              <textarea
                rows={10}
                required
                className="w-full rounded-md border border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Write your content here..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-black dark:text-white">
              Metadata
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Author */}
              <div>
                <label className="block text-sm font-medium mb-2 text-black dark:text-white">
                  Author
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  value={formData.author}
                  onChange={(e) => handleInputChange('author', e.target.value)}
                  placeholder="Author name"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2 text-black dark:text-white">
                  Category
                </label>
                <select
                  className="w-full rounded-md border border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat.replace('-', ' ')}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-2 text-black dark:text-white">
                Tags
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                placeholder="tag1, tag2, tag3"
              />
              <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
            </div>

            {/* Announcement specific fields */}
            {isAnnouncement && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-black dark:text-white">
                    Priority
                  </label>
                  <select
                    className="w-full rounded-md border border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    value={announcementData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                  >
                    {PRIORITIES.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>

                {/* Expires At */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-black dark:text-white">
                    Expires At
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full rounded-md border border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    value={announcementData.expires_at}
                    onChange={(e) => handleInputChange('expires_at', e.target.value)}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Featured Image */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-black dark:text-white">
              Featured Image
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Image */}
            {(formData as any).featured_image_url && (
              <div className="relative w-full max-w-md">
                <Image
                  src={(formData as any).featured_image_url}
                  alt="Featured image"
                  width={400}
                  height={200}
                  className="rounded-lg object-cover"
                />
              </div>
            )}

            {/* Upload Image */}
            <div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploadingImage || !article?.id}
                variant="outline"
              >
                {uploadingImage ? (
                  <>
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Upload Image
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500 mt-1">
                {!article?.id 
                  ? "Save the article first to enable image upload"
                  : "Supported formats: JPEG, PNG, WebP. Max size: 5MB"
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-black dark:text-white">
              Document Attachments
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Attachments */}
            {attachments.length > 0 && article?.id && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-black dark:text-white">Current Attachments</h4>
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-3 border border-stroke rounded-lg dark:border-strokedark">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {attachment.filename.split('.').pop()?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-black dark:text-white">
                          {attachment.original_filename}
                        </p>
                        <p className="text-xs text-gray-500">
                          {attachment.content_type} • {(attachment.file_size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(attachment.url, '_blank')}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteAttachment(attachment.id)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Documents */}
            <div>
              <input
                ref={documentsInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                onChange={handleDocumentUpload}
                className="hidden"
              />
              <Button
                type="button"
                onClick={() => documentsInputRef.current?.click()}
                disabled={uploadingDocuments || !article?.id}
                variant="outline"
              >
                {uploadingDocuments ? (
                  <>
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Upload Documents
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500 mt-1">
                {!article?.id 
                  ? "Save the article first to enable document upload"
                  : "Supported formats: PDF, Word, Excel, PowerPoint. Max size: 10MB per file"
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Publishing Options */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-black dark:text-white">
              Publishing Options
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Published Date */}
              <div>
                <label className="block text-sm font-medium mb-2 text-black dark:text-white">
                  Published Date
                </label>
                <input
                  type="datetime-local"
                  className="w-full rounded-md border border-stroke bg-transparent py-3 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  value={formData.published_at}
                  onChange={(e) => handleInputChange('published_at', e.target.value)}
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => handleInputChange('is_published', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-black dark:text-white">Published</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-black dark:text-white">Featured</span>
              </label>

              {isAnnouncement && (
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={announcementData.is_sticky}
                    onChange={(e) => handleInputChange('is_sticky', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-black dark:text-white">Sticky (Pin to top)</span>
                </label>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                Saving...
              </>
            ) : (
              <>Save {type === 'announcements' ? 'Announcement' : 'Article'}</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
