"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Star,
  AlertTriangle,
  Settings,
  Building2,
  ClipboardList,
  ChevronRight,
  ShieldCheck,
  X,
  Network
} from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const managerLinks = [
  { href: "/manager", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/manager/360-review", label: "التقييم الداخلي", icon: Star },
  { href: "/manager/evaluations", label: "سجل تقييمات الفرع", icon: ClipboardList },
  { href: "/manager/alerts", label: "التنبيهات", icon: AlertTriangle },
];

const adminLinks = [
  { href: "/admin", label: "نظرة عامة", icon: LayoutDashboard },
  { href: "/admin/branches", label: "إدارة الفروع", icon: Building2 },
  { href: "/admin/departments", label: "إدارة الإدارات", icon: Network },
  { href: "/admin/employees", label: "إدارة المستخدمين والموظفين", icon: Users },
  { href: "/admin/evaluations", label: "سجل التقييمات الشامل", icon: ClipboardList },
  { href: "/admin/criteria", label: "معايير التقييم", icon: Settings },
];

const employeeLinks = [
  { href: "/employee", label: "لوحة تحكم الموظف", icon: LayoutDashboard },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    window.addEventListener("toggleSidebar", handleToggle);
    return () => window.removeEventListener("toggleSidebar", handleToggle);
  }, []);

  // Close sidebar on navigation on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const links = role === "ADMIN" 
    ? adminLinks 
    : (role === "MANAGER" || role === "DEPARTMENT_MANAGER") 
      ? managerLinks 
      : employeeLinks;

  const portalLabel = role === "ADMIN" 
    ? "بوابة الإدارة" 
    : role === "DEPARTMENT_MANAGER" 
      ? "بوابة مدير الإدارة" 
      : role === "MANAGER" 
        ? "بوابة مدير الفرع" 
        : "بوابة الموظف";

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <motion.aside
        initial={{ x: 280, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed top-0 right-0 h-full w-64 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        style={{
          background: "var(--sidebar)",
          borderLeft: "1px solid var(--sidebar-border)",
        }}
      >
        {/* Logo */}
        <div className="px-5 py-6 border-b border-white/8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-brand p-1">
                <img src="/logo.png" alt="شعار الشركة" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-sm leading-tight truncate">
                شركة عادل الحبيشي
              </p>
              <p className="text-gold-400 text-xs mt-0.5 truncate">
                {portalLabel}
              </p>
            </div>
          </div>
        </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-brand-300 text-xs font-semibold uppercase tracking-widest px-2 mb-3">
          القائمة الرئيسية
        </p>
        {links.map((link, i) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <Link
                href={link.href}
                id={`sidebar-link-${link.href.replace(/\//g, "-").slice(1)}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                  isActive
                    ? "bg-gold-500/20 text-gold-400 shadow-sm"
                    : "text-brand-300 hover:text-white hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-gold-500/15 border border-gold-400/20"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 relative z-10",
                    isActive ? "text-gold-400" : "text-brand-300 group-hover:text-gold-400"
                  )}
                />
                <span className="relative z-10 flex-1">{link.label}</span>
                {isActive && (
                  <ChevronRight className="w-3 h-3 text-gold-400 relative z-10" />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Bottom: user info */}
      <div className="px-4 py-4 border-t border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center text-black text-sm font-extrabold">
            {session?.user?.name?.[0] ?? "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-xs font-semibold truncate">
              {session?.user?.name ?? "المستخدم"}
            </p>
            <p className="text-blue-300/50 text-xs truncate">
              {role === "ADMIN" ? "مدير النظام" : role === "MANAGER" ? "مدير الفرع" : "موظف"}
            </p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-white/8 text-center text-[10px] text-white/40 space-y-0.5 font-medium">
          <p>© 2026 شركة عادل الحبيشي للصرافة والحوالات</p>
          <p className="text-gold-400 font-semibold">تصميم وتطوير : م عبدالرحمن غلاب 2026 ©</p>
        </div>
      </div>
    </motion.aside>
    </>
  );
}
