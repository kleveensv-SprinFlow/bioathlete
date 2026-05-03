"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ProPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500 selection:text-black pb-16 relative overflow-hidden select-none">
      {/* Premium ambient glows */}
      <div className="absolute top-[-15%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] bg-blue-500/15 rounded-full blur-[140px] pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-md mx-auto px-5 pt-12 flex flex-col gap-10 min-h-screen">
        {/* Header */}
        <div className="flex flex-col gap-3 text-center">
          <div className="flex justify-center select-none">
            <span className="px-3.5 py-1.5 bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 text-[10px] font-black tracking-widest uppercase rounded-full shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-pulse">
              Offre Exclusive
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight select-none mt-2">
            Passez au statut <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400">Élite Pro</span>
          </h1>
          <p className="text-gray-400 text-xs max-w-sm mx-auto leading-relaxed select-none">
            Donnez à votre profil d&apos;athlète une dimension supérieure. Le forfait Élite Pro vous offre tous les outils pour un branding premium.
          </p>
        </div>

        {/* Pricing Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="backdrop-blur-xl bg-white/5 border border-emerald-500/30 hover:border-emerald-500/50 rounded-3xl p-6 shadow-2xl flex flex-col gap-6 select-none relative hover:shadow-[0_4px_32px_rgba(16,185,129,0.15)] transition-all duration-500"
        >
          <div className="flex justify-between items-start select-none">
            <div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                Abonnement Élite
              </span>
              <h2 className="text-xl font-black text-white mt-1">9.99 € <span className="text-xs text-gray-400 font-medium">/ mois</span></h2>
              <p className="text-gray-500 text-[10px] mt-0.5">Sans engagement, annulable à tout moment.</p>
            </div>
            <span className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xl">
              🏆
            </span>
          </div>

          <div className="flex flex-col gap-3.5 pt-4 border-t border-white/5 select-none">
            <div className="flex items-center gap-3 text-xs text-gray-300 font-medium">
              <span className="text-emerald-400 text-sm">⚡</span>
              <span>Liens & réseaux sociaux <strong>illimités</strong></span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-300 font-medium">
              <span className="text-emerald-400 text-sm">🌐</span>
              <span>Nom de domaine personnalisé <strong>(prenom-nom.com)</strong></span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-300 font-medium">
              <span className="text-emerald-400 text-sm">🎨</span>
              <span>Thèmes et gradients exclusifs</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-300 font-medium">
              <span className="text-emerald-400 text-sm">📄</span>
              <span>Générateur de Media Kit (PDF) <strong>illimité</strong></span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-300 font-medium">
              <span className="text-emerald-400 text-sm">🔥</span>
              <span>Badge <strong className="text-emerald-400">Élite Pro</strong> holographique</span>
            </div>
          </div>

          <Link
            href="/register"
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs tracking-wider uppercase text-center rounded-2xl shadow-xl hover:shadow-[0_4px_24px_rgba(16,185,129,0.3)] transition-all duration-300 select-none cursor-pointer"
          >
            Commencer maintenant
          </Link>
        </motion.div>

        {/* Comparison Table */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-5 shadow-xl flex flex-col gap-4 select-none">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 text-center select-none mb-1">
            Standard vs Élite Pro
          </h3>

          <div className="flex flex-col gap-3 text-xs select-none">
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-gray-400">Nombre de liens</span>
              <div className="flex items-center gap-3">
                <span className="text-gray-500">Max 3</span>
                <span className="text-emerald-400 font-black">Illimité</span>
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-gray-400">Domaine personnalisé</span>
              <div className="flex items-center gap-3">
                <span className="text-red-500">❌</span>
                <span className="text-emerald-400 font-black">Inclus</span>
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-gray-400">Thèmes premium</span>
              <div className="flex items-center gap-3">
                <span className="text-red-500">❌</span>
                <span className="text-emerald-400 font-black">Inclus</span>
              </div>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400">Badge Élite Pro</span>
              <div className="flex items-center gap-3">
                <span className="text-red-500">❌</span>
                <span className="text-emerald-400 font-black">Inclus</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="text-center select-none pt-2">
          <Link href="/" className="text-[11px] text-gray-500 hover:text-emerald-400 hover:underline transition-colors duration-300">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
