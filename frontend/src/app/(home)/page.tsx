import { ContentOverviewCards, RecentActivity, ContentQuickActions, SystemStats } from "./_components";
import { Suspense } from "react";

type PropsType = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};

export default async function Home({ searchParams }: PropsType) {
  const { selected_time_frame } = await searchParams;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-dark dark:text-white">
          Content Management Dashboard
        </h1>
        <p className="text-sm text-dark-4 dark:text-dark-6">
          Welcome to your website content management system
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <ContentOverviewCards />
      </Suspense>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
        <ContentQuickActions className="col-span-12 xl:col-span-8" />
        
        <SystemStats className="col-span-12 xl:col-span-4" />

        <RecentActivity className="col-span-12" />
      </div>
    </>
  );
}
