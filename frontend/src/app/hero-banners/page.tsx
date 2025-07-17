import { Metadata } from "next";
import { HeroBannerHeader, HeroBannerList } from "./_components";

export const metadata: Metadata = {
  title: "Hero Banners Management",
  description: "Manage hero banners for your website",
};

export default function HeroBannersPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <HeroBannerHeader />
      <HeroBannerList />
    </div>
  );
}
