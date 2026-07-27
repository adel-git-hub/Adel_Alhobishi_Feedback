import { NextAuthProvider } from "@/components/providers/SessionProvider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تقييم الخدمة | شركة عادل الحبيشي",
  description: "قيّم خدماتنا وساعدنا على التطور",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextAuthProvider>
      <div dir="rtl" className="min-h-screen">
        {children}
      </div>
    </NextAuthProvider>
  );
}
