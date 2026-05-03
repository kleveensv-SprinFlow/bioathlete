"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500 selection:text-black flex flex-col justify-between">
      {/* Background radial glow */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Top Navbar */}
      <header className="relative z-10 max-w-5xl mx-auto w-full px-6 py-6 flex items-center justify-between select-none">
        <Link href="/" className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-300">
          BioAthlete
        </Link>
        <Link href="/login" className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold rounded-xl text-gray-300 transition-all duration-300 select-none">
          Espace Athlète
        </Link>
      </header>

      {/* Main Hero Section */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12 flex flex-col items-center text-center gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-4 select-none"
        >
          <span className="text-xs font-extrabold tracking-widest text-emerald-400 uppercase">
            Vitrine Digitale Pour Sportifs
          </span>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-white leading-none">
            Boostez votre <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
              Identité d&apos;Athlète
            </span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Créez un profil professionnel, partagez vos records chronométriques, affichez vos sponsors,
            et générez votre Média Kit en quelques secondes.
          </p>
        </motion.div>

        {/* Call to Actions Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full mt-4 select-none"
        >
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 font-black text-sm tracking-wide uppercase text-black rounded-2xl shadow-xl hover:shadow-[0_4px_24px_rgba(16,185,129,0.3)] transition-all duration-300 text-center select-none"
          >
            Créer mon profil
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/20 font-black text-sm tracking-wide uppercase text-white rounded-2xl transition-all duration-300 text-center select-none backdrop-blur-xl"
          >
            Se connecter
          </Link>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full px-6 py-8 text-center select-none border-t border-white/5">
        <p className="text-[11px] text-gray-600 font-medium tracking-widest flex items-center justify-center gap-1">
          Optimisé par <span className="text-emerald-500 font-bold">BioAthlete.space</span>
        </p>
      </footer>
    </div>
  );
}
