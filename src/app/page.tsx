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
        <Link href="/" className="flex items-center gap-3 group">
          <img 
            src="https://vhbwfqqvsudznnfoqyjm.supabase.co/storage/v1/object/public/Logo/bioathlete_logo_transparent.png" 
            alt="BioAthlete Logo" 
            className="h-8 md:h-10 object-contain group-hover:opacity-100 transition-opacity"
            onError={(e) => {
              // Fallback just in case the file name is slightly different
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.querySelector('.fallback-text')?.classList.remove('hidden');
            }}
          />
          <span className="fallback-text hidden text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-300">
            BioAthlete
          </span>
        </Link>
        <Link href="/login" className="px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/50 text-xs font-bold rounded-xl text-white transition-all duration-300 select-none shadow-lg shadow-black/20">
          Se connecter
        </Link>
      </header>

      {/* Split Landing Hero showcasing Sprint-Mich */}
      <main className="relative z-10 max-w-6xl mx-auto w-full px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center flex-grow">
        
        {/* Main Content: Pitch and Call to Actions */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, duration: 0.8 }}
          className="col-span-1 md:col-span-2 flex flex-col items-center text-center gap-8 py-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100, damping: 20 }}
            className="flex flex-col gap-6 items-center"
          >
            <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-extrabold tracking-widest text-emerald-400 uppercase select-none inline-block">
              La Vitrine Digitale des Champions
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight">
              L&apos;Élégance de la <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
                Performance
              </span>
            </h1>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl leading-relaxed select-none">
              Créez une présence en ligne irréprochable. Affichez vos records vérifiés, mettez en valeur vos partenaires et générez un Media Kit professionnel digne de votre talent.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 100, damping: 20 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4 w-full"
          >
            <Link
              href="/register"
              className="w-full sm:w-auto px-10 py-5 bg-emerald-500 hover:bg-emerald-400 font-black text-sm tracking-wide uppercase text-black rounded-2xl shadow-xl hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300 text-center select-none"
            >
              Créer mon profil
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Highlights Grid */}
        <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full pb-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="p-8 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl hover:border-emerald-500/30 transition-all shadow-xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-2xl mb-4">
              ⏱️
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Chronos Vérifiés</h3>
            <p className="text-sm text-gray-400">Centralisez vos performances et prouvez votre valeur avec une interface claire et moderne.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
            className="p-8 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl hover:border-emerald-500/30 transition-all shadow-xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 text-2xl mb-4">
              🤝
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Visibilité Sponsors</h3>
            <p className="text-sm text-gray-400">Offrez à vos équipementiers et partenaires la visibilité qu&apos;ils méritent sur une vitrine premium.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
            className="p-8 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl hover:border-emerald-500/30 transition-all shadow-xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 text-2xl mb-4">
              📄
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Media Kit Pro</h3>
            <p className="text-sm text-gray-400">Générez un Media Kit PDF professionnel en un clic pour démarcher de nouveaux sponsors.</p>
          </motion.div>
        </div>

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
