"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        const { data, error: registerError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (registerError) {
          setError(registerError.message);
        } else if (data.user) {
          // Auto create base profile
          await supabase.from("profiles").insert([
            { user_id: data.user.id, username: "athlete-" + Date.now().toString().slice(-4) }
          ]);
          router.push("/dashboard");
        }
      } else {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) {
          setError(loginError.message);
        } else if (data.user) {
          router.push("/dashboard");
        }
      }
    } catch (err) {
      setError("Erreur serveur lors de l'authentification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500 selection:text-black flex flex-col md:flex-row overflow-hidden select-none">
      
      {/* 50% Left Side: Form Section */}
      <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-between relative z-10">
        
        {/* Navigation / Top Bar */}
        <div className="w-full flex items-center justify-between mb-8 select-none">
          <Link href="/" className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-300">
            BioAthlete
          </Link>
          <Link href="/" className="text-gray-400 hover:text-emerald-400 text-xs font-bold uppercase tracking-wider transition-all duration-300">
            ← Accueil
          </Link>
        </div>

        {/* Dynamic sliding form */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-sm mx-auto w-full flex flex-col justify-center flex-grow py-8"
        >
          <div className="mb-6 select-none">
            <h2 className="text-3xl font-black tracking-tight text-white leading-tight">
              {isRegister ? "Créez votre profil" : "Ravi de vous revoir"}
            </h2>
            <p className="text-gray-400 text-xs mt-2 font-medium leading-relaxed max-w-xs">
              Passe au niveau supérieur. Crée ta carte de visite d&apos;athlète pro en 2 minutes.
            </p>
          </div>

          {/* Form Tabs */}
          <div className="grid grid-cols-2 gap-1 bg-white/5 border border-white/10 p-1 rounded-2xl mb-6 select-none">
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              className={`py-3 text-xs font-black rounded-xl transition-all duration-300 uppercase tracking-wide ${
                !isRegister ? "bg-emerald-500 text-black shadow-xl" : "text-gray-400 hover:text-white"
              }`}
            >
              Se connecter
            </button>
            <button
              type="button"
              onClick={() => setIsRegister(true)}
              className={`py-3 text-xs font-black rounded-xl transition-all duration-300 uppercase tracking-wide ${
                isRegister ? "bg-emerald-500 text-black shadow-xl" : "text-gray-400 hover:text-white"
              }`}
            >
              S&apos;inscrire
            </button>
          </div>

          <form onSubmit={handleAuth} className="flex flex-col gap-4">
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
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs tracking-wider uppercase rounded-2xl shadow-xl hover:shadow-[0_4px_24px_rgba(16,185,129,0.3)] transition-all duration-300 mt-2 select-none"
            >
              {loading ? "Chargement..." : isRegister ? "S'inscrire" : "Se connecter"}
            </button>

            {/* Preview demonstration button */}
            <Link
              href="/u/bolt"
              className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/20 font-black text-xs tracking-wider text-center text-white rounded-2xl transition-all duration-300 select-none uppercase tracking-wide backdrop-blur-xl"
            >
              Voir un exemple de profil
            </Link>
          </form>
        </motion.div>

        {/* Footer */}
        <footer className="w-full select-none mt-8 text-center md:text-left">
          <p className="text-[10px] text-gray-600 font-medium tracking-widest flex items-center justify-center md:justify-start gap-1">
            Optimisé par <span className="text-emerald-500 font-bold">BioAthlete.space</span>
          </p>
        </footer>
      </div>

      {/* 50% Right Side: Smartphone Mockup Preview Section */}
      <div className="w-full md:w-1/2 bg-neutral-950 border-l border-white/5 relative flex items-center justify-center p-8 overflow-hidden select-none min-h-[450px] md:min-h-screen">
        
        {/* Glow neon accents */}
        <div className="absolute top-[-20%] right-[-20%] w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-20%] w-[450px] h-[450px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none"></div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="relative w-[280px] h-[560px] border-4 border-white/15 bg-black rounded-[42px] p-4 shadow-2xl overflow-hidden hover:border-emerald-500/30 transition-all duration-500 select-none"
        >
          {/* Dynamic Mockup content */}
          <div className="flex flex-col items-center gap-4 text-center mt-4 h-full select-none">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 p-0.5 shadow-xl flex items-center justify-center select-none">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
                BA
              </div>
            </div>

            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Sprinteur N1</h3>
              <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                Sprint • Performance
              </p>
            </div>

            {/* Dummy horizontal scroll gallery */}
            <div className="w-full flex items-center gap-2 overflow-x-hidden select-none">
              <div className="w-24 flex-shrink-0 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-2 flex items-center gap-2">
                <span className="text-xs">👟</span>
                <span className="text-[9px] font-bold">Nike</span>
              </div>
              <div className="w-24 flex-shrink-0 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-2 flex items-center gap-2">
                <span className="text-xs">🥤</span>
                <span className="text-[9px] font-bold">Red Bull</span>
              </div>
            </div>

            {/* Dummy Records Cards */}
            <div className="grid grid-cols-2 gap-2 w-full mt-2 select-none">
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col justify-between gap-1 text-left">
                <div className="text-[8px] font-black tracking-wider uppercase text-gray-500">
                  100m
                </div>
                <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-400 leading-none">
                  9.98s
                </div>
              </div>
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col justify-between gap-1 text-left">
                <div className="text-[8px] font-black tracking-wider uppercase text-gray-500">
                  60m
                </div>
                <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-400 leading-none">
                  6.55s
                </div>
              </div>
            </div>

            {/* Dummy Linktree Cards */}
            <div className="w-full flex flex-col gap-2 mt-2 select-none">
              <div className="w-full flex items-center justify-between p-2.5 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-sm">📸</span>
                  <span className="font-bold text-[10px] text-gray-200">Instagram Officiel</span>
                </div>
                <span className="text-gray-500 text-[10px]">↗</span>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
