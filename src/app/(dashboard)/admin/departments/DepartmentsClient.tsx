"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/dashboard/Header";
import { Card } from "@/components/ui/card";
import { useState, useTransition } from "react";
import {
  Building2, Plus, Pencil, Trash2, Users,
  X, Loader2, CheckCircle2, Shield, Network
} from "lucide-react";
import { createDepartment, updateDepartment, deleteDepartment } from "@/app/actions/department.actions";
import { PublicAccessType } from "@prisma/client";

type Department = { id: string; name: string; branchId: string; accessType: PublicAccessType; branch: { name: string }; _count: { users: number } };
type Branch = { id: string; name: string };
type ModalMode = "add" | "edit" | "delete" | null;

const accessTypeLabels: Record<PublicAccessType, string> = {
  LOBBY_CUSTOMER: "زوار الصالة الخارجية",
  MERCHANT_CUSTOMER: "التجار والشركات",
  INTERNAL_ONLY: "تقييم داخلي فقط",
};

export default function DepartmentsClient({ initialDepartments, branches }: { initialDepartments: Department[], branches: Branch[] }) {
  const [modal, setModal] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<Department | null>(null);
  const [form, setForm] = useState<{name: string; branchId: string; accessType: PublicAccessType}>({ name: "", branchId: branches[0]?.id || "", accessType: "INTERNAL_ONLY" });
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState("");

  const openAdd = () => {
    setForm({ name: "", branchId: branches[0]?.id || "", accessType: "INTERNAL_ONLY" });
    setSelected(null);
    setModal("add");
  };
  const openEdit = (d: Department) => {
    setForm({ name: d.name, branchId: d.branchId, accessType: d.accessType });
    setSelected(d);
    setModal("edit");
  };
  const openDelete = (d: Department) => {
    setSelected(d);
    setModal("delete");
  };
  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setSuccess("");
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.branchId) return;
    startTransition(async () => {
      try {
        if (modal === "add") {
          await createDepartment({ name: form.name, branchId: form.branchId, accessType: form.accessType });
        } else if (selected) {
          await updateDepartment(selected.id, { name: form.name, accessType: form.accessType });
        }
        setSuccess(modal === "add" ? "تم إضافة الإدارة بنجاح!" : "تم تحديث الإدارة بنجاح!");
        setTimeout(() => {
          closeModal();
          window.location.reload();
        }, 1200);
      } catch (err) {
        console.error(err);
        alert("فشل الحفظ. قد لا تملك الصلاحية أو حدث خطأ.");
      }
    });
  };

  const handleDelete = () => {
    if (!selected) return;
    startTransition(async () => {
      try {
        await deleteDepartment(selected.id);
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert("فشل الحذف. يرجى المحاولة مرة أخرى.");
      }
    });
  };

  return (
    <div>
      <Header title="إدارة الأقسام والإدارات" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">الإدارات</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              إجمالي {initialDepartments.length} إدارات مسجلة
            </p>
          </div>
          <motion.button
            id="btn-add-department"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-gold text-brand-950 font-bold shadow-brand border border-gold-400/30"
          >
            <Plus className="w-4 h-4 text-brand-950" />
            إضافة إدارة
          </motion.button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {initialDepartments.map((dept, i) => (
              <motion.div
                key={dept.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.07 }}
              >
                <Card className="p-5 border-border hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 gradient-gold rounded-xl flex items-center justify-center shadow-sm">
                      <Network className="w-5 h-5 text-black" />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(dept)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/8 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openDelete(dept)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-foreground mb-1">{dept.name}</h3>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-3">
                    <Building2 className="w-3 h-3" />
                    الفرع: {dept.branch.name}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/8 w-fit px-2.5 py-1 rounded-full">
                      <Users className="w-3 h-3" />
                      {dept._count.users} موظف
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-medium w-fit px-2.5 py-1 rounded-full ${
                      dept.accessType === "INTERNAL_ONLY" ? "text-gray-500 bg-gray-500/10" : 
                      dept.accessType === "LOBBY_CUSTOMER" ? "text-blue-500 bg-blue-500/10" : 
                      "text-emerald-500 bg-emerald-500/10"
                    }`}>
                      <Shield className="w-3 h-3" />
                      صلاحية التقييم: {accessTypeLabels[dept.accessType]}
                    </div>
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
                      هل أنت متأكد من حذف إدارة{" "}
                      <span className="font-semibold text-foreground">
                        {selected?.name}
                      </span>
                      ؟ 
                    </p>
                    <div className="flex gap-3">
                      <button onClick={closeModal} disabled={isPending} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50">
                        إلغاء
                      </button>
                      <button onClick={handleDelete} disabled={isPending} className="flex-1 py-2.5 rounded-xl bg-destructive text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-70">
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        حذف
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-bold text-foreground text-lg">
                        {modal === "add" ? "إضافة إدارة جديدة" : "تعديل الإدارة"}
                      </h3>
                      <button onClick={closeModal} disabled={isPending} className="text-muted-foreground hover:text-foreground">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">اسم الإدارة *</label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                          disabled={isPending}
                          placeholder="مثال: خدمة العملاء"
                          className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/40 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 disabled:opacity-50"
                        />
                      </div>
                      
                      {modal === "add" && (
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">الفرع *</label>
                          <select
                            value={form.branchId}
                            onChange={(e) => setForm((p) => ({ ...p, branchId: e.target.value }))}
                            disabled={isPending}
                            className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/40 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                          >
                            {branches.map(b => (
                              <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">صلاحية التقييم *</label>
                        <select
                          value={form.accessType}
                          onChange={(e) => setForm((p) => ({ ...p, accessType: e.target.value as PublicAccessType }))}
                          disabled={isPending}
                          className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/40 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                        >
                          <option value="INTERNAL_ONLY">تقييم داخلي فقط (للموظفين)</option>
                          <option value="LOBBY_CUSTOMER">زوار الصالة الخارجية (عامة)</option>
                          <option value="MERCHANT_CUSTOMER">التجار والشركات (رابط مخصص)</option>
                        </select>
                        <p className="text-xs text-muted-foreground mt-2">
                          حدد من يحق له تقييم موظفي هذه الإدارة من خارج النظام.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={closeModal} disabled={isPending} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50">
                        إلغاء
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isPending || !form.name.trim() || !form.branchId}
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
