"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500 selection:text-black flex flex-col justify-between select-none relative overflow-hidden">
      {/* Background radial glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none z-0"></div>

      {/* Header */}
      <header className="relative z-10 max-w-6xl mx-auto w-full px-6 py-6 flex items-center justify-between select-none">
        <Link href="/" className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-300">
          BioAthlete
        </Link>
        <Link href="/login" className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold rounded-xl text-gray-300 transition-all duration-300 select-none">
          Espace Athlète
        </Link>
      </header>

      {/* Split Landing Hero showcasing Sprint-Mich */}
      <main className="relative z-10 max-w-6xl mx-auto w-full px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center flex-grow">
        
        {/* Left Side: Pitch and Call to Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col gap-4">
            <span className="text-xs font-extrabold tracking-widest text-emerald-400 uppercase select-none">
              Vitrine Digitale Pour Sportifs
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Affichez votre <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
                Statut d&apos;Athlète
              </span>
            </h1>
            <p className="text-gray-400 text-sm sm:text-base max-w-md leading-relaxed select-none">
              Créez un profil professionnel en ligne, partagez vos chronos vérifiés, affichez vos sponsors et générez votre Media Kit professionnel.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
            <Link
              href="/register"
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
          </div>
        </motion.div>

        {/* Right Side: Mock Profile Showcase (Vitrine Sprint-Mich) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center gap-6 text-center select-none hover:border-emerald-500/20 transition-all"
        >
          <div className="w-28 h-28 rounded-full border-2 border-emerald-500/30 p-1 flex items-center justify-center overflow-hidden bg-neutral-900 shadow-lg">
            <img
              src="https://api.dicebear.com/7.x/pixel-art/svg?seed=SprintMich"
              alt="Sprint-Mich"
              width={112}
              height={112}
              className="w-full h-full object-cover rounded-full select-none"
              loading="lazy"
            />
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-xl">
              Athlète Certifié
            </span>
            <h2 className="text-2xl font-black text-white mt-3 tracking-tight">Sprint-Mich</h2>
            <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-wider">
              Sprinteur 100m
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full select-none">
            <div className="p-4 backdrop-blur-xl bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-1 text-left">
              <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Records</span>
              <span className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-400">
                100m • 9.98s
              </span>
            </div>
            <div className="p-4 backdrop-blur-xl bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-1 text-left">
              <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Sponsor</span>
              <span className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-400">
                SpikeSpeed
              </span>
            </div>
          </div>
        </motion.div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl mx-auto w-full px-6 py-6 text-center select-none border-t border-white/5">
        <p className="text-[11px] text-gray-600 font-medium tracking-widest flex items-center justify-center gap-1">
          Optimisé par <span className="text-emerald-500 font-bold">BioAthlete.space</span>
        </p>
      </footer>
    </div>
  );
}
