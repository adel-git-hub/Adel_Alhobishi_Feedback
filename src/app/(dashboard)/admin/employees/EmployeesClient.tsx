"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/dashboard/Header";
import { Card } from "@/components/ui/card";
import { useState, useTransition } from "react";
import {
  Users, Plus, Pencil, Trash2, X, Loader2,
  CheckCircle2, Building2, Mail, ShieldCheck,
} from "lucide-react";
import { saveEmployee, deleteEmployee } from "@/app/actions/admin.actions";

type Role = "ADMIN" | "MANAGER" | "DEPARTMENT_MANAGER" | "EMPLOYEE";
type Employee = { id: string; name: string; email: string; role: Role; isActive: boolean; branch: { name: string } | null; branchId: string | null; department?: { name: string } | null; departmentId?: string | null };
type Branch = { id: string; name: string };
type Department = { id: string; name: string; branchId: string };

const roleLabels: Record<Role, { label: string; class: string }> = {
  ADMIN: { label: "مدير نظام", class: "bg-violet-100 text-violet-700 border-violet-200" },
  MANAGER: { label: "مدير فرع", class: "bg-blue-100 text-blue-700 border-blue-200" },
  DEPARTMENT_MANAGER: { label: "مدير إدارة", class: "bg-teal-100 text-teal-700 border-teal-200" },
  EMPLOYEE: { label: "موظف", class: "bg-slate-100 text-slate-700 border-slate-200" },
};

type ModalMode = "add" | "edit" | "delete" | null;
type FormState = { name: string; email: string; role: Role; branchId: string; departmentId: string; password?: string };

export default function EmployeesClient({ initialEmployees, branches, departments }: { initialEmployees: Employee[], branches: Branch[], departments: Department[] }) {
  const [modal, setModal] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [form, setForm] = useState<FormState>({ name: "", email: "", role: "EMPLOYEE", branchId: branches[0]?.id || "", departmentId: "", password: "" });
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState<Role | "ALL">("ALL");

  const filtered = filter === "ALL" ? initialEmployees : initialEmployees.filter((e) => e.role === filter);

  const openAdd = () => {
    setForm({ name: "", email: "", role: "EMPLOYEE", branchId: branches[0]?.id || "", departmentId: "", password: "" });
    setSelected(null);
    setModal("add");
  };
  const openEdit = (e: Employee) => {
    setForm({ name: e.name, email: e.email, role: e.role, branchId: e.branchId || branches[0]?.id || "", departmentId: e.departmentId || "", password: "" });
    setSelected(e);
    setModal("edit");
  };
  const openDelete = (e: Employee) => { setSelected(e); setModal("delete"); };
  const closeModal = () => { setModal(null); setSelected(null); setSuccess(""); };

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) return;
    startTransition(async () => {
      try {
        await saveEmployee({
          id: selected?.id,
          name: form.name,
          email: form.email,
          role: form.role,
          branchId: form.branchId,
          departmentId: form.departmentId || undefined,
          password: form.password || undefined
        });
        setSuccess(modal === "add" ? "تم إضافة الموظف بنجاح!" : "تم تحديث بيانات الموظف!");
        setTimeout(closeModal, 1200);
      } catch (err: any) {
        console.error(err);
        const msg = err?.message || "";
        // إذا كان الخطأ بسبب بريد إلكتروني مكرر ولا يتعلق بتغيير كلمة مرور مدير الإدارة
        if (msg.includes("Unique constraint") && !(form.role === "ADMIN" && form.password)) {
          alert("❌ البريد الإلكتروني مستخدم مسبقاً، يرجى اختيار بريد إلكتروني مختلف.");
        } else {
          alert("❌ فشل الحفظ. يرجى التحقق من البيانات والمحاولة مرة أخرى.");
        }
      }
    });
  };

  const handleDelete = () => {
    if (!selected) return;
    startTransition(async () => {
      try {
        await deleteEmployee(selected.id);
        closeModal();
      } catch (err) {
        console.error(err);
        alert("فشل الحذف. يرجى المحاولة مرة أخرى.");
      }
    });
  };

  return (
    <div>
      <Header title="إدارة الموظفين" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">الموظفون</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{initialEmployees.length} موظف مسجل</p>
          </div>
          <motion.button id="btn-add-employee" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-gold text-brand-950 font-bold shadow-brand border border-gold-400/30">
            <Plus className="w-4 h-4 text-brand-950" /> إضافة موظف
          </motion.button>
        </div>

        <div className="flex gap-2 mb-5 flex-wrap">
          {(["ALL", "ADMIN", "MANAGER", "DEPARTMENT_MANAGER", "EMPLOYEE"] as const).map((r) => (
            <button key={r}
              id={`filter-${r}`}
              onClick={() => setFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${filter === r ? "gradient-gold text-brand-950 border-gold-400/30 shadow-sm" : "border-border text-muted-foreground hover:bg-muted"}`}>
              {r === "ALL" ? "الكل" : roleLabels[r].label}
            </button>
          ))}
        </div>

        <Card className="border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">الموظف</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">الدور</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">الفرع / الإدارة</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">الحالة</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((emp, i) => (
                    <motion.tr key={emp.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 gradient-gold rounded-lg flex items-center justify-center text-black text-xs font-extrabold shrink-0">
                            {emp.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{emp.name}</p>
                            <p className="text-xs text-muted-foreground">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${roleLabels[emp.role].class}`}>
                          {emp.role === "ADMIN" && <ShieldCheck className="w-3 h-3" />}
                          {roleLabels[emp.role].label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Building2 className="w-3 h-3" />{emp.branch?.name || "الإدارة العليا"}
                          </div>
                          {emp.department && (
                            <div className="flex items-center gap-1.5 text-xs text-blue-600">
                              <ShieldCheck className="w-3 h-3" />{emp.department.name}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${emp.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${emp.isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                          {emp.isActive ? "نشط" : "معطّل"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button id={`btn-edit-emp-${emp.id}`} onClick={() => openEdit(emp)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/8 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button id={`btn-delete-emp-${emp.id}`} onClick={() => openDelete(emp)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-sm text-muted-foreground">لا يوجد موظفين مسجلين</td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </Card>
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
                      هل أنت متأكد من حذف <span className="font-semibold text-foreground">{selected?.name}</span>؟
                    </p>
                    <div className="flex gap-3">
                      <button onClick={closeModal} disabled={isPending} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-50">إلغاء</button>
                      <button id="btn-confirm-delete-emp" onClick={handleDelete} disabled={isPending}
                        className="flex-1 py-2.5 rounded-xl bg-destructive text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70">
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} حذف
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-bold text-foreground text-lg">
                        {modal === "add" ? "إضافة موظف جديد" : "تعديل بيانات الموظف"}
                      </h3>
                      <button onClick={closeModal} disabled={isPending}><X className="w-5 h-5 text-muted-foreground" /></button>
                    </div>
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">الاسم الكامل *</label>
                        <input id="input-emp-name" type="text" value={form.name}
                          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                          disabled={isPending}
                          placeholder="أحمد محمد"
                          className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/40 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">البريد الإلكتروني *</label>
                        <div className="relative">
                          <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input id="input-emp-email" type="email" value={form.email}
                            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                            disabled={isPending}
                            placeholder="ahmed@alhobaishi.com"
                            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-border bg-muted/40 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">الدور</label>
                          <select id="select-emp-role" value={form.role}
                            onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as Role }))}
                            disabled={isPending}
                            className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/40 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50">
                            <option value="EMPLOYEE">موظف</option>
                            <option value="DEPARTMENT_MANAGER">مدير إدارة</option>
                            <option value="MANAGER">مدير فرع</option>
                            <option value="ADMIN">مدير نظام</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">الفرع</label>
                          <select id="select-emp-branch" value={form.branchId}
                            onChange={(e) => setForm((p) => ({ ...p, branchId: e.target.value, departmentId: "" }))}
                            disabled={isPending}
                            className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/40 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50">
                            {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                          </select>
                        </div>
                      </div>
                      
                      {(form.role === "EMPLOYEE" || form.role === "DEPARTMENT_MANAGER") && (
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">
                            الإدارة {form.role === "DEPARTMENT_MANAGER" ? "*" : "(اختياري)"}
                          </label>
                          <select id="select-emp-department" value={form.departmentId}
                            onChange={(e) => setForm((p) => ({ ...p, departmentId: e.target.value }))}
                            disabled={isPending}
                            className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/40 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50">
                            <option value="">{form.role === "DEPARTMENT_MANAGER" ? "اختر الإدارة المخصصة..." : "بدون إدارة محددة (تقييم داخلي 360)"}</option>
                            {departments
                              .filter(d => d.branchId === form.branchId)
                              .map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                              ))}
                          </select>
                          <p className="text-xs text-muted-foreground mt-1.5">
                            {form.role === "DEPARTMENT_MANAGER" 
                              ? "يجب اختيار الإدارة التي سيشرف عليها هذا المدير."
                              : "تعيين الموظف لإدارة معينة سيجعله يظهر في تقييم هذه الإدارة (الزوار أو التجار)."}
                          </p>
                        </div>
                      )}
                      {(form.role === "MANAGER" || form.role === "ADMIN" || form.role === "DEPARTMENT_MANAGER") && (
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">
                            كلمة المرور (اتركه فارغاً للاحتفاظ بكلمة المرور الحالية)
                          </label>
                          <input type="password" value={form.password || ""}
                            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                            disabled={isPending}
                            placeholder="••••••••"
                            className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/40 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 text-left" dir="ltr" />
                        </div>
                      )}
                      {form.role === "EMPLOYEE" && (
                        <p className="text-xs text-muted-foreground mt-2">
                          * كلمة المرور الافتراضية للموظف هي <strong>421293!@#</strong> ولا يمكنه تغييرها.
                        </p>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button onClick={closeModal} disabled={isPending} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-50">إلغاء</button>
                      <button id="btn-save-employee" onClick={handleSave} disabled={isPending || !form.name.trim() || !form.email.trim()}
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
