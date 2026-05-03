"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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
    {
      title: "TikTok Officiel",
      url: "https://tiktok.com/",
      icon: "🎵",
    },
  ],
  evolution: [
    { date: "Fév 2024", "100m": 10.45 },
    { date: "Avr 2024", "100m": 10.32 },
    { date: "Juin 2024", "100m": 10.15 },
    { date: "Août 2024", "100m": 10.05 },
    { date: "Oct 2024", "100m": 9.98 },
  ],
};

const SectionWrapper = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6, delay }}
    className="w-full"
  >
    {children}
  </motion.div>
);

export default function PublicProfile() {
  const [mounted, setMounted] = useState(false);
  const [records, setRecords] = useState(DEFAULT_ATHLETE.records);
  const [links, setLinks] = useState(DEFAULT_ATHLETE.links);
  const [evolution, setEvolution] = useState(DEFAULT_ATHLETE.evolution);

  useEffect(() => {
    setMounted(true);

    async function fetchAndIncrement() {
      try {
        // Incrémente compteur de vues
        await supabase.from("views").insert([{ count: 1 }]);

        // Charger données Supabase
        const { data: perfData, error: perfErr } = await supabase.from("performances").select("*");
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

        const { data: linkData, error: linkErr } = await supabase.from("links").select("*");
        if (!linkErr && linkData && linkData.length > 0) {
          setLinks(linkData);
        }
      } catch (err) {
        console.error("Fetch fallback views/data:", err);
      }
    }

    fetchAndIncrement();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-emerald-500 selection:text-black">
      {/* Background radial gradients for ambient neon feel */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-md mx-auto px-5 pt-12 pb-24 flex flex-col items-center gap-8 min-h-screen select-none">
        
        {/* Header Profile Info */}
        <SectionWrapper delay={0.1}>
          <div className="flex flex-col items-center gap-4 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 via-emerald-400 to-blue-500 p-1 shadow-xl flex items-center justify-center relative select-none"
            >
              <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center font-black text-3xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
                BA
              </div>
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-400 border-2 border-neutral-950 rounded-full"></span>
            </motion.div>
            
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm select-none">
                {DEFAULT_ATHLETE.name}
              </h1>
              <p className="text-emerald-400 text-sm font-semibold uppercase tracking-wider select-none">
                {DEFAULT_ATHLETE.disciplines.join(" &bull; ")}
              </p>
              <p className="text-gray-400 text-xs select-none">
                En activité depuis {DEFAULT_ATHLETE.debut}
              </p>
            </div>

            <p className="text-gray-300 text-sm max-w-sm mt-1 px-4 leading-relaxed select-none">
              {DEFAULT_ATHLETE.biographie}
            </p>
          </div>
        </SectionWrapper>

        {/* Stats Glassmorphism Blocks */}
        <SectionWrapper delay={0.2}>
          <div className="grid grid-cols-2 gap-4 w-full">
            {records.map((rec, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between gap-1 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:border-emerald-500/30 transition-all duration-300 select-none"
              >
                <div className="text-gray-400 font-medium text-xs tracking-wide uppercase select-none">
                  {rec.distance}
                </div>
                <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-300 tracking-tight select-none">
                  {rec.temps}
                </div>
                <div className="text-gray-500 text-[10px] select-none truncate">
                  {rec.competition}
                </div>
              </motion.div>
            ))}
          </div>
        </SectionWrapper>

        {/* Graphique de Performance */}
        <SectionWrapper delay={0.3}>
          <div className="w-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:border-emerald-500/20 transition-colors duration-300 select-none">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4 select-none">
              Progression Chronométrique (100m)
            </h3>
            <div className="w-full h-40">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evolution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#a3a3a3', fontSize: 10 }} 
                      axisLine={{ stroke: '#404040' }} 
                      tickLine={{ stroke: '#404040' }}
                    />
                    <YAxis 
                      domain={['dataMin - 0.1', 'dataMax + 0.1']} 
                      tick={{ fill: '#a3a3a3', fontSize: 10 }} 
                      axisLine={{ stroke: '#404040' }} 
                      tickLine={{ stroke: '#404040' }}
                      reversed
                    />
                    <Tooltip 
                      contentStyle={{ background: '#171717', border: '1px solid #404040', borderRadius: '8px' }} 
                      labelStyle={{ color: '#a3a3a3', fontSize: 11 }} 
                      itemStyle={{ color: '#10b981', fontSize: 12 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="100m" 
                      stroke="url(#gradient-line)" 
                      strokeWidth={3} 
                      dot={{ r: 4, stroke: '#10b981', strokeWidth: 2, fill: '#171717' }} 
                      activeDot={{ r: 6, fill: '#10b981' }} 
                    />
                    <defs>
                      <linearGradient id="gradient-line" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </SectionWrapper>

        {/* Liens de Sources Officielles (Linktree Premium style) */}
        <SectionWrapper delay={0.4}>
          <div className="flex flex-col gap-3 w-full">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 px-1 select-none">
              Réseaux & Sources
            </h3>
            {links.map((link, idx) => (
              <motion.a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02, x: 2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-between p-4 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 hover:shadow-[0_4px_24px_rgba(16,185,129,0.1)] transition-all duration-300 group select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-neutral-900 border border-white/5 group-hover:border-white/10 transition-colors text-xl">
                    {link.icon}
                  </div>
                  <span className="font-semibold text-sm text-gray-200 group-hover:text-white transition-colors">
                    {link.title}
                  </span>
                </div>
                <span className="text-gray-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300">
                  ↗
                </span>
              </motion.a>
            ))}
          </div>
        </SectionWrapper>

        {/* Footer */}
        <SectionWrapper delay={0.5}>
          <footer className="text-center mt-6 select-none">
            <p className="text-[10px] text-gray-600 font-medium uppercase tracking-widest flex items-center justify-center gap-1">
              Optimisé par <span className="text-emerald-500/80 font-bold">BioAthlete.space</span>
            </p>
          </footer>
        </SectionWrapper>

      </div>
    </div>
  );
}
