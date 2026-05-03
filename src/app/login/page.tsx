"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Intégration authentification Supabase
      const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (supabaseError) {
        // Fallback pour test avec données en dur locales si Supabase n'a pas cet utilisateur
        if (email === "athlete@bioathlete.space" && password === "athlete2026") {
          router.push("/dashboard");
          return;
        }
        setError(supabaseError.message);
      } else if (data?.user) {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans flex items-center justify-center p-5 selection:bg-emerald-500 selection:text-black">
      {/* Ambient backgrounds */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-300">
            BioAthlete
          </h1>
          <p className="text-gray-400 text-sm">
            Espace d'administration connecté à Supabase
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 px-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="athlete@bioathlete.space"
              className="w-full p-4 bg-neutral-900 border border-white/10 rounded-2xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-sm placeholder-gray-600"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 px-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-4 bg-neutral-900 border border-white/10 rounded-2xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-sm placeholder-gray-600"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs px-1 font-medium leading-relaxed">
              {error}
            </p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-2 bg-gradient-to-tr from-emerald-500 to-blue-500 font-extrabold text-sm rounded-2xl hover:shadow-[0_4px_24px_rgba(16,185,129,0.25)] transition-all duration-300 tracking-wider text-black uppercase disabled:opacity-50"
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </motion.button>
        </form>

        <p className="text-center text-gray-500 text-xs mt-8 select-none">
          Identifiants d'essai : athlete@bioathlete.space / athlete2026
        </p>
      </motion.div>
    </div>
  );
}
