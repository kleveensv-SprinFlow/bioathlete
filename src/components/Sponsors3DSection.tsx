"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { GlassCard, SectionTitle } from "./ParallaxComponents";
import { Sponsor } from "@/types";

interface Sponsors3DSectionProps {
  title: string;
  sponsors: Sponsor[];
  hideSlogan?: boolean;
  athleteName?: string;
  athleteEmail?: string;
}

export const Sponsors3DSection: React.FC<Sponsors3DSectionProps> = ({ 
  title, 
  sponsors, 
  hideSlogan = false,
  athleteName = "cet athlète",
  athleteEmail
}) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Cinematic parallax values
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [15, 0, -15]);
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <div ref={containerRef} className="w-full relative perspective-[2000px] py-12 select-none">
      <div className="flex items-center gap-4 mb-10 w-full max-w-md mx-auto">
        <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent to-emerald-500/30" />
        <h2 className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/50 whitespace-nowrap px-4 italic">
          {title}
        </h2>
        <div className="h-[1px] flex-grow bg-gradient-to-l from-transparent to-emerald-500/30" />
      </div>

      <motion.div
        style={{ rotateX, y, opacity, transformStyle: 'preserve-3d' }}
        className="w-full flex flex-col items-center gap-12"
      >
        {sponsors && sponsors.length > 0 ? (
          <>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 w-full">
              {sponsors.map((sp, idx) => (
                <div key={`sp-${idx}`} className="group relative flex flex-col items-center">
                  <motion.div 
                    whileHover={{ y: -10, scale: 1.05 }}
                    className="relative flex items-center justify-center p-6 md:p-8 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl transition-all duration-500 hover:border-emerald-500/20 hover:bg-emerald-500/5"
                  >
                    <img 
                      src={sp.logo} 
                      alt={sp.name} 
                      className="h-10 md:h-14 w-auto object-contain grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 logo-visibility-fix" 
                    />
                  </motion.div>
                  <span className="mt-4 text-[9px] uppercase tracking-[0.3em] font-black text-white/20 group-hover:text-emerald-400 transition-colors duration-500">
                    {sp.name}
                  </span>
                </div>
              ))}
            </div>

            {!hideSlogan && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="px-8 py-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-md"
              >
                <p className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold">
                  Marque en collaboration avec <span className="text-emerald-400">{athleteName}</span>
                </p>
              </motion.div>
            )}
          </>
        ) : (
          <motion.a
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            href={athleteEmail ? `mailto:${athleteEmail}?subject=Proposition de collaboration via BioAthlete` : "#"}
            className="group relative flex flex-col items-center gap-6 p-10 md:p-16 rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-2xl hover:border-emerald-500/30 transition-all duration-700"
          >
            <div className="absolute inset-0 bg-emerald-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="text-4xl opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700">🤝</div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs md:text-sm font-black text-white uppercase tracking-tighter">Collaborer avec {athleteName}</span>
              <span className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-medium italic">Devenir un partenaire officiel</span>
            </div>
            <div className="px-6 py-2 rounded-full border border-emerald-500/20 text-emerald-400 text-[8px] font-bold uppercase tracking-widest group-hover:bg-emerald-500 group-hover:text-black transition-all">
              Envoyer une proposition
            </div>
          </motion.a>
        )}
      </motion.div>
    </div>
  );
};
