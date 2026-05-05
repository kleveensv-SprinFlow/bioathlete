"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CGUPage() {
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
            Conditions Générales d&apos;Utilisation (CGU)
          </h1>
          
          <p className="text-xs text-gray-400 leading-relaxed">
            Bienvenue sur BioAthlete.space. Les présentes Conditions Générales d&apos;Utilisation encadrent l&apos;accès et l&apos;utilisation du site BioAthlete par ses utilisateurs et athlètes.
          </p>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white">1. Objet du Service</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              BioAthlete.space est une plateforme permettant aux athlètes de créer une vitrine digitale professionnelle, d&apos;afficher leurs records sportifs et de partager leurs sponsors officiels.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white">2. Droits de propriété intellectuelle</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              Chaque utilisateur athlète est responsable des données, images, vidéos, et liens qu&apos;il publie sur son profil. L&apos;athlète s&apos;engage à posséder l&apos;ensemble des droits de diffusion et d&apos;auteur de ses contenus.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-white">3. Responsabilité</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              BioAthlete.space décline toute responsabilité en cas d&apos;interruption du service, de perte de données ou d&apos;utilisation non autorisée du compte.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
