"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bell, LogOut, ChevronDown, User, Menu, X, Loader2, CheckCircle2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { changeMyPassword } from "@/app/actions/profile.actions";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  const handleBellClick = () => {
    const url = session?.user?.role === "ADMIN" ? "/admin/evaluations" : "/manager/evaluations";
    router.push(url);
    router.refresh();
  };

  const handlePasswordChange = () => {
    if (!newPassword || newPassword.length < 6) {
      alert("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
      return;
    }
    startTransition(async () => {
      try {
        await changeMyPassword(newPassword);
        setSuccess(true);
        setTimeout(() => {
          setIsProfileOpen(false);
          setSuccess(false);
          setNewPassword("");
        }, 1500);
      } catch (err) {
        console.error(err);
        alert("فشل تغيير كلمة المرور.");
      }
    });
  };

  return (
    <>
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("toggleSidebar"))}
            className="lg:hidden p-2 -mr-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground hidden sm:block">
              شركة عادل الحبيشي للصرافة والحوالات
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            id="header-notifications"
            onClick={handleBellClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-muted hover:bg-accent transition-colors"
          >
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-background" />
          </motion.button>

          <DropdownMenu>
            <DropdownMenuTrigger
              id="header-user-menu"
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-muted hover:bg-accent transition-colors hover:scale-[1.02]"
            >
                <Avatar className="w-7 h-7">
                  <AvatarFallback className="gradient-gold text-black text-xs font-extrabold">
                    {session?.user?.name?.[0] ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-foreground leading-tight">
                    {session?.user?.name ?? "المستخدم"}
                  </p>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {session?.user?.role === "ADMIN" ? "مدير النظام" : "مدير الفرع"}
                  </p>
                </div>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 mt-1">
              <DropdownMenuItem id="header-menu-profile" onClick={() => setIsProfileOpen(true)} className="gap-2 cursor-pointer">
                <User className="w-4 h-4" />
                الملف الشخصي
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                id="header-menu-logout"
                onClick={async () => {
                  await signOut({ redirect: false });
                  window.location.href = "/login";
                }}
                className="gap-2 text-destructive cursor-pointer focus:text-destructive"
              >
                <LogOut className="w-4 h-4" />
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.header>

      <AnimatePresence>
        {isProfileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={!isPending ? () => setIsProfileOpen(false) : undefined} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed inset-0 flex items-center justify-center z-50 px-4">
              <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                {success ? (
                  <div className="text-center py-4">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                    <p className="font-semibold text-foreground">تم تغيير كلمة المرور بنجاح!</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-bold text-foreground text-lg">تغيير كلمة المرور</h3>
                      <button onClick={() => setIsProfileOpen(false)} disabled={isPending}><X className="w-5 h-5 text-muted-foreground" /></button>
                    </div>
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">كلمة المرور الجديدة</label>
                        <input type="password" value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          disabled={isPending}
                          placeholder="••••••••"
                          className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/40 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 text-left" dir="ltr" />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setIsProfileOpen(false)} disabled={isPending} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-50">إلغاء</button>
                      <button onClick={handlePasswordChange} disabled={isPending || !newPassword}
                        className="flex-1 py-2.5 rounded-xl gradient-brand text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-brand disabled:opacity-60 disabled:cursor-not-allowed">
                        {isPending && <Loader2 className="w-4 h-4 animate-spin" />} حفظ
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
