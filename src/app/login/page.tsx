"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
      setError("Erreur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center p-6 select-none select-none">
      <div className="max-w-sm w-full backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col gap-6">
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3.5 bg-neutral-900 border border-white/10 rounded-2xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white placeholder-gray-600"
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3.5 bg-neutral-900 border border-white/10 rounded-2xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white placeholder-gray-600"
            required
          />
          {error && <p className="text-red-400 text-xs font-semibold px-1 py-1">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs tracking-wider uppercase rounded-2xl shadow-xl hover:shadow-[0_4px_24px_rgba(16,185,129,0.3)] transition-all duration-300"
          >
            {loading ? "Chargement..." : "Connexion"}
          </button>
        </form>
      </div>
    </div>
  );
}
