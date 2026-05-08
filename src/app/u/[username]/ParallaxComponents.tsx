"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

// Section reveal with simple scroll animation (no ref-based useScroll)
export function ParallaxSection({ children, className = "", noPadding = false }: { children: React.ReactNode; className?: string; noPadding?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`${noPadding ? "" : "py-12"} ${className}`}
    >
      {children}
    </motion.div>
  );
}

// Floating orbs for ambient background
export function FloatingOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] rounded-full bg-emerald-500/[0.03] blur-[120px]" style={{ animation: "float 12s ease-in-out infinite" }} />
      <div className="absolute top-[60%] right-[5%] w-[400px] h-[400px] rounded-full bg-cyan-500/[0.03] blur-[100px]" style={{ animation: "floatReverse 15s ease-in-out infinite" }} />
      <div className="absolute bottom-[10%] left-[40%] w-[300px] h-[300px] rounded-full bg-purple-500/[0.02] blur-[80px]" style={{ animation: "float 18s ease-in-out infinite 3s" }} />
    </div>
  );
}

// Glowing glass card
export function GlassCard({ children, className = "", glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`glass-card rounded-[2rem] overflow-hidden ${glow ? "hover-glow" : ""} ${className}`}
      style={glow ? { animation: "borderGlow 4s ease-in-out infinite" } : {}}
    >
      {children}
    </motion.div>
  );
}

// Section title with animated line
export function SectionTitle({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="flex items-center gap-4 mb-8"
    >
      <div className="h-px flex-1 max-w-[40px] bg-gradient-to-r from-emerald-500/60 to-transparent" />
      <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">
        {children} {accent && <span className="text-emerald-400/60">{accent}</span>}
      </h3>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </motion.div>
  );
}

// Horizontal scroll gallery — uses viewport scroll (no target ref) to avoid hydration error
export function CinemaGallery({ photos }: { photos: { id: string; url: string; title: string; date?: string }[] }) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  if (photos.length === 0) return null;

  // Fallback: simple horizontal scroll if not enough photos for parallax
  if (photos.length <= 1 || !mounted) {
    return (
      <div className="flex gap-6 overflow-x-auto scrollbar-none pb-4">
        {photos.map((photo, i) => (
          <div key={photo.id || i} className="group relative h-[50vh] w-[85vw] max-w-[700px] flex-shrink-0 rounded-3xl overflow-hidden border border-white/5">
            <img src={photo.url} alt={photo.title} className="h-full w-full object-cover" loading="lazy"
              onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80'; }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 w-full">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">{photo.title}</h3>
              {photo.date && <p className="text-emerald-400/80 text-xs font-bold mt-2 tracking-widest uppercase">{photo.date}</p>}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <CinemaGalleryInner photos={photos} />;
}

// Inner component: only rendered after mount so ref is guaranteed hydrated
function CinemaGalleryInner({ photos }: { photos: { id: string; url: string; title: string; date?: string }[] }) {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: targetRef, offset: ["start start", "end end"] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 80, damping: 25 });

  const viewportCards = photos.length;
  const sectionHeight = `${100 + viewportCards * 25}vh`;
  const x = useTransform(smoothProgress, [0, 1], ["0%", `${-(viewportCards - 1) * 85}%`]);

  return (
    <section ref={targetRef} className="relative w-full" style={{ height: sectionHeight }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div style={{ x }} className="flex gap-6 pl-[5vw]">
          {photos.map((photo, i) => (
            <motion.div
              key={photo.id || i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="group relative h-[65vh] w-[80vw] max-w-[750px] flex-shrink-0 rounded-3xl overflow-hidden border border-white/5"
            >
              <img src={photo.url} alt={photo.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80'; }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">{photo.title}</h3>
                {photo.date && <p className="text-emerald-400/80 text-xs font-bold mt-2 tracking-widest uppercase">{photo.date}</p>}
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Cinematic 3D List for Links
export function CinematicLinksList({ links, getLogo }: { links: any[]; getLogo: (url: string) => string | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [15, 0, -15]);
  const z = useTransform(scrollYProgress, [0, 0.5, 1], [-50, 0, -50]);

  if (links.length === 0) return null;

  return (
    <div ref={containerRef} className="w-full perspective-[1500px]">
      <motion.div 
        style={{ rotateX, translateZ: z, transformStyle: 'preserve-3d' }}
        className="flex flex-col gap-3"
      >
        {links.map((link, idx) => (
          <motion.a
            key={idx}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: -30, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ 
              duration: 0.8, 
              delay: idx * 0.1,
              ease: [0.16, 1, 0.3, 1]
            }}
            whileHover={{ scale: 1.02, x: 10, backgroundColor: "rgba(255,255,255,0.05)" }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-4 p-4 md:p-5 rounded-[1.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-md transition-all group relative overflow-hidden"
          >
            {/* Hover light sweep */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1.2s] bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent skew-x-12" />
            
            <div className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-2xl bg-white/[0.03] border border-white/5 relative z-10 shrink-0 shadow-xl">
              {getLogo(link.url) ? (
                <img 
                  src={getLogo(link.url)!} 
                  alt={link.title} 
                  className="w-7 h-7 md:w-8 md:h-8 object-contain transition-transform duration-500 group-hover:scale-110 filter drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]" 
                />
              ) : (
                <span className="text-xl">{link.icon || "🔗"}</span>
              )}
            </div>
            
            <div className="flex flex-col gap-0.5 relative z-10">
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-white/80 group-hover:text-emerald-400 transition-colors">
                {link.title}
              </span>
              <span className="text-[8px] md:text-[10px] text-white/20 font-medium tracking-wider lowercase truncate max-w-[180px] md:max-w-xs italic">
                {link.url.replace(/^https?:\/\/(www\.)?/, '')}
              </span>
            </div>

            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </motion.a>
        ))}
      </motion.div>
    </div>
  );
}
