import { Contact } from "@/types/contact";
import { useState } from "react";

interface ContactsTableProps {
  contacts: Contact[];
  loading: boolean;
  selectedContacts: number[];
  onSelectedContactsChange: (ids: number[]) => void;
  onViewContact: (contact: Contact) => void;
  onReplyToContact: (contact: Contact) => void;
  onMarkAsRead: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export default function ContactsTable({
  contacts,
  loading,
  selectedContacts,
  onSelectedContactsChange,
  onViewContact,
  onReplyToContact,
  onMarkAsRead,
  onDelete,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: ContactsTableProps) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectedContactsChange(contacts.map(contact => contact.id));
    } else {
      onSelectedContactsChange([]);
    }
  };

  const handleSelectContact = (contactId: number, checked: boolean) => {
    if (checked) {
      onSelectedContactsChange([...selectedContacts, contactId]);
    } else {
      onSelectedContactsChange(selectedContacts.filter(id => id !== contactId));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const getStatusBadge = (contact: Contact) => {
    if (contact.is_replied) {
      return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
          <div className="mr-1 h-1.5 w-1.5 rounded-full bg-green-500"></div>
          Replied
        </span>
      );
    }
    if (contact.is_read) {
      return (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
          <div className="mr-1 h-1.5 w-1.5 rounded-full bg-blue-500"></div>
          Read
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
        <div className="mr-1 h-1.5 w-1.5 rounded-full bg-orange-500"></div>
        Unread
      </span>
    );
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-stroke bg-white shadow-sm dark:border-dark-3 dark:bg-gray-dark">
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-dark-4 dark:text-dark-6">Loading contacts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="rounded-lg border border-stroke bg-white shadow-sm dark:border-dark-3 dark:bg-gray-dark">
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center dark:bg-dark-2">
              <svg
                className="h-8 w-8 text-dark-4 dark:text-dark-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-dark dark:text-white mb-2">
              No contacts found
            </h3>
            <p className="text-dark-4 dark:text-dark-6">
              No contacts match your current filters. Try adjusting your search criteria.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const allSelected = contacts.length > 0 && contacts.every(contact => selectedContacts.includes(contact.id));
  const someSelected = contacts.some(contact => selectedContacts.includes(contact.id));

  return (
    <div className="rounded-lg border border-stroke bg-white shadow-sm dark:border-dark-3 dark:bg-gray-dark">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-stroke dark:border-dark-3">
            <tr>
              <th className="p-4 text-left">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected && !allSelected;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 rounded border-stroke text-primary focus:ring-primary dark:border-dark-3"
                  />
                </label>
              </th>
              <th className="p-4 text-left text-sm font-medium text-dark dark:text-white">Name</th>
              <th className="p-4 text-left text-sm font-medium text-dark dark:text-white">Company</th>
              <th className="p-4 text-left text-sm font-medium text-dark dark:text-white">Subject</th>
              <th className="p-4 text-left text-sm font-medium text-dark dark:text-white">Status</th>
              <th className="p-4 text-left text-sm font-medium text-dark dark:text-white">Date</th>
              <th className="p-4 text-right text-sm font-medium text-dark dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr
                key={contact.id}
                className={`border-b border-stroke transition-colors dark:border-dark-3 ${
                  hoveredRow === contact.id ? 'bg-gray-1 dark:bg-dark-2' : ''
                }`}
                onMouseEnter={() => setHoveredRow(contact.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="p-4">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedContacts.includes(contact.id)}
                      onChange={(e) => handleSelectContact(contact.id, e.target.checked)}
                      className="h-4 w-4 rounded border-stroke text-primary focus:ring-primary dark:border-dark-3"
                    />
                  </label>
                </td>
                <td className="p-4">
                  <div>
                    <div className="font-medium text-dark dark:text-white">{contact.name}</div>
                    <div className="text-sm text-dark-4 dark:text-dark-6">{contact.email}</div>
                    {contact.phone && (
                      <div className="text-sm text-dark-4 dark:text-dark-6">{contact.phone}</div>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-dark dark:text-white">
                    {contact.company || '—'}
                  </span>
                </td>
                <td className="p-4">
                  <span className="text-dark dark:text-white" title={contact.subject}>
                    {truncateText(contact.subject, 40)}
                  </span>
                </td>
                <td className="p-4">
                  {getStatusBadge(contact)}
                </td>
                <td className="p-4">
                  <span className="text-sm text-dark-4 dark:text-dark-6">
                    {formatDate(contact.created_at)}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onViewContact(contact)}
                      className="rounded-lg p-2 text-dark-4 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-dark-6 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                      title="View contact"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => onReplyToContact(contact)}
                      className="rounded-lg p-2 text-dark-4 transition-colors hover:bg-green-50 hover:text-green-600 dark:text-dark-6 dark:hover:bg-green-900/20 dark:hover:text-green-400"
                      title="Reply to contact"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => onMarkAsRead(contact)}
                      className={`rounded-lg p-2 transition-colors ${
                        contact.is_read
                          ? 'text-dark-4 hover:bg-orange-50 hover:text-orange-600 dark:text-dark-6 dark:hover:bg-orange-900/20 dark:hover:text-orange-400'
                          : 'text-dark-4 hover:bg-blue-50 hover:text-blue-600 dark:text-dark-6 dark:hover:bg-blue-900/20 dark:hover:text-blue-400'
                      }`}
                      title={contact.is_read ? 'Mark as unread' : 'Mark as read'}
                    >
                      {contact.is_read ? (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                    
                    <button
                      onClick={() => onDelete(contact)}
                      className="rounded-lg p-2 text-dark-4 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-dark-6 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                      title="Delete contact"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t border-stroke p-4 dark:border-dark-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-dark-4 dark:text-dark-6">Show</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="rounded-lg border border-stroke bg-transparent px-3 py-1 text-sm text-dark dark:border-dark-3 dark:text-white"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-dark-4 dark:text-dark-6">per page</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                className="rounded-lg border border-stroke px-3 py-1.5 text-sm font-medium text-dark transition-colors hover:bg-gray-1 disabled:opacity-50 disabled:cursor-not-allowed dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
              >
                Previous
              </button>
              
              <span className="text-sm text-dark-4 dark:text-dark-6">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
                className="rounded-lg border border-stroke px-3 py-1.5 text-sm font-medium text-dark transition-colors hover:bg-gray-1 disabled:opacity-50 disabled:cursor-not-allowed dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
