"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isLogin) {
        // Mode Connexion
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) {
          // Fallback pour test avec données locales
          if (email === "athlete@bioathlete.space" && password === "athlete2026") {
            router.push("/dashboard");
            return;
          }
          setError(loginError.message);
        } else if (data?.user) {
          router.push("/dashboard");
        }
      } else {
        // Mode Inscription
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          setError(signUpError.message);
        } else if (data?.user) {
          setSuccess("Inscription réussie ! Vous pouvez maintenant vous connecter.");
          setIsLogin(true);
        }
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans flex flex-col items-center justify-center p-5 selection:bg-emerald-500 selection:text-black">
      {/* Ambient backgrounds */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      
      {/* Header / Navigation Back Link */}
      <div className="w-full max-w-md mb-4 flex items-center justify-start z-10 select-none">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-emerald-400 font-bold text-xs uppercase tracking-wider transition-colors duration-300">
          <span>←</span> Retour à l'accueil
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-300">
            BioAthlete
          </h1>
          <p className="text-gray-400 text-sm">
            Espace d'administration de vos performances
          </p>
        </div>

        {/* Tab Toggle Buttons */}
        <div className="flex border border-white/10 rounded-2xl p-1 bg-neutral-900 mb-6 select-none">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 ${
              isLogin ? "bg-emerald-500 text-black" : "text-gray-400 hover:text-white"
            }`}
          >
            Se connecter
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 ${
              !isLogin ? "bg-emerald-500 text-black" : "text-gray-400 hover:text-white"
            }`}
          >
            S'inscrire
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

          {success && (
            <p className="text-emerald-400 text-xs px-1 font-medium leading-relaxed">
              {success}
            </p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-2 bg-gradient-to-tr from-emerald-500 to-blue-500 font-extrabold text-sm rounded-2xl hover:shadow-[0_4px_24px_rgba(16,185,129,0.25)] transition-all duration-300 tracking-wider text-black uppercase disabled:opacity-50"
          >
            {loading ? "Chargement..." : isLogin ? "Se connecter" : "S'inscrire"}
          </motion.button>
        </form>

        <p className="text-center text-gray-500 text-xs mt-8 select-none">
          Identifiants de test : athlete@bioathlete.space / athlete2026
        </p>
      </motion.div>
    </div>
  );
}
