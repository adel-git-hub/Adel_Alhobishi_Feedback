"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/dashboard/Header";
import { Card } from "@/components/ui/card";
import { useState, useTransition } from "react";
import {
  Building2, Plus, Pencil, Trash2, MapPin, Users,
  X, Loader2, CheckCircle2,
} from "lucide-react";
import { saveBranch, deleteBranch } from "@/app/actions/admin.actions";

type Branch = { id: string; name: string; location: string | null; _count: { users: number } };
type ModalMode = "add" | "edit" | "delete" | null;

export default function BranchesClient({ initialBranches }: { initialBranches: Branch[] }) {
  const [modal, setModal] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<Branch | null>(null);
  const [form, setForm] = useState({ name: "", location: "" });
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState("");

  const openAdd = () => {
    setForm({ name: "", location: "" });
    setSelected(null);
    setModal("add");
  };
  const openEdit = (b: Branch) => {
    setForm({ name: b.name, location: b.location || "" });
    setSelected(b);
    setModal("edit");
  };
  const openDelete = (b: Branch) => {
    setSelected(b);
    setModal("delete");
  };
  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setSuccess("");
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    startTransition(async () => {
      try {
        await saveBranch({
          id: selected?.id,
          name: form.name,
          location: form.location
        });
        setSuccess(modal === "add" ? "تم إضافة الفرع بنجاح!" : "تم تحديث الفرع بنجاح!");
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
        await deleteBranch(selected.id);
        closeModal();
      } catch (err) {
        console.error(err);
        alert("فشل الحذف. يرجى المحاولة مرة أخرى.");
      }
    });
  };

  return (
    <div>
      <Header title="إدارة الفروع" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">الفروع</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              إجمالي {initialBranches.length} فروع مسجلة
            </p>
          </div>
          <motion.button
            id="btn-add-branch"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-gold text-brand-950 font-bold shadow-brand border border-gold-400/30"
          >
            <Plus className="w-4 h-4 text-brand-950" />
            إضافة فرع
          </motion.button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {initialBranches.map((branch, i) => (
              <motion.div
                key={branch.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.07 }}
              >
                <Card className="p-5 border-border hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 gradient-gold rounded-xl flex items-center justify-center shadow-sm">
                      <Building2 className="w-5 h-5 text-black" />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        id={`btn-edit-branch-${branch.id}`}
                        onClick={() => openEdit(branch)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/8 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id={`btn-delete-branch-${branch.id}`}
                        onClick={() => openDelete(branch)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-foreground mb-1">{branch.name}</h3>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-3">
                    <MapPin className="w-3 h-3" />
                    {branch.location || "لا يوجد موقع محدد"}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/8 w-fit px-2.5 py-1 rounded-full">
                    <Users className="w-3 h-3" />
                    {branch._count.users} موظف
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {modal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={!isPending ? closeModal : undefined}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed inset-0 flex items-center justify-center z-50 px-4"
            >
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
                      <button onClick={closeModal} disabled={isPending} className="text-muted-foreground hover:text-foreground">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-muted-foreground text-sm mb-6">
                      هل أنت متأكد من حذف فرع{" "}
                      <span className="font-semibold text-foreground">
                        {selected?.name}
                      </span>
                      ؟ لا يمكن التراجع عن هذا الإجراء.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={closeModal}
                        disabled={isPending}
                        className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
                      >
                        إلغاء
                      </button>
                      <button
                        id="btn-confirm-delete-branch"
                        onClick={handleDelete}
                        disabled={isPending}
                        className="flex-1 py-2.5 rounded-xl bg-destructive text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-70"
                      >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        حذف
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-bold text-foreground text-lg">
                        {modal === "add" ? "إضافة فرع جديد" : "تعديل الفرع"}
                      </h3>
                      <button onClick={closeModal} disabled={isPending} className="text-muted-foreground hover:text-foreground">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                          اسم الفرع *
                        </label>
                        <input
                          id="input-branch-name"
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                          disabled={isPending}
                          placeholder="مثال: فرع تعز"
                          className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/40 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                          الموقع
                        </label>
                        <input
                          id="input-branch-location"
                          type="text"
                          value={form.location}
                          onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                          disabled={isPending}
                          placeholder="مثال: تعز - شارع جمال"
                          className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/40 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 disabled:opacity-50"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={closeModal}
                        disabled={isPending}
                        className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
                      >
                        إلغاء
                      </button>
                      <button
                        id="btn-save-branch"
                        onClick={handleSave}
                        disabled={isPending || !form.name.trim()}
                        className="flex-1 py-2.5 rounded-xl gradient-brand text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-brand disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
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
