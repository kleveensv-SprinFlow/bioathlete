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
    <div className="min-h-screen bg-slate-200 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      <div className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] bg-white/60 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-slate-300/50 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="relative z-10 flex flex-col items-center min-h-screen w-full max-w-4xl mx-auto px-4 md:px-8">


        {/* CONTENU PRINCIPAL */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="w-full flex flex-col gap-16 pb-32 pt-8 select-none"
        >





        {/* MOBILE TOP LEFT LOGO */}
        <div className="absolute top-6 left-6 z-50 pointer-events-none">
          <img
            src="https://vhbwfqqvsudznnfoqyjm.supabase.co/storage/v1/object/public/Logo/bioathlete_logo_transparent.png"
            alt="BioAthlete Logo"
            className="h-8 object-contain brightness-0 opacity-80"
          />
        </div>

        {/* HERO SECTION */}
        <motion.div
          variants={staggerItem}
          className="relative w-full h-[500px] md:h-[600px] overflow-hidden rounded-b-3xl md:rounded-3xl border border-slate-300 group"
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
            <div className={`w-full h-full bg-slate-200 flex flex-col items-center justify-center relative select-none ${profileData.avatar_url ? 'hidden' : ''}`}>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/40 via-slate-200 to-slate-300 opacity-60"></div>
              <div className="font-black text-8xl md:text-[120px] tracking-tighter text-slate-400 select-none z-10">
                {username?.slice(0, 2).toUpperCase() || "BA"}
              </div>
            </div>
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/40 to-transparent"></div>
          </motion.div>

          {/* Glassmorphism Info Overlay */}
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 flex flex-col gap-2">
            <div className="flex flex-col gap-1 select-none">
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 uppercase">
                {(profileData.full_name || username).toUpperCase()}
              </h1>
              <p className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-[0.3em] select-none">
                Athlète de haut niveau
              </p>
            </div>
            <p className="text-slate-600 text-sm md:text-base max-w-2xl leading-relaxed select-none backdrop-blur-xl bg-white p-4 rounded-2xl border border-slate-300 mt-2">
              {profileData.bio || "Visant l'excellence à chaque foulée, repoussant les limites de la performance athlétique."}
            </p>

            {links.length > 0 && (
              <div className="flex gap-3 mt-4">
                {links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white backdrop-blur-xl border border-slate-300 flex items-center justify-center text-lg hover:bg-slate-100 hover:border-slate-400 hover:text-slate-900 transition-all duration-300"
                    title={link.title}
                  >
                    {link.icon || "🔗"}
                  </a>
                ))}
              </div>
            )}
          </div>
        </motion.div>


                {/* BENTO GRID SPONSORS */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-10%" }}
          className="w-full flex flex-col gap-6 select-none"
        >
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 px-2">
            Partenaires <span className="text-white">&</span> Sponsors
          </h3>

          {(equipementiers.length === 0 && partenaires.length === 0) ? (
            <div className="w-full backdrop-blur-xl bg-white border border-slate-300 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
              <span className="text-4xl mb-4 grayscale opacity-40">🤝</span>
              <h4 className="text-slate-800 font-black text-lg tracking-wide uppercase mb-2">Espace Sponsoring</h4>
              <p className="text-slate-500 text-sm max-w-sm">Associez votre marque à l'excellence et soutenez la progression de cet athlète.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {equipementiers.map((eq, idx) => (
                <div key={`eq-${idx}`} className="col-span-2 backdrop-blur-xl bg-white border border-slate-300 hover:border-slate-400 transition-all duration-300 rounded-3xl p-6 md:p-10 flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute top-4 left-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity">Équipementier Officiel</div>
                  <span className="text-5xl md:text-6xl grayscale group-hover:grayscale-0 transition-all duration-500">{eq.logo}</span>
                </div>
              ))}

              {partenaires.map((sp, idx) => (
                <div key={`sp-${idx}`} className="col-span-1 backdrop-blur-xl bg-white border border-slate-300 hover:border-slate-400 transition-all duration-300 rounded-3xl p-6 flex items-center justify-center relative group">
                  <span className="text-3xl md:text-4xl grayscale group-hover:grayscale-0 transition-all duration-300">{sp.logo}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {galleryPhotos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-10%" }}
            className="w-full select-none"
          >
            <div className="w-full flex items-center gap-4 overflow-x-auto pb-4 pt-2 snap-x select-none scrollbar-none">
              {galleryPhotos.map((photo, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.03 }}
                  className="w-[200px] flex-shrink-0 snap-center backdrop-blur-xl bg-white border border-slate-300 rounded-2xl overflow-hidden select-none"
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
                  <div className="p-3 text-[11px] font-bold text-slate-500 text-center uppercase tracking-wide">
                    {photo.title}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {videos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-10%" }}
            className="w-full select-none flex flex-col gap-3"
          >
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 px-1">
              Vidéos <span className="text-slate-600">&</span> Médias
            </h3>
            <div className="flex flex-col gap-4">
              {videos.map((vid, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  className="w-full backdrop-blur-xl bg-white border border-slate-300 rounded-2xl p-3 hover:border-slate-400 transition-all duration-300 select-none overflow-hidden"
                >
                  {vid.title && (
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 truncate px-1">
                      {vid.title}
                    </p>
                  )}
                  <div className="w-full rounded-xl border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center">
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

        {Object.keys(processedPerformances).length > 0 && selectedDiscipline && processedPerformances[selectedDiscipline] && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-10%" }}
            className="w-full flex flex-col gap-6 select-none"
          >
            {/* TABS FOR DISCIPLINES */}
            <div className="w-full overflow-x-auto pb-2 scrollbar-none snap-x">
              <div className="flex gap-2">
                {Object.keys(processedPerformances).map((disc) => (
                  <button
                    key={disc}
                    onClick={() => setSelectedDiscipline(disc)}
                    className={`snap-center px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-500 ${
                      selectedDiscipline === disc
                        ? "bg-slate-900 text-white scale-105"
                        : "bg-white text-slate-500 border border-slate-300 hover:bg-slate-50 hover:text-slate-900"
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
              className="backdrop-blur-xl bg-white border border-slate-300 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>

              <div className="text-slate-400 font-black text-[10px] tracking-[0.3em] uppercase mb-4">Record Personnel</div>

              <div className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter">
                {processedPerformances[selectedDiscipline].bestRecord.temps}
                <span className="text-2xl md:text-3xl text-slate-400 ml-1">s</span>
              </div>

              <div className="mt-8 flex flex-col items-center gap-1 text-center">
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                  <span className="text-emerald-500 text-[10px] font-black tracking-[0.2em] uppercase">
                    {processedPerformances[selectedDiscipline].improvementPercentage} D'ÉVOLUTION
                  </span>
                </div>

                {processedPerformances[selectedDiscipline].bestRecord.competition && (
                  <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mt-2">
                    {processedPerformances[selectedDiscipline].bestRecord.competition}
                  </div>
                )}
                <div className="text-slate-500 text-[10px] mt-1">
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
                      contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '12px' }}
                      labelStyle={{ color: '#64748b', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}
                      itemStyle={{ color: '#f8fafc', fontSize: 16, fontWeight: '900' }}
                      formatter={(value) => [`${value}s`, 'Chrono']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                    />
                    <Area
                      type="monotone"
                      dataKey="tempsVal"
                      stroke="#94a3b8"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#glow-gradient)"
                      activeDot={{ r: 6, fill: '#f8fafc', stroke: '#0f172a', strokeWidth: 3 }}
                      dot={false}
                      isAnimationActive={true}
                    />
                    <defs>
                      <linearGradient id="glow-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.1} />
                        <stop offset="100%" stopColor="#94a3b8" stopOpacity={0.0} />
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



        <motion.div variants={staggerItem} className="w-full">
          <footer className="text-center mt-6 select-none">
            <p className="text-[10px] text-gray-600 font-medium uppercase tracking-widest flex items-center justify-center gap-1">
              Optimisé par <span className="text-[#00FF88]/80 font-bold">BioAthlete.space</span>
            </p>
          </footer>
        </motion.div>



      </motion.div>
      </div>
    </div>
  );
}
