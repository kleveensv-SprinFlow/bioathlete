"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500 selection:text-black flex flex-col justify-between select-none">
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12 flex flex-col gap-8">
        <Link href="/" className="text-sm font-bold text-gray-400 hover:text-emerald-400 transition-colors uppercase tracking-wider select-none">
          ← Retour à l&apos;accueil
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col gap-6"
        >
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-300">
            Mentions Légales
          </h1>
          
          <section className="flex flex-col gap-2 select-none">
            <h2 className="text-base font-bold text-emerald-400">1. Éditeur du site</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              Le site BioAthlete.space est édité par BioAthlete SAS, société par actions simplifiée au capital de 1 000 euros, dont le siège social est situé à Paris, immatriculée au Registre du Commerce et des Sociétés de Paris sous le numéro B 123 456 789.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-emerald-400">2. Hébergement</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              Le site est hébergé par Vercel Inc., dont le siège social est situé au 717 D Street NW, Washington DC.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-emerald-400">3. Directeur de publication</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              Le directeur de la publication est le représentant légal de BioAthlete SAS.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
