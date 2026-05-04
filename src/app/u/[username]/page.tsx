"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts";

interface Record {
  distance: string;
  temps: string;
  competition: string;
}

interface SocialLink {
  title: string;
  url: string;
  icon: string;
}

interface Sponsor {
  id: string | number;
  name: string;
  logo: string;
  category?: string;
}

interface Video {
  id: string | number;
  url: string;
  title: string;
}

interface EvolutionPoint {
  date: string;
  "100m": number;
}


export interface PerformanceRaw {
  id?: string | number;
  distance: string;
  temps: string | number;
  date: string;
  competition?: string;
  [key: string]: any;
}

export interface ProcessedDiscipline {
  distance: string;
  records: PerformanceRaw[];
  firstRecord: PerformanceRaw;
  bestRecord: PerformanceRaw;
  improvementTime: string;
  improvementPercentage: string;
}

export function processPerformances(performances: PerformanceRaw[]): { [key: string]: ProcessedDiscipline } {
  const grouped: { [key: string]: PerformanceRaw[] } = {};

  performances.forEach(perf => {
    if (!grouped[perf.distance]) {
      grouped[perf.distance] = [];
    }
    grouped[perf.distance].push(perf);
  });

  const result: { [key: string]: ProcessedDiscipline } = {};

  for (const [distance, records] of Object.entries(grouped)) {
    const sortedByDate = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const sortedByTime = [...records].sort((a, b) => parseFloat(a.temps.toString()) - parseFloat(b.temps.toString()));

    const firstRecord = sortedByDate[0];
    const bestRecord = sortedByTime[0];

    const firstTime = parseFloat(firstRecord.temps.toString());
    const bestTime = parseFloat(bestRecord.temps.toString());

    let improvementTimeVal = bestTime - firstTime;
    let improvementPercentageVal = firstTime > 0 ? (improvementTimeVal / firstTime) * 100 : 0;

    let improvementTime = improvementTimeVal <= 0 ? `${improvementTimeVal.toFixed(2)}s` : `+${improvementTimeVal.toFixed(2)}s`;
    let improvementPercentage = improvementTimeVal <= 0 ? `${improvementPercentageVal.toFixed(1)}%` : `+${improvementPercentageVal.toFixed(1)}%`;

    result[distance] = {
      distance,
      records: sortedByDate,
      firstRecord,
      bestRecord,
      improvementTime,
      improvementPercentage
    };
  }

  return result;
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 20 } }
};

export default function PublicAthleteProfile() {
  const params = useParams();
  const username = params?.username as string;

  const [mounted, setMounted] = useState(false);
  const [profileNotFound, setProfileNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  const [profileData, setProfileData] = useState<{ full_name?: string; bio?: string; avatar_url?: string; photos?: { id: string; url: string; title: string }[] }>({});
  const [records, setRecords] = useState<Record[]>([]);
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [evolution, setEvolution] = useState<EvolutionPoint[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [processedPerformances, setProcessedPerformances] = useState<{ [key: string]: ProcessedDiscipline }>({});
  const [selectedDiscipline, setSelectedDiscipline] = useState<string | null>(null);

  const { scrollY } = useScroll();
  const headerY = useTransform(scrollY, [0, 400], [0, 100]);

  useEffect(() => {

    async function fetchAthleteByUsername() {
      if (!username) {
        setLoading(false);
        return;
      }




      try {
        await supabase.from("views").insert([{ count: 1 }]);

        // Fetch profile
        const { data: profile, error: profErr } = await supabase
          .from("profiles")
          .select("user_id, bio, avatar_url, photos, full_name")
          .eq("username", username.toLowerCase())
          .maybeSingle() as any;

        if (profErr || !profile?.user_id) {
          setProfileNotFound(true);
          setLoading(false);
          return;
        }

        setProfileData({
          full_name: profile.full_name,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          photos: profile.photos
        });

        const uid = profile.user_id;

        const { data: { user: currentUser } } = await supabase.auth.getUser();
        const isOwner = currentUser && currentUser.id === uid;

        // Increment user's specific views_count
        if (!isOwner) {
          try {
            const { error: rpcError } = await supabase.rpc('increment_views', { p_id: uid });
            if (rpcError) {
              const { data } = await supabase.from("profiles").select("views_count").eq("user_id", uid).single();
              if (data) {
                await supabase.from("profiles").update({ views_count: (data.views_count || 0) + 1 }).eq("user_id", uid);
              }
            }
          } catch (e) {}
        }

                // Fetch records
        const { data: perfData, error: perfErr } = await supabase
          .from("performances")
          .select("*")
          .eq("user_id", uid);

        if (!perfErr && perfData && perfData.length > 0) {
          const mappedRecords = perfData.slice(-2).map((p) => ({
            distance: p.distance,
            temps: p.temps + "s",
            competition: p.competition,
          }));
          setRecords(mappedRecords);

          const mappedEvolution = perfData.map((p) => ({
            date: p.date,
            "100m": parseFloat(p.temps),
          }));
          setEvolution(mappedEvolution);

          const processed = processPerformances(perfData);
          setProcessedPerformances(processed);
          const disciplines = Object.keys(processed);
          if (disciplines.length > 0) {
            setSelectedDiscipline(disciplines[0]);
          }
        }

        // Fetch links
        const { data: linkData, error: linkErr } = await supabase
          .from("links")
          .select("*")
          .eq("user_id", uid);
        if (!linkErr && linkData) setLinks(linkData);

        // Fetch sponsors
        const { data: spData, error: spErr } = await supabase
          .from("sponsors")
          .select("*")
          .eq("user_id", uid);
        if (!spErr && spData) setSponsors(spData);

        // Fetch videos
        const { data: vidData, error: vidErr } = await supabase
          .from("videos")
          .select("*")
          .eq("user_id", uid);
        if (!vidErr && vidData) setVideos(vidData);

      } catch (err) {
        console.error("Fetch profile err:", err);
      } finally {
        setMounted(true);
        setLoading(false);
      }
    }

    fetchAthleteByUsername();
  }, [username]);

  const formatEmbedUrl = (url: string) => {
    try {
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        const urlObj = new URL(url);
        let videoId = "";
        if (url.includes("youtu.be")) {
          videoId = urlObj.pathname.slice(1);
        } else {
          videoId = urlObj.searchParams.get("v") || "";
        }
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-sans">
        <p className="text-gray-500 text-xs tracking-wider uppercase animate-pulse select-none">
          Chargement du profil...
        </p>
      </div>
    );
  }

  if (profileNotFound) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6 font-sans px-5 text-center select-none">
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-300 tracking-tight">
          Athlète non trouvé
        </h2>
        <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
          Le profil que vous cherchez n&apos;existe pas ou a été désactivé.
        </p>
        <Link href="/" className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold rounded-xl text-emerald-400 tracking-wide uppercase transition-all duration-300">
          ← Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  const equipementiers = sponsors.filter((sp) => sp.category === "Équipementier");
  const partenaires = sponsors.filter((sp) => sp.category === "Partenaire" || !sp.category);
  const galleryPhotos = profileData.photos && profileData.photos.length > 0 ? profileData.photos : [];


  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500 selection:text-black">
      <div className="fixed top-[-15%] left-[-15%] w-[600px] h-[600px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-15%] right-[-15%] w-[600px] h-[600px] bg-blue-500/15 rounded-full blur-[140px] pointer-events-none z-0"></div>

      <div className="relative z-10 flex flex-col md:flex-row min-h-screen w-full max-w-[1400px] mx-auto">
        {/* COLONNE DE GAUCHE */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hidden md:flex w-full md:w-1/3 md:sticky md:top-0 md:h-screen flex-col justify-between p-8 md:p-12 border-b md:border-b-0 md:border-r border-white/5 bg-black/40 backdrop-blur-md z-20"
        >
          {/* Haut : Logo */}
          <div className="w-full flex justify-center md:justify-start select-none">
            <img
              src="/logo.png"
              alt="BioAthlete Logo"
              className="h-16 md:h-20 object-contain brightness-0 invert"
            />
          </div>

          {/* Centre : Navigation */}
          <nav className="flex flex-col gap-6 my-10 md:my-0 select-none items-center md:items-start">
            <a href="#performances" className="text-gray-400 hover:text-white font-black text-sm uppercase tracking-widest transition-colors flex items-center gap-3 group">
              <span className="hidden md:block w-8 h-[1px] bg-gray-600 group-hover:bg-[#00FF88] group-hover:w-12 transition-all duration-300"></span>
              Performances
            </a>
            <a href="#sponsors" className="text-gray-400 hover:text-white font-black text-sm uppercase tracking-widest transition-colors flex items-center gap-3 group">
              <span className="hidden md:block w-8 h-[1px] bg-gray-600 group-hover:bg-[#00FF88] group-hover:w-12 transition-all duration-300"></span>
              Sponsors
            </a>
            <a href="#medias" className="text-gray-400 hover:text-white font-black text-sm uppercase tracking-widest transition-colors flex items-center gap-3 group">
              <span className="hidden md:block w-8 h-[1px] bg-gray-600 group-hover:bg-[#00FF88] group-hover:w-12 transition-all duration-300"></span>
              Médias
            </a>
          </nav>

          {/* Bas : Réseaux & Sources */}
          <div className="flex items-center justify-center md:justify-start gap-4 flex-wrap select-none">
            {links.length > 0 ? (
              links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-lg hover:bg-white/10 hover:border-emerald-500/30 hover:text-emerald-400 transition-all duration-300 shadow-lg"
                  title={link.title}
                >
                  {link.icon || "🔗"}
                </a>
              ))
            ) : (
              <span className="text-xs text-gray-600 uppercase tracking-wider">Aucun réseau</span>
            )}
          </div>
        </motion.div>

        {/* COLONNE DE DROITE */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="w-full md:w-2/3 flex flex-col gap-12 pb-24 select-none"
        >





        {/* MOBILE TOP LEFT LOGO */}
        <div className="md:hidden absolute top-6 left-6 z-50 pointer-events-none">
          <img
            src="https://vhbwfqqvsudznnfoqyjm.supabase.co/storage/v1/object/public/Logo/bioathlete_logo_transparent.png"
            alt="BioAthlete Logo"
            className="h-8 object-contain brightness-0 invert drop-shadow-md"
          />
        </div>

        {/* HERO SECTION */}
        <motion.div
          variants={staggerItem}
          className="relative w-full h-[500px] md:h-[600px] overflow-hidden rounded-b-3xl md:rounded-3xl shadow-2xl group"
        >
          <motion.div style={{ y: headerY }} className="absolute inset-0 w-full h-[120%] -top-[10%]">
            {profileData.avatar_url ? (
              <img
                src={profileData.avatar_url}
                alt={username}
                className="w-full h-full object-cover object-top select-none"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-full h-full bg-gradient-to-b from-black via-[#111111] to-[#000000] flex flex-col items-center justify-center relative select-none ${profileData.avatar_url ? 'hidden' : ''}`}>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#00FF88]/20 via-black to-black opacity-60"></div>
              <div className="font-black text-8xl md:text-[120px] tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-[#00FF88]/50 select-none z-10 drop-shadow-[0_0_30px_rgba(0,255,136,0.3)]">
                {username?.slice(0, 2).toUpperCase() || "BA"}
              </div>
            </div>
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
          </motion.div>

          {/* Glassmorphism Info Overlay */}
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 flex flex-col gap-2">
            <div className="flex flex-col gap-1 select-none">
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white drop-shadow-md uppercase">
                {(profileData.full_name || username).toUpperCase()}
              </h1>
              <p className="text-[#00FF88] text-sm md:text-base font-extrabold uppercase tracking-widest select-none drop-shadow-[0_0_8px_rgba(0,255,136,0.5)]">
                Athlète
              </p>
            </div>
            <p className="text-gray-300 text-sm md:text-base max-w-2xl leading-relaxed select-none backdrop-blur-md bg-black/20 p-4 rounded-xl border border-white/10 mt-2">
              {profileData.bio || "Athlète passionné visant l'excellence sur les pistes nationales et internationales."}
            </p>
          </div>
        </motion.div>


        <div id="sponsors" className="w-full"></div>
        {equipementiers.length > 0 && (
          <motion.div variants={staggerItem} className="w-full select-none text-center flex flex-col items-center">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#00FF88] mb-2 select-none">
              Équipementier Officiel
            </h3>
            {equipementiers.map((eq, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                className="backdrop-blur-xl bg-white/5 border border-white/10 border-emerald-500/30 rounded-2xl px-6 py-4 flex items-center gap-3 shadow-xl select-none text-sm font-black tracking-wider uppercase"
              >
                <span className="text-2xl">{eq.logo}</span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {equipementiers.length === 0 && partenaires.length === 0 && (
          <motion.div variants={staggerItem} className="w-full select-none">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="w-full mt-2 select-none text-center flex flex-col items-center backdrop-blur-xl bg-gradient-to-r from-emerald-500/5 to-blue-500/5 border border-dashed border-emerald-500/30 rounded-2xl px-6 py-5 shadow-lg"
            >
              <h3 className="text-xs font-black uppercase tracking-wider text-[#00FF88]/80 mb-1">
                Espace Sponsoring Disponible
              </h3>
              <p className="text-[10px] text-gray-500 font-medium">Soutenez cet athlète dans sa progression</p>
            </motion.div>
          </motion.div>
        )}

        {partenaires.length > 0 && (
          <motion.div variants={staggerItem} className="w-full flex flex-wrap items-center justify-center gap-3 select-none">
            {partenaires.map((sp, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.1, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className="backdrop-blur-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg select-none text-xs font-bold hover:shadow-[0_0_15px_rgba(0,255,136,0.25)] transition-all duration-300"
              >
                <span>{sp.logo}</span>
              </motion.div>
            ))}
          </motion.div>
        )}

        <div id="medias" className="w-full"></div>
        {galleryPhotos.length > 0 && (
          <motion.div variants={staggerItem} className="w-full select-none">
            <div className="w-full flex items-center gap-4 overflow-x-auto pb-4 pt-2 snap-x select-none scrollbar-none">
              {galleryPhotos.map((photo, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.03 }}
                  className="w-[200px] flex-shrink-0 snap-center backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-lg select-none"
                >
                  <img
                    src={photo.url}
                    alt={photo.title}
                    width={200}
                    height={112}
                    className="w-full h-28 object-cover select-none pointer-events-none"
                    loading="lazy"
                    onError={(e) => e.currentTarget.src = 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80'}
                  />
                  <div className="p-3 text-[11px] font-bold text-gray-300 text-center uppercase tracking-wide">
                    {photo.title}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {videos.length > 0 && (
          <motion.div variants={staggerItem} className="w-full select-none flex flex-col gap-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#00FF88] px-1">
              Vidéos Présentation
            </h3>
            <div className="flex flex-col gap-4">
              {videos.map((vid, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  className="w-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-3 shadow-xl hover:border-emerald-500/20 transition-all duration-300 select-none overflow-hidden"
                >
                  {vid.title && (
                    <p className="text-xs font-bold uppercase tracking-wider text-white mb-2 truncate px-1">
                      {vid.title}
                    </p>
                  )}
                  <div className="w-full rounded-xl border border-white/10 overflow-hidden bg-black flex items-center justify-center">
                    {vid.url.includes("youtube.com") || vid.url.includes("youtu.be") || vid.url.includes("vimeo") ? (
                      <iframe
                        src={formatEmbedUrl(vid.url)}
                        title={vid.title}
                        className="w-full h-44 border-none select-none"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                      />
                    ) : (
                      <video
                        src={vid.url}
                        controls
                        controlsList="nodownload"
                        className="w-full max-h-64 object-contain"
                        preload="metadata"
                      />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <div id="performances" className="w-full"></div>
        {Object.keys(processedPerformances).length > 0 && selectedDiscipline && processedPerformances[selectedDiscipline] && (
          <motion.div variants={staggerItem} className="w-full flex flex-col gap-6 select-none">
            {/* TABS FOR DISCIPLINES */}
            <div className="w-full overflow-x-auto pb-2 scrollbar-none snap-x">
              <div className="flex gap-2">
                {Object.keys(processedPerformances).map((disc) => (
                  <button
                    key={disc}
                    onClick={() => setSelectedDiscipline(disc)}
                    className={`snap-center px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
                      selectedDiscipline === disc
                        ? "bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/30 shadow-[0_0_15px_rgba(0,255,136,0.15)]"
                        : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {disc}
                  </button>
                ))}
              </div>
            </div>

            {/* PB CARD */}
            <motion.div
              key={selectedDiscipline}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00FF88] to-transparent opacity-50"></div>

              <div className="text-[#00FF88] font-black text-xs tracking-widest uppercase mb-2">Record Personnel</div>

              <div className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tighter drop-shadow-md">
                {processedPerformances[selectedDiscipline].bestRecord.temps}
                <span className="text-2xl md:text-3xl text-gray-500">s</span>
              </div>

              <div className="mt-4 flex flex-col items-center gap-1 text-center">
                <div className="flex items-center gap-2 bg-[#00FF88]/10 border border-[#00FF88]/20 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse"></span>
                  <span className="text-[#00FF88] text-[10px] font-bold tracking-widest">
                    {processedPerformances[selectedDiscipline].improvementPercentage} D'ÉVOLUTION
                  </span>
                </div>

                {processedPerformances[selectedDiscipline].bestRecord.competition && (
                  <div className="text-gray-400 text-xs font-medium uppercase tracking-wider mt-2">
                    {processedPerformances[selectedDiscipline].bestRecord.competition}
                  </div>
                )}
                <div className="text-gray-500 text-[10px] mt-1">
                  {new Date(processedPerformances[selectedDiscipline].bestRecord.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}
                </div>
              </div>
            </motion.div>

            {/* CHART */}
            <motion.div
              key={`chart-${selectedDiscipline}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="w-full h-[200px] mt-2 relative"
            >
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={processedPerformances[selectedDiscipline].records.map(r => ({
                      ...r,
                      tempsVal: parseFloat(r.temps.toString())
                    }))}
                  >
                    <Tooltip 
                      contentStyle={{ background: '#0a0a0a', border: '1px solid #1f1f1f', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                      labelStyle={{ color: '#888888', fontSize: 10, textTransform: 'uppercase', marginBottom: '4px' }}
                      itemStyle={{ color: '#00FF88', fontSize: 14, fontWeight: '900' }}
                      formatter={(value) => [`${value}s`, 'Chrono']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                    />
                    <Area
                      type="monotone"
                      dataKey="tempsVal"
                      stroke="#00FF88"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#glow-gradient)"
                      activeDot={{ r: 6, fill: '#00FF88', stroke: '#000000', strokeWidth: 3 }}
                      dot={processedPerformances[selectedDiscipline].records.length === 1 ? { r: 6, fill: '#00FF88', stroke: '#000000', strokeWidth: 3 } : false}
                      isAnimationActive={true}
                    />
                    <defs>
                      <linearGradient id="glow-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00FF88" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#00FF88" stopOpacity={0.0} />
                      </linearGradient>
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          </motion.div>
        )}

        {links.length > 0 && (
          <motion.div variants={staggerItem} className="flex flex-col gap-3 w-full select-none">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#00FF88] px-1">
              Réseaux & Sources
            </h3>
            {links.map((link, idx) => (
              <motion.a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03, x: 2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-between p-4 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 hover:shadow-[0_4px_24px_rgba(16,185,129,0.1)] transition-all duration-300 group select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-black border border-white/5 group-hover:border-white/15 transition-colors text-xl">
                    {link.icon}
                  </div>
                  <span className="font-extrabold text-sm text-gray-200 group-hover:text-white transition-colors">
                    {link.title}
                  </span>
                </div>
                <span className="text-gray-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300">
                  ↗
                </span>
              </motion.a>
            ))}
          </motion.div>
        )}

        <motion.div variants={staggerItem} className="w-full">
          <footer className="text-center mt-6 select-none">
            <p className="text-[10px] text-gray-600 font-medium uppercase tracking-widest flex items-center justify-center gap-1">
              Optimisé par <span className="text-[#00FF88]/80 font-bold">BioAthlete.space</span>
            </p>
          </footer>
        </motion.div>

        {/* MOBILE NAVIGATION BAR (Bottom Sticky) */}
        <div className="md:hidden fixed bottom-0 left-0 w-full z-50 p-4 select-none pb-safe">
          <div className="w-full backdrop-blur-2xl bg-black/60 border border-white/10 rounded-2xl flex items-center justify-around p-3 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
            <a href="#performances" className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#00FF88] transition-colors">
              <span className="text-xl">⏱️</span>
              <span className="text-[9px] font-black uppercase tracking-wider">Perfs</span>
            </a>
            <a href="#sponsors" className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#00FF88] transition-colors">
              <span className="text-xl">🤝</span>
              <span className="text-[9px] font-black uppercase tracking-wider">Sponsors</span>
            </a>
            <a href="#medias" className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#00FF88] transition-colors">
              <span className="text-xl">📸</span>
              <span className="text-[9px] font-black uppercase tracking-wider">Médias</span>
            </a>
            <div className="w-[1px] h-8 bg-white/10 mx-1"></div>
            <div className="flex gap-2">
              {links.slice(0, 2).map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm hover:bg-white/20 hover:text-[#00FF88] transition-colors"
                >
                  {link.icon || "🔗"}
                </a>
              ))}
            </div>
          </div>
        </div>

      </motion.div>
      </div>
    </div>
  );
}
