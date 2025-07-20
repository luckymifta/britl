import { useState } from "react";
import { Contact } from "@/types/contact";

interface ReplyModalProps {
  contact: Contact;
  isOpen: boolean;
  onClose: () => void;
  onSend: (replyMessage: string) => Promise<void>;
}

export default function ReplyModal({
  contact,
  isOpen,
  onClose,
  onSend,
}: ReplyModalProps) {
  const [replyMessage, setReplyMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!replyMessage.trim()) {
      setError("Please enter a reply message");
      return;
    }

    setIsSending(true);
    setError("");

    try {
      await onSend(replyMessage.trim());
      setReplyMessage("");
      onClose();
    } catch (err) {
      setError("Failed to send reply. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    if (!isSending) {
      setReplyMessage("");
      setError("");
      onClose();
    }
  };

  const characterCount = replyMessage.length;
  const maxCharacters = 2000;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all dark:bg-gray-dark">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stroke p-6 dark:border-dark-3">
            <div>
              <h3 className="text-lg font-semibold text-dark dark:text-white">
                Reply to Contact
              </h3>
              <p className="text-sm text-dark-4 dark:text-dark-6 mt-1">
                Replying to {contact.name} ({contact.email})
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isSending}
              className="rounded-lg p-2 text-dark-4 transition-colors hover:bg-gray-1 hover:text-dark disabled:opacity-50 dark:text-dark-6 dark:hover:bg-dark-2 dark:hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Original Message */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-dark-4 dark:text-dark-6 mb-2">
                Original Message
              </label>
              <div className="rounded-lg border border-stroke bg-gray-1 p-4 dark:border-dark-3 dark:bg-dark-2">
                <div className="mb-2">
                  <p className="text-sm font-medium text-dark dark:text-white">
                    Subject: {contact.subject}
                  </p>
                </div>
                <p className="text-sm text-dark-4 dark:text-dark-6 whitespace-pre-wrap">
                  {contact.message}
                </p>
              </div>
            </div>

            {/* Reply Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                Your Reply
              </label>
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your reply message here..."
                rows={8}
                maxLength={maxCharacters}
                disabled={isSending}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark placeholder:text-dark-5 focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-3 dark:text-white dark:placeholder:text-dark-6 dark:focus:border-primary"
              />
              <div className="flex items-center justify-between mt-2">
                <div className="text-sm text-dark-4 dark:text-dark-6">
                  {characterCount}/{maxCharacters} characters
                </div>
                {characterCount > maxCharacters * 0.9 && (
                  <div className="text-sm text-orange-600 dark:text-orange-400">
                    Approaching character limit
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 dark:bg-red-900/20 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Templates */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-dark-4 dark:text-dark-6 mb-2">
                Quick Templates
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setReplyMessage("Thank you for your inquiry. We have received your message and will get back to you within 24 hours.")}
                  disabled={isSending}
                  className="text-xs px-3 py-1 rounded-md border border-stroke bg-gray-1 text-dark hover:bg-gray-2 transition-colors disabled:opacity-50 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:hover:bg-dark-3"
                >
                  Standard Response
                </button>
                <button
                  onClick={() => setReplyMessage("Thank you for contacting us. We appreciate your interest in our services. Our team will review your inquiry and respond shortly.")}
                  disabled={isSending}
                  className="text-xs px-3 py-1 rounded-md border border-stroke bg-gray-1 text-dark hover:bg-gray-2 transition-colors disabled:opacity-50 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:hover:bg-dark-3"
                >
                  Service Inquiry
                </button>
                <button
                  onClick={() => setReplyMessage("Thank you for your message. We have forwarded your inquiry to the appropriate department and they will contact you directly.")}
                  disabled={isSending}
                  className="text-xs px-3 py-1 rounded-md border border-stroke bg-gray-1 text-dark hover:bg-gray-2 transition-colors disabled:opacity-50 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:hover:bg-dark-3"
                >
                  Forward to Team
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-stroke bg-gray-1 p-6 dark:border-dark-3 dark:bg-dark-2">
            <div className="flex items-center justify-between">
              <div className="text-sm text-dark-4 dark:text-dark-6">
                This reply will be sent to: {contact.email}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClose}
                  disabled={isSending}
                  className="rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-dark transition-colors hover:bg-gray-2 disabled:opacity-50 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={isSending || !replyMessage.trim() || characterCount > maxCharacters}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Send Reply
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
