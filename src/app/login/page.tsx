"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        setError(loginError.message);
      } else if (data.user) {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Erreur lors de l'authentification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500 selection:text-black flex items-center justify-center p-6 select-none relative overflow-hidden">
      {/* Background radial effects */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-sm w-full backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10 flex flex-col gap-6"
      >
        <div className="text-center select-none">
          <Link href="/" className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-300">
            BioAthlete
          </Link>
          <p className="text-gray-400 text-xs mt-1.5 font-medium">Connectez-vous à votre espace athlète</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
              Adresse e-mail
            </label>
            <input
              type="email"
              placeholder="athlete@bioathlete.space"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3.5 bg-neutral-900 border border-white/10 rounded-2xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white placeholder-gray-600"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
              Mot de passe
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3.5 bg-neutral-900 border border-white/10 rounded-2xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white placeholder-gray-600"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs font-semibold px-1 py-1 animate-pulse select-none">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs tracking-wider uppercase rounded-2xl shadow-xl hover:shadow-[0_4px_24px_rgba(16,185,129,0.3)] transition-all duration-300 mt-1 select-none"
          >
            {loading ? "Chargement..." : "Se connecter"}
          </button>
        </form>

        <div className="text-center select-none pt-2 border-t border-white/5">
          <p className="text-[11px] text-gray-400">
            Pas encore inscrit ?{" "}
            <Link href="/register" className="text-emerald-400 hover:underline font-bold transition-all">
              Créer un profil d&apos;athlète
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
