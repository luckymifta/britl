import { cn } from "@/lib/utils";

interface SystemStatsProps {
  className?: string;
}

export function SystemStats({ className }: SystemStatsProps) {
  const stats = [
    {
      label: "Total Content Items",
      value: "247",
      icon: "📊",
      trend: "+15%",
      trendDirection: "up" as const,
    },
    {
      label: "Published Items",
      value: "231",
      icon: "✅",
      trend: "+8%",
      trendDirection: "up" as const,
    },
    {
      label: "Draft Items",
      value: "16",
      icon: "📝",
      trend: "-3%",
      trendDirection: "down" as const,
    },
    {
      label: "Storage Used",
      value: "2.4 GB",
      icon: "💾",
      trend: "+12%",
      trendDirection: "up" as const,
    },
  ];

  return (
    <div className={cn("rounded-xl border border-stroke bg-white p-6 shadow-lg dark:border-dark-3 dark:bg-gray-dark dark:shadow-card", className)}>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-dark dark:text-white">
          System Overview
        </h3>
        <p className="text-sm text-dark-4 dark:text-dark-6">
          Content management statistics
        </p>
      </div>
      
      <div className="space-y-6">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <span className="text-lg">{stat.icon}</span>
              </div>
              <div>
                <p className="text-sm text-dark-4 dark:text-dark-6">
                  {stat.label}
                </p>
                <p className="font-semibold text-dark dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  "text-sm font-medium",
                  stat.trendDirection === "up"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                )}
              >
                {stat.trend}
              </span>
              <svg
                className={cn(
                  "h-4 w-4",
                  stat.trendDirection === "up"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {stat.trendDirection === "up" ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 17l9.2-9.2M17 8v9m0-9H8"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 7l-9.2 9.2M8 16V7m0 9h9"
                  />
                )}
              </svg>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-stroke dark:border-dark-3">
        <button className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90">
          View Detailed Analytics
        </button>
      </div>
    </div>
  );
}
