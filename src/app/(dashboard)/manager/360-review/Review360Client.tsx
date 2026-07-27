"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/dashboard/Header";
import { Card } from "@/components/ui/card";
import { useState, useTransition } from "react";
import {
  Star,
  Users,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { submit360Review } from "@/app/actions/manager.actions";

type Employee = { id: string; name: string; role: string; branchId: string | null };
type Criterion = { id: string; name: string; description: string | null };

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <Star
            className={`w-6 h-6 transition-colors duration-150 ${
              star <= display ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function Review360Client({ employees, criteria }: { employees: Employee[], criteria: Criterion[] }) {
  const { data: session } = useSession();
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  const activeEmployee = employees.find((e) => e.id === selectedEmployee);
  const allRated = criteria.length > 0 && criteria.every((c) => scores[c.id] > 0);

  const handleSubmit = () => {
    if (!activeEmployee || !activeEmployee.branchId) return;
    
    startTransition(async () => {
      try {
        await submit360Review({
          employeeId: activeEmployee.id,
          scores,
          feedback,
        });
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setSelectedEmployee(null);
          setScores({});
          setFeedback("");
        }, 2500);
      } catch (err) {
        console.error(err);
        alert("فشل الإرسال. يرجى المحاولة مرة أخرى.");
      }
    });
  };

  return (
    <div>
      <Header title="التقييم الداخلي 360°" />
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground">تقييم الأداء الداخلي</h2>
            <p className="text-sm text-muted-foreground mt-1">
              أنت تقيّم كمشرف مباشر. تقييماتك تساهم في تطوير مهارات فريقك في فرعك.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-3">
              <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide mb-2">
                اختر الموظف
              </h3>
              {employees.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => {
                    setSelectedEmployee(emp.id);
                    setSuccess(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-right transition-all ${
                    selectedEmployee === emp.id
                      ? "bg-primary/5 border-primary shadow-sm"
                      : "bg-card border-border hover:bg-muted"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    selectedEmployee === emp.id ? "gradient-brand text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    {emp.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{emp.name}</p>
                    <p className="text-xs text-muted-foreground">{emp.role === "MANAGER" ? "مدير" : "موظف"}</p>
                  </div>
                </button>
              ))}
              {employees.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">لا يوجد موظفين مسجلين في فرعك.</p>
              )}
            </div>

            <div className="md:col-span-2">
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full flex items-center justify-center min-h-[300px]"
                  >
                    <Card className="p-8 text-center border-border shadow-sm w-full">
                      <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-foreground mb-2">تم تسجيل التقييم</h3>
                      <p className="text-sm text-muted-foreground">شكراً لمساهمتك في تقييم وتطوير الموظف.</p>
                    </Card>
                  </motion.div>
                ) : selectedEmployee ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Card className="p-6 border-border shadow-sm">
                      <div className="flex items-center gap-3 pb-5 mb-5 border-b border-border">
                        <div className="w-12 h-12 gradient-brand rounded-xl flex items-center justify-center text-white text-lg font-bold">
                          {activeEmployee?.name[0]}
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground text-lg">{activeEmployee?.name}</h3>
                          <p className="text-sm text-muted-foreground">{activeEmployee?.role === "MANAGER" ? "مدير" : "موظف"}</p>
                        </div>
                      </div>

                      <div className="space-y-6 mb-6">
                        {criteria.map((crit) => (
                          <div key={crit.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-sm text-foreground">{crit.name}</p>
                              <p className="text-xs text-muted-foreground">{crit.description}</p>
                            </div>
                            <StarRating
                              value={scores[crit.id] || 0}
                              onChange={(v) => setScores((s) => ({ ...s, [crit.id]: v }))}
                            />
                          </div>
                        ))}
                        {criteria.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center">لا توجد معايير تقييم داخلي متاحة حالياً.</p>
                        )}
                      </div>

                      <div className="mb-6">
                        <label className="block font-semibold text-sm text-foreground mb-2">ملاحظات توجيهية (اختياري)</label>
                        <textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="اكتب ملاحظاتك لتوجيه وتطوير الموظف..."
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                        />
                      </div>

                      <div className="flex justify-end">
                        <motion.button
                          whileHover={allRated ? { scale: 1.02 } : {}}
                          whileTap={allRated ? { scale: 0.98 } : {}}
                          disabled={!allRated || isPending || criteria.length === 0}
                          onClick={handleSubmit}
                          className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                            allRated && criteria.length > 0
                              ? "gradient-brand text-white shadow-brand"
                              : "bg-muted text-muted-foreground cursor-not-allowed"
                          }`}
                        >
                          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                          حفظ التقييم السري
                        </motion.button>
                      </div>
                    </Card>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex items-center justify-center min-h-[300px]"
                  >
                    <Card className="p-8 text-center border-border shadow-sm w-full border-dashed bg-transparent">
                      <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">اختر موظفاً من القائمة الجانبية للبدء بالتقييم</p>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
