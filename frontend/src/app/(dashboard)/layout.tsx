import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Suspense fallback={<div className="hidden md:block w-60 shrink-0 border-r bg-card" />}>
          <Sidebar />
        </Suspense>
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="max-w-5xl mx-auto px-6 py-6">
            {children}
          </div>
        </main>
      </div>
      <Suspense fallback={null}>
        <MobileNav />
      </Suspense>
    </div>
  );
}
