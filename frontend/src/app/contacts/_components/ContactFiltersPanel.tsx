import { ContactStatus, ContactSortField, SortOrder } from "@/types/contact";

interface ContactFiltersPanelProps {
  statusFilter: ContactStatus;
  searchQuery: string;
  companyFilter: string;
  sortField: ContactSortField;
  sortOrder: SortOrder;
  onStatusFilterChange: (status: ContactStatus) => void;
  onSearchQueryChange: (query: string) => void;
  onCompanyFilterChange: (company: string) => void;
  onSortFieldChange: (field: ContactSortField) => void;
  onSortOrderChange: (order: SortOrder) => void;
  onClearFilters: () => void;
}

export default function ContactFiltersPanel({
  statusFilter,
  searchQuery,
  companyFilter,
  sortField,
  sortOrder,
  onStatusFilterChange,
  onSearchQueryChange,
  onCompanyFilterChange,
  onSortFieldChange,
  onSortOrderChange,
  onClearFilters,
}: ContactFiltersPanelProps) {
  const statusOptions: { value: ContactStatus; label: string }[] = [
    { value: 'all', label: 'All Contacts' },
    { value: 'unread', label: 'Unread' },
    { value: 'read', label: 'Read' },
    { value: 'replied', label: 'Replied' },
    { value: 'pending', label: 'Pending Reply' },
  ];

  const sortOptions: { value: ContactSortField; label: string }[] = [
    { value: 'created_at', label: 'Date Created' },
    { value: 'name', label: 'Name' },
    { value: 'company', label: 'Company' },
    { value: 'subject', label: 'Subject' },
  ];

  const hasActiveFilters = 
    statusFilter !== 'all' || 
    searchQuery.trim() !== '' || 
    companyFilter.trim() !== '' ||
    sortField !== 'created_at' ||
    sortOrder !== 'desc';

  return (
    <div className="mb-6 rounded-lg border border-stroke bg-white p-4 shadow-sm dark:border-dark-3 dark:bg-gray-dark">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-dark dark:text-white">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-primary hover:text-primary/80 font-medium"
          >
            Clear all filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div>
          <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="h-4 w-4 text-dark-4 dark:text-dark-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="w-full rounded-lg border border-stroke bg-transparent pl-10 pr-4 py-2 text-dark placeholder-dark-4 focus:border-primary focus:outline-none dark:border-dark-3 dark:text-white dark:placeholder-dark-6"
              placeholder="Search contacts..."
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as ContactStatus)}
            className="w-full rounded-lg border border-stroke bg-transparent px-3 py-2 text-dark focus:border-primary focus:outline-none dark:border-dark-3 dark:text-white"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value} className="dark:bg-gray-dark">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Company Filter */}
        <div>
          <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
            Company
          </label>
          <input
            type="text"
            value={companyFilter}
            onChange={(e) => onCompanyFilterChange(e.target.value)}
            className="w-full rounded-lg border border-stroke bg-transparent px-3 py-2 text-dark placeholder-dark-4 focus:border-primary focus:outline-none dark:border-dark-3 dark:text-white dark:placeholder-dark-6"
            placeholder="Filter by company..."
          />
        </div>

        {/* Sort */}
        <div>
          <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
            Sort by
          </label>
          <div className="flex gap-2">
            <select
              value={sortField}
              onChange={(e) => onSortFieldChange(e.target.value as ContactSortField)}
              className="flex-1 rounded-lg border border-stroke bg-transparent px-3 py-2 text-dark focus:border-primary focus:outline-none dark:border-dark-3 dark:text-white"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value} className="dark:bg-gray-dark">
                  {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="rounded-lg border border-stroke px-3 py-2 text-dark transition-colors hover:bg-gray-1 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
              title={sortOrder === 'asc' ? 'Sort descending' : 'Sort ascending'}
            >
              <svg 
                className={`h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
