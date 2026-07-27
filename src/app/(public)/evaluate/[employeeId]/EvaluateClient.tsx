"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Star,
  ChevronLeft,
  CheckCircle2,
  Loader2,
  Building2,
  MessageSquare,
  Send,
  AlertTriangle,
  Copy,
  Check,
  X,
  Phone,
} from "lucide-react";
import { submitCustomerEvaluation } from "@/app/actions/public.actions";

type Employee = { id: string; name: string; role: string; branch: { id: string; name: string } };
type Criterion = { id: string; name: string; description: string | null };

function StarRating({
  value,
  onChange,
  criteriaId,
}: {
  value: number;
  onChange: (v: number) => void;
  criteriaId: string;
}) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          id={`star-${criteriaId}-${star}`}
          type="button"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="focus:outline-none"
        >
          <motion.div
            animate={{
              scale: star <= display ? [1, 1.3, 1] : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            <Star
              className={`w-9 h-9 transition-colors duration-150 ${
                star <= display
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-white/20"
              }`}
            />
          </motion.div>
        </motion.button>
      ))}
    </div>
  );
}

const ratingLabels: Record<number, { label: string; color: string }> = {
  0: { label: "اختر تقييمك", color: "text-white/40" },
  1: { label: "سيئ جداً", color: "text-red-400" },
  2: { label: "سيئ", color: "text-orange-400" },
  3: { label: "متوسط", color: "text-yellow-400" },
  4: { label: "جيد", color: "text-gold-300" },
  5: { label: "ممتاز!", color: "text-emerald-400" },
};

export default function EvaluateClient({ employee, criteria }: { employee: Employee; criteria: Criterion[] }) {
  const router = useRouter();

  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState("");
  const [feedbackCategory, setFeedbackCategory] = useState<"SUGGESTION" | "THANKS" | "COMPLAINT" | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [phoneError, setPhoneError] = useState("");
  
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);
  
  const [step, setStep] = useState<"type" | "rating" | "feedback" | "success">("type");
  const [isPending, startTransition] = useTransition();

  const allRated = criteria.length > 0 && criteria.every((c) => scores[c.id] > 0);
  const avgScore =
    Object.values(scores).length > 0
      ? Object.values(scores).reduce((a, b) => a + b, 0) /
        Object.values(scores).length
      : 0;

  const validatePhone = (phone: string) => {
    if (!phone) return "رقم الهاتف مطلوب";
    if (!/^7\d{8}$/.test(phone)) return "رقم الهاتف يجب أن يتكون من 9 أرقام ويبدأ بـ 7";
    return "";
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 9);
    setCustomerPhone(val);
    if (val.length === 9) {
      setPhoneError(validatePhone(val));
    } else if (phoneError) {
      setPhoneError("");
    }
  };

  const handleCopyError = () => {
    navigator.clipboard.writeText(errorMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = () => {
    const pError = validatePhone(customerPhone);
    if (pError) {
      setPhoneError(pError);
      return;
    }
    if (customerName.trim().length < 2) {
      setErrorMessage("الرجاء إدخال اسمك بشكل صحيح");
      return;
    }

    startTransition(async () => {
      try {
        await submitCustomerEvaluation({
          employeeId: employee.id,
          branchId: employee.branch.id,
          scores,
          feedback,
          feedbackCategory: feedbackCategory!,
          customerName,
          customerPhone,
          customerEmail,
        });
        setStep("success");
      } catch (err: any) {
        console.error(err);
        setErrorMessage(err.message || "فشل إرسال التقييم. يرجى المحاولة مرة أخرى.");
      }
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 gradient-brand" />
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <img src="/globe.png" alt="Globe" className="w-[120%] max-w-4xl object-contain -rotate-12 blur-[2px]" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between px-5 pt-6 pb-4"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-blue-200/70 hover:text-white transition-colors text-sm"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
            العودة
          </button>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-300/60" />
            <span className="text-blue-200/60 text-xs">
              {employee.branch.name}
            </span>
          </div>
        </motion.div>

        <div className="flex-1 flex items-start justify-center px-4 pb-12 pt-2">
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait">

              {step === "type" && (
                <motion.div
                  key="type"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="glass-dark rounded-3xl p-6 mb-4 text-center">
                    <div className="w-16 h-16 gradient-brand rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3 shadow-brand">
                      <MessageSquare className="w-8 h-8" />
                    </div>
                    <h1 className="text-white text-xl font-bold mb-2">
                      ما هو نوع تقييمك؟
                    </h1>
                    <p className="text-white/60 text-sm mb-6">
                      نحن نهتم برأيك، يرجى تحديد نوع الملاحظة التي تود تقديمها.
                    </p>

                    <div className="space-y-3">
                      {[
                        { id: "SUGGESTION", label: "مقترح", icon: "💡", color: "hover:bg-gold-500/20 hover:border-gold-400/30" },
                        { id: "THANKS", label: "شكر وثناء", icon: "⭐", color: "hover:bg-emerald-500/20 hover:border-emerald-400/30" },
                        { id: "COMPLAINT", label: "شكوى", icon: "⚠️", color: "hover:bg-red-500/20 hover:border-red-400/30" },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            setFeedbackCategory(t.id as any);
                            setStep("rating");
                          }}
                          className={`w-full flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-white/5 transition-all text-right ${t.color}`}
                        >
                          <span className="text-2xl">{t.icon}</span>
                          <span className="text-white font-semibold flex-1">{t.label}</span>
                          <ChevronLeft className="w-5 h-5 text-white/50" />
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === "rating" && (
                <motion.div
                  key="rating"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="glass-dark rounded-3xl p-6 mb-4 text-center">
                    <div className="w-16 h-16 gradient-gold rounded-2xl flex items-center justify-center text-black text-3xl font-extrabold mx-auto mb-3 shadow-brand">
                      {employee.name[0]}
                    </div>
                    <h1 className="text-white text-xl font-bold mb-0.5">
                      {employee.name}
                    </h1>
                    <p className="text-white/60 text-sm">
                      {employee.role === "MANAGER" ? "مدير الفرع" : "موظف"}
                    </p>
                    <div className="mt-3 h-px bg-gradient-to-r from-transparent via-gold-400/30 to-transparent" />
                    <p className="mt-3 text-white/50 text-xs">
                      قيّم تجربتك مع هذا الموظف
                    </p>
                  </div>

                  <div className="space-y-3 mb-4">
                    {criteria.map((criterion, i) => {
                      const score = scores[criterion.id] ?? 0;
                      const ratingInfo = ratingLabels[score];
                      return (
                        <motion.div
                          key={criterion.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + i * 0.08 }}
                          className="glass-dark rounded-2xl p-5"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-white font-semibold text-sm">
                                {criterion.name}
                              </p>
                              <p className="text-blue-200/40 text-xs mt-0.5">
                                {criterion.description}
                              </p>
                            </div>
                            <motion.span
                              key={score}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`text-xs font-semibold ${ratingInfo.color}`}
                            >
                              {ratingInfo.label}
                            </motion.span>
                          </div>
                          <StarRating
                            value={score}
                            onChange={(v) =>
                              setScores((prev) => ({
                                ...prev,
                                [criterion.id]: v,
                              }))
                            }
                            criteriaId={criterion.id}
                          />
                        </motion.div>
                      );
                    })}
                    {criteria.length === 0 && (
                      <p className="text-center text-blue-200/50 text-sm p-4">لا توجد معايير تقييم حالياً.</p>
                    )}
                  </div>

                  {avgScore > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass-dark rounded-2xl p-4 mb-4 flex items-center justify-between"
                    >
                      <span className="text-blue-200/60 text-sm">متوسط تقييمك</span>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-white font-bold text-lg">{avgScore.toFixed(1)}</span>
                        <span className="text-blue-200/40 text-sm">/ 5</span>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep("type")}
                      className="flex-1 py-4 rounded-2xl border border-white/15 text-white/60 text-sm font-medium hover:bg-white/5 transition-colors"
                    >
                      رجوع
                    </button>
                    <motion.button
                      id="btn-next-feedback"
                      disabled={!allRated || criteria.length === 0}
                      whileHover={allRated ? { scale: 1.02 } : {}}
                      whileTap={allRated ? { scale: 0.98 } : {}}
                      onClick={() => setStep("feedback")}
                      className={`flex-[2] py-4 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                        allRated
                          ? "gradient-gold shadow-brand text-brand-950 border border-gold-400/30"
                          : "bg-white/5 text-white/30 cursor-not-allowed border border-white/5"
                      }`}
                    >
                      التالي
                      <ChevronLeft className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {step === "feedback" && (
                <motion.div
                  key="feedback"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="glass-dark rounded-3xl p-6 mb-4">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-white font-bold text-lg">البيانات الشخصية</h2>
                        <p className="text-blue-200/50 text-xs">يرجى إدخال تفاصيلك لاستكمال التقييم</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-white text-sm font-medium mb-1.5">اسم العميل <span className="text-red-400">*</span></label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="الاسم الثلاثي"
                          className="w-full px-4 py-3 rounded-xl bg-white/8 border border-white/10 text-white placeholder:text-blue-200/30 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-white text-sm font-medium mb-1.5">رقم الهاتف <span className="text-red-400">*</span></label>
                        <input
                          type="tel"
                          dir="ltr"
                          value={customerPhone}
                          onChange={handlePhoneChange}
                          placeholder="7XXXXXXXX"
                          className="w-full px-4 py-3 rounded-xl bg-white/8 border border-white/10 text-white placeholder:text-blue-200/30 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-sm text-right"
                        />
                        {phoneError && (
                          <p className="text-red-400 text-xs mt-1.5">{phoneError}</p>
                        )}
                        <p className="text-blue-200/40 text-xs mt-1.5">يجب أن يتكون من 9 أرقام ويبدأ بالرقم 7</p>
                      </div>

                      <div>
                        <label className="block text-white text-sm font-medium mb-1.5">البريد الإلكتروني (اختياري)</label>
                        <input
                          type="email"
                          dir="ltr"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="example@email.com"
                          className="w-full px-4 py-3 rounded-xl bg-white/8 border border-white/10 text-white placeholder:text-blue-200/30 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-sm text-right"
                        />
                      </div>

                      <div className="pt-2">
                        <label className="block text-white text-sm font-medium mb-1.5">ملاحظات إضافية (اختياري)</label>
                        <textarea
                          id="feedback-textarea"
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="شاركنا تفاصيل أكثر حول تقييمك..."
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl bg-white/8 border border-white/10 text-white placeholder:text-blue-200/30 focus:outline-none focus:ring-2 focus:ring-blue-400/50 resize-none text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep("rating")}
                      className="flex-1 py-4 rounded-2xl border border-white/15 text-blue-200/60 text-sm font-medium hover:bg-white/5 transition-colors"
                    >
                      رجوع
                    </button>
                    <motion.button
                      id="btn-submit-evaluation"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmit}
                      disabled={isPending || !customerName || customerPhone.length !== 9 || !!phoneError}
                      className="flex-[2] py-4 rounded-2xl gradient-gold shadow-brand text-brand-950 font-bold text-sm border border-gold-400/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-brand-950" />
                          جارٍ الإرسال...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 text-brand-950" />
                          إرسال التقييم
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {step === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="text-center"
                >
                  <div className="glass-dark rounded-3xl p-10">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                      className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400/40 flex items-center justify-center mx-auto mb-6"
                    >
                      <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    </motion.div>

                    <motion.h2
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-white text-2xl font-bold mb-2"
                    >
                      شكراً لك!
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-blue-200/60 text-sm mb-8"
                    >
                      تم إرسال تقييمك بنجاح. رأيك يهمنا ويساعدنا على تقديم خدمة أفضل.
                    </motion.p>

                    <motion.button
                      id="btn-back-home"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push("/")}
                      className="w-full py-4 rounded-2xl gradient-gold shadow-brand text-brand-950 font-bold text-sm border border-gold-400/30"
                    >
                      العودة إلى الرئيسية
                    </motion.button>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="mt-6 pt-5 border-t border-white/10 text-center"
                    >
                      <p className="text-gold-400 text-xs font-bold mb-1">
                        لوصلك بأحد موظفي خدمة العملاء
                      </p>
                      <p className="text-white/70 text-xs mb-3 font-medium">
                        يرجى الاتصال على الأرقام التالية:
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs font-semibold" dir="ltr">
                        <a
                          href="tel:04407777"
                          className="p-2.5 rounded-xl bg-white/8 border border-white/12 text-gold-300 hover:text-white hover:bg-white/15 hover:border-gold-400/50 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Phone className="w-3.5 h-3.5 text-gold-400" />
                          04407777
                        </a>
                        <a
                          href="tel:774302030"
                          className="p-2.5 rounded-xl bg-white/8 border border-white/12 text-gold-300 hover:text-white hover:bg-white/15 hover:border-gold-400/50 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Phone className="w-3.5 h-3.5 text-gold-400" />
                          774302030
                        </a>
                        <a
                          href="tel:777866999"
                          className="p-2.5 rounded-xl bg-white/8 border border-white/12 text-gold-300 hover:text-white hover:bg-white/15 hover:border-gold-400/50 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Phone className="w-3.5 h-3.5 text-gold-400" />
                          777866999
                        </a>
                        <a
                          href="tel:775302030"
                          className="p-2.5 rounded-xl bg-white/8 border border-white/12 text-gold-300 hover:text-white hover:bg-white/15 hover:border-gold-400/50 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Phone className="w-3.5 h-3.5 text-gold-400" />
                          775302030
                        </a>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="text-center text-white/50 text-xs font-medium space-y-1 mt-6">
              <p>© 2026 شركة عادل الحبيشي للصرافة والحوالات المالية</p>
              <p className="text-gold-400 font-semibold">تصميم وتطوير : م عبدالرحمن غلاب 2026 ©</p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {errorMessage && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setErrorMessage("")}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed inset-0 flex items-center justify-center z-50 px-4"
            >
              <div className="bg-slate-950/90 border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative backdrop-blur-lg">
                <button
                  onClick={() => setErrorMessage("")}
                  className="absolute left-4 top-4 p-1.5 rounded-lg text-blue-200/60 hover:bg-white/5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="text-center py-2">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2">تنبيه</h3>
                  <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl text-right mb-4 max-h-[200px] overflow-y-auto">
                    <p className="text-sm font-medium text-blue-100 whitespace-pre-wrap select-text leading-relaxed">
                      {errorMessage}
                    </p>
                  </div>
                  <div className="flex gap-2.5">
                    <button
                      onClick={handleCopyError}
                      className="flex-1 py-3 rounded-xl border border-white/10 text-sm font-medium text-blue-200 hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          تم النسخ
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          نسخ الخطأ
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setErrorMessage("")}
                      className="flex-1 py-3 rounded-xl gradient-brand text-white text-sm font-bold shadow-brand border border-blue-400/30"
                    >
                      إغلاق
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
