"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setError("Erreur d'authentification. Vérifiez vos identifiants.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6 font-sans selection:bg-emerald-500 selection:text-black relative overflow-hidden select-none">
      {/* Intense Glowing Radial Accents */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/15 rounded-full blur-[140px] pointer-events-none z-0"></div>

      {/* Main glassmorphism card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md backdrop-blur-xl bg-white/5 p-8 rounded-3xl border border-white/10 hover:border-emerald-500/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] transition-all duration-300 relative z-10 flex flex-col gap-6"
      >
        <div className="text-center select-none">
          <Link href="/" className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-300 select-none">
            BIOATHLETE
          </Link>
          <p className="mt-2 text-gray-400 text-xs font-semibold uppercase tracking-wider select-none">
            Passe au niveau supérieur • Espace Athlète Pro
          </p>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleLogin}>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl text-xs font-semibold text-center select-none"
            >
              {error}
            </motion.div>
          )}
          
          <div className="flex flex-col gap-4 select-none">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                Adresse e-mail
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 bg-neutral-900/80 border border-white/10 hover:border-white/20 focus:border-emerald-500/80 rounded-2xl text-white focus:outline-none transition-all text-xs placeholder-gray-600"
                placeholder="Ex: ton@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                Mot de passe
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 bg-neutral-900/80 border border-white/10 hover:border-white/20 focus:border-emerald-500/80 rounded-2xl text-white focus:outline-none transition-all text-xs placeholder-gray-600"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs tracking-wider uppercase rounded-2xl shadow-xl hover:shadow-[0_4px_24px_rgba(16,185,129,0.3)] transition-all transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 select-none mt-1"
          >
            {loading ? "Connexion..." : "SE CONNECTER"}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-white/5 select-none">
          <p className="text-gray-400 text-xs">
            Pas encore inscrit ?{" "}
            <Link href="/register" className="text-emerald-400 hover:underline font-bold transition-all">
              Créer mon profil
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
