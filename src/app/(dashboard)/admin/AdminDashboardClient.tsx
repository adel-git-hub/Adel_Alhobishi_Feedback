"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/dashboard/Header";
import { Card } from "@/components/ui/card";
import {
  Building2,
  Users,
  ClipboardList,
  Star,
  TrendingUp,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

const tiles = [
  {
    id: "admin-tile-branches",
    href: "/admin/branches",
    icon: Building2,
    label: "إدارة الفروع",
    desc: "إضافة، تعديل، وحذف الفروع",
    color: "from-blue-500 to-blue-700",
  },
  {
    id: "admin-tile-employees",
    href: "/admin/employees",
    icon: Users,
    label: "إدارة الموظفين",
    desc: "إدارة بيانات الموظفين وتوزيعهم",
    color: "from-violet-500 to-purple-700",
  },
  {
    id: "admin-tile-criteria",
    href: "/admin/criteria",
    icon: ClipboardList,
    label: "معايير التقييم",
    desc: "تخصيص معايير تقييم العملاء والداخلية",
    color: "from-emerald-500 to-teal-700",
  },
  {
    id: "admin-tile-evaluations",
    href: "/admin/evaluations",
    icon: Star,
    label: "جميع التقييمات",
    desc: "استعراض وتصفية كل التقييمات",
    color: "from-yellow-500 to-orange-600",
  },
];

type AdminStats = { totalEvals: number; avgScore: number; satisfactionPct: number };
type BranchPerf = { branch: string; reviews: number; score: number; pct: number };

export default function AdminDashboardClient({ 
  stats, 
  branchPerformance,
  counts 
}: { 
  stats: AdminStats; 
  branchPerformance: BranchPerf[];
  counts: { branches: number; employees: number; criteria: number };
}) {
  const { data: session } = useSession();

  const systemStats = [
    { label: "إجمالي التقييمات", value: stats.totalEvals.toString(), change: "حقيقي" },
    { label: "متوسط التقييم العام", value: `${stats.avgScore.toFixed(1)} / 5`, change: "حقيقي" },
    { label: "نسبة الرضا", value: `${stats.satisfactionPct}%`, change: "حقيقي" },
  ];

  return (
    <div>
      <Header title="لوحة الإدارة" />
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl p-6 shadow-brand gradient-brand border border-white/10"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full -translate-y-1/3 translate-x-1/4 pointer-events-none blur-2xl" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 gradient-gold rounded-2xl flex items-center justify-center shadow-md shrink-0">
              <ShieldCheck className="w-6 h-6 text-black" />
            </div>
            <div>
              <p className="text-gold-400 text-sm font-semibold">مدير النظام</p>
              <h2 className="text-white text-2xl font-bold">
                {session?.user?.name ?? "مدير النظام"}
              </h2>
              <p className="text-white/70 text-sm">
                لديك صلاحية كاملة على النظام
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-4">
          {systemStats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
            >
              <Card className="p-4 border-border text-center">
                <p className="text-2xl font-bold text-foreground mb-1">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mb-2">
                  {stat.label}
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <ArrowUpRight className="w-3 h-3" />
                  {stat.change}
                </span>
              </Card>
            </motion.div>
          ))}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            إدارة النظام
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tiles.map((tile, i) => {
              const Icon = tile.icon;
              const countMap: Record<string, string> = {
                "/admin/branches": `${counts.branches} فروع`,
                "/admin/employees": `${counts.employees} موظفين`,
                "/admin/criteria": `${counts.criteria} معايير`,
                "/admin/evaluations": `${stats.totalEvals} تقييم`,
              };
              
              return (
                <motion.div
                  key={tile.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                >
                  <Link href={tile.href} id={tile.id}>
                    <Card className="p-5 border-border hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer group">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tile.color} flex items-center justify-center shadow-sm shrink-0 group-hover:scale-110 transition-transform duration-200`}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-foreground text-sm">
                              {tile.label}
                            </p>
                            <span className="text-xs font-medium text-primary bg-primary/8 px-2 py-0.5 rounded-full">
                              {countMap[tile.href]}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {tile.desc}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-5 border-border">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground text-sm">
                أداء الفروع — حقيقي
              </h3>
            </div>
            <div className="space-y-4">
              {branchPerformance.map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + i * 0.08 }}
                >
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium text-foreground">
                      {b.branch}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{b.reviews} تقييم</span>
                      <span className="flex items-center gap-1 font-bold text-foreground">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {b.score}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${b.pct}%` }}
                      transition={{
                        delay: 0.7 + i * 0.1,
                        duration: 0.9,
                        ease: "easeOut",
                      }}
                      className="h-full gradient-brand rounded-full"
                    />
                  </div>
                </motion.div>
              ))}
              {branchPerformance.length === 0 && (
                <p className="text-sm text-muted-foreground text-center">لا توجد بيانات للأداء بعد.</p>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
