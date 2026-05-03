"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import jsPDF from "jspdf";

interface Performance {
  id?: string;
  date: string;
  distance: string;
  temps: string;
  competition: string;
}

interface SocialLink {
  id: string | number;
  title: string;
  url: string;
  icon: string;
}

export default function DashboardPage() {
  const router = useRouter();

  // Local state with simulated fallback mock data
  const [performances, setPerformances] = useState<Performance[]>([
    { date: "2024-02-15", distance: "60m", temps: "6.55", competition: "Chpt de France" },
    { date: "2024-04-20", distance: "100m", temps: "10.32", competition: "Meeting Intl" },
    { date: "2024-10-12", distance: "100m", temps: "9.98", competition: "Finale Or" },
  ]);

  const [links, setLinks] = useState<SocialLink[]>([
    { id: 1, title: "FFA Officiel", url: "https://www.athle.fr/", icon: "🏅" },
    { id: 2, title: "Instagram", url: "https://instagram.com/", icon: "📸" },
  ]);

  const [views, setViews] = useState(124); // Compteur de visites local / fallback

  // Form states
  const [newDate, setNewDate] = useState("");
  const [newDistance, setNewDistance] = useState("100m");
  const [newTemps, setNewTemps] = useState("");
  const [newComp, setNewComp] = useState("");

  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkIcon, setNewLinkIcon] = useState("🔗");

  // Load data from Supabase on mount
  useEffect(() => {
    async function loadSupabaseData() {
      try {
        const { data: perfData, error: perfErr } = await supabase.from("performances").select("*");
        if (!perfErr && perfData && perfData.length > 0) {
          setPerformances(perfData);
        }

        const { data: linkData, error: linkErr } = await supabase.from("links").select("*");
        if (!linkErr && linkData && linkData.length > 0) {
          setLinks(linkData);
        }

        const { data: viewData, error: viewErr } = await supabase.from("views").select("*");
        if (!viewErr && viewData && viewData.length > 0) {
          setViews(viewData.length);
        }
      } catch (err) {
        console.error("Erreur chargement Supabase:", err);
      }
    }
    loadSupabaseData();
  }, []);

  const handleAddPerformance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newTemps) return;

    const newItem: Performance = {
      date: newDate,
      distance: newDistance,
      temps: newTemps,
      competition: newComp || "Meeting",
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
    if (!newLinkTitle || !newLinkUrl) return;

    const newItem: Omit<SocialLink, "id"> = {
      title: newLinkTitle,
      url: newLinkUrl,
      icon: newLinkIcon || "🔗",
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Exporter le Média Kit sous forme de PDF stylisé
  const handleGenerateMediaKit = () => {
    const doc = new jsPDF();

    // Fond foncé élégant du Média Kit
    doc.setFillColor(15, 15, 15);
    doc.rect(0, 0, 210, 297, "F");

    // En-tête
    doc.setTextColor(16, 185, 129); // Emerald
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text("MEDIA KIT ATHLÈTE", 20, 35);

    doc.setFontSize(12);
    doc.setTextColor(160, 160, 160);
    doc.text("Optimisé par BioAthlete.space", 20, 45);

    // Separateur
    doc.setDrawColor(40, 40, 40);
    doc.setLineWidth(1);
    doc.line(20, 52, 190, 52);

    // Informations Générales
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text("PROFIL ET PERFORMANCES", 20, 65);

    doc.setFontSize(11);
    doc.setTextColor(200, 200, 200);
    doc.text("Nom de l'athlète : Sprinteur N1", 20, 75);
    doc.text("Activités sportives : 100m, 60m", 20, 82);

    // Records & Performances
    doc.setFontSize(14);
    doc.setTextColor(16, 185, 129);
    doc.text("RECORDS HISTORIQUES", 20, 100);

    let currentY = 112;
    performances.forEach((perf) => {
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text(`${perf.distance} - ${perf.temps}s`, 20, currentY);

      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`${perf.competition} (${perf.date})`, 20, currentY + 6);

      currentY += 16;
    });

    // Liens & Réseaux Sociaux
    doc.setFontSize(14);
    doc.setTextColor(16, 185, 129);
    doc.text("LIENS ET RÉSEAUX SOCIAUX", 20, currentY + 10);

    currentY += 22;
    links.forEach((link) => {
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text(`${link.icon} ${link.title}`, 20, currentY);

      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`${link.url}`, 20, currentY + 6);

      currentY += 16;
    });

    // Pied de page
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Ce document est un Média Kit officiel généré par BioAthlete.", 20, 280);

    doc.save("Media_Kit_BioAthlete.pdf");
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-emerald-500 selection:text-black pb-16">
      {/* Radial neon effects */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-md mx-auto px-5 pt-8 flex flex-col gap-8 min-h-screen">
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

        {/* Compteur Visites (Glassmorphism Premium) */}
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

      </div>
    </div>
  );
}
