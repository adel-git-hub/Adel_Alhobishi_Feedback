"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/dashboard/Header";
import { Card } from "@/components/ui/card";
import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { deleteEvaluation } from "@/app/actions/admin.actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Star,
  Search,
  Calendar,
  Building2,
  MessageSquare,
  ShieldCheck,
  MoreVertical,
  Trash2,
  Loader2,
  Mail
} from "lucide-react";

type EvaluationType = "CUSTOMER" | "INTERNAL_360";

type Evaluation = {
  id: string;
  employeeName: string;
  branchName: string;
  type: EvaluationType;
  score: number;
  feedback: string | null;
  feedbackCategory?: "SUGGESTION" | "THANKS" | "COMPLAINT" | null;
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  evaluatorName?: string | null;
  date: Date;
};

function ScoreBadge({ score }: { score: number }) {
  const rounded = Math.round(score);
  const colors = {
    1: "bg-red-100 text-red-700",
    2: "bg-orange-100 text-orange-700",
    3: "bg-yellow-100 text-yellow-700",
    4: "bg-blue-100 text-blue-700",
    5: "bg-emerald-100 text-emerald-700",
  };
  return (
    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold w-fit ${colors[rounded as keyof typeof colors] || colors[5]}`}>
      <Star className="w-3.5 h-3.5 fill-current" />
      {score.toFixed(1)}
    </div>
  );
}

export default function EvaluationsClient({ initialEvaluations }: { initialEvaluations: Evaluation[] }) {
  const [filterType, setFilterType] = useState<"ALL" | EvaluationType>("ALL");
  const [search, setSearch] = useState("");
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();

  const isAdmin = session?.user?.role === "ADMIN";

  const handleDelete = (id: string) => {
    if (!isAdmin) return;
    if (confirm("هل أنت متأكد من رغبتك في حذف هذا التقييم؟ لا يمكن التراجع عن هذا الإجراء.")) {
      startTransition(async () => {
        try {
          await deleteEvaluation(id);
        } catch (error) {
          alert("حدث خطأ أثناء محاولة الحذف.");
          console.error(error);
        }
      });
    }
  };

  const filtered = initialEvaluations.filter((e) => {
    const matchType = filterType === "ALL" || e.type === filterType;
    const matchSearch =
      e.employeeName.includes(search) || 
      e.branchName.includes(search) || 
      (e.customerName && e.customerName.includes(search));
    return matchType && matchSearch;
  });

  return (
    <div>
      <Header title="سجل التقييمات" />
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">التقييمات</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              عرض جميع التقييمات للعملاء والتقييم الداخلي
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="ابحث عن موظف، عميل، أو فرع..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-4 pr-10 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex bg-muted rounded-xl p-1 shrink-0 overflow-x-auto">
              {(["ALL", "CUSTOMER", "INTERNAL_360"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    filterType === t
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "ALL" ? "الكل" : t === "CUSTOMER" ? "عملاء" : "داخلي"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Card className="border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 whitespace-nowrap">
                  <th className="text-right font-semibold text-muted-foreground px-4 py-3 min-w-[100px]">التقييم</th>
                  <th className="text-right font-semibold text-muted-foreground px-4 py-3 min-w-[160px]">الموظف المقُيَّم / الفرع</th>
                  <th className="text-right font-semibold text-muted-foreground px-4 py-3 min-w-[160px]">بيانات العميل</th>
                  <th className="text-right font-semibold text-muted-foreground px-4 py-3 min-w-[140px]">النوع</th>
                  <th className="text-right font-semibold text-muted-foreground px-4 py-3 min-w-[200px]">الملاحظات</th>
                  <th className="text-right font-semibold text-muted-foreground px-4 py-3 min-w-[140px]">التاريخ والوقت</th>
                  <th className="text-center font-semibold text-muted-foreground px-4 py-3 min-w-[80px]">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ev, i) => (
                  <motion.tr
                    key={ev.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3 align-top">
                      <ScoreBadge score={ev.score} />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p className="font-semibold text-foreground mb-1 text-blue-600 dark:text-blue-400">
                        {ev.employeeName}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Building2 className="w-3 h-3" />
                        <span className="truncate max-w-[140px]">{ev.branchName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      {ev.type === "CUSTOMER" ? (
                        <div>
                          <p className="font-medium text-foreground">{ev.customerName || "غير محدد"}</p>
                          <p className="text-xs text-muted-foreground mt-0.5" dir="ltr">{ev.customerPhone || "—"}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col gap-2">
                        <span
                          className={`inline-flex w-fit items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                            ev.type === "CUSTOMER"
                              ? "bg-blue-100 text-blue-700 border-blue-200"
                              : "bg-violet-100 text-violet-700 border-violet-200"
                          }`}
                        >
                          {ev.type === "CUSTOMER" ? "تقييم عميل" : "تقييم 360°"}
                        </span>
                        
                        {ev.type === "CUSTOMER" && ev.feedbackCategory && (
                          <span className={`inline-flex w-fit items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            ev.feedbackCategory === "SUGGESTION" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                            ev.feedbackCategory === "THANKS" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                            "bg-red-50 text-red-600 border border-red-100"
                          }`}>
                            {ev.feedbackCategory === "SUGGESTION" ? "مقترح" :
                             ev.feedbackCategory === "THANKS" ? "شكر" : "شكوى"}
                          </span>
                        )}

                        {ev.evaluatorName && (
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            بواسطة: {ev.evaluatorName}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top max-w-[250px]">
                      {ev.feedback ? (
                        <div className="flex gap-2 text-sm text-muted-foreground">
                          <MessageSquare className="w-4 h-4 shrink-0 text-blue-400/70 mt-0.5" />
                          <p className="line-clamp-3 leading-relaxed text-xs">{ev.feedback}</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/40 text-xs">لا يوجد ملاحظات</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col gap-1 text-xs text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>
                            {new Date(ev.date).toLocaleDateString("en-GB", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                            })}
                          </span>
                        </div>
                        <span className="text-[10px] bg-muted/50 w-fit px-2 py-0.5 rounded-full mr-5 font-mono text-muted-foreground">
                          {new Date(ev.date).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-center">
                      <div className="flex justify-center items-center gap-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className={`p-2 rounded-xl transition-colors ${
                              ev.customerEmail
                                ? "text-blue-500 hover:bg-blue-500/10"
                                : "text-muted-foreground/30 cursor-not-allowed"
                            }`}
                            disabled={!ev.customerEmail}
                            title={ev.customerEmail ? "تفاصيل إضافية" : "لا يوجد بريد إلكتروني"}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          {ev.customerEmail && (
                            <DropdownMenuContent align="end" className="w-56 mt-1">
                              <div className="px-3 py-2">
                                <p className="text-xs text-muted-foreground mb-1">البريد الإلكتروني للعميل:</p>
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-blue-500" />
                                  <a href={`mailto:${ev.customerEmail}`} className="text-sm font-medium hover:underline" dir="ltr">
                                    {ev.customerEmail}
                                  </a>
                                </div>
                              </div>
                            </DropdownMenuContent>
                          )}
                        </DropdownMenu>

                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(ev.id)}
                            disabled={isPending}
                            title="حذف التقييم"
                            className="p-2 rounded-xl text-red-400/70 hover:bg-red-500/10 hover:text-red-500 transition-colors disabled:opacity-50"
                          >
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} className="text-center py-8 text-muted-foreground text-sm">
                      لا توجد تقييمات مطابقة لبحثك.
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
