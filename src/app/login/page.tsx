"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);
  const [resendStatus, setResendStatus] = useState("");
  const router = useRouter();

  // Scroll ref for horizontal slider
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"]
  });

  // Exactly shifts over the three cards without creating empty space at the end
  const horizontalX = useTransform(scrollYProgress, [0, 1], ["0%", "-66.66%"]);

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

  // Function to smoothly scroll down to the horizontal slider
  const scrollToNextSection = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({
        top: window.innerHeight,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="w-full bg-black text-white font-sans selection:bg-emerald-500 selection:text-black overflow-x-clip relative select-none">
      
      {/* FIXED LUMINOUS BACKGROUND LAYER (z-0) */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute top-[5%] right-[5%] w-96 h-96 bg-[#00FF88] opacity-15 rounded-full blur-[120px]" />
        <div className="absolute bottom-[5%] left-[5%] w-96 h-96 bg-blue-500 opacity-15 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#ffffff02_1px,_transparent_1px)] bg-[length:32px_32px] opacity-40"></div>
      </div>



      {/* SECTION 1: Login Form (min-h-[85vh]) */}
      <div className="min-h-[85vh] w-full flex flex-col items-center justify-center p-6 lg:p-12 relative z-20 select-none">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md h-full flex flex-col items-center justify-center gap-6"
        >
          {/* Logo at h-40 */}
          <div className="flex justify-center select-none w-full -mb-4">
            <Link href="/" className="flex items-center justify-center group relative cursor-pointer">
              <img 
                src="https://vhbwfqqvsudznnfoqyjm.supabase.co/storage/v1/object/public/Logo/bioathlete_logo_transparent.png" 
                alt="BioAthlete Logo" 
                className="h-32 md:h-40 object-contain brightness-0 invert drop-shadow-[0_0_20px_rgba(0,255,136,0.2)] group-hover:drop-shadow-[0_0_35px_rgba(0,255,136,0.35)] transition-all duration-300 select-none"
              />
            </Link>
          </div>

          {/* Form container card */}
          <div className="w-full backdrop-blur-xl bg-white/5 p-8 rounded-3xl border border-white/10 hover:border-emerald-500/30 hover:shadow-[0_0_32px_rgba(0,255,136,0.08)] shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] transition-all duration-500 flex flex-col gap-6 select-none">
            <div className="flex flex-col gap-1 text-center select-none">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                Connexion
              </h2>
              <p className="text-gray-400 text-xs font-medium">
                Accédez à votre espace athlète professionnel
              </p>
            </div>

            <form className="flex flex-col gap-5" onSubmit={handleLogin}>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl text-xs font-semibold text-center select-none flex flex-col gap-2"
                >
                  <span>{error}</span>
                  {showResend && (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-emerald-400 hover:underline font-bold text-[10px] uppercase mt-1 cursor-pointer select-none"
                    >
                      Renvoyer le code
                    </button>
                  )}
                  {resendStatus && (
                    <span className="text-[10px] text-emerald-300 font-bold block mt-1">
                      {resendStatus}
                    </span>
                  )}
                </motion.div>
              )}
              
              <div className="flex flex-col gap-4 select-none">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                    Adresse e-mail
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 bg-neutral-900/80 border border-white/10 hover:border-white/20 focus:border-emerald-500/80 rounded-2xl text-white focus:outline-none transition-all text-xs placeholder-gray-600 focus:shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                    placeholder="Ex: ton@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-3 bg-neutral-900/80 border border-white/10 hover:border-white/20 focus:border-emerald-500/80 rounded-2xl text-white focus:outline-none transition-all text-xs placeholder-gray-600 focus:shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs tracking-wider uppercase rounded-2xl shadow-xl hover:shadow-[0_4px_24px_rgba(16,185,129,0.3)] transition-all transform select-none mt-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                    <span>Connexion...</span>
                  </>
                ) : (
                  "SE CONNECTER"
                )}
              </motion.button>
            </form>

            <div className="text-center pt-2 border-t border-white/5 select-none">
              <p className="text-gray-400 text-xs">
                Pas encore inscrit ?{" "}
                <Link href="/register" className="text-emerald-400 hover:underline font-bold transition-all">
                  Créer mon profil
                </Link>
              </p>
            </div>
          </div>

          {/* Event Driven Scroll Down Arrow */}
          <div 
            onClick={scrollToNextSection}
            className="flex flex-col items-center justify-center gap-1.5 cursor-pointer select-none mt-2 text-gray-500 hover:text-emerald-400 transition-all z-40"
          >
            <span className="text-[10px] uppercase font-black tracking-widest select-none">En savoir plus</span>
            <span className="text-sm animate-bounce">↓</span>
          </div>
        </motion.div>
      </div>

      {/* SECTION 2 & 3: HORIZONTAL SCROLL SLIDER */}
      <div ref={wrapperRef} className="relative h-[250vh] w-full select-none z-30 -mt-12">
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center bg-black/40 backdrop-blur-sm select-none">
          <motion.div
            style={{ x: horizontalX }}
            className="flex w-[300vw] h-screen items-center select-none flex-shrink-0"
          >
            
            {/* Card 1 */}
            <div className="w-screen h-screen flex-shrink-0 flex flex-col items-center justify-center p-6 lg:p-12 select-none">
              <div className="w-full max-w-2xl flex flex-col items-center text-center gap-6">
                <div className="text-6xl md:text-8xl">🏅</div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-white uppercase">
                  Profil Élite Certifié
                </h2>
                <p className="text-[#00FF88] text-xs lg:text-sm font-extrabold uppercase tracking-widest drop-shadow-[0_0_8px_rgba(0,255,136,0.35)] select-none">
                  Plus-value n°1 : Une visibilité haut de gamme
                </p>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed font-medium max-w-lg select-none">
                  Bénéficiez d&apos;une vitrine d&apos;athlète professionnelle d&apos;élite, mettant en avant vos réalisations pour attirer fans, marques et médias.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="w-screen h-screen flex-shrink-0 flex flex-col items-center justify-center p-6 lg:p-12 border-l border-white/5 bg-neutral-950/40 backdrop-blur-md select-none">
              <div className="w-full max-w-2xl flex flex-col items-center text-center gap-6">
                <div className="text-6xl md:text-8xl">⏱️</div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-white uppercase">
                  Gestion des Chronos
                </h2>
                <p className="text-[#00FF88] text-xs lg:text-sm font-extrabold uppercase tracking-widest drop-shadow-[0_0_8px_rgba(0,255,136,0.35)] select-none">
                  Plus-value n°2 : Vos chronos au centième
                </p>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed font-medium max-w-lg select-none">
                  Saisissez directement vos chronos sur 60m, 100m et observez votre courbe d&apos;évolution pour une progression constante.
                </p>
              </div>
            </div>

            {/* Card 3 + Final Button */}
            <div className="w-screen h-screen flex-shrink-0 flex flex-col items-center justify-center p-6 lg:p-12 border-l border-white/5 bg-neutral-950/70 backdrop-blur-md select-none">
              <div className="w-full max-w-2xl flex flex-col items-center text-center gap-6 select-none">
                <div className="text-6xl md:text-8xl">🤝</div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-white uppercase">
                  Vitrine Sponsors
                </h2>
                <p className="text-[#00FF88] text-xs lg:text-sm font-extrabold uppercase tracking-widest drop-shadow-[0_0_8px_rgba(0,255,136,0.35)] select-none">
                  Plus-value n°3 : Vos partenaires à l&apos;honneur
                </p>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed font-medium max-w-lg select-none">
                  Mettez en avant vos sponsors et partenaires avec vos propres liens ou proposez des emplacements disponibles aux marques qui vous soutiennent.
                </p>

                {/* CTA Final */}
                <div className="flex flex-col items-center gap-4 mt-6 w-full max-w-sm select-none">
                  <Link href="/register" className="w-full">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full py-4 bg-[#00FF88] hover:bg-emerald-400 text-black font-black text-xs tracking-wider uppercase rounded-2xl shadow-xl hover:shadow-[0_4px_32px_rgba(0,255,136,0.45)] transition-all duration-300 flex items-center justify-center gap-2 select-none"
                    >
                      ⚡ Créer mon profil
                    </motion.button>
                  </Link>
                  <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider select-none">
                    Rejoignez l&apos;élite en moins de 30 secondes
                  </p>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </div>

    </div>
  );
}
