import { cn } from "@/lib/utils";

interface RecentActivityProps {
  className?: string;
}

export function RecentActivity({ className }: RecentActivityProps) {
  const activities = [
    {
      id: 1,
      type: "created",
      item: "Hero Banner",
      title: "Summer Sale Banner",
      user: "John Doe",
      timestamp: "2 hours ago",
      icon: "🖼️",
      color: "bg-green-500",
    },
    {
      id: 2,
      type: "updated",
      item: "Product",
      title: "Wireless Headphones Pro",
      user: "Sarah Smith",
      timestamp: "4 hours ago",
      icon: "🛍️",
      color: "bg-blue-500",
    },
    {
      id: 3,
      type: "created",
      item: "News Article",
      title: "Company Expansion Plans",
      user: "Mike Johnson",
      timestamp: "6 hours ago",
      icon: "📰",
      color: "bg-green-500",
    },
    {
      id: 4,
      type: "updated",
      item: "Team Member",
      title: "Alice Wilson - Marketing Manager",
      user: "Admin",
      timestamp: "1 day ago",
      icon: "👥",
      color: "bg-blue-500",
    },
    {
      id: 5,
      type: "deleted",
      item: "Service",
      title: "Old Consultation Service",
      user: "John Doe",
      timestamp: "1 day ago",
      icon: "⚙️",
      color: "bg-red-500",
    },
    {
      id: 6,
      type: "created",
      item: "Contact Message",
      title: "New inquiry from customer",
      user: "System",
      timestamp: "2 days ago",
      icon: "📧",
      color: "bg-green-500",
    },
  ];

  const getActionText = (type: string) => {
    switch (type) {
      case "created":
        return "created";
      case "updated":
        return "updated";
      case "deleted":
        return "deleted";
      default:
        return "modified";
    }
  };

  return (
    <div className={cn("rounded-xl border border-stroke bg-white p-6 shadow-lg dark:border-dark-3 dark:bg-gray-dark dark:shadow-card", className)}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-dark dark:text-white">
            Recent Activity
          </h3>
          <p className="text-sm text-dark-4 dark:text-dark-6">
            Latest changes to your content
          </p>
        </div>
        <button className="text-sm text-primary hover:text-primary/80">
          View All
        </button>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center gap-4 rounded-lg border border-stroke p-4 transition-colors hover:bg-gray-1 dark:border-dark-3 dark:hover:bg-dark-2"
          >
            <div className={cn("rounded-lg p-2 text-white", activity.color)}>
              <span className="text-sm">{activity.icon}</span>
            </div>
            
            <div className="flex-1">
              <p className="text-sm text-dark dark:text-white">
                <span className="font-medium">{activity.user}</span>{" "}
                <span className="text-dark-4 dark:text-dark-6">
                  {getActionText(activity.type)} {activity.item.toLowerCase()}
                </span>{" "}
                <span className="font-medium">"{activity.title}"</span>
              </p>
              <p className="text-xs text-dark-4 dark:text-dark-6">
                {activity.timestamp}
              </p>
            </div>
            
            <button className="rounded-lg p-2 text-dark-4 transition-colors hover:bg-gray-2 hover:text-dark dark:text-dark-6 dark:hover:bg-dark-3 dark:hover:text-white">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-stroke dark:border-dark-3">
        <button className="w-full rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-dark transition-colors hover:bg-gray-1 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2">
          Load More Activities
        </button>
      </div>
    </div>
  );
}
