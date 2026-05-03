"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal states
  const [activeModal, setActiveModal] = useState<"cgu" | "privacy" | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Absolute blocking Rule 2 & Rule 5
    if (!acceptTerms) {
      setError("Vous devez obligatoirement accepter les CGU et la Politique de Confidentialité avant de continuer.");
      return;
    }

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
            username: "sprint-mich-" + Date.now().toString().slice(-4),
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
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500 selection:text-black select-none relative overflow-hidden">
      {/* Background neon glows */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none z-0"></div>

      {/* Main Container */}
      <div className="relative z-10 max-w-lg mx-auto px-5 py-12 flex flex-col items-center gap-10">
        
        {/* Mock Profile: Sprint-Mich with Pixel avatar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-4 text-center select-none"
        >
          <div className="w-24 h-24 rounded-full border-2 border-emerald-500/30 p-1 flex items-center justify-center overflow-hidden bg-neutral-900">
            <img
              src="https://api.dicebear.com/7.x/pixel-art/svg?seed=SprintMich"
              alt="Sprint-Mich"
              width={96}
              height={96}
              className="w-full h-full object-cover rounded-full select-none"
              loading="lazy"
            />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-xl">
              Sprint-Mich
            </span>
            <h2 className="text-xl font-black text-white mt-3 tracking-tight">Sprint-Mich</h2>
            <p className="text-xs text-gray-400 mt-1 uppercase font-semibold tracking-wider">
              Sprinteur 100m
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full mt-2">
            <div className="p-3 backdrop-blur-xl bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-1 text-left">
              <span className="text-[8px] uppercase tracking-wider text-gray-500 font-bold">Records</span>
              <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-400">
                100m • 9.98s
              </span>
            </div>
            <div className="p-3 backdrop-blur-xl bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-1 text-left">
              <span className="text-[8px] uppercase tracking-wider text-gray-500 font-bold">Sponsors</span>
              <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-400">
                Nike • Puma
              </span>
            </div>
          </div>
        </motion.div>

        {/* Form and CTA */}
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

            {/* Consent Checkbox and buttons opening Modals */}
            <div className="flex items-start gap-2.5 px-1 py-1">
              <input
                id="terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border border-white/20 bg-black checked:bg-emerald-500 focus:ring-0 transition-all cursor-pointer"
              />
              <label htmlFor="terms" className="text-[10px] text-gray-400 font-medium leading-relaxed select-none">
                J&apos;accepte les{" "}
                <button
                  type="button"
                  onClick={() => setActiveModal("cgu")}
                  className="text-emerald-400 hover:underline font-bold transition-all cursor-pointer"
                >
                  CGU
                </button>{" "}
                et la{" "}
                <button
                  type="button"
                  onClick={() => setActiveModal("privacy")}
                  className="text-emerald-400 hover:underline font-bold transition-all cursor-pointer"
                >
                  Politique de Confidentialité
                </button>.
              </label>
            </div>

            {error && (
              <p className="text-red-400 border border-red-500/30 bg-red-500/10 text-xs font-semibold px-3 py-2 rounded-xl animate-pulse select-none leading-relaxed">
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

      {/* MODALS */}
      <AnimatePresence>
        {activeModal === "cgu" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xl flex items-center justify-center p-6 select-none"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full backdrop-blur-xl bg-white/10 border border-white/20 p-6 rounded-3xl shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto select-none"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-300 uppercase">
                  CGU & Conditions Protectrices
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="text-gray-400 hover:text-emerald-400 font-bold transition-all cursor-pointer text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-4 text-xs text-gray-300 leading-relaxed overflow-y-auto select-none">
                <section className="flex flex-col gap-1">
                  <h4 className="text-emerald-400 font-bold">1. Clause de véracité</h4>
                  <p>
                    L&apos;utilisateur s&apos;engage formellement sur l&apos;exactitude des performances et chronos renseignés. BioAthlete ne procède à aucune vérification manuelle et décline toute responsabilité pour toute déclaration erronée.
                  </p>
                </section>

                <section className="flex flex-col gap-1">
                  <h4 className="text-emerald-400 font-bold">2. Clause de propriété intellectuelle</h4>
                  <p>
                    L&apos;utilisateur est l&apos;unique responsable des contenus et s&apos;engage à posséder l&apos;ensemble des droits de diffusion et d&apos;auteur pour les images, vidéos et fichiers qu&apos;il publie sur sa vitrine digitale.
                  </p>
                </section>

                <section className="flex flex-col gap-1">
                  <h4 className="text-emerald-400 font-bold">3. Clause de décharge de responsabilité</h4>
                  <p>
                    BioAthlete agit uniquement comme un outil de visibilité et ne garantit aucun contrat de sponsoring ou de partenariat avec des marques sportives ou des tiers. L&apos;utilisation de nos fonctionnalités gratuites ou premium n&apos;ouvre droit à aucune contrepartie financière.
                  </p>
                </section>
              </div>

              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 font-black tracking-wide text-xs uppercase text-black rounded-xl transition-all duration-300 mt-2 select-none"
              >
                Fermer et revenir
              </button>
            </motion.div>
          </motion.div>
        )}

        {activeModal === "privacy" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xl flex items-center justify-center p-6 select-none"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full backdrop-blur-xl bg-white/10 border border-white/20 p-6 rounded-3xl shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto select-none"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-300 uppercase">
                  Politique de Confidentialité
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="text-gray-400 hover:text-emerald-400 font-bold transition-all cursor-pointer text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-4 text-xs text-gray-300 leading-relaxed overflow-y-auto select-none">
                <section className="flex flex-col gap-1">
                  <h4 className="text-emerald-400 font-bold">1. Stockage sécurisé (Supabase)</h4>
                  <p>
                    L&apos;ensemble de vos données d&apos;authentification et d&apos;activité sont enregistrées, sécurisées et chiffrées de bout en bout sur notre infrastructure technique partenaire **Supabase**. Les serveurs répondent aux normes internationales de protection des données (RGPD).
                  </p>
                </section>

                <section className="flex flex-col gap-1">
                  <h4 className="text-emerald-400 font-bold">2. Absence de cession commerciale</h4>
                  <p>
                    BioAthlete s&apos;interdit formellement de revendre, louer ou céder vos données personnelles à des tiers à des fins de prospection publicitaire ou marketing.
                  </p>
                </section>

                <section className="flex flex-col gap-1">
                  <h4 className="text-emerald-400 font-bold">3. Vos droits RGPD de suppression</h4>
                  <p>
                    Vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression totale de votre compte directement à partir des outils disponibles dans votre Dashboard.
                  </p>
                </section>
              </div>

              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 font-black tracking-wide text-xs uppercase text-black rounded-xl transition-all duration-300 mt-2 select-none"
              >
                Fermer et revenir
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
