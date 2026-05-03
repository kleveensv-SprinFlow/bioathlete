"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, useScroll, useSpring } from "framer-motion";
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

const DEFAULT_PHOTOS = [
  { title: "Entraînement", url: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80" },
  { title: "Course", url: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=400&q=80" },
  { title: "Stade", url: "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=400&q=80" },
];

const StaggeredWrapper = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    className="w-full"
  >
    {children}
  </motion.div>
);

export default function PublicAthleteProfile() {
  const params = useParams();
  const username = params?.username as string;

  const [mounted, setMounted] = useState(false);
  const [profileNotFound, setProfileNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  const [records, setRecords] = useState<Record[]>([]);
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [evolution, setEvolution] = useState<EvolutionPoint[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    setMounted(true);

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
          .select("user_id")
          .eq("username", username.toLowerCase())
          .maybeSingle();

        if (profErr || !profile?.user_id) {
          setProfileNotFound(true);
          setLoading(false);
          return;
        }

        const uid = profile.user_id;

        // Fetch records and evolution
        const { data: perfData, error: perfErr } = await supabase
          .from("performances")
          .select("*")
          .eq("user_id", uid);

        if (!perfErr && perfData && perfData.length > 0) {
          const mappedRecords = perfData.slice(-2).map((p) => ({
            distance: p.distance,
            temps: p.temps + "s",
            competition: p.competition || "Meeting",
          }));
          setRecords(mappedRecords);

          const mappedEvolution = perfData.map((p) => ({
            date: p.date,
            "100m": parseFloat(p.temps),
          }));
          setEvolution(mappedEvolution);
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

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500 selection:text-black">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400 origin-left z-50 pointer-events-none"
        style={{ scaleX }}
      />

      {/* Extreme Neon effects */}
      <div className="fixed top-[-15%] left-[-15%] w-[600px] h-[600px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-15%] right-[-15%] w-[600px] h-[600px] bg-blue-500/15 rounded-full blur-[140px] pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-md mx-auto px-5 pt-8 pb-24 flex flex-col items-center gap-8 min-h-screen select-none">
        
        {/* Navigation Bar */}
        <div className="w-full flex items-center justify-between backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 shadow-xl select-none">
          <Link href="/" className="text-sm font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-300 hover:opacity-80 transition-opacity select-none">
            BioAthlete
          </Link>
          <Link href="/login" className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold rounded-xl text-gray-300 transition-all duration-300 select-none">
            Espace Athlète
          </Link>
        </div>

        {/* Header Profile Info */}
        <StaggeredWrapper delay={0.1}>
          <div className="flex flex-col items-center gap-4 text-center select-none">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 via-emerald-400 to-blue-500 p-1 shadow-xl flex items-center justify-center relative select-none"
            >
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center font-black text-3xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400 select-none">
                {username?.slice(0, 2).toUpperCase() || "BA"}
              </div>
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-400 border-2 border-black rounded-full animate-pulse"></span>
            </motion.div>
            
            <div className="flex flex-col gap-1 select-none">
              <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-md uppercase">
                {username}
              </h1>
              <p className="text-emerald-400 text-sm font-extrabold uppercase tracking-widest select-none">
                Sprint • Performance
              </p>
              <p className="text-gray-400 text-xs select-none">
                En activité
              </p>
            </div>

            <p className="text-gray-300 text-sm max-w-sm mt-1 px-4 leading-relaxed select-none">
              Athlète passionné visant l&apos;excellence sur les pistes nationales et internationales.
            </p>
          </div>
        </StaggeredWrapper>

        {/* Horizontal Gallery */}
        <StaggeredWrapper delay={0.15}>
          <div className="w-full select-none">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 mb-3 px-1">
              Galerie Photos
            </h3>
            <div className="w-full flex items-center gap-4 overflow-x-auto pb-4 snap-x select-none scrollbar-none">
              {DEFAULT_PHOTOS.map((photo, i) => (
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
                  />
                  <div className="p-3 text-[11px] font-bold text-gray-300 text-center uppercase tracking-wide">
                    {photo.title}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </StaggeredWrapper>

        {/* Sponsors Badges */}
        {sponsors.length > 0 && (
          <StaggeredWrapper delay={0.2}>
            <div className="w-full flex flex-wrap items-center justify-center gap-3 select-none">
              {sponsors.map((sp, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.1, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg select-none text-xs font-bold hover:shadow-[0_4px_24px_rgba(16,185,129,0.15)] transition-all duration-300"
                >
                  <span>{sp.logo}</span>
                </motion.div>
              ))}
            </div>
          </StaggeredWrapper>
        )}

        {/* Vidéos Externes */}
        {videos.length > 0 && (
          <StaggeredWrapper delay={0.25}>
            <div className="w-full select-none flex flex-col gap-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 px-1">
                Vidéos & Médias
              </h3>
              <div className="flex flex-col gap-4">
                {videos.map((vid, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    className="w-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-3 shadow-xl hover:border-emerald-500/20 transition-all duration-300 select-none overflow-hidden"
                  >
                    <p className="text-xs font-bold uppercase tracking-wider text-white mb-2 truncate px-1">
                      {vid.title}
                    </p>
                    <div className="w-full h-44 overflow-hidden rounded-xl border border-white/10">
                      <iframe
                        src={formatEmbedUrl(vid.url)}
                        title={vid.title}
                        className="w-full h-full border-none select-none"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </StaggeredWrapper>
        )}

        {/* Stats Glassmorphism Blocks */}
        {records.length > 0 && (
          <StaggeredWrapper delay={0.3}>
            <div className="grid grid-cols-2 gap-4 w-full select-none">
              {records.map((rec, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between gap-1 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] hover:border-emerald-500/30 transition-all duration-300 select-none"
                >
                  <div className="text-gray-400 font-extrabold text-xs tracking-wider uppercase">
                    {rec.distance}
                  </div>
                  <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-300 tracking-tight">
                    {rec.temps}
                  </div>
                  <div className="text-gray-500 text-[10px] select-none truncate">
                    {rec.competition}
                  </div>
                </motion.div>
              ))}
            </div>
          </StaggeredWrapper>
        )}

        {/* Graphique de Performance */}
        {evolution.length > 0 && (
          <StaggeredWrapper delay={0.4}>
            <div className="w-full h-[320px] backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] hover:border-emerald-500/30 transition-all duration-300 select-none">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 mb-4 select-none">
                Progression Chronométrique (100m)
              </h3>
              <div className="w-full h-[230px] select-none">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={evolution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: '#888888', fontSize: 10 }} 
                        axisLine={{ stroke: '#2c2c2c' }} 
                        tickLine={{ stroke: '#2c2c2c' }}
                      />
                      <YAxis 
                        domain={['dataMin - 0.1', 'dataMax + 0.1']} 
                        tick={{ fill: '#888888', fontSize: 10 }} 
                        axisLine={{ stroke: '#2c2c2c' }} 
                        tickLine={{ stroke: '#2c2c2c' }}
                        reversed
                      />
                      <Tooltip 
                        contentStyle={{ background: '#000000', border: '1px solid #333333', borderRadius: '12px' }} 
                        labelStyle={{ color: '#888888', fontSize: 11 }} 
                        itemStyle={{ color: '#10b981', fontSize: 12 }} 
                      />
                      <Area
                        type="monotone"
                        dataKey="100m"
                        stroke="url(#gradient-line)"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#gradient-area)"
                        activeDot={{ r: 8, fill: '#10b981', stroke: '#000000', strokeWidth: 2 }}
                      />
                      <defs>
                        <linearGradient id="gradient-line" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                        <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </StaggeredWrapper>
        )}

        {/* Liens de Sources Officielles */}
        {links.length > 0 && (
          <StaggeredWrapper delay={0.5}>
            <div className="flex flex-col gap-3 w-full select-none">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 px-1">
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
            </div>
          </StaggeredWrapper>
        )}

        {/* Footer */}
        <StaggeredWrapper delay={0.6}>
          <footer className="text-center mt-6 select-none">
            <p className="text-[10px] text-gray-600 font-medium uppercase tracking-widest flex items-center justify-center gap-1">
              Optimisé par <span className="text-emerald-500/80 font-bold">BioAthlete.space</span>
            </p>
          </footer>
        </StaggeredWrapper>

      </div>
    </div>
  );
}
