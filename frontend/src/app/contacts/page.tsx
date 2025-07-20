"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Metadata } from "next";
import { contactsAPI } from "@/lib/api/contacts";
import { Contact, ContactStats, ContactFilters, ContactStatus, ContactSortField, SortOrder } from "@/types/contact";
import { useAuth } from "@/components/Auth/AuthProvider";
import {
  ContactsTable,
  ContactsHeader,
  ContactsStats,
  ContactModal,
  ReplyModal,
  ContactFiltersPanel,
} from "./_components";

// export const metadata: Metadata = {
//   title: "Contacts Management",
//   description: "Manage customer contacts and inquiries",
// };

export default function ContactsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stats, setStats] = useState<ContactStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  
  // Check authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/sign-in');
    }
  }, [isAuthenticated, authLoading, router]);

  // Don't render anything if not authenticated
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }
  
  // Modal states
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<ContactStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [sortField, setSortField] = useState<ContactSortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [pageSize, setPageSize] = useState(20);
  const [showFilters, setShowFilters] = useState(false);

  // Create filters object
  const filters: ContactFilters = useMemo(() => {
    const filterObj: ContactFilters = {
      skip: (currentPage - 1) * pageSize,
      limit: pageSize,
      order_by: sortField,
      order_desc: sortOrder === 'desc',
    };

    if (searchQuery.trim()) {
      filterObj.search = searchQuery.trim();
    }

    if (companyFilter.trim()) {
      filterObj.company = companyFilter.trim();
    }

    switch (statusFilter) {
      case 'unread':
        filterObj.is_read = false;
        break;
      case 'read':
        filterObj.is_read = true;
        break;
      case 'replied':
        filterObj.is_replied = true;
        break;
      case 'pending':
        filterObj.is_replied = false;
        break;
    }

    return filterObj;
  }, [currentPage, pageSize, sortField, sortOrder, searchQuery, companyFilter, statusFilter]);

  // Fetch contacts
  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await contactsAPI.getAllContacts(filters);
      setContacts(response.items);
      setTotalContacts(response.total);
      setTotalPages(response.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contacts');
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await contactsAPI.getContactStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  // Initial load and refetch when filters change
  useEffect(() => {
    console.log('Contacts Page - Auth state:', { isAuthenticated, authLoading });
    if (isAuthenticated && !authLoading) {
      console.log('Contacts Page - Fetching contacts...');
      fetchContacts();
    }
  }, [filters, isAuthenticated, authLoading, fetchContacts]);

  // Fetch stats on component mount
  useEffect(() => {
    console.log('Contacts Page - Auth state for stats:', { isAuthenticated, authLoading });
    if (isAuthenticated && !authLoading) {
      console.log('Contacts Page - Fetching stats...');
      fetchStats();
    }
  }, [isAuthenticated, authLoading, fetchStats]);

  // Handle bulk actions
  const handleBulkMarkAsRead = async () => {
    if (selectedContacts.length === 0) return;
    
    try {
      await contactsAPI.bulkMarkAsRead(selectedContacts);
      setSelectedContacts([]);
      fetchContacts();
      fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark contacts as read');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedContacts.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedContacts.length} contact(s)?`)) {
      return;
    }
    
    try {
      await contactsAPI.bulkDelete(selectedContacts);
      setSelectedContacts([]);
      fetchContacts();
      fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete contacts');
    }
  };

  // Handle individual contact actions
  const handleMarkAsRead = async (contact: Contact) => {
    try {
      if (contact.is_read) {
        await contactsAPI.markAsUnread(contact.id);
      } else {
        await contactsAPI.markAsRead(contact.id);
      }
      fetchContacts();
      fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update contact status');
    }
  };

  const handleDelete = async (contact: Contact) => {
    if (!confirm(`Are you sure you want to delete the contact from ${contact.name}?`)) {
      return;
    }
    
    try {
      await contactsAPI.deleteContact(contact.id);
      fetchContacts();
      fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete contact');
    }
  };

  const handleReply = async (replyMessage: string) => {
    if (!selectedContact) return;
    
    try {
      await contactsAPI.replyToContact(selectedContact.id, { reply_message: replyMessage });
      setIsReplyModalOpen(false);
      setSelectedContact(null);
      fetchContacts();
      fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reply');
    }
  };

  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsViewModalOpen(true);
    
    // Mark as read when viewing
    if (!contact.is_read) {
      handleMarkAsRead(contact);
    }
  };

  const handleReplyToContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsReplyModalOpen(true);
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setSearchQuery('');
    setCompanyFilter('');
    setSortField('created_at');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <ContactsHeader
        totalContacts={totalContacts}
        selectedCount={selectedContacts.length}
        onBulkMarkAsRead={handleBulkMarkAsRead}
        onBulkDelete={handleBulkDelete}
        onToggleFilters={() => setShowFilters(!showFilters)}
        showFilters={showFilters}
      />

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      {stats && <ContactsStats stats={stats} />}

      {showFilters && (
        <ContactFiltersPanel
          statusFilter={statusFilter}
          searchQuery={searchQuery}
          companyFilter={companyFilter}
          sortField={sortField}
          sortOrder={sortOrder}
          onStatusFilterChange={setStatusFilter}
          onSearchQueryChange={setSearchQuery}
          onCompanyFilterChange={setCompanyFilter}
          onSortFieldChange={setSortField}
          onSortOrderChange={setSortOrder}
          onClearFilters={clearFilters}
        />
      )}

      <ContactsTable
        contacts={contacts}
        loading={loading}
        selectedContacts={selectedContacts}
        onSelectedContactsChange={setSelectedContacts}
        onViewContact={handleViewContact}
        onReplyToContact={handleReplyToContact}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDelete}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      {/* Contact View Modal */}
      {selectedContact && (
        <ContactModal
          contact={selectedContact}
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedContact(null);
          }}
          onReply={() => {
            setIsViewModalOpen(false);
            setIsReplyModalOpen(true);
          }}
          onMarkAsRead={handleMarkAsRead}
          onDelete={handleDelete}
        />
      )}

      {/* Reply Modal */}
      {selectedContact && (
        <ReplyModal
          contact={selectedContact}
          isOpen={isReplyModalOpen}
          onClose={() => {
            setIsReplyModalOpen(false);
            setSelectedContact(null);
          }}
          onSend={handleReply}
        />
      )}
    </div>
  );
}
