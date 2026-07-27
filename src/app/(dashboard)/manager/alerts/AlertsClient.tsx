"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/dashboard/Header";
import { Card } from "@/components/ui/card";
import { useState, useTransition } from "react";
import {
  AlertTriangle,
  Clock,
  MessageSquare,
  CheckCircle2,
  Trash2,
  Phone
} from "lucide-react";
import { resolveAlert } from "@/app/actions/manager.actions";

type Alert = {
  id: string;
  employeeName: string;
  score: number;
  time: string;
  feedback: string | null;
  status: "NEW" | "RESOLVED";
};

export default function AlertsClient({ initialAlerts }: { initialAlerts: Alert[] }) {
  const [isPending, startTransition] = useTransition();

  const handleResolve = (id: string) => {
    startTransition(async () => {
      try {
        await resolveAlert(id);
      } catch (err) {
        console.error(err);
        alert("فشل تحديث الحالة. يرجى المحاولة مرة أخرى.");
      }
    });
  };

  const newAlerts = initialAlerts.filter((a) => a.status === "NEW");
  const resolvedAlerts = initialAlerts.filter((a) => a.status === "RESOLVED");

  return (
    <div>
      <Header title="تنبيهات التقييمات الحرجة" />
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">التنبيهات العاجلة</h2>
            <p className="text-sm text-muted-foreground mt-1">
              التقييمات التي تقل عن 3 نجوم وتتطلب تدخلاً فورياً من الإدارة.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-100 text-red-700 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            {newAlerts.length} تنبيهات جديدة
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              تتطلب إجراءً (قيد الانتظار)
            </h3>
            <div className="space-y-4">
              <AnimatePresence>
                {newAlerts.length === 0 && (
                  <p className="text-sm text-muted-foreground py-4">لا توجد تنبيهات جديدة.</p>
                )}
                {newAlerts.map((alert, i) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="p-5 border-red-200 bg-red-50/50 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-1.5 h-full bg-red-500" />
                      
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current" />
                              {alert.score.toFixed(1)}
                            </span>
                            <span className="font-bold text-foreground">{alert.employeeName}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {alert.time}
                            </span>
                          </div>
                          
                          {alert.feedback ? (
                            <div className="flex gap-2 text-sm text-red-900/80 mb-3 bg-red-100/50 p-3 rounded-lg border border-red-200/50">
                              <MessageSquare className="w-4 h-4 shrink-0 mt-0.5" />
                              <p>{alert.feedback}</p>
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground mb-3">لا توجد ملاحظات مرفقة</p>
                          )}
                        </div>

                        <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                          <button
                            onClick={() => handleResolve(alert.id)}
                            disabled={isPending}
                            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            تحديد كمنجز
                          </button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>

          {resolvedAlerts.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> تم التعامل معها
              </h3>
              <div className="space-y-3">
                {resolvedAlerts.map((alert) => (
                  <Card key={alert.id} className="p-4 border-border bg-muted/20 opacity-70 hover:opacity-100 transition-opacity">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="bg-muted-foreground/20 text-muted-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                          ★ {alert.score.toFixed(1)}
                        </span>
                        <span className="font-semibold text-foreground text-sm">{alert.employeeName}</span>
                        <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px] sm:max-w-md">
                          "{alert.feedback || "بدون ملاحظات"}"
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// Temporary Star icon mock for the file
const Star = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
  </svg>
)
