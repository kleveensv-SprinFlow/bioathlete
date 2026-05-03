"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import jsPDF from "jspdf";

interface Performance {
  id?: string;
  date: string;
  distance: string;
  temps: string;
  competition: string;
  user_id?: string;
}

interface SocialLink {
  id: string | number;
  title: string;
  url: string;
  icon: string;
  user_id?: string;
}

interface Sponsor {
  id: string | number;
  name: string;
  logo: string;
  category?: string; // "Équipementier" or "Partenaire"
  user_id?: string;
}

interface Video {
  id: string | number;
  url: string;
  title: string;
  user_id?: string;
}

const PREDEFINED_EQUIPEMENTIERS = [
  { name: "Nike", logo: "👟 Nike" },
  { name: "Adidas", logo: "👟 Adidas" },
  { name: "Puma", logo: "👟 Puma" },
  { name: "Asics", logo: "👟 Asics" },
  { name: "New Balance", logo: "👟 NB" },
  { name: "Kiprun", logo: "👟 Kiprun" },
  { name: "Decathlon", logo: "👟 Decathlon" },
  { name: "Mizuno", logo: "👟 Mizuno" },
  { name: "Hoka", logo: "👟 Hoka" },
  { name: "Saucony", logo: "👟 Saucony" },
];

const PREDEFINED_PARTENAIRES = [
  { name: "Red Bull", logo: "🥤 Red Bull" },
  { name: "Oakley", logo: "🕶️ Oakley" },
  { name: "Yazio", logo: "🥗 Yazio" },
];

export default function DashboardPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [profSuccess, setProfSuccess] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [showStripeModal, setShowStripeModal] = useState(false);

  const [performances, setPerformances] = useState<Performance[]>([]);
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [views, setViews] = useState(0);

  // Form states
  const [newDate, setNewDate] = useState("");
  const [newDistance, setNewDistance] = useState("100m");
  const [newTemps, setNewTemps] = useState("");
  const [newComp, setNewComp] = useState("");

  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkIcon, setNewLinkIcon] = useState("🔗");

  const [selectedEquip, setSelectedEquip] = useState("Nike");
  const [selectedPartner, setSelectedPartner] = useState("Red Bull");
  const [customSponsorName, setCustomSponsorName] = useState("");

  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newVideoTitle, setNewVideoTitle] = useState("");

  const [shareText, setShareText] = useState("");
  const [linkError, setLinkError] = useState("");

  // Load user data and content
  useEffect(() => {
    async function loadUserAndContent() {
      try {
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !user) {
          router.push("/login");
          return;
        }

        const uid = user.id;
        setUserId(uid);

        // Fetch user profile username
        const { data: profData, error: profErr } = await supabase
          .from("profiles")
          .select("username, is_premium")
          .eq("user_id", uid)
          .maybeSingle();

        if (!profErr && profData) {
          setUsername(profData.username || "");
          setUsernameInput(profData.username || "");
          setIsPremium(profData.is_premium || false);
        }

        // Fetch filtered data
        const { data: perfData, error: perfErr } = await supabase
          .from("performances")
          .select("*")
          .eq("user_id", uid);
        if (!perfErr && perfData) setPerformances(perfData);

        const { data: linkData, error: linkErr } = await supabase
          .from("links")
          .select("*")
          .eq("user_id", uid);
        if (!linkErr && linkData) setLinks(linkData);

        const { data: spData, error: spErr } = await supabase
          .from("sponsors")
          .select("*")
          .eq("user_id", uid);
        if (!spErr && spData) setSponsors(spData);

        const { data: vidData, error: vidErr } = await supabase
          .from("videos")
          .select("*")
          .eq("user_id", uid);
        if (!vidErr && vidData) setVideos(vidData);

        const { data: viewData, error: viewErr } = await supabase
          .from("views")
          .select("*");
        if (!viewErr && viewData) setViews(viewData.length);
      } catch (err) {
        console.error("Erreur chargement Supabase:", err);
      }
    }
    loadUserAndContent();
  }, [router]);

  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput || !userId) return;
    setProfSuccess("");

    try {
      const { data, error } = await supabase
        .from("profiles")
        .upsert([{ user_id: userId, username: usernameInput.toLowerCase() }])
        .select();

      if (!error && data && data.length > 0) {
        setUsername(data[0].username);
        setUsernameInput(data[0].username);
        setProfSuccess("Nom d'utilisateur enregistré !");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpgradePremium = async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .upsert([{ user_id: userId, username: username || "athlete", is_premium: true }])
        .select();

      if (!error && data && data.length > 0) {
        setIsPremium(true);
        setProfSuccess("Mode Élite débloqué avec succès ! 🔥");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPerformance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newTemps || !userId) return;

    const newItem: Performance = {
      date: newDate,
      distance: newDistance,
      temps: newTemps,
      competition: newComp || "Meeting",
      user_id: userId,
    };

    try {
      const { data, error } = await supabase.from("performances").insert([newItem]).select();
      if (!error && data && data.length > 0) {
        setPerformances([...performances, data[0]]);
      } else {
        setPerformances([...performances, { ...newItem, id: Date.now().toString() }]);
      }
    } catch (err) {
      setPerformances([...performances, { ...newItem, id: Date.now().toString() }]);
    }

    setNewDate("");
    setNewTemps("");
    setNewComp("");
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkTitle || !newLinkUrl || !userId) return;
    setLinkError("");

    // Freemium restriction check: 3 links limit
    if (!isPremium && links.length >= 3) {
      setLinkError("Passe en mode Élite pour ajouter plus de liens !");
      return;
    }

    const newItem: Omit<SocialLink, "id"> = {
      title: newLinkTitle,
      url: newLinkUrl,
      icon: newLinkIcon || "🔗",
      user_id: userId,
    };

    try {
      const { data, error } = await supabase.from("links").insert([newItem]).select();
      if (!error && data && data.length > 0) {
        setLinks([...links, data[0]]);
      } else {
        setLinks([...links, { ...newItem, id: Date.now().toString() }]);
      }
    } catch (err) {
      setLinks([...links, { ...newItem, id: Date.now().toString() }]);
    }

    setNewLinkTitle("");
    setNewLinkUrl("");
    setNewLinkIcon("🔗");
  };

  // Step 1: Handling Category and exclusivity for Equipment Manufacturer (Équipementier)
  const handleAddEquipementier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    const matched = PREDEFINED_EQUIPEMENTIERS.find((eq) => eq.name === selectedEquip);
    const newItem: Omit<Sponsor, "id"> = {
      name: selectedEquip,
      logo: matched ? matched.logo : "🏢 " + selectedEquip,
      category: "Équipementier",
      user_id: userId,
    };

    try {
      // Exclusivity: Remove all previous "Équipementier" category sponsors for the user
      await supabase
        .from("sponsors")
        .delete()
        .eq("user_id", userId)
        .eq("category", "Équipementier");

      const { data, error } = await supabase.from("sponsors").insert([newItem]).select();

      // Refresh list
      const { data: spData } = await supabase
        .from("sponsors")
        .select("*")
        .eq("user_id", userId);
      if (spData) setSponsors(spData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    let newItem: Omit<Sponsor, "id">;
    if (customSponsorName.trim() !== "") {
      newItem = {
        name: customSponsorName,
        logo: "🏢 " + customSponsorName,
        category: "Partenaire",
        user_id: userId,
      };
    } else {
      const matched = PREDEFINED_PARTENAIRES.find((p) => p.name === selectedPartner);
      newItem = {
        name: selectedPartner,
        logo: matched ? matched.logo : "🏢 " + selectedPartner,
        category: "Partenaire",
        user_id: userId,
      };
    }

    try {
      const { data, error } = await supabase.from("sponsors").insert([newItem]).select();
      if (!error && data && data.length > 0) {
        setSponsors([...sponsors, data[0]]);
      } else {
        setSponsors([...sponsors, { ...newItem, id: Date.now().toString() }]);
      }
    } catch (err) {
      setSponsors([...sponsors, { ...newItem, id: Date.now().toString() }]);
    }

    setCustomSponsorName("");
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoUrl || !userId) return;

    const newItem: Omit<Video, "id"> = {
      url: newVideoUrl,
      title: newVideoTitle || "Vidéo d'athlétisme",
      user_id: userId,
    };

    try {
      const { data, error } = await supabase.from("videos").insert([newItem]).select();
      if (!error && data && data.length > 0) {
        setVideos([...videos, data[0]]);
      } else {
        setVideos([...videos, { ...newItem, id: Date.now().toString() }]);
      }
    } catch (err) {
      setVideos([...videos, { ...newItem, id: Date.now().toString() }]);
    }

    setNewVideoUrl("");
    setNewVideoTitle("");
  };

  const handleShareProfile = () => {
    if (!username) return;
    const profileUrl = `${window.location.origin}/u/${username}`;
    navigator.clipboard.writeText(profileUrl);
    setShareText("Lien copié dans le presse-papier !");
    setTimeout(() => setShareText(""), 3000);
  };

  const handleRemovePerformance = async (id: string | undefined, i: number) => {
    if (id) {
      try {
        await supabase.from("performances").delete().eq("id", id);
      } catch (err) {
        console.error(err);
      }
    }
    setPerformances(performances.filter((_, idx) => idx !== i));
  };

  const handleRemoveLink = async (id: string | number, i: number) => {
    if (id && typeof id === "string") {
      try {
        await supabase.from("links").delete().eq("id", id);
      } catch (err) {
        console.error(err);
      }
    }
    setLinks(links.filter((_, idx) => idx !== i));
  };

  const handleRemoveSponsor = async (id: string | number, i: number) => {
    if (id && typeof id === "string") {
      try {
        await supabase.from("sponsors").delete().eq("id", id);
      } catch (err) {
        console.error(err);
      }
    }
    setSponsors(sponsors.filter((_, idx) => idx !== i));
  };

  const handleRemoveVideo = async (id: string | number, i: number) => {
    if (id && typeof id === "string") {
      try {
        await supabase.from("videos").delete().eq("id", id);
      } catch (err) {
        console.error(err);
      }
    }
    setVideos(videos.filter((_, idx) => idx !== i));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleGenerateMediaKit = () => {
    const doc = new jsPDF();
    doc.setFillColor(15, 15, 15);
    doc.rect(0, 0, 210, 297, "F");

    doc.setTextColor(16, 185, 129);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text("MEDIA KIT ATHLÈTE", 20, 35);

    doc.setFontSize(12);
    doc.setTextColor(160, 160, 160);
    doc.text("Optimisé par BioAthlete.space", 20, 45);

    doc.setDrawColor(40, 40, 40);
    doc.setLineWidth(1);
    doc.line(20, 52, 190, 52);

    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text("PROFIL ET PERFORMANCES", 20, 65);

    doc.setFontSize(11);
    doc.setTextColor(200, 200, 200);
    doc.text(`Nom de l'athlète : ${username || "Sprinteur N1"}`, 20, 75);
    doc.text("Activités sportives : 100m, 60m", 20, 82);

    doc.save("Media_Kit_BioAthlete.pdf");
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-emerald-500 selection:text-black pb-16">
      {/* Radial neon effects */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-md mx-auto px-5 pt-8 flex flex-col gap-8 min-h-screen">
        {/* Navigation top bar */}
        <div className="w-full flex items-center justify-start select-none">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-emerald-400 font-bold text-xs uppercase tracking-wider transition-colors duration-300">
            <span>←</span> Retour à l'accueil
          </Link>
        </div>

        {/* Top bar with logo and logout */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-300">
              Dashboard
            </h1>
            <p className="text-gray-400 text-xs">Gestion du profil BioAthlete</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-white/5 border border-white/10 text-xs font-bold rounded-xl text-gray-300 hover:bg-white/10 transition-all duration-300 select-none"
          >
            Déconnexion
          </button>
        </div>

        {/* Freemium Banner & Option Élite */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col gap-4 select-none"
        >
          <div className="flex items-center justify-between select-none">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Statut de votre compte
              </h3>
              <p className="text-gray-300 text-sm font-black uppercase tracking-wide mt-1">
                {isPremium ? "🏆 Mode Élite Actif" : "🆓 Compte Standard (Gratuit)"}
              </p>
            </div>
            {!isPremium && (
              <button
                onClick={() => setShowStripeModal(true)}
                className="px-4 py-2 bg-emerald-500 text-black font-extrabold text-xs tracking-wider uppercase rounded-xl hover:bg-emerald-400 shadow-lg transition-all"
              >
                Devenir Élite
              </button>
            )}
          </div>
          {!isPremium && (
            <p className="text-[10px] text-emerald-400 font-medium">
              Version Gratuite : Limite de 3 liens active
            </p>
          )}
        </motion.div>

        {/* Partager mon profil URL button */}
        {username && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleShareProfile}
            className="w-full py-4 bg-gradient-to-tr from-emerald-500/10 to-blue-500/10 hover:from-emerald-500/20 hover:to-blue-500/20 border border-emerald-500/30 hover:border-emerald-500/50 font-extrabold text-sm text-center text-white rounded-2xl shadow-xl hover:shadow-[0_4px_24px_rgba(16,185,129,0.15)] transition-all duration-300 tracking-wide uppercase select-none flex items-center justify-center gap-2"
          >
            🔗 Partager mon profil
          </motion.button>
        )}
        {shareText && (
          <p className="text-center text-xs text-emerald-400 font-semibold select-none -mt-5">{shareText}</p>
        )}

        {/* Configuration Username */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl select-none"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 select-none mb-3">
            Identité Publique & Profil URL
          </h3>
          <form onSubmit={handleSaveUsername} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Ex: bolt-95"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="w-full p-3 bg-neutral-900 border border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white placeholder-gray-600"
              required
            />
            {username && (
              <p className="text-[10px] text-gray-500 select-none">
                Votre profil est accessible sur :{" "}
                <Link href={`/u/${username}`} target="_blank" className="text-emerald-400 hover:underline">
                  /u/{username}
                </Link>
              </p>
            )}
            {profSuccess && (
              <p className="text-[10px] text-emerald-400 select-none">{profSuccess}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-extrabold uppercase tracking-wider text-white rounded-xl transition-all duration-300 select-none"
            >
              Enregistrer mon username
            </button>
          </form>
        </motion.div>

        {/* Compteur Visites */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl flex items-center justify-between hover:border-emerald-500/20 transition-all duration-300 select-none"
        >
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 select-none">
              Statistiques de visites
            </h3>
            <p className="text-gray-400 text-xs mt-0.5 select-none">Vues uniques de votre profil</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-400 tracking-tight">
              {views}
            </span>
            <span className="text-[10px] text-gray-500 uppercase font-semibold">Vues</span>
          </div>
        </motion.div>

        {/* Section Sponsors : Categorisation et Exclusivité Équipementier */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl select-none"
        >
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-4 select-none">
            Gestion des Sponsors
          </h2>
          
          {/* Categorie 1: Équipementier unique */}
          <form onSubmit={handleAddEquipementier} className="flex flex-col gap-3 mb-6">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                Choisir un Équipementier (Exclusif)
              </label>
              <select
                value={selectedEquip}
                onChange={(e) => setSelectedEquip(e.target.value)}
                className="w-full p-3 bg-neutral-900 border border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white"
              >
                {PREDEFINED_EQUIPEMENTIERS.map((eq) => (
                  <option key={eq.name} value={eq.name}>
                    {eq.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 font-extrabold text-xs tracking-wider uppercase text-black rounded-xl hover:shadow-[0_4px_16px_rgba(16,185,129,0.25)] transition-all duration-300 mt-1 select-none"
            >
              Définir mon Équipementier
            </button>
          </form>

          {/* Categorie 2: Partenaires multiples */}
          <form onSubmit={handleAddPartner} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                Choisir un Partenaire
              </label>
              <select
                value={selectedPartner}
                onChange={(e) => setSelectedPartner(e.target.value)}
                className="w-full p-3 bg-neutral-900 border border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white mb-2"
              >
                {PREDEFINED_PARTENAIRES.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                Ou ajouter un partenaire personnalisé
              </label>
              <input
                type="text"
                placeholder="Ex: Oakley"
                value={customSponsorName}
                onChange={(e) => setCustomSponsorName(e.target.value)}
                className="w-full p-3 bg-neutral-900 border border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white placeholder-gray-600"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 font-extrabold text-xs tracking-wider uppercase text-white rounded-xl transition-all duration-300 mt-1 select-none"
            >
              Ajouter Partenaire
            </button>
          </form>

          {/* Liste des Sponsors actuels */}
          <div className="flex flex-col gap-2 mt-4">
            {sponsors.map((sp, i) => (
              <div
                key={sp.id}
                className="w-full flex items-center justify-between p-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base p-1.5 bg-neutral-900 border border-white/5 rounded-xl">
                    {sp.logo}
                  </span>
                  <div className="flex flex-col select-none">
                    <span className="font-semibold text-sm text-white leading-none">
                      {sp.name}
                    </span>
                    <span className="text-[9px] text-emerald-400 font-bold uppercase mt-1">
                      {sp.category || "Sponsor"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveSponsor(sp.id, i)}
                  className="text-gray-600 hover:text-red-400 text-xs font-semibold px-2"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Section Vidéos */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl select-none"
        >
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-4 select-none">
            Gestion des Vidéos Externes
          </h2>
          <form onSubmit={handleAddVideo} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                Titre de la vidéo
              </label>
              <input
                type="text"
                placeholder="Ex: Finale 100m Olympique"
                value={newVideoTitle}
                onChange={(e) => setNewVideoTitle(e.target.value)}
                className="w-full p-3 bg-neutral-900 border border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white placeholder-gray-600"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                URL de la vidéo (YouTube, Vimeo, etc.)
              </label>
              <input
                type="url"
                placeholder="Ex: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                value={newVideoUrl}
                onChange={(e) => setNewVideoUrl(e.target.value)}
                className="w-full p-3 bg-neutral-900 border border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white placeholder-gray-600"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 font-extrabold text-xs tracking-wider uppercase text-black rounded-xl hover:shadow-[0_4px_16px_rgba(16,185,129,0.25)] transition-all duration-300 mt-1 select-none"
            >
              Ajouter Vidéo
            </button>
          </form>

          {/* Liste des Vidéos actuelles */}
          <div className="flex flex-col gap-2 mt-4">
            {videos.map((vid, i) => (
              <div
                key={vid.id}
                className="w-full flex items-center justify-between p-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex flex-col select-none">
                  <span className="font-semibold text-sm text-white block">
                    {vid.title}
                  </span>
                  <span className="text-[10px] text-gray-500 truncate max-w-[180px] block">
                    {vid.url}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveVideo(vid.id, i)}
                  className="text-gray-600 hover:text-red-400 text-xs font-semibold px-2"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Button Média Kit PDF */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGenerateMediaKit}
          className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 font-extrabold text-sm text-center text-white rounded-2xl shadow-xl hover:shadow-[0_4px_24px_rgba(16,185,129,0.1)] transition-all duration-300 tracking-wide uppercase select-none"
        >
          📄 Générer mon Média Kit (PDF)
        </motion.button>

        {/* Formulaire Performances */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl select-none"
        >
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-4 select-none">
            Mettre à jour les performances
          </h2>
          <form onSubmit={handleAddPerformance} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                  Distance
                </label>
                <select
                  value={newDistance}
                  onChange={(e) => setNewDistance(e.target.value)}
                  className="w-full p-3 bg-neutral-900 border border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white"
                >
                  <option value="60m">60m</option>
                  <option value="100m">100m</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                  Chrono (ex: 9.98)
                </label>
                <input
                  type="text"
                  placeholder="9.98"
                  value={newTemps}
                  onChange={(e) => setNewTemps(e.target.value)}
                  className="w-full p-3 bg-neutral-900 border border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white placeholder-gray-600"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                  Date
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full p-3 bg-neutral-900 border border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                  Compétition
                </label>
                <input
                  type="text"
                  placeholder="Championnats"
                  value={newComp}
                  onChange={(e) => setNewComp(e.target.value)}
                  className="w-full p-3 bg-neutral-900 border border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white placeholder-gray-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 font-extrabold text-xs tracking-wider uppercase text-black rounded-xl hover:shadow-[0_4px_16px_rgba(16,185,129,0.25)] transition-all duration-300 mt-1 select-none"
            >
              Ajouter Performance
            </button>
          </form>
        </motion.div>

        {/* Liste des Performances existantes */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 px-1 select-none">
            Performances Actuelles
          </h3>
          <div className="flex flex-col gap-2">
            {performances.map((perf, i) => (
              <div
                key={i}
                className="w-full flex items-center justify-between p-4 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors duration-300 select-none"
              >
                <div>
                  <span className="font-extrabold text-sm text-emerald-400 mr-2">
                    {perf.distance}
                  </span>
                  <span className="font-semibold text-sm text-white mr-1">{perf.temps}s</span>
                  <span className="text-[10px] text-gray-500 block">
                    {perf.competition} • {perf.date}
                  </span>
                </div>
                <button
                  onClick={() => handleRemovePerformance(perf.id, i)}
                  className="text-gray-600 hover:text-red-400 text-xs font-semibold px-2"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Formulaire Liens et Réseaux Sociaux */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl select-none"
        >
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-4 select-none">
            Ajouter un lien / réseau social
          </h2>
          <form onSubmit={handleAddLink} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                  Nom du lien
                </label>
                <input
                  type="text"
                  placeholder="World Athletics"
                  value={newLinkTitle}
                  onChange={(e) => setNewLinkTitle(e.target.value)}
                  className="w-full p-3 bg-neutral-900 border border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white placeholder-gray-600"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                  Emoji Icone
                </label>
                <input
                  type="text"
                  placeholder="📸"
                  value={newLinkIcon}
                  onChange={(e) => setNewLinkIcon(e.target.value)}
                  className="w-full p-3 bg-neutral-900 border border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white placeholder-gray-600"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                URL du lien
              </label>
              <input
                type="url"
                placeholder="https://worldathletics.org/"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                className="w-full p-3 bg-neutral-900 border border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white placeholder-gray-600"
                required
              />
            </div>

            {linkError && (
              <p className="text-red-400 text-xs font-semibold px-1 py-1 animate-pulse select-none">
                {linkError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 font-extrabold text-xs tracking-wider uppercase text-black rounded-xl hover:shadow-[0_4px_16px_rgba(16,185,129,0.25)] transition-all duration-300 mt-1 select-none"
            >
              Ajouter Lien
            </button>
          </form>
        </motion.div>

        {/* Liste des Liens existants */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 px-1 select-none">
            Liens & Sources Actuels
          </h3>
          <div className="flex flex-col gap-2">
            {links.map((link, i) => (
              <div
                key={link.id}
                className="w-full flex items-center justify-between p-4 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors duration-300 select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl p-2 bg-neutral-900 border border-white/5 rounded-xl">
                    {link.icon}
                  </span>
                  <div>
                    <span className="font-semibold text-sm text-white block">
                      {link.title}
                    </span>
                    <span className="text-[10px] text-gray-500 select-none truncate max-w-[180px] block">
                      {link.url}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveLink(link.id, i)}
                  className="text-gray-600 hover:text-red-400 text-xs font-semibold px-2"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* IP rights reminder mention */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 text-center mt-2 shadow-xl select-none">
          <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">
            Rappel : L&apos;athlète s&apos;engage à posséder l&apos;ensemble des droits de diffusion et d&apos;auteur pour les images, vidéos et contenus qu&apos;il publie sur son profil.
          </p>
        </div>

        {/* Premium Upgrade Stripe Modal */}
        {showStripeModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="backdrop-blur-2xl bg-neutral-900/90 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl max-w-sm w-full flex flex-col gap-5 border-t-emerald-400"
            >
              <div className="flex flex-col select-none">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  Élévation de statut
                </span>
                <h3 className="text-lg font-black text-white tracking-tight leading-snug">
                  Abonnement Mode Élite
                </h3>
                <p className="text-gray-400 text-xs">
                  Abonnement mensuel de 9.99 € • Annulable à tout moment
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2 text-xs text-gray-300 font-medium">
                  <span className="text-emerald-400 text-sm">⚡</span> Liens illimités (Plus de limites)
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-300 font-medium">
                  <span className="text-emerald-400 text-sm">🏆</span> Vitrine certifiée Élite Pro
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-300 font-medium">
                  <span className="text-emerald-400 text-sm">📄</span> Génération illimitée de Media Kit
                </div>
              </div>

              {/* Fake Stripe Credit Card Fields */}
              <div className="flex flex-col gap-3 pt-2 border-t border-white/5 select-none">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                    Numéro de carte
                  </label>
                  <input
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    defaultValue="4242424242424242"
                    className="w-full p-3 bg-neutral-950 border border-white/10 focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white placeholder-gray-600 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                      Expiration
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      defaultValue="12/26"
                      className="w-full p-3 bg-neutral-950 border border-white/10 focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white placeholder-gray-600 rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                      CVC
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      defaultValue="123"
                      className="w-full p-3 bg-neutral-950 border border-white/10 focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white placeholder-gray-600 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <button
                  onClick={() => {
                    handleUpgradePremium();
                    setShowStripeModal(false);
                  }}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs tracking-wider uppercase rounded-2xl shadow-xl hover:shadow-[0_4px_24px_rgba(16,185,129,0.3)] transition-all duration-300"
                >
                  Activer mon abonnement (9.99€)
                </button>
                <button
                  onClick={() => setShowStripeModal(false)}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </div>
        )}

      </div>
    </div>
  );
}


