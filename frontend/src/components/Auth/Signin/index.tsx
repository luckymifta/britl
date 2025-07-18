import Link from "next/link";
import SigninWithPassword from "../SigninWithPassword";

export default function Signin() {
  return (
    <div className="space-y-6">
      <div>
        <SigninWithPassword />
      </div>

      <div className="text-center">
        <p className="text-dark-4 dark:text-dark-6">
          Don't have an account?{" "}
          <Link
            href="/auth/sign-up"
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
