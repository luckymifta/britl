"use client";

import { Metadata } from "next";
import TeamManagement from '@/components/Team/TeamManagement';

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TeamManagement />
    </div>
  );
}
