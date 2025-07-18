import Signin from "@/components/Auth/Signin";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign In - Timles Admin",
  description: "Sign in to your Timles admin account",
};

export default function SignIn() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="rounded-2xl bg-white shadow-xl dark:bg-gray-dark overflow-hidden">
          <div className="flex flex-wrap items-stretch min-h-[600px]">
            <div className="w-full xl:w-1/2 flex flex-col justify-center">
              <div className="w-full p-8 sm:p-12 xl:p-16">
                <div className="mb-8">
                  <Link href="/" className="inline-block mb-8">
                    <Image
                      className="hidden dark:block"
                      src={"/images/logo/logo.svg"}
                      alt="Timles Logo"
                      width={160}
                      height={32}
                    />
                    <Image
                      className="dark:hidden"
                      src={"/images/logo/logo-dark.svg"}
                      alt="Timles Logo"
                      width={160}
                      height={32}
                    />
                  </Link>
                  <h1 className="text-3xl font-bold text-dark dark:text-white mb-3">
                    Welcome Back
                  </h1>
                  <p className="text-dark-4 dark:text-dark-6 text-lg">
                    Sign in to access your admin dashboard
                  </p>
                </div>
                
                <Signin />
              </div>
            </div>

            <div className="hidden xl:flex xl:w-1/2 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 relative">
              <div className="flex flex-col justify-center items-center p-12 w-full text-center">
                <div className="mb-8">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <svg 
                      className="w-10 h-10 text-primary" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1.5} 
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                      />
                    </svg>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-dark dark:text-white mb-4">
                    Secure Access
                  </h2>
                  <p className="text-dark-4 dark:text-dark-6 text-lg leading-relaxed max-w-md">
                    Your data is protected with enterprise-grade security. 
                    Access your dashboard with confidence.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6 w-full max-w-md">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-2">99.9%</div>
                    <div className="text-sm text-dark-4 dark:text-dark-6">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-2">24/7</div>
                    <div className="text-sm text-dark-4 dark:text-dark-6">Support</div>
                  </div>
                </div>

                <div className="absolute bottom-8 left-8 right-8">
                  <Image
                    src={"/images/grids/grid-02.svg"}
                    alt="Decorative grid"
                    width={200}
                    height={160}
                    className="mx-auto opacity-20 dark:opacity-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
