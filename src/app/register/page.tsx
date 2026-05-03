"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: registerError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (registerError) {
        setError(registerError.message);
      } else if (data.user) {
        await supabase.from("profiles").insert([
          {
            user_id: data.user.id,
            username: "jm-start-" + Date.now().toString().slice(-4),
            is_premium: false,
          }
        ]);
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500 selection:text-black select-none">
      {/* Glow neon accents */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none z-0"></div>

      {/* Main Container */}
      <div className="relative z-10 max-w-lg mx-auto px-5 py-12 flex flex-col items-center gap-10">
        
        {/* Profile Card Demo with AI generated Placeholder & Humorous Text */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-4 text-center select-none"
        >
          <div className="w-24 h-24 rounded-full border-2 border-emerald-500/30 p-1 flex items-center justify-center overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
              alt="Jean-Michel Start"
              className="w-full h-full object-cover rounded-full select-none"
              loading="lazy"
            />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-xl">
              Démo IA : Jean-Michel Start
            </span>
            <h2 className="text-xl font-black text-white mt-3 tracking-tight">Jean-Michel Start</h2>
            <p className="text-xs text-gray-400 mt-1 uppercase font-semibold tracking-wider">
              Sprinteur de Blocks professionnel
            </p>
          </div>
          <p className="text-gray-300 text-xs italic max-w-sm px-4 leading-relaxed mt-1">
            &quot;Plus rapide que ton ombre, mais moins que nos serveurs.&quot;
          </p>

          <div className="grid grid-cols-2 gap-3 w-full mt-2">
            <div className="p-3 backdrop-blur-xl bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-1 text-left">
              <span className="text-[8px] uppercase tracking-wider text-gray-500 font-bold">Record</span>
              <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-400">
                10.05s
              </span>
            </div>
            <div className="p-3 backdrop-blur-xl bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-1 text-left">
              <span className="text-[8px] uppercase tracking-wider text-gray-500 font-bold">Temps de reaction</span>
              <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-400">
                0.01s
              </span>
            </div>
          </div>
        </motion.div>

        {/* Humorous Features / Slogans */}
        <div className="w-full text-center flex flex-col gap-3 select-none">
          <p className="text-gray-400 text-xs font-medium max-w-xs mx-auto leading-relaxed">
            🚀 Pourquoi vous inscrire ? Nos graphiques de progression sont plus fluides qu&apos;une foulée parfaite.
          </p>
        </div>

        {/* Final Registration form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col gap-6"
        >
          <div className="text-center">
            <h3 className="text-xl font-black tracking-tight text-white select-none">
              Inscrivez-vous maintenant
            </h3>
            <p className="text-gray-400 text-xs font-medium select-none mt-1">
              Et accédez aux fonctionnalités Élite
            </p>
          </div>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
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
              {loading ? "Chargement..." : "Créer mon profil"}
            </button>
          </form>

          <div className="text-center select-none pt-2 border-t border-white/5">
            <p className="text-[11px] text-gray-400">
              Vous avez déjà un compte ?{" "}
              <Link href="/login" className="text-emerald-400 hover:underline font-bold transition-all">
                Se connecter
              </Link>
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
