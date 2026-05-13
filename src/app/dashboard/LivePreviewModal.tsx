"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Custom3DChart } from "@/components/CustomChart";
import { Sponsors3DSection } from "@/components/Sponsors3DSection";
import { processPerformances } from "../[username]/page";
import { PerformanceRaw, SocialLink, Sponsor, Video } from "@/types";

/* ═══════════════════════════════════════════════════════════
   CINEMA PARALLAX LIVE PREVIEW — Style #71 + #49 + #14
   Based on: Modern Dark Cinema Mobile, Parallax Storytelling,
   Liquid Glass, Motion-Driven
   ═══════════════════════════════════════════════════════════ */

// Cinematic easing from style guide
const CINEMA_EASE = [0.16, 1, 0.3, 1] as const;
const SPRING_CONFIG = { damping: 20, stiffness: 90 };

// Stagger container
const stagger: any = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.3 } }
};
const item: any = {
  hidden: { opacity: 0, y: 50, filter: "blur(10px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", damping: 20, stiffness: 90 } }
};

/* ─── Ambient Light Blobs (animated bg) ─── */
function AmbientBlobs() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Primary emerald blob */}
      <motion.div
        animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0], scale: [1, 1.2, 0.9, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-[8%] left-[8%] w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)", filter: "blur(60px)" }}
      />
      {/* Secondary cyan blob */}
      <motion.div
        animate={{ x: [0, -40, 30, 0], y: [0, 20, -30, 0], scale: [1, 0.8, 1.15, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[55%] right-[5%] w-[450px] h-[450px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)", filter: "blur(50px)" }}
      />
      {/* Accent purple blob */}
      <motion.div
        animate={{ x: [0, 20, -30, 0], y: [0, -20, 40, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[15%] left-[30%] w-[350px] h-[350px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(94,106,210,0.05) 0%, transparent 70%)", filter: "blur(40px)" }}
      />
      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")` }} />
    </div>
  );
}

/* ─── Glass Card with top-edge shine ─── */
function GlassCard({ children, className = "", glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.008 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`relative rounded-2xl overflow-hidden ${className}`}
      style={{
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(40px) saturate(180%)",
        WebkitBackdropFilter: "blur(40px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Top-edge shine gradient */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)" }} />
      {/* Glow effect */}
      {glow && <div className="absolute -inset-px rounded-2xl pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.08), transparent 50%, rgba(0,212,255,0.05))" }} />}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

/* ─── Section Title ─── */
function SectionLabel({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <motion.div variants={item} className="flex items-center gap-4 mb-10">
      <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.8, ease: CINEMA_EASE as any }} className="h-px w-10 origin-left" style={{ background: "linear-gradient(90deg, rgba(16,185,129,0.6), transparent)" }} />
      <h3 className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: "rgba(255,255,255,0.25)" }}>
        {children} {accent && <span style={{ color: "rgba(16,185,129,0.5)" }}>{accent}</span>}
      </h3>
      <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.04), transparent)" }} />
    </motion.div>
  );
}

/* ─── Scroll Progress Bar ─── */
function ScrollProgress({ progress }: { progress: any }) {
  return (
    <motion.div className="fixed top-0 left-0 right-0 h-[2px] z-[120] origin-left" style={{ scaleX: progress, background: "linear-gradient(90deg, #10B981, #00D4FF)" }} />
  );
}

/* ═══════════════════════════════════════════════════════════ */
export default function LivePreviewModal({ setShowFullPreview, avatarUrl, firstNameInput, lastNameInput, bioInput, performances, sponsors, links, videos, username, photoGallery }: any) {
  const [selDisc, setSelDisc] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const processed = processPerformances(performances);
  const disciplines = Object.keys(processed);
  useEffect(() => { setMounted(true); if (disciplines.length > 0 && !selDisc) setSelDisc(disciplines[0]); }, []);

  const getLinkLogo = (url: string) => {
    try {
      const domain = new URL(url).hostname.replace("www.", "");
      if (domain.includes("instagram.com")) return "https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg";
      if (domain.includes("tiktok.com")) return "https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg";
      if (domain.includes("youtube.com") || domain.includes("youtu.be")) return "https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg";
      if (domain.includes("twitter.com") || domain.includes("x.com")) return "https://upload.wikimedia.org/wikipedia/commons/5/57/X_logo_2023_%28white%29.svg";
      if (domain.includes("facebook.com")) return "https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg";
      
      // Fallback to high-res favicon service
      return `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;
    } catch { return null; }
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: scrollRef });

  const equips = sponsors.filter((s: any) => s.category === "Équipementier");
  const partners = sponsors.filter((s: any) => s.category === "Partenaire" || !s.category);
  const photos = photoGallery || [];

  const formatEmbed = (url: string) => {
    try { if (url.includes("youtu.be")) return `https://www.youtube.com/embed/${new URL(url).pathname.slice(1)}`; if (url.includes("youtube.com")) return `https://www.youtube.com/embed/${new URL(url).searchParams.get("v")}`; return url; } catch { return url; }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}
      className="fixed inset-0 z-[200]">
      
      {/* Scroll progress indicator */}
      {mounted && <ScrollProgress progress={scrollYProgress} />}

      {/* Close button */}
      <motion.button onClick={() => setShowFullPreview(false)} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
        className="fixed top-5 right-5 z-[230] w-11 h-11 rounded-full flex items-center justify-center text-white/40 hover:text-white/80 font-medium text-lg transition-colors duration-300 cursor-pointer"
        style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.06)" }}>
        ✕
      </motion.button>

      {/* Main scroll container */}
      <div ref={scrollRef} className="fixed inset-0 overflow-y-auto overflow-x-hidden"
        style={{ background: "linear-gradient(180deg, #0a0a0f 0%, #020203 100%)" }}
        onClick={() => setShowFullPreview(false)}>

        <AmbientBlobs />

        <div className="relative z-10 w-full" onClick={e => e.stopPropagation()}>

          {/* ═══ HERO — Full-screen cinematic ═══ */}
          <section className="relative w-full h-screen overflow-hidden flex flex-col justify-end">
            {/* Background image */}
            <div className="absolute inset-0 w-full h-full">
              {avatarUrl ? (
                <motion.img src={avatarUrl} alt="" className="w-full h-full object-cover object-top"
                  initial={{ scale: 1.1, filter: "blur(10px)" }} animate={{ scale: 1, filter: "blur(0px)" }}
                  transition={{ duration: 1.5, ease: CINEMA_EASE as any }} />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: "radial-gradient(ellipse at 30% 40%, rgba(16,185,129,0.05) 0%, #0a0a0f 70%)" }}>
                  <span className="text-[200px] font-black text-white/[0.02] tracking-tighter select-none">{(firstNameInput || "BA").slice(0, 2).toUpperCase()}</span>
                </div>
              )}
              {/* Multi-layer cinematic gradients */}
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #020203 0%, rgba(2,2,3,0.7) 40%, transparent 70%)" }} />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(2,2,3,0.3) 0%, transparent 30%, transparent 70%, rgba(2,2,3,0.3) 100%)" }} />
              {/* Vignette */}
              <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(2,2,3,0.4) 100%)" }} />
            </div>

            {/* Hero text content */}
            <motion.div className="relative z-10 p-6 md:p-12 pb-20"
              initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: CINEMA_EASE as any }}>
              
              <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6, duration: 0.6 }}
                className="text-[10px] font-bold uppercase tracking-[0.5em] mb-4" style={{ color: "rgba(16,185,129,0.6)" }}>
                Profil Athlète
              </motion.p>

              <h1 className="text-5xl md:text-8xl font-black tracking-[-0.04em] text-white uppercase leading-[0.85]"
                style={{ textShadow: "0 0 120px rgba(16,185,129,0.08), 0 4px 30px rgba(0,0,0,0.5)" }}>
                {(firstNameInput || "Prénom").toUpperCase()}<br/>
                <span style={{ color: "rgba(255,255,255,0.6)" }}>{(lastNameInput || "Nom").toUpperCase()}</span>
              </h1>

              {bioInput && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.8 }}
                  className="text-sm md:text-base max-w-xl leading-relaxed mt-6 font-light" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {bioInput}
                </motion.p>
              )}

            </motion.div>

            {/* Scroll indicator */}
            <motion.div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
              animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}>
              <div className="w-[1px] h-10" style={{ background: "linear-gradient(to bottom, transparent, rgba(16,185,129,0.4))" }} />
              <span className="text-[7px] uppercase tracking-[0.4em] font-bold" style={{ color: "rgba(255,255,255,0.15)" }}>Scroll</span>
            </motion.div>
          </section>

          {/* ═══ CONTENT SECTIONS ═══ */}
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }}
            className="w-full max-w-5xl mx-auto px-4 md:px-8 flex flex-col gap-24 pb-32 pt-20">

            {/* ── BENTO GRID: Sponsors & Social Links ── */}
            <motion.section variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
              <div className="lg:col-span-2">
                <Sponsors3DSection sponsors={sponsors} />
              </div>
              
              <div className="lg:col-span-1 flex flex-col justify-center">
                <div className="themed-card p-8 flex flex-col h-full bg-white/[0.01] border-white/5 backdrop-blur-xl rounded-[2.5rem]">
                  <div className="mb-6 flex items-center justify-between">
                     <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Connexions</h4>
                     <div className="w-8 h-px bg-white/10" />
                  </div>
                  
                  <motion.div 
                    className="grid grid-cols-2 gap-4 flex-1"
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-20px" }}
                    variants={{
                      hidden: { opacity: 0 },
                      show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
                    }}
                  >
                    {links.map((link: any, idx: number) => (
                      <motion.a
                        key={idx}
                        variants={{
                          hidden: { opacity: 0, scale: 0.8, filter: "blur(10px)", y: 20 },
                          show: { opacity: 1, scale: 1, filter: "blur(0px)", y: 0, transition: { type: "spring", damping: 20, stiffness: 90 } }
                        }}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.05)" }}
                        whileTap={{ scale: 0.95 }}
                        className="flex flex-col items-center justify-center p-4 rounded-3xl border border-white/5 bg-white/[0.02] transition-colors group"
                      >
                        <div className="w-12 h-12 flex items-center justify-center mb-3 relative">
                          {getLinkLogo(link.url) ? (
                            <img 
                              src={getLinkLogo(link.url)!} 
                              alt={link.title} 
                              className="w-8 h-8 object-contain transition-transform duration-500 group-hover:scale-110 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" 
                              onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.setAttribute('style', 'display:block'); }}
                            />
                          ) : null}
                          <span className="text-xl hidden">{link.icon || "🔗"}</span>
                        </div>
                        <span className="text-[8px] font-bold uppercase tracking-widest text-white/40 group-hover:text-emerald-400 transition-colors truncate w-full text-center px-1">
                          {link.title}
                        </span>
                      </motion.a>
                    ))}
                    
                    {links.length === 0 && (
                       <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="col-span-2 flex flex-col items-center justify-center opacity-20 py-12">
                         <span className="text-2xl mb-2">🌐</span>
                         <p className="text-[8px] uppercase tracking-widest font-bold">Aucun lien</p>
                       </motion.div>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.section>

            {/* ── Gallery ── */}
            {photos.length > 0 && (
              <motion.div variants={item}>
                <SectionLabel accent="Gallery">Moments</SectionLabel>
                <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-none snap-x">
                  {photos.map((p: any, i: number) => (
                    <motion.div key={i} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      className="group relative h-[50vh] w-[78vw] max-w-[650px] flex-shrink-0 snap-center rounded-2xl overflow-hidden"
                      style={{ border: "1px solid rgba(255,255,255,0.05)" }}>
                      <img src={p.url} alt={p.title} className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.06]"
                        onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80'; }} />
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(2,2,3,0.85) 0%, transparent 50%)" }} />
                      {/* Corner glow on hover */}
                      <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.1), transparent)", filter: "blur(20px)" }} />
                      <div className="absolute bottom-0 left-0 p-6 w-full">
                        <h4 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">{p.title}</h4>
                        {p.date && <p className="text-xs font-bold mt-2 tracking-[0.2em] uppercase" style={{ color: "rgba(16,185,129,0.6)" }}>{p.date}</p>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Videos ── */}
            {videos.length > 0 && (
              <motion.div variants={item}>
                <SectionLabel accent="& Médias">Vidéos</SectionLabel>
                <div className="flex flex-col gap-5">
                  {videos.map((v: any, i: number) => (
                    <GlassCard key={i} className="p-4">
                      {v.title && <p className="text-xs font-bold uppercase tracking-[0.15em] mb-3 px-1" style={{ color: "rgba(255,255,255,0.4)" }}>{v.title}</p>}
                      <div className="w-full rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.04)" }}>
                        {v.url.includes("youtube") || v.url.includes("youtu.be") || v.url.includes("vimeo") ? (
                          <iframe src={formatEmbed(v.url)} title={v.title} className="w-full h-48 md:h-64 border-none" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen loading="lazy" />
                        ) : <video src={v.url} controls className="w-full max-h-64 object-contain bg-black" preload="metadata" />}
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Performances ── */}
            {disciplines.length > 0 && selDisc && processed[selDisc] && (
              <motion.div variants={item}>
                <SectionLabel accent="Analytics">Performances</SectionLabel>

                {/* Discipline selector pills */}
                <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none mb-6">
                  {disciplines.map(d => (
                    <motion.button key={d} onClick={() => setSelDisc(d)} whileTap={{ scale: 0.95 }}
                      className="px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap transition-all duration-500 cursor-pointer"
                      style={selDisc === d ? {
                        background: "rgba(16,185,129,0.12)", color: "rgba(16,185,129,0.9)",
                        border: "1px solid rgba(16,185,129,0.25)", boxShadow: "0 0 30px rgba(16,185,129,0.08)"
                      } : {
                        background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.25)",
                        border: "1px solid rgba(255,255,255,0.05)"
                      }}>
                      {d}
                    </motion.button>
                  ))}
                </div>

                {/* Performance card */}
                <AnimatePresence mode="wait">
                  <motion.div key={selDisc} initial={{ opacity: 0, y: 20, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5, ease: CINEMA_EASE as any }}>
                    <GlassCard glow>
                      {/* PB display */}
                      <div className="p-8 md:p-14 flex flex-col items-center justify-center relative" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        {/* Ambient glow behind number */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full pointer-events-none"
                          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)", filter: "blur(40px)" }} />
                        
                        <span className="text-[10px] font-black tracking-[0.4em] uppercase mb-8 relative z-10" style={{ color: "rgba(255,255,255,0.2)" }}>Record Personnel</span>
                        <div className="text-7xl md:text-9xl font-black text-white tracking-tighter flex items-baseline relative z-10"
                          style={{ textShadow: "0 0 80px rgba(16,185,129,0.06)" }}>
                          {processed[selDisc].bestRecord.temps}
                          <span className="text-2xl md:text-4xl ml-2 font-bold" style={{ color: "rgba(255,255,255,0.12)" }}>s</span>
                        </div>

                        {/* Evolution badge */}
                        <div className="mt-8 relative z-10">
                          <div className="flex items-center gap-3 px-5 py-2.5 rounded-full"
                            style={{ border: "1px solid rgba(16,185,129,0.2)", background: "rgba(16,185,129,0.05)" }}>
                            <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}
                              className="w-2 h-2 rounded-full" style={{ background: "#10B981" }} />
                            <span className="text-[10px] font-black tracking-[0.2em] uppercase" style={{ color: "rgba(16,185,129,0.7)" }}>
                              {processed[selDisc].improvementPercentage} d&apos;évolution
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Chart */}
                      {mounted && processed[selDisc].records.length > 0 && (
                        <div className="p-3 md:p-6" style={{ background: "rgba(255,255,255,0.008)" }}>
                          <Custom3DChart records={processed[selDisc].records} isEmbedded={true} />
                        </div>
                      )}
                    </GlassCard>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}

            {/* ── Footer ── */}
            <motion.div variants={item} className="w-full pt-8">
              <div className="h-px w-full mb-8" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)" }} />
              <p className="text-center text-[9px] font-medium uppercase tracking-[0.3em]" style={{ color: "rgba(255,255,255,0.1)" }}>
                Optimisé par{" "}
                <span className="font-bold" style={{ background: "linear-gradient(135deg, #10B981, #00D4FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  BioAthlete.space
                </span>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
