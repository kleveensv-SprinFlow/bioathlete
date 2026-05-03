"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, useScroll, useSpring } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts";

const DEFAULT_ATHLETE = {
  name: "Sprinteur N1",
  debut: "Février 2024",
  disciplines: ["100m", "60m"],
  biographie: "Athlète passionné visant l'excellence sur les pistes nationales et internationales.",
  records: [
    { distance: "60m", temps: "6.55s", competition: "Championnats de France" },
    { distance: "100m", temps: "9.98s", competition: "Meeting International" },
  ],
  links: [
    {
      title: "Fédération Française d'Athlétisme",
      url: "https://www.athle.fr/",
      icon: "🏅",
    },
    {
      title: "World Athletics",
      url: "https://worldathletics.org/",
      icon: "🌐",
    },
    {
      title: "Instagram Officiel",
      url: "https://instagram.com/",
      icon: "📸",
    },
  ],
  evolution: [
    { date: "Fév 2024", "100m": 10.45 },
    { date: "Avr 2024", "100m": 10.32 },
    { date: "Juin 2024", "100m": 10.15 },
    { date: "Août 2024", "100m": 10.05 },
    { date: "Oct 2024", "100m": 9.98 },
  ],
  sponsors: [
    { id: 1, name: "Nike", logo: "👟 Nike" },
    { id: 2, name: "Red Bull", logo: "🥤 Red Bull" },
  ],
};

// Entrance Stagger Effect Component
const StaggeredWrapper = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, delay, ease: "easeOut" }}
    className="w-full"
  >
    {children}
  </motion.div>
);

export default function PublicAthleteProfile() {
  const params = useParams();
  const username = params?.username as string;

  const [mounted, setMounted] = useState(false);
  const [records, setRecords] = useState(DEFAULT_ATHLETE.records);
  const [links, setLinks] = useState(DEFAULT_ATHLETE.links);
  const [evolution, setEvolution] = useState(DEFAULT_ATHLETE.evolution);
  const [sponsors, setSponsors] = useState(DEFAULT_ATHLETE.sponsors);

  // Discrete scroll progress bar at the top
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    setMounted(true);

    async function fetchAthleteByUsername() {
      if (!username) return;

      try {
        await supabase.from("views").insert([{ count: 1 }]);

        const { data: profile, error: profErr } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("username", username)
          .maybeSingle();

        if (profErr || !profile?.user_id) return;

        const uid = profile.user_id;

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
        }

        const { data: linkData, error: linkErr } = await supabase
          .from("links")
          .select("*")
          .eq("user_id", uid);

        if (!linkErr && linkData && linkData.length > 0) {
          setLinks(linkData);
        }

        const { data: spData, error: spErr } = await supabase
          .from("sponsors")
          .select("*")
          .eq("user_id", uid);

        if (!spErr && spData && spData.length > 0) {
          setSponsors(spData);
        }
      } catch (err) {
        console.error("Fetch profile fallback err:", err);
      }
    }

    fetchAthleteByUsername();
  }, [username]);

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
                {username || DEFAULT_ATHLETE.name}
              </h1>
              <p className="text-emerald-400 text-sm font-extrabold uppercase tracking-widest select-none">
                {DEFAULT_ATHLETE.disciplines.join(" • ")}
              </p>
              <p className="text-gray-400 text-xs select-none">
                En activité depuis {DEFAULT_ATHLETE.debut}
              </p>
            </div>

            <p className="text-gray-300 text-sm max-w-sm mt-1 px-4 leading-relaxed select-none">
              {DEFAULT_ATHLETE.biographie}
            </p>
          </div>
        </StaggeredWrapper>

        {/* Sponsors Badges with Parallax / Stagger Entrance */}
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

        {/* Stats Glassmorphism Blocks */}
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

        {/* Graphique de Performance : Gradient Area Chart */}
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

        {/* Liens de Sources Officielles (Linktree Premium style) */}
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
