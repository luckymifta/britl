import { Contact } from "@/types/contact";

interface ContactModalProps {
  contact: Contact;
  isOpen: boolean;
  onClose: () => void;
  onReply: () => void;
  onMarkAsRead: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
}

export default function ContactModal({
  contact,
  isOpen,
  onClose,
  onReply,
  onMarkAsRead,
  onDelete,
}: ContactModalProps) {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = () => {
    if (contact.is_replied) {
      return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
          <div className="mr-1.5 h-2 w-2 rounded-full bg-green-500"></div>
          Replied
        </span>
      );
    }
    if (contact.is_read) {
      return (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
          <div className="mr-1.5 h-2 w-2 rounded-full bg-blue-500"></div>
          Read
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
        <div className="mr-1.5 h-2 w-2 rounded-full bg-orange-500"></div>
        Unread
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all dark:bg-gray-dark">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stroke p-6 dark:border-dark-3">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-dark dark:text-white">
                Contact Details
              </h3>
              {getStatusBadge()}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-dark-4 transition-colors hover:bg-gray-1 hover:text-dark dark:text-dark-6 dark:hover:bg-dark-2 dark:hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Contact Info */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-dark-4 dark:text-dark-6 mb-1">
                  Name
                </label>
                <p className="text-dark dark:text-white font-medium">{contact.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-4 dark:text-dark-6 mb-1">
                  Email
                </label>
                <a
                  href={`mailto:${contact.email}`}
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  {contact.email}
                </a>
              </div>
              {contact.phone && (
                <div>
                  <label className="block text-sm font-medium text-dark-4 dark:text-dark-6 mb-1">
                    Phone
                  </label>
                  <a
                    href={`tel:${contact.phone}`}
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    {contact.phone}
                  </a>
                </div>
              )}
              {contact.company && (
                <div>
                  <label className="block text-sm font-medium text-dark-4 dark:text-dark-6 mb-1">
                    Company
                  </label>
                  <p className="text-dark dark:text-white font-medium">{contact.company}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-dark-4 dark:text-dark-6 mb-1">
                  Date Received
                </label>
                <p className="text-dark dark:text-white">{formatDate(contact.created_at)}</p>
              </div>
              {contact.replied_at && (
                <div>
                  <label className="block text-sm font-medium text-dark-4 dark:text-dark-6 mb-1">
                    Replied At
                  </label>
                  <p className="text-dark dark:text-white">{formatDate(contact.replied_at)}</p>
                </div>
              )}
            </div>

            {/* Subject */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-dark-4 dark:text-dark-6 mb-2">
                Subject
              </label>
              <p className="text-dark dark:text-white font-medium">{contact.subject}</p>
            </div>

            {/* Message */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-dark-4 dark:text-dark-6 mb-2">
                Message
              </label>
              <div className="rounded-lg border border-stroke bg-gray-1 p-4 dark:border-dark-3 dark:bg-dark-2">
                <p className="text-dark dark:text-white whitespace-pre-wrap leading-relaxed">
                  {contact.message}
                </p>
              </div>
            </div>

            {/* Reply Message */}
            {contact.reply_message && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-dark-4 dark:text-dark-6 mb-2">
                  Reply Message
                </label>
                <div className="rounded-lg border border-stroke bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                  <p className="text-dark dark:text-white whitespace-pre-wrap leading-relaxed">
                    {contact.reply_message}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-stroke bg-gray-1 p-6 dark:border-dark-3 dark:bg-dark-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onMarkAsRead(contact)}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    contact.is_read
                      ? 'bg-orange-600 text-white hover:bg-orange-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {contact.is_read ? (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Mark as Unread
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Mark as Read
                    </>
                  )}
                </button>
                <button
                  onClick={() => onDelete(contact)}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-dark transition-colors hover:bg-gray-1 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
                >
                  Close
                </button>
                <button
                  onClick={onReply}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
