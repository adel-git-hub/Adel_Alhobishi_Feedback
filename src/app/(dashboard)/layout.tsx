import { NextAuthProvider } from "@/components/providers/SessionProvider";
import { Sidebar } from "@/components/dashboard/Sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "لوحة التحكم | شركة عادل الحبيشي",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextAuthProvider>
      <div className="flex h-screen overflow-hidden bg-background" dir="rtl">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content area */}
        <main className="flex-1 flex flex-col overflow-hidden lg:mr-64">
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </NextAuthProvider>
  );
}
