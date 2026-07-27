"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/dashboard/Header";
import { Card } from "@/components/ui/card";
import { useState, useTransition } from "react";
import {
  ClipboardList, Plus, Pencil, Trash2, X,
  Loader2, CheckCircle2, ToggleLeft, ToggleRight,
} from "lucide-react";
import { saveCriterion, toggleCriterionActive, deleteCriterion } from "@/app/actions/admin.actions";

type CriteriaType = "CUSTOMER" | "INTERNAL_360";
type Criterion = {
  id: string;
  name: string;
  description: string | null;
  type: CriteriaType;
  isActive: boolean;
};

type ModalMode = "add" | "edit" | "delete" | null;
type FormState = { name: string; description: string; type: CriteriaType };

export default function CriteriaClient({ initialCriteria }: { initialCriteria: Criterion[] }) {
  const [modal, setModal] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<Criterion | null>(null);
  const [form, setForm] = useState<FormState>({ name: "", description: "", type: "CUSTOMER" });
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState<CriteriaType | "ALL">("ALL");

  const filtered = activeTab === "ALL" ? initialCriteria : initialCriteria.filter((c) => c.type === activeTab);

  const openAdd = () => {
    setForm({ name: "", description: "", type: "CUSTOMER" });
    setSelected(null);
    setModal("add");
  };
  const openEdit = (c: Criterion) => {
    setForm({ name: c.name, description: c.description || "", type: c.type });
    setSelected(c);
    setModal("edit");
  };
  const openDelete = (c: Criterion) => { setSelected(c); setModal("delete"); };
  const closeModal = () => { setModal(null); setSelected(null); setSuccess(""); };

  const handleToggle = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      try {
        await toggleCriterionActive(id, !currentStatus);
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    startTransition(async () => {
      try {
        await saveCriterion({
          id: selected?.id,
          name: form.name,
          description: form.description,
          type: form.type
        });
        setSuccess(modal === "add" ? "تم إضافة المعيار بنجاح!" : "تم تحديث المعيار بنجاح!");
        setTimeout(closeModal, 1200);
      } catch (err) {
        console.error(err);
        alert("فشل الحفظ. يرجى المحاولة مرة أخرى.");
      }
    });
  };

  const handleDelete = () => {
    if (!selected) return;
    startTransition(async () => {
      try {
        await deleteCriterion(selected.id);
        closeModal();
      } catch (err) {
        console.error(err);
        alert("فشل الحذف. يرجى المحاولة مرة أخرى.");
      }
    });
  };

  const typeLabel: Record<CriteriaType, string> = {
    CUSTOMER: "تقييم العملاء",
    INTERNAL_360: "تقييم داخلي 360°",
  };

  const typeColor: Record<CriteriaType, string> = {
    CUSTOMER: "bg-blue-100 text-blue-700 border-blue-200",
    INTERNAL_360: "bg-violet-100 text-violet-700 border-violet-200",
  };

  return (
    <div>
      <Header title="معايير التقييم" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">معايير التقييم</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {initialCriteria.filter((c) => c.isActive).length} معيار نشط من أصل {initialCriteria.length}
            </p>
          </div>
          <motion.button id="btn-add-criterion" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-gold text-brand-950 font-bold shadow-brand border border-gold-400/30">
            <Plus className="w-4 h-4 text-brand-950" /> إضافة معيار
          </motion.button>
        </div>

        <div className="flex gap-2 mb-5">
          {(["ALL", "CUSTOMER", "INTERNAL_360"] as const).map((t) => (
            <button key={t} id={`tab-${t}`} onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${activeTab === t ? "gradient-gold text-brand-950 border-gold-400/30 shadow-sm" : "border-border text-muted-foreground hover:bg-muted"}`}>
              {t === "ALL" ? "الكل" : typeLabel[t]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((criterion, i) => (
              <motion.div key={criterion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.07 }}>
                <Card className={`p-5 border-border hover:shadow-md transition-all duration-200 ${!criterion.isActive ? "opacity-50" : ""}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 gradient-gold rounded-xl flex items-center justify-center shadow-sm">
                      <ClipboardList className="w-5 h-5 text-black" />
                    </div>
                    <div className="flex items-center gap-1">
                      <button id={`btn-toggle-${criterion.id}`} onClick={() => handleToggle(criterion.id, criterion.isActive)} disabled={isPending}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
                        {criterion.isActive
                          ? <ToggleRight className="w-5 h-5 text-emerald-500" />
                          : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                      </button>
                      <button id={`btn-edit-crit-${criterion.id}`} onClick={() => openEdit(criterion)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/8 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button id={`btn-delete-crit-${criterion.id}`} onClick={() => openDelete(criterion)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-foreground mb-1">{criterion.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{criterion.description}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${typeColor[criterion.type]}`}>
                    {typeLabel[criterion.type]}
                  </span>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {modal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={!isPending ? closeModal : undefined} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed inset-0 flex items-center justify-center z-50 px-4">
              <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
                {success ? (
                  <div className="text-center py-4">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                    <p className="font-semibold text-foreground">{success}</p>
                  </div>
                ) : modal === "delete" ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-foreground text-lg">تأكيد الحذف</h3>
                      <button onClick={closeModal} disabled={isPending}><X className="w-5 h-5 text-muted-foreground" /></button>
                    </div>
                    <p className="text-muted-foreground text-sm mb-6">
                      هل أنت متأكد من حذف معيار <span className="font-semibold text-foreground">{selected?.name}</span>؟
                    </p>
                    <div className="flex gap-3">
                      <button onClick={closeModal} disabled={isPending} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-50">إلغاء</button>
                      <button id="btn-confirm-delete-crit" onClick={handleDelete} disabled={isPending}
                        className="flex-1 py-2.5 rounded-xl bg-destructive text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70">
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} حذف
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-bold text-foreground text-lg">
                        {modal === "add" ? "إضافة معيار جديد" : "تعديل المعيار"}
                      </h3>
                      <button onClick={closeModal} disabled={isPending}><X className="w-5 h-5 text-muted-foreground" /></button>
                    </div>
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">اسم المعيار *</label>
                        <input id="input-crit-name" type="text" value={form.name}
                          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                          disabled={isPending}
                          placeholder="مثال: سرعة الخدمة"
                          className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/40 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">الوصف</label>
                        <textarea id="input-crit-desc" value={form.description} rows={3}
                          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                          disabled={isPending}
                          placeholder="وصف موجز لهذا المعيار..."
                          className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/40 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none disabled:opacity-50" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">نوع التقييم</label>
                        <div className="flex gap-2">
                          {(["CUSTOMER", "INTERNAL_360"] as const).map((t) => (
                            <button key={t} type="button"
                              disabled={isPending}
                              onClick={() => setForm((p) => ({ ...p, type: t }))}
                              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all ${form.type === t ? "gradient-brand text-white border-blue-400/30" : "border-border text-muted-foreground hover:bg-muted"} disabled:opacity-50`}>
                              {typeLabel[t]}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={closeModal} disabled={isPending} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-50">إلغاء</button>
                      <button id="btn-save-criterion" onClick={handleSave} disabled={isPending || !form.name.trim()}
                        className="flex-1 py-2.5 rounded-xl gradient-brand text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-brand disabled:opacity-60 disabled:cursor-not-allowed">
                        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        {modal === "add" ? "إضافة" : "حفظ"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
