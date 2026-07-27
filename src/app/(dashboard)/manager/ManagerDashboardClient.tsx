"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/dashboard/Header";
import { useSession } from "next-auth/react";
import {
  Star,
  Users,
  TrendingUp,
  AlertTriangle,
  Building2,
  ClipboardCheck,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type ManagerStats = {
  evaluations: number;
  avgScore: number;
  activeEmployees: number;
  criticalAlerts: number;
};

type Evaluation = {
  employee: string;
  branch: string;
  score: number;
  time: string;
};

type Performance = {
  label: string;
  value: number;
};

function ScoreBadge({ score }: { score: number }) {
  const colors = {
    1: "bg-red-100 text-red-700",
    2: "bg-orange-100 text-orange-700",
    3: "bg-yellow-100 text-yellow-700",
    4: "bg-blue-100 text-blue-700",
    5: "bg-emerald-100 text-emerald-700",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${colors[Math.round(score) as keyof typeof colors] || colors[5]}`}>
      {"★".repeat(Math.round(score))}{"☆".repeat(5 - Math.round(score))}
    </span>
  );
}

export default function ManagerDashboardClient({
  stats,
  recentEvaluations,
  performance
}: {
  stats: ManagerStats;
  recentEvaluations: Evaluation[];
  performance: Performance[];
}) {
  const { data: session } = useSession();
  const router = useRouter();

  const statCards = [
    {
      id: "stat-evaluations",
      title: "إجمالي التقييمات",
      value: stats.evaluations.toString(),
      change: "حقيقي",
      trend: "up",
      icon: ClipboardCheck,
      color: "from-blue-500 to-blue-700",
    },
    {
      id: "stat-avg-score",
      title: "متوسط التقييم",
      value: `${stats.avgScore.toFixed(1)} / 5`,
      change: "حقيقي",
      trend: "up",
      icon: Star,
      color: "from-yellow-500 to-orange-600",
    },
    {
      id: "stat-employees",
      title: "الموظفون النشطون",
      value: stats.activeEmployees.toString(),
      change: "حقيقي",
      trend: "up",
      icon: Users,
      color: "from-emerald-500 to-teal-700",
    },
    {
      id: "stat-alerts",
      title: "تنبيهات حرجة",
      value: stats.criticalAlerts.toString(),
      change: "حقيقي",
      trend: stats.criticalAlerts > 0 ? "down" : "up",
      icon: AlertTriangle,
      color: "from-red-500 to-rose-700",
    },
  ];

  return (
    <div>
      <Header title="لوحة التحكم" />
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl gradient-brand p-6 shadow-brand"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-gold-500/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold-500/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-lg" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-gold-400 text-sm font-semibold mb-1">مرحباً بك،</p>
              <h2 className="text-white text-2xl font-bold mb-1">
                {session?.user?.name ?? "المدير"}
              </h2>
              <p className="text-white/70 text-sm font-medium">
                إليك ملخص أداء الفرع لهذا اليوم
              </p>
            </div>
          </div>
          <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none">
            <Building2 className="w-20 h-20 text-gold-400/15" />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            const isAlerts = stat.id === "stat-alerts";
            return (
              <motion.div
                key={stat.id}
                id={stat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
              >
                <Card
                  onClick={isAlerts ? () => router.push("/manager/alerts") : undefined}
                  className={cn(
                    "p-5 border-border transition-all duration-200",
                    isAlerts
                      ? "cursor-pointer hover:shadow-lg hover:border-red-500/50 hover:scale-[1.02] active:scale-[0.98]"
                      : "hover:shadow-md"
                  )}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-semibold ${stat.trend === "up" ? "text-emerald-600" : "text-red-500"}`}>
                      {stat.trend === "up" ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {stat.change}
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="xl:col-span-2"
          >
            <Card className="p-5 border-border">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-foreground">آخر التقييمات</h3>
              </div>
              <div className="space-y-3">
                {recentEvaluations.map((ev, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.06 }}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {ev.employee[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{ev.employee}</p>
                      <p className="text-xs text-muted-foreground truncate">{ev.branch}</p>
                    </div>
                    <div className="shrink-0 text-left">
                      <ScoreBadge score={ev.score} />
                      <p className="text-xs text-muted-foreground mt-1 text-center">{ev.time}</p>
                    </div>
                  </motion.div>
                ))}
                {recentEvaluations.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center">لا توجد تقييمات حديثة.</p>
                )}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-5 border-border h-full">
              <h3 className="font-semibold text-foreground mb-5">أداء المعايير (معدل)</h3>
              <div className="space-y-4">
                {performance.map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-semibold text-foreground">{item.value}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ delay: 0.6 + i * 0.15, duration: 0.8, ease: "easeOut" }}
                        className="h-full gradient-brand rounded-full"
                      />
                    </div>
                  </div>
                ))}
                {performance.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center">لا توجد بيانات للأداء.</p>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
