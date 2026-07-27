"use client";

import { motion } from "framer-motion";
import { Building2, Star, ChevronLeft, ShieldCheck, Users, Clock, Loader2, LogIn } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getEmployeesByBranch } from "../actions/public.actions";
import { PublicAccessType } from "@prisma/client";

const stats = [
  { icon: Users, value: "+5,200", label: "عميل راضٍ" },
  { icon: Star, value: "4.8/5", label: "متوسط التقييم" },
  { icon: Clock, value: "24/7", label: "خدمة متواصلة" },
];

type Branch = { id: string; name: string; location: string | null };
type Employee = { id: string; name: string; role: string; department?: { name: string } | null };

export default function PublicHomeClient({ initialBranches, accessType }: { initialBranches: Branch[], accessType: PublicAccessType }) {
  const router = useRouter();
  const [step, setStep] = useState<"branch" | "employee">("branch");
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleSelectBranch = (branch: Branch) => {
    setSelectedBranch(branch);
    startTransition(async () => {
      try {
        const data = await getEmployeesByBranch(branch.id, accessType);
        setEmployees(data as any);
        setStep("employee");
      } catch (err) {
        console.error(err);
        alert("فشل جلب الموظفين. يرجى المحاولة مرة أخرى.");
      }
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 gradient-brand" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 40%, rgba(96,165,250,0.5) 0%, transparent 55%), radial-gradient(circle at 75% 70%, rgba(30,58,138,0.7) 0%, transparent 50%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: `${100 + i * 80}px`,
            height: `${100 + i * 80}px`,
            background: `rgba(245, 158, 11,${0.02 + i * 0.01})`, // Gold tint
            right: `${5 + i * 22}%`,
            top: `${10 + i * 18}%`,
          }}
          animate={{ y: [0, -20, 0], scale: [1, 1.04, 1] }}
          transition={{ duration: 5 + i * 2, repeat: Infinity, delay: i * 1.2 }}
        />
      ))}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <img src="/globe.png" alt="Globe" className="w-[120%] max-w-4xl object-contain -rotate-12 blur-[2px]" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Login Button in top corner */}
        <div className="absolute top-5 left-5 z-20">
          <button
            id="btn-goto-login"
            onClick={() => router.push("/login")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-gold text-brand-950 font-bold text-xs shadow-lg hover:scale-105 transition-all border border-gold-400/30"
          >
            <LogIn className="w-4 h-4 text-brand-950" />
            تسجيل الدخول
          </button>
        </div>

        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center pt-12 pb-8 px-4"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-44 h-44 sm:w-52 sm:h-52 bg-white border-4 border-amber-400/30 rounded-3xl flex items-center justify-center shadow-brand-lg overflow-hidden p-3 transition-transform hover:scale-105">
                <img src="/logo.png" alt="شركة عادل الحبيشي" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            شركة عادل الحبيشي
          </h1>
          <p className="text-white/80 text-base">للصرافة والحوالات المالية</p>
          <div className="mt-4 h-0.5 w-40 mx-auto bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
          <p className="mt-4 text-amber-400 text-base font-bold tracking-wide">
            رأيك يهمنا – ساعدنا على تقديم خدمة أفضل
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex justify-center gap-6 sm:gap-10 px-6 mb-8"
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="text-center group">
                <div className="flex items-center justify-center gap-2 text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3.5 py-2 rounded-2xl shadow-sm">
                  <Icon className="w-5 h-5 text-amber-400 shrink-0" />
                  <span className="text-white font-bold text-base">{stat.value}</span>
                </div>
                <p className="text-amber-300/80 text-xs font-semibold mt-1.5">{stat.label}</p>
              </div>
            );
          })}
        </motion.div>

        <div className="flex-1 flex flex-col items-center justify-start px-4 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md glass-dark rounded-3xl p-6 shadow-brand-lg mb-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${step === "branch" || step === "employee" ? "gradient-brand" : "bg-white/10"}`}
              />
              <div
                className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${step === "employee" ? "gradient-brand" : "bg-white/10"}`}
              />
            </div>

            {isPending ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-4">
                <Loader2 className="w-10 h-10 text-gold-400/70 animate-spin" />
                <p className="text-white/60 text-sm">جاري تحميل البيانات...</p>
              </div>
            ) : step === "branch" ? (
              <div>
                <h2 className="text-white text-xl font-bold mb-1">اختر الفرع</h2>
                <p className="text-white/60 text-sm mb-5">
                  حدد الفرع الذي تلقيت فيه الخدمة
                </p>
                <div className="space-y-3">
                  {initialBranches.map((branch, i) => (
                    <motion.button
                      key={branch.id}
                      id={`branch-${branch.id}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.08 }}
                      whileHover={{ scale: 1.02, x: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectBranch(branch)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/8 border border-white/10 hover:bg-white/15 hover:border-gold-400/40 transition-all duration-200 text-right group"
                    >
                      <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white/5">
                        <Building2 className="w-5 h-5 text-gold-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm group-hover:text-gold-400 transition-colors">{branch.name}</p>
                        <p className="text-white/50 text-xs mt-0.5 truncate">{branch.location}</p>
                      </div>
                      <ChevronLeft className="w-4 h-4 text-white/40 shrink-0 group-hover:text-gold-400" />
                    </motion.button>
                  ))}
                  {initialBranches.length === 0 && (
                    <p className="text-center text-white/50 text-sm">لا توجد فروع مسجلة</p>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <button
                  onClick={() => setStep("branch")}
                  className="flex items-center gap-1 text-white/60 hover:text-gold-400 text-sm mb-4 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 rotate-180" />
                  العودة
                </button>
                <h2 className="text-white text-xl font-bold mb-1">اختر الموظف</h2>
                <p className="text-white/60 text-sm mb-2">
                  {selectedBranch?.name}
                </p>
                <p className="text-white/40 text-xs mb-5">
                  حدد الموظف الذي قدم لك الخدمة
                </p>
                <div className="space-y-3">
                  {employees.map((emp, i) => (
                    <motion.button
                      key={emp.id}
                      id={`employee-${emp.id}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      whileHover={{ scale: 1.02, x: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push(`/evaluate/${emp.id}?accessType=${accessType}`)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/8 border border-white/10 hover:bg-white/15 hover:border-gold-400/40 transition-all duration-200 text-right group"
                    >
                      <div className="w-10 h-10 gradient-gold rounded-xl flex items-center justify-center shrink-0 text-black font-extrabold text-base shadow-sm">
                        {emp.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm group-hover:text-gold-400 transition-colors">{emp.name}</p>
                        <p className="text-white/50 text-xs mt-0.5">{emp.role === "MANAGER" ? "مدير الفرع" : "موظف"}</p>
                      </div>
                      <div className="shrink-0 flex items-center gap-1">
                        <Star className="w-3 h-3 text-gold-500 fill-gold-500" />
                        <ChevronLeft className="w-4 h-4 text-white/40 group-hover:text-gold-400" />
                      </div>
                    </motion.button>
                  ))}
                  {employees.length === 0 && (
                    <p className="text-center text-white/50 text-sm">لا يوجد موظفون متاحون في هذا الفرع.</p>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          <div className="text-center text-white/50 text-xs font-medium space-y-1 mt-auto">
            <p>© 2026 شركة عادل الحبيشي للصرافة والحوالات المالية</p>
            <p className="text-gold-400 font-semibold">تصميم وتطوير : م عبدالرحمن غلاب 2026 ©</p>
            <div className="flex items-center justify-center gap-5 mt-4">
              {/* Google Maps Icon */}
              <a href="https://go.rootits.com/adelalhabishico" target="_blank" rel="noopener noreferrer" title="موقعنا على الخريطة" className="text-white/60 hover:text-amber-400 hover:scale-125 transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </a>
              <div className="w-px h-6 bg-white/20" />
              {/* TikTok */}
              <a href="https://go.rootits.com/adelalhabishico" target="_blank" rel="noopener noreferrer" title="TikTok" className="text-white/60 hover:text-white hover:scale-125 transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.87a8.18 8.18 0 0 0 4.78 1.52V6.93a4.85 4.85 0 0 1-1.01-.24z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a href="https://go.rootits.com/adelalhabishico" target="_blank" rel="noopener noreferrer" title="Instagram" className="text-white/60 hover:text-pink-400 hover:scale-125 transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                </svg>
              </a>
              {/* Facebook */}
              <a href="https://go.rootits.com/adelalhabishico" target="_blank" rel="noopener noreferrer" title="Facebook" className="text-white/60 hover:text-blue-400 hover:scale-125 transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
