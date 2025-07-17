import { cn } from "@/lib/utils";

interface ContentOverviewCardsProps {
  className?: string;
}

export function ContentOverviewCards({ className }: ContentOverviewCardsProps) {
  const cards = [
    {
      title: "Hero Banners",
      count: "5",
      change: "+2 this month",
      changeType: "positive" as const,
      icon: "🖼️",
      href: "/hero-banners",
    },
    {
      title: "Products",
      count: "24",
      change: "+8 this month",
      changeType: "positive" as const,
      icon: "🛍️",
      href: "/products",
    },
    {
      title: "Services",
      count: "12",
      change: "+3 this month",
      changeType: "positive" as const,
      icon: "⚙️",
      href: "/services",
    },
    {
      title: "Team Members",
      count: "18",
      change: "+1 this month",
      changeType: "positive" as const,
      icon: "👥",
      href: "/team",
    },
    {
      title: "News Articles",
      count: "42",
      change: "+12 this month",
      changeType: "positive" as const,
      icon: "📰",
      href: "/news",
    },
    {
      title: "Contact Messages",
      count: "156",
      change: "+24 this week",
      changeType: "positive" as const,
      icon: "📧",
      href: "/contacts",
    },
  ];

  return (
    <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3", className)}>
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-xl border border-stroke bg-white p-6 shadow-lg transition-all hover:shadow-xl dark:border-dark-3 dark:bg-gray-dark dark:shadow-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{card.icon}</span>
                <h3 className="text-lg font-semibold text-dark dark:text-white">
                  {card.title}
                </h3>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-dark dark:text-white">
                  {card.count}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium",
                    card.changeType === "positive"
                      ? "text-green-600 dark:text-green-400"
                      : card.changeType === "negative"
                      ? "text-red-600 dark:text-red-400"
                      : "text-dark-4 dark:text-dark-6"
                  )}
                >
                  {card.change}
                </span>
              </div>
            </div>
            <a
              href={card.href}
              className="rounded-lg bg-primary p-2 text-white transition-colors hover:bg-primary/90"
            >
              <svg
                className="h-5 w-5"
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
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
