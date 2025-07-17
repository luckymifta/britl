import { cn } from "@/lib/utils";

interface ContentQuickActionsProps {
  className?: string;
}

export function ContentQuickActions({ className }: ContentQuickActionsProps) {
  const quickActions = [
    {
      title: "Add New Hero Banner",
      description: "Create a new banner for your homepage",
      icon: "🖼️",
      href: "/hero-banners/new",
      color: "bg-blue-500",
    },
    {
      title: "Add New Product",
      description: "Add a product to your catalog",
      icon: "🛍️",
      href: "/products/new",
      color: "bg-green-500",
    },
    {
      title: "Add New Service",
      description: "Create a new service offering",
      icon: "⚙️",
      href: "/services/new",
      color: "bg-purple-500",
    },
    {
      title: "Add Team Member",
      description: "Introduce a new team member",
      icon: "👤",
      href: "/team/new",
      color: "bg-orange-500",
    },
    {
      title: "Write News Article",
      description: "Share company news and updates",
      icon: "📝",
      href: "/news/new",
      color: "bg-indigo-500",
    },
    {
      title: "Update Company Info",
      description: "Modify company details and settings",
      icon: "🏢",
      href: "/company-info",
      color: "bg-teal-500",
    },
  ];

  return (
    <div className={cn("rounded-xl border border-stroke bg-white p-6 shadow-lg dark:border-dark-3 dark:bg-gray-dark dark:shadow-card", className)}>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-dark dark:text-white">
          Quick Actions
        </h3>
        <p className="text-sm text-dark-4 dark:text-dark-6">
          Quickly create or manage your content
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action) => (
          <a
            key={action.title}
            href={action.href}
            className="group rounded-lg border border-stroke p-4 transition-all hover:border-primary hover:shadow-md dark:border-dark-3 dark:hover:border-primary"
          >
            <div className="flex items-start gap-3">
              <div className={cn("rounded-lg p-2 text-white", action.color)}>
                <span className="text-lg">{action.icon}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-dark group-hover:text-primary dark:text-white dark:group-hover:text-primary">
                  {action.title}
                </h4>
                <p className="text-sm text-dark-4 dark:text-dark-6">
                  {action.description}
                </p>
              </div>
              <svg
                className="h-4 w-4 text-dark-4 transition-colors group-hover:text-primary dark:text-dark-6 dark:group-hover:text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
