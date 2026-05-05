"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black flex flex-col justify-between select-none">
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/10 rounded-full blur-[140px] pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12 flex flex-col gap-8">
        <Link href="/" className="text-sm font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-wider select-none">
          ← Retour à l&apos;accueil
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col gap-6"
        >
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white">
            Politique de Confidentialité & RGPD
          </h1>
          
          <p className="text-xs text-gray-400 leading-relaxed">
            La protection de vos données personnelles est une priorité absolue pour BioAthlete.space.
          </p>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white">1. Collecte des données</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              Nous collectons l&apos;adresse e-mail et le mot de passe hashé pour l&apos;accès à votre espace athlète. Les données de profil (performances, liens, sponsors) sont collectées pour l&apos;affichage public de votre vitrine.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white">2. Gestion par Supabase</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              Vos informations d&apos;authentification et de profil sont hébergées et sécurisées par notre prestataire tiers de confiance **Supabase**. Les données sont protégées par le chiffrement de bout en bout.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white">3. Absence de revente</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              BioAthlete.space s&apos;engage formellement à **ne jamais revendre ni céder** vos données personnelles à des tiers à des fins de prospection commerciale.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white">4. Vos droits</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de modification et de suppression de vos données personnelles directement à partir de votre Dashboard.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
