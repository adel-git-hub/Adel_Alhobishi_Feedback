"use client";

import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ShieldCheck, Building2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      } else {
        router.push("/manager");
      }
    } catch {
      setError("حدث خطأ غير متوقع. حاول مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <div className="absolute inset-0 gradient-brand">
        <div className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(37,99,235,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(96,165,250,0.2) 0%, transparent 50%), radial-gradient(circle at 60% 80%, rgba(30,58,138,0.6) 0%, transparent 50%)",
          }}
        />
        {/* Floating orbs */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: `${120 + i * 60}px`,
              height: `${120 + i * 60}px`,
              background: `rgba(245, 158, 11, ${0.03 + i * 0.015})`,
              left: `${10 + i * 18}%`,
              top: `${15 + i * 15}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 6 + i * 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.8,
            }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <img src="/globe.png" alt="Globe" className="w-[120%] max-w-4xl object-contain -rotate-12 blur-[2px]" />
        </div>
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="glass-dark rounded-3xl p-8 shadow-brand-lg">
          {/* Logo & Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="w-20 h-20 bg-white border-2 border-white/20 rounded-2xl flex items-center justify-center shadow-brand overflow-hidden p-2">
                  <img src="/logo.png" alt="شركة عادل الحبيشي" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              شركة عادل الحبيشي
            </h1>
            <p className="text-white/80 text-sm font-medium">
              للصرافة والحوالات المالية
            </p>
            <div className="mt-3 h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" />
            <p className="mt-3 text-gold-400/80 text-xs tracking-wide font-medium">
              نظام تقييم الموظفين والخدمات
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="space-y-5"
          >
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                اسم المستخدم أو البريد الإلكتروني
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                placeholder="مثال: ahmed أو user@gmail.com"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/50 transition-all duration-200 text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/50 transition-all duration-200 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/15 border border-red-400/30 text-red-300 text-sm"
              >
                <span className="text-red-400">⚠</span>
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <motion.button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl gradient-gold border border-gold-400/30 text-brand-950 font-bold text-sm shadow-brand hover:shadow-brand-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جارٍ تسجيل الدخول...
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </motion.button>
          </motion.form>

          {/* Footer */}
          <div className="text-center text-white/50 text-xs mt-6 font-medium space-y-1">
            <p>© 2026 شركة عادل الحبيشي للصرافة والحوالات المالية</p>
            <p className="text-gold-400 font-semibold">تصميم وتطوير : م عبدالرحمن غلاب 2026 ©</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
