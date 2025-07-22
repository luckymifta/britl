import { authService } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function to get auth headers for form data
const getAuthHeadersFormData = () => {
  const token = authService.getToken();
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Types based on backend schemas
export interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  author?: string;
  category?: string;
  tags?: string;
  featured_image_url?: string;
  attachments?: string;
  is_published: boolean;
  is_featured: boolean;
  published_at?: string;
  views_count: number;
  created_at: string;
  updated_at?: string;
}

export interface Announcement extends NewsArticle {
  priority: string;
  expires_at?: string;
  is_sticky: boolean;
  is_expired: boolean;
}

export interface NewsFilters {
  skip?: number;
  limit?: number;
  search?: string;
  category?: string;
  author?: string;
  is_published?: boolean;
  is_featured?: boolean;
  order_by?: string;
  order_desc?: boolean;
}

export interface AnnouncementFilters extends NewsFilters {
  priority?: string;
  is_sticky?: boolean;
  include_expired?: boolean;
}

export interface NewsListResponse {
  items: NewsArticle[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface AnnouncementListResponse {
  items: Announcement[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface NewsStats {
  total_news: number;
  published_news: number;
  draft_news: number;
  featured_news: number;
  total_announcements: number;
  published_announcements: number;
  draft_announcements: number;
  sticky_announcements: number;
  total_views: number;
}

export interface NewsCreateData {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  author?: string;
  category?: string;
  tags?: string;
  is_published?: boolean;
  is_featured?: boolean;
  published_at?: string;
}

export interface AnnouncementCreateData extends NewsCreateData {
  priority: string;
  expires_at?: string;
  is_sticky?: boolean;
}

export interface NewsUpdateData extends Partial<NewsCreateData> {}

export interface AnnouncementUpdateData extends Partial<AnnouncementCreateData> {}

export interface Attachment {
  id: string;
  filename: string;
  original_filename: string;
  content_type: string;
  file_size: number;
  url: string;
  uploaded_at: string;
}

// Categories and priorities (based on backend validation)
export const CATEGORIES = [
  'announcement',
  'news',
  'update',
  'press-release',
  'company-news',
  'industry-news',
  'event',
  'promotion'
] as const;

export const PRIORITIES = [
  'low',
  'normal',
  'high',
  'urgent'
] as const;

class NewsAPI {
  // News endpoints
  async getNews(filters: NewsFilters = {}): Promise<NewsListResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE}/api/news?${params}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch news');
    }

    return response.json();
  }

  async getNewsById(id: number, incrementViews = false): Promise<NewsArticle> {
    const params = incrementViews ? '?increment_views=true' : '';
    const response = await fetch(`${API_BASE}/api/news/${id}${params}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch news');
    }

    return response.json();
  }

  async getNewsBySlug(slug: string, incrementViews = true): Promise<NewsArticle> {
    const params = incrementViews ? '?increment_views=true' : '';
    const response = await fetch(`${API_BASE}/api/news/slug/${slug}${params}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch news');
    }

    return response.json();
  }

  async createNews(data: NewsCreateData): Promise<NewsArticle> {
    const response = await fetch(`${API_BASE}/api/news`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      try {
        const error = await response.json();
        // Handle FastAPI validation errors
        if (error.detail && Array.isArray(error.detail)) {
          const validationErrors = error.detail.map((err: any) => 
            `${err.loc ? err.loc.join('.') : 'field'}: ${err.msg}`
          ).join(', ');
          throw new Error(`Validation errors: ${validationErrors}`);
        }
        throw new Error(error.detail || error.message || 'Failed to create news');
      } catch (parseError) {
        throw new Error(`Failed to create news (${response.status}: ${response.statusText})`);
      }
    }

    return response.json();
  }

  async updateNews(id: number, data: NewsUpdateData): Promise<NewsArticle> {
    const response = await fetch(`${API_BASE}/api/news/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update news');
    }

    return response.json();
  }

  async deleteNews(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/api/news/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete news');
    }
  }

  // Announcements endpoints
  async getAnnouncements(filters: AnnouncementFilters = {}): Promise<AnnouncementListResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE}/api/news/announcements?${params}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch announcements');
    }

    return response.json();
  }

  async createAnnouncement(data: AnnouncementCreateData): Promise<Announcement> {
    const response = await fetch(`${API_BASE}/api/news/announcements`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      try {
        const error = await response.json();
        // Handle FastAPI validation errors
        if (error.detail && Array.isArray(error.detail)) {
          const validationErrors = error.detail.map((err: any) => 
            `${err.loc ? err.loc.join('.') : 'field'}: ${err.msg}`
          ).join(', ');
          throw new Error(`Validation errors: ${validationErrors}`);
        }
        throw new Error(error.detail || error.message || 'Failed to create announcement');
      } catch (parseError) {
        throw new Error(`Failed to create announcement (${response.status}: ${response.statusText})`);
      }
    }

    return response.json();
  }

  async updateAnnouncement(id: number, data: AnnouncementUpdateData): Promise<Announcement> {
    const response = await fetch(`${API_BASE}/api/news/announcements/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update announcement');
    }

    return response.json();
  }

  // Stats and other endpoints
  async getStats(): Promise<NewsStats> {
    const response = await fetch(`${API_BASE}/api/news/stats`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }

    return response.json();
  }

  async getFeatured(limit = 5): Promise<NewsArticle[]> {
    const response = await fetch(`${API_BASE}/api/news/featured?limit=${limit}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch featured news');
    }

    return response.json();
  }

  async getLatest(limit = 10, category?: string): Promise<NewsArticle[]> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (category) params.append('category', category);

    const response = await fetch(`${API_BASE}/api/news/latest?${params}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch latest news');
    }

    return response.json();
  }

  // Publishing actions
  async publishNews(id: number): Promise<NewsArticle> {
    const response = await fetch(`${API_BASE}/api/news/${id}/publish`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to publish news');
    }

    return response.json();
  }

  async unpublishNews(id: number): Promise<NewsArticle> {
    const response = await fetch(`${API_BASE}/api/news/${id}/unpublish`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to unpublish news');
    }

    return response.json();
  }

  async toggleFeatured(id: number): Promise<NewsArticle> {
    const response = await fetch(`${API_BASE}/api/news/${id}/toggle-featured`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to toggle featured');
    }

    return response.json();
  }

  async toggleSticky(id: number): Promise<NewsArticle> {
    const response = await fetch(`${API_BASE}/api/news/${id}/toggle-sticky`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to toggle sticky');
    }

    return response.json();
  }

  // File upload endpoints
  async uploadImage(id: number, file: File): Promise<NewsArticle> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/api/news/${id}/upload-image`, {
      method: 'POST',
      headers: getAuthHeadersFormData(),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to upload image');
    }

    return response.json();
  }

  async uploadDocument(id: number, file: File): Promise<{ message: string; attachment: Attachment }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/api/news/${id}/upload-document`, {
      method: 'POST',
      headers: getAuthHeadersFormData(),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to upload document');
    }

    return response.json();
  }

  async uploadMultipleDocuments(id: number, files: File[]): Promise<{ message: string; attachments: Attachment[] }> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await fetch(`${API_BASE}/api/news/${id}/upload-multiple-documents`, {
      method: 'POST',
      headers: getAuthHeadersFormData(),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to upload documents');
    }

    return response.json();
  }

  async getAttachments(id: number): Promise<Attachment[]> {
    const response = await fetch(`${API_BASE}/api/news/${id}/attachments`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch attachments');
    }

    return response.json();
  }

  async deleteAttachment(id: number, attachmentId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE}/api/news/${id}/attachments/${attachmentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete attachment');
    }

    return response.json();
  }

  // Helper methods
  parseTags(tagsJson?: string): string[] {
    if (!tagsJson) return [];
    try {
      return JSON.parse(tagsJson);
    } catch {
      return [];
    }
  }

  formatTags(tags: string[]): string {
    return JSON.stringify(tags);
  }

  parseAttachments(attachmentsJson?: string): Attachment[] {
    if (!attachmentsJson) return [];
    try {
      return JSON.parse(attachmentsJson);
    } catch {
      return [];
    }
  }
}

export const newsAPI = new NewsAPI();
export default newsAPI;
