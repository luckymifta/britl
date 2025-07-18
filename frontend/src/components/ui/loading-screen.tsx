"use client";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-dark">
      <div className="text-center">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
        <h3 className="text-lg font-semibold text-dark dark:text-white mb-2">
          {message}
        </h3>
        <p className="text-dark-4 dark:text-dark-6">
          Please wait while we set things up for you.
        </p>
      </div>
    </div>
  );
}
