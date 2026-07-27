"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/dashboard/Header";
import { Card } from "@/components/ui/card";
import { Star, Calendar, MessageSquare, Target } from "lucide-react";

type EmployeeEvaluation = {
  id: string;
  type: string;
  score: number;
  feedback: string | null;
  feedbackCategory: "SUGGESTION" | "THANKS" | "COMPLAINT" | null;
  date: Date;
};

export default function EmployeeDashboardClient({ 
  evaluations, 
  stats 
}: { 
  evaluations: EmployeeEvaluation[];
  stats: { totalEvals: number; avgScore: number };
}) {
  return (
    <div>
      <Header title="لوحة تحكم الموظف" />
      
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-dark rounded-3xl p-6 relative overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/20 blur-3xl rounded-full" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-blue-200/60 text-sm font-medium mb-1">إجمالي التقييمات</p>
                <h3 className="text-3xl font-bold text-white">{stats.totalEvals}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-dark rounded-3xl p-6 relative overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-500/20 blur-3xl rounded-full" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-blue-200/60 text-sm font-medium mb-1">متوسط التقييم</p>
                <div className="flex items-end gap-2">
                  <h3 className="text-3xl font-bold text-white">{stats.avgScore.toFixed(1)}</h3>
                  <span className="text-blue-200/50 text-sm mb-1.5">/ 5</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 border border-yellow-400/20 flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </motion.div>
        </div>

        <h2 className="text-xl font-bold text-foreground mb-4">أحدث التقييمات (بدون تفاصيل العميل)</h2>
        
        <Card className="border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-right text-xs font-semibold text-muted-foreground px-5 py-4">التقييم</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-5 py-4">النوع</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-5 py-4">الملاحظات</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-5 py-4">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {evaluations.map((ev, i) => (
                  <motion.tr
                    key={ev.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-4 align-top">
                      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold w-fit ${
                        Math.round(ev.score) >= 4 ? "bg-emerald-100 text-emerald-700" :
                        Math.round(ev.score) === 3 ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {ev.score.toFixed(1)}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="flex flex-col gap-2">
                        <span className="inline-flex w-fit items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-blue-100 text-blue-700 border-blue-200">
                          تقييم عميل
                        </span>
                        
                        {ev.feedbackCategory && (
                          <span className={`inline-flex w-fit items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            ev.feedbackCategory === "SUGGESTION" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                            ev.feedbackCategory === "THANKS" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                            "bg-red-50 text-red-600 border border-red-100"
                          }`}>
                            {ev.feedbackCategory === "SUGGESTION" ? "مقترح" :
                             ev.feedbackCategory === "THANKS" ? "شكر" : "شكوى"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top max-w-sm">
                      {ev.feedback ? (
                        <div className="flex gap-2 text-sm text-muted-foreground">
                          <MessageSquare className="w-4 h-4 shrink-0 text-blue-400/70 mt-0.5" />
                          <p className="leading-relaxed">{ev.feedback}</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/40 text-xs">لا يوجد ملاحظات</span>
                      )}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(ev.date).toLocaleDateString("ar-SA", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {evaluations.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-muted-foreground text-sm">
                      لا توجد تقييمات حالياً.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
