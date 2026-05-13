"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);
  const [resendStatus, setResendStatus] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShowResend(false);
    setResendStatus("");
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed") || error.message.toLowerCase().includes("confirm your email")) {
        setError("Votre adresse e-mail n'a pas encore été validée par code OTP.");
        setShowResend(true);
      } else {
        setError("Erreur d'authentification. Vérifiez vos identifiants.");
      }
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setError("Veuillez saisir votre adresse e-mail pour renvoyer le code.");
      return;
    }
    setResendStatus("Envoi en cours...");
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });
      if (error) {
        setResendStatus("Erreur : " + error.message);
      } else {
        setResendStatus("Un nouveau code a été envoyé avec succès !");
      }
    } catch {
      setResendStatus("Erreur lors de l'envoi.");
    }
  };

  // Scroll progress for the top bar
  const { scrollYProgress } = useScroll();

  return (
    <div className="w-full bg-black text-white font-sans selection:bg-emerald-500 selection:text-black relative select-none">
      
      {/* SCROLL PROGRESS BAR */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-emerald-500 origin-left z-[100] shadow-[0_0_10px_rgba(16,185,129,0.5)]"
        style={{ scaleX: scrollYProgress }}
      />

      {/* FIXED LUMINOUS BACKGROUND LAYER */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute top-[5%] right-[5%] w-96 h-96 bg-[#00FF88] opacity-10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[5%] left-[5%] w-96 h-96 bg-blue-500 opacity-10 rounded-full blur-[120px]" />
      </div>

      {/* SECTION 1: Login Form */}
      <section className="min-h-[90vh] w-full flex flex-col items-center justify-center p-6 lg:p-12 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md flex flex-col items-center gap-8"
        >
          <div className="flex justify-center w-full">
            <Link href="/" className="group relative">
              <img 
                src="https://vhbwfqqvsudznnfoqyjm.supabase.co/storage/v1/object/public/Logo/bioathlete_logo_transparent.png" 
                alt="BioAthlete Logo" 
                className="h-32 md:h-40 object-contain brightness-0 invert drop-shadow-[0_0_20px_rgba(0,255,136,0.2)] group-hover:drop-shadow-[0_0_35px_rgba(0,255,136,0.35)] transition-all duration-300"
              />
            </Link>
          </div>

          <div className="w-full backdrop-blur-2xl bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col gap-6">
            <div className="text-center">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Connexion</h2>
              <p className="text-gray-400 text-xs font-medium mt-1">Accédez à votre espace professionnel</p>
            </div>

            <form className="flex flex-col gap-5" onSubmit={handleLogin}>
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl text-xs font-semibold text-center">
                  {error}
                  {showResend && (
                    <button type="button" onClick={handleResendOtp} className="text-emerald-400 hover:underline font-bold block mt-2 uppercase text-[10px]">
                      Renvoyer le code
                    </button>
                  )}
                </div>
              )}
              
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-1">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 focus:border-emerald-500/50 rounded-2xl text-white focus:outline-none transition-all text-sm placeholder-gray-700"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-1">Mot de passe</label>
                  <input
                    type="password"
                    required
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 focus:border-emerald-500/50 rounded-2xl text-white focus:outline-none transition-all text-sm placeholder-gray-700"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs tracking-widest uppercase rounded-2xl shadow-xl transition-all"
                type="submit"
                disabled={loading}
              >
                {loading ? "Chargement..." : "Se connecter"}
              </motion.button>
            </form>

            <div className="text-center pt-4 border-t border-white/5">
              <p className="text-gray-500 text-xs font-medium">
                Nouveau ici ?{" "}
                <Link href="/register" className="text-emerald-400 hover:underline font-bold">Créer mon profil</Link>
              </p>
            </div>
          </div>
          
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] flex flex-col items-center gap-2 mt-4"
          >
            Découvrir
            <span className="text-emerald-500">↓</span>
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION 2: Vitrine Athlètes */}
      <section className="py-32 w-full flex items-center justify-center p-6 relative z-10 border-t border-white/5">
        <motion.div 
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
          viewport={{ once: false, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl w-full text-center flex flex-col items-center gap-6"
        >
          <div className="text-6xl md:text-8xl">⚡</div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 uppercase leading-none">
            Vitrine pensée <br /> pour les athlètes
          </h2>
          <p className="text-gray-400 text-base md:text-lg font-medium max-w-2xl leading-relaxed">
            Ne laissez plus vos performances se perdre dans des tableaux Excel. Transformez vos chronos en une identité visuelle forte et impactante.
          </p>
        </motion.div>
      </section>

      {/* SECTION 3: Visuel Marques */}
      <section className="py-32 w-full flex items-center justify-center p-6 relative z-10 border-t border-white/5 bg-white/[0.01]">
        <motion.div 
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
          viewport={{ once: false, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl w-full text-center flex flex-col items-center gap-6"
        >
          <div className="text-6xl md:text-8xl">💎</div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 uppercase leading-none">
            Un visuel pour <br /> les marques
          </h2>
          <p className="text-gray-400 text-base md:text-lg font-medium max-w-2xl leading-relaxed">
            Offrez à vos partenaires une visibilité professionnelle. Présentez vos sponsors actuels et attirez de nouvelles opportunités.
          </p>
        </motion.div>
      </section>

      {/* SECTION 4: Final CTA */}
      <section className="py-32 w-full flex items-center justify-center p-6 relative z-10 border-t border-white/5 bg-emerald-500/[0.02]">
        <motion.div 
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
          viewport={{ once: false, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl w-full text-center flex flex-col items-center gap-8"
        >
          <div className="text-6xl md:text-8xl animate-bounce">🚀</div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 uppercase leading-none">
            Passe le cap et affiche <br /> fièrement ton image
          </h2>
          
          <div className="flex flex-col items-center gap-6 mt-2 w-full max-w-md">
            <Link href="/register" className="w-full">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(16, 185, 129, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-5 bg-emerald-500 text-black font-black text-sm tracking-[0.2em] uppercase rounded-3xl shadow-2xl transition-all"
              >
                Créer mon profil maintenant
              </motion.button>
            </Link>
            <p className="text-emerald-500/50 text-[10px] font-black uppercase tracking-[0.4em]">
              Rejoins l'élite en 30 secondes
            </p>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
