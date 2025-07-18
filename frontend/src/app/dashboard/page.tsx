import { Metadata } from "next";
import DashboardContent from "./_components/DashboardContent";

export const metadata: Metadata = {
  title: "Dashboard - Admin Panel",
  description: "Admin dashboard overview",
};

export default function DashboardPage() {
  return <DashboardContent />;
}
