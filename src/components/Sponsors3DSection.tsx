"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { GlassCard, ParallaxSection, SectionTitle } from "./ParallaxComponents";
import { Sponsor } from "@/types";

interface Props {
  sponsors: Sponsor[];
  showTitle?: boolean;
  hideSlogan?: boolean;
}

export function Sponsors3DSection({ sponsors, showTitle = false, hideSlogan = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { scrollYProgress } = useScroll(
    isMounted && containerRef.current
      ? { target: containerRef, offset: ["start end", "end start"] }
      : {}
  );

  // Nike-style intense parallax values
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [25, 0, -25]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [80, 0, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1, 0.85]);

  if (!sponsors || sponsors.length === 0) {
    return (
      <div className="w-full py-8 perspective-[2000px]">
        {showTitle && <SectionTitle accent="& Partners">Sponsors</SectionTitle>}
        <motion.div 
          initial={{ opacity: 0, rotateX: 20, y: 50 }}
          whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring", stiffness: 100, damping: 20, duration: 1.2 }}
          className="w-full rounded-[2.5rem] p-12 md:p-20 flex flex-col items-center justify-center text-center relative overflow-hidden group"
          style={{
             background: 'rgba(255,255,255,0.01)',
             backdropFilter: 'blur(30px)',
             border: '1px solid rgba(255,255,255,0.03)',
             boxShadow: '0 30px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
             transformStyle: 'preserve-3d'
          }}
        >
          {/* Animated gradient mesh background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-[1.5s]" />
          
          <motion.span 
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 0.4 }}
            transition={{ delay: 0.2, duration: 1 }}
            className="text-5xl md:text-7xl mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            style={{ transform: 'translateZ(40px)' }}
          >🤝</motion.span>
          
          <h4 className="font-black text-2xl md:text-3xl tracking-tighter uppercase mb-4 text-white drop-shadow-md" style={{ transform: 'translateZ(30px)' }}>
            Aucun soutien officiel
          </h4>
          
          <p className="text-sm md:text-base max-w-lg leading-relaxed font-light text-white/50 mb-10" style={{ transform: 'translateZ(20px)' }}>
            Cet athlète n'a pas encore de partenaire officiel. Devenez le premier à associer votre image à ses futures victoires.
          </p>
          
          <motion.a 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="mailto:contact@bioathlete.space?subject=Demande%20de%20partenariat" 
            className="relative px-8 py-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs overflow-hidden group/btn"
            style={{ transform: 'translateZ(50px)' }}
          >
            <span className="relative z-10">Proposer un soutien</span>
            <div className="absolute inset-0 bg-emerald-500/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
          </motion.a>
        </motion.div>
      </div>
    );
  }

  const getSponsorsText = () => {
    if (sponsors.length === 1) return `${sponsors[0].name} soutient cet athlète`;
    if (sponsors.length === 2) return `${sponsors[0].name} et ${sponsors[1].name} soutiennent cet athlète`;
    
    const names = sponsors.map(s => s.name);
    const last = names.pop();
    return `${names.join(", ")} et ${last} soutiennent cet athlète`;
  };

  return (
    <div ref={containerRef} className={`w-full relative perspective-[2500px] ${hideSlogan ? 'pt-0 pb-12' : 'py-12'} select-none`}>
      {showTitle && <SectionTitle accent="& Partners">Sponsors</SectionTitle>}
      
      {!hideSlogan && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 flex flex-col items-center justify-center gap-3"
        >
          <div className="h-px w-12 bg-emerald-500/50" />
          <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/60 font-black text-center max-w-2xl leading-relaxed">
            {getSponsorsText()}
          </p>
        </motion.div>
      )}

      <motion.div
        style={{ rotateX, y, opacity, scale, transformStyle: 'preserve-3d' }}
        className="w-full grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 items-stretch"
      >
        {sponsors.map((sp, idx) => (
          <GlassCard
            key={`sp-${idx}`}
            glow
            className="col-span-1 p-8 md:p-12 flex flex-col items-center justify-center min-h-[180px] md:min-h-[240px] transition-all duration-[0.8s] hover:translate-y-[-15px] hover:scale-[1.03] hover:shadow-[0_40px_80px_rgba(0,0,0,0.6)] group"
            style={{ 
              transformStyle: 'preserve-3d',
              background: 'rgba(255,255,255,0.015)'
            }}
          >
            {/* Cinematic light sweep effect on hover */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1.5s] ease-in-out bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12" />
            
            <div className="relative z-10 flex items-center justify-center mb-4 transition-transform duration-700 group-hover:translate-z-[50px]" style={{ transform: 'translateZ(30px)' }}>
              {sp.logo?.startsWith('http') ? (
                <img 
                  src={sp.logo} 
                  alt={sp.name} 
                  className="h-14 md:h-20 w-auto object-contain logo-visibility-fix transition-all duration-700 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] group-hover:drop-shadow-[0_20px_40px_rgba(16,185,129,0.2)]" 
                />
              ) : (
                <span className="text-5xl md:text-6xl drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] group-hover:drop-shadow-[0_20px_40px_rgba(16,185,129,0.2)] transition-all duration-700">
                  {sp.logo}
                </span>
              )}
            </div>
            
            {/* Brand name permanently visible */}
            <div className="absolute bottom-6 left-0 w-full text-center transition-all duration-500" style={{ transform: 'translateZ(20px)' }}>
              <span className="text-[10px] uppercase tracking-[0.3em] font-black text-white/40 group-hover:text-emerald-400 transition-colors duration-500 drop-shadow-md">
                {sp.name}
              </span>
            </div>
          </GlassCard>
        ))}
      </motion.div>
    </div>
  );
}
