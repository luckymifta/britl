export interface Contact {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  is_read: boolean;
  is_replied: boolean;
  reply_message?: string;
  replied_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface ContactCreate {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
}

export interface ContactUpdate {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  subject?: string;
  message?: string;
  is_read?: boolean;
  is_replied?: boolean;
  reply_message?: string;
}

export interface ContactReply {
  reply_message: string;
}

export interface ContactListResponse {
  items: Contact[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface ContactStats {
  total_contacts: number;
  unread_contacts: number;
  read_contacts: number;
  replied_contacts: number;
  pending_contacts: number;
  today_contacts: number;
  this_week_contacts: number;
  this_month_contacts: number;
}

export interface ContactFilters {
  skip?: number;
  limit?: number;
  search?: string;
  is_read?: boolean;
  is_replied?: boolean;
  company?: string;
  start_date?: string;
  end_date?: string;
  order_by?: string;
  order_desc?: boolean;
}

export type ContactStatus = 'all' | 'unread' | 'read' | 'replied' | 'pending';
export type ContactSortField = 'created_at' | 'name' | 'company' | 'subject';
export type SortOrder = 'asc' | 'desc';
