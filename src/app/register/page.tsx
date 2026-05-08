"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const availableDisciplines = [
  "60m", "100m", "200m", "400m",
  "60mH", "100mH", "110mH", "400mH",
  "Demi-fond/Fond",
  "Longueur", "Triple saut", "Hauteur", "Perche",
  "Poids", "Disque", "Marteau", "Javelot",
  "Décathlon", "Heptathlon"
];

export default function RegisterPage() {
  const router = useRouter();

  // Onboarding Steps: 1 (Identity), 2 (Discipline Filter), 3 (Sponsor), 4 (Security & Create), 5 (Upsell Premium), 6 (OTP Verification)
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    discipline: "",
    hasSponsor: false,
    sponsorName: "",
    email: "",
    password: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [otpToken, setOtpToken] = useState("");

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  // Filter disciplines based on user search
  const filteredDisciplines = availableDisciplines.filter((d) =>
    d.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stepper Validation Handlers
  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!formData.firstName || !formData.lastName || !formData.birthDate) {
      setError("Veuillez remplir tous les champs d'identité.");
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = () => {
    setError("");
    if (!formData.discipline) {
      setError("Veuillez sélectionner une discipline.");
      return;
    }
    setStep(3);
  };

  const handleNextStep3 = () => {
    setError("");
    if (formData.hasSponsor && !formData.sponsorName) {
      setError("Veuillez préciser le nom de votre sponsor.");
      return;
    }
    setStep(4);
  };

  // Create User via Supabase & insert profile details
  const handleCreateAccountStep4 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!formData.email || !formData.password) {
        setError("L'e-mail et le mot de passe sont obligatoires.");
        setLoading(false);
        return;
      }

      const response = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (response.error) {
        setError(response.error.message);
        setLoading(false);
        return;
      }

      if (response.data?.user) {
        // Build readable unique username fallback
        const generatedUsername =
          formData.firstName.toLowerCase().replace(/[^a-z0-9]/g, "") +
          "-" +
          Date.now().toString().slice(-4);

        const bio = `Discipline : ${formData.discipline}${
          formData.hasSponsor ? ` • Sponsor : ${formData.sponsorName}` : ""
        }${formData.birthDate ? ` • Date de naissance : ${formData.birthDate}` : ""}`;

        // Insert structured athlete details into the database profiles row
        await supabase.from("profiles").insert([
          {
            user_id: response.data.user.id,
            username: generatedUsername,
            full_name: `${formData.firstName} ${formData.lastName}`,
            bio: bio,
            is_premium: false,
          },
        ]);

        if (response.data.session) {
          router.push("/dashboard");
        } else {
          setStep(5);
        }
      } else {
        setError("Une erreur inattendue est survenue lors de la création.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur de connexion lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  // OTP token verification step
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otpToken || otpToken.length < 6) {
      setError("Veuillez entrer le code de vérification à 6 chiffres.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: otpError } = await supabase.auth.verifyOtp({
        email: formData.email.trim(),
        token: otpToken,
        type: "signup",
      });

      if (otpError) {
        setError(otpError.message);
      } else if (data.user || data.session) {
        router.push("/dashboard");
      } else {
        setError("Échec de la validation. Veuillez réessayer.");
      }
    } catch (err: any) {
      setError("Erreur de confirmation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500 selection:text-black select-none relative overflow-hidden flex flex-col justify-between">
      
      {/* Dynamic Background Neon Glowing Halo Lights */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none z-0 select-none"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none z-0 select-none"></div>

      {/* Main Form Stepper Wrapper */}
      <div className="relative z-10 max-w-lg mx-auto w-full px-5 py-12 flex flex-col items-center justify-center gap-10 flex-grow select-none">
        
        <Link href="/" className="flex items-center justify-center gap-2 group select-none">
          <img 
            src="https://vhbwfqqvsudznnfoqyjm.supabase.co/storage/v1/object/public/Logo/bioathlete_logo_transparent.png" 
            alt="BioAthlete Logo" 
            className="h-14 object-contain group-hover:opacity-100 transition-opacity drop-shadow-[0_0_12px_rgba(0,255,136,0.2)] select-none"
          />
        </Link>

        {/* Dynamic Premium Visually Progress Stepper Bar */}
        {step < 6 && (
          <div className="w-full flex flex-col gap-3 select-none">
            <div className="flex flex-col gap-1 text-center mb-1">
              <h4 className="text-sm font-black uppercase tracking-wider text-white">
                {step === 1 && "Faisons connaissance"}
                {step === 2 && "Votre terrain de jeu"}
                {step === 3 && "Vos partenaires"}
                {step === 4 && "Verrouillez votre espace"}
                {step === 5 && "Passez au niveau supérieur"}
              </h4>
              <p className="text-xs text-gray-400 font-medium">
                {step === 1 && "C'est la base de votre future vitrine professionnelle."}
                {step === 2 && "Pour adapter vos statistiques et le suivi de vos chronos."}
                {step === 3 && "Mettons en lumière les sponsors qui vous soutiennent."}
                {step === 4 && "Sécurisez l'accès à vos performances et générez votre profil."}
                {step === 5 && "Découvrez les avantages d'un profil Élite."}
              </p>
            </div>
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                Onboarding <span className="text-[#00FF88]">Étape {step} / 5</span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                {Math.round((step / 5) * 100)}%
              </span>
            </div>
            <div className="w-full h-1 bg-white/5 border border-white/10 rounded-full overflow-hidden select-none">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(step / 5) * 100}%` }}
                transition={{ duration: 0.4 }}
                className="h-full bg-gradient-to-r from-emerald-400 to-[#00FF88] shadow-[0_0_8px_rgba(0,255,136,0.5)]"
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: Identity */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
              className="w-full backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col gap-6"
            >
              <div className="text-center select-none">
                <h3 className="text-xl font-black tracking-tight text-white uppercase select-none">
                  Identité de l&apos;athlète
                </h3>
                <p className="text-gray-400 text-xs font-medium mt-1">
                  Présentez-vous pour commencer
                </p>
              </div>

              <form onSubmit={handleNextStep1} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Michael"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="w-full p-3.5 bg-neutral-900 border border-white/10 rounded-2xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white placeholder-gray-600"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Johnson"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="w-full p-3.5 bg-neutral-900 border border-white/10 rounded-2xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white placeholder-gray-600"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                    Date de naissance
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange("birthDate", e.target.value)}
                    className="w-full p-3.5 bg-neutral-900 border border-white/10 rounded-2xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white placeholder-gray-600"
                  />
                </div>

                {error && (
                  <p className="text-red-400 border border-red-500/30 bg-red-500/10 text-xs font-semibold px-3 py-2 rounded-xl animate-pulse leading-relaxed">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs tracking-wider uppercase rounded-2xl shadow-xl hover:shadow-[0_4px_24px_rgba(16,185,129,0.3)] transition-all duration-300 mt-1 select-none"
                >
                  Suivant
                </button>
              </form>

              <div className="text-center pt-2 border-t border-white/5 select-none">
                <p className="text-xs text-gray-400">
                  Vous possédez déjà un compte ?{" "}
                  <Link href="/login" className="text-emerald-400 hover:underline font-bold transition-all">
                    Se connecter
                  </Link>
                </p>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Searchable dropdown selectable filter */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
              className="w-full backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col gap-6"
            >
              <div className="text-center select-none">
                <h3 className="text-xl font-black tracking-tight text-white uppercase select-none">
                  Discipline d&apos;athlétisme
                </h3>
                <p className="text-gray-400 text-xs font-medium mt-1">
                  Sélectionnez votre spécialité ou recherchez-la
                </p>
              </div>

              <div className="flex flex-col gap-4 relative">
                <div className="flex flex-col gap-1 relative select-none">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                    Rechercher une discipline
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 100m, Sauts, Haies..."
                    value={searchQuery}
                    onFocus={() => setShowDropdown(true)}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowDropdown(true);
                    }}
                    className="w-full p-3.5 bg-neutral-900 border border-white/10 rounded-2xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white placeholder-gray-600"
                  />
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-0 right-0 bg-neutral-900 border border-white/15 max-h-48 overflow-y-auto rounded-2xl mt-1 z-50 flex flex-col gap-1 p-2 shadow-2xl select-none"
                    >
                      {filteredDisciplines.length > 0 ? (
                        filteredDisciplines.map((d, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              handleInputChange("discipline", d);
                              setSearchQuery(d);
                              setShowDropdown(false);
                            }}
                            className={`w-full text-left p-3 text-xs font-medium rounded-xl transition-all select-none ${
                              formData.discipline === d
                                ? "bg-emerald-500/20 text-emerald-400 font-bold"
                                : "text-gray-300 hover:bg-white/5"
                            }`}
                          >
                            🏃 {d}
                          </button>
                        ))
                      ) : (
                        <p className="text-gray-500 text-xs p-3">Aucune discipline trouvée.</p>
                      )}
                    </motion.div>
                  )}
                </div>

                {formData.discipline && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3.5 rounded-xl text-xs font-bold text-center select-none">
                    Spécialité choisie : <span className="text-white font-black">{formData.discipline}</span>
                  </div>
                )}

                {error && (
                  <p className="text-red-400 border border-red-500/30 bg-red-500/10 text-xs font-semibold px-3 py-2 rounded-xl animate-pulse leading-relaxed">
                    {error}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3 w-full mt-1">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black text-xs tracking-wider uppercase rounded-2xl transition-all duration-300 select-none"
                  >
                    Retour
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep2}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs tracking-wider uppercase rounded-2xl shadow-xl hover:shadow-[0_4px_24px_rgba(16,185,129,0.3)] transition-all duration-300 select-none"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Sponsoring */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
              className="w-full backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col gap-6"
            >
              <div className="text-center select-none">
                <h3 className="text-xl font-black tracking-tight text-white uppercase select-none">
                  Gestion Sponsors
                </h3>
                <p className="text-gray-400 text-xs font-medium mt-1">
                  Précisez vos partenariats actuels
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2 select-none">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                    Avez-vous un sponsor ?
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleInputChange("hasSponsor", true)}
                      className={`py-3.5 text-xs font-black tracking-wider rounded-2xl border uppercase transition-all select-none ${
                        formData.hasSponsor
                          ? "bg-emerald-500 border-emerald-500 text-black shadow-lg"
                          : "bg-neutral-900 border-white/10 text-gray-400 hover:border-white/20"
                      }`}
                    >
                      Oui
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleInputChange("hasSponsor", false);
                        handleInputChange("sponsorName", "");
                      }}
                      className={`py-3.5 text-xs font-black tracking-wider rounded-2xl border uppercase transition-all select-none ${
                        !formData.hasSponsor
                          ? "bg-white/10 border-white/20 text-white shadow-lg"
                          : "bg-neutral-900 border-white/10 text-gray-400 hover:border-white/20"
                      }`}
                    >
                      Non
                    </button>
                  </div>
                </div>

                {formData.hasSponsor && (
                  <div className="flex flex-col gap-1 select-none animate-fadeIn">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                      Nom du sponsor
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: SpikeSpeed, Nike..."
                      value={formData.sponsorName}
                      onChange={(e) => handleInputChange("sponsorName", e.target.value)}
                      className="w-full p-3.5 bg-neutral-900 border border-white/10 rounded-2xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white placeholder-gray-600"
                    />
                  </div>
                )}

                {error && (
                  <p className="text-red-400 border border-red-500/30 bg-red-500/10 text-xs font-semibold px-3 py-2 rounded-xl animate-pulse leading-relaxed">
                    {error}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3 w-full mt-1">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black text-xs tracking-wider uppercase rounded-2xl transition-all duration-300 select-none"
                  >
                    Retour
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep3}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs tracking-wider uppercase rounded-2xl shadow-xl hover:shadow-[0_4px_24px_rgba(16,185,129,0.3)] transition-all duration-300 select-none"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Security & Create */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
              className="w-full backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col gap-6"
            >
              <div className="text-center select-none">
                <h3 className="text-xl font-black tracking-tight text-white uppercase select-none">
                  Sécurité du compte
                </h3>
                <p className="text-gray-400 text-xs font-medium mt-1">
                  Créez vos identifiants de connexion
                </p>
              </div>

              <form onSubmit={handleCreateAccountStep4} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1 select-none">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                    Adresse e-mail
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="athlete@bioathlete.space"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full p-3.5 bg-neutral-900 border border-white/10 rounded-2xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white placeholder-gray-600"
                  />
                </div>

                <div className="flex flex-col gap-1 select-none">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="w-full p-3.5 bg-neutral-900 border border-white/10 rounded-2xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white placeholder-gray-600"
                  />
                </div>

                {error && (
                  <p className="text-red-400 border border-red-500/30 bg-red-500/10 text-xs font-semibold px-3 py-2 rounded-xl animate-pulse leading-relaxed">
                    {error}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3 w-full mt-1">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black text-xs tracking-wider uppercase rounded-2xl transition-all duration-300 select-none"
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs tracking-wider uppercase rounded-2xl shadow-xl hover:shadow-[0_4px_24px_rgba(16,185,129,0.3)] transition-all duration-300 select-none flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                        <span>Création...</span>
                      </>
                    ) : (
                      "Créer mon profil"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 5: Premium Upsell */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
              className="w-full backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col gap-6"
            >
              <div className="text-center select-none">
                <div className="text-5xl mb-2">⭐</div>
                <h3 className="text-xl font-black tracking-tight text-white uppercase select-none">
                  Passez à l&apos;Élite Premium
                </h3>
                <p className="text-gray-400 text-xs font-medium mt-1 leading-relaxed">
                  Activez des outils premium pour booster votre visibilité
                </p>
              </div>

              <div className="flex flex-col gap-3 select-none">
                <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3">
                  <span className="text-xl">📊</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Statistiques de visites</span>
                    <span className="text-[10px] text-gray-400">Découvrez qui visite votre profil</span>
                  </div>
                </div>
                <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3">
                  <span className="text-xl">🔗</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Liens personnalisables</span>
                    <span className="text-[10px] text-gray-400">Ajoutez des liens illimités</span>
                  </div>
                </div>
                <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3">
                  <span className="text-xl">💎</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Badge premium</span>
                    <span className="text-[10px] text-gray-400">Affichez votre statut d&apos;élite</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full mt-2 select-none">
                <button
                  type="button"
                  onClick={() => setStep(6)}
                  className="w-full py-4 bg-[#00FF88] hover:bg-emerald-400 text-black font-black text-xs tracking-wider uppercase rounded-2xl shadow-xl hover:shadow-[0_4px_24px_rgba(0,255,136,0.3)] transition-all duration-300 select-none"
                >
                  Découvrir les offres
                </button>
                <button
                  type="button"
                  onClick={() => setStep(6)}
                  className="w-full py-3 hover:underline text-gray-500 font-black text-[10px] tracking-wider uppercase select-none cursor-pointer"
                >
                  Ignorer pour le moment
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 6: OTP token Validation step */}
          {step === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
              className="w-full backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col gap-6 select-none"
            >
              <div className="text-center select-none">
                <h3 className="text-xl font-black tracking-tight text-white uppercase select-none">
                  Confirmation de compte
                </h3>
                <p className="text-gray-400 text-xs font-medium select-none mt-1 leading-relaxed">
                  Un code OTP à 6 chiffres a été envoyé à :<br />
                  <span className="text-[#00FF88] font-bold">{formData.email}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1 select-none">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                    Code OTP à 6 chiffres
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    placeholder="123456"
                    value={otpToken}
                    onChange={(e) => setOtpToken(e.target.value)}
                    className="w-full p-4 bg-neutral-900 border border-white/10 rounded-2xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-base text-center tracking-[0.4em] font-black text-emerald-400 placeholder-gray-700"
                  />
                </div>

                {error && (
                  <p className="text-red-400 border border-red-500/30 bg-red-500/10 text-xs font-semibold px-3 py-2 rounded-xl animate-pulse leading-relaxed">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs tracking-wider uppercase rounded-2xl shadow-xl hover:shadow-[0_4px_24px_rgba(16,185,129,0.3)] transition-all duration-300 select-none flex items-center justify-center gap-2 mt-1"
                >
                  {loading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                      <span>Validation...</span>
                    </>
                  ) : (
                    "Valider mon compte"
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

      </div>



    </div>
  );
}
