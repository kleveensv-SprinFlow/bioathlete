"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, useScroll, useTransform, useMotionValueEvent, useSpring } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Custom3DChart } from "@/components/CustomChart";
import { FloatingOrbs, GlassCard, ParallaxSection, SectionTitle, CinemaGallery, CinematicLinksList } from "./ParallaxComponents";
import { Sponsors3DSection } from "@/components/Sponsors3DSection";

import { PerformanceRaw, ProcessedDiscipline, SocialLink, Sponsor, Video } from "@/types";

interface Record { distance: string; temps: string; competition: string; }
interface EvolutionPoint { date: string; "100m": number; }

export function processPerformances(performances: PerformanceRaw[]): { [key: string]: ProcessedDiscipline } {
  const grouped: { [key: string]: PerformanceRaw[] } = {};
  performances.forEach(perf => { if (!grouped[perf.distance]) grouped[perf.distance] = []; grouped[perf.distance].push(perf); });
  const result: { [key: string]: ProcessedDiscipline } = {};
  for (const [distance, records] of Object.entries(grouped)) {
    const sortedByDate = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const sortedByTime = [...records].sort((a, b) => parseFloat(a.temps.toString()) - parseFloat(b.temps.toString()));
    const firstRecord = sortedByDate[0]; const bestRecord = sortedByTime[0];
    const firstTime = parseFloat(firstRecord.temps.toString()); const bestTime = parseFloat(bestRecord.temps.toString());
    let improvementTimeVal = bestTime - firstTime;
    let improvementPercentageVal = firstTime > 0 ? (improvementTimeVal / firstTime) * 100 : 0;
    result[distance] = { distance, records: sortedByDate, firstRecord, bestRecord,
      improvementTime: improvementTimeVal <= 0 ? `${improvementTimeVal.toFixed(2)}s` : `+${improvementTimeVal.toFixed(2)}s`,
      improvementPercentage: improvementTimeVal <= 0 ? `${improvementPercentageVal.toFixed(1)}%` : `+${improvementPercentageVal.toFixed(1)}%`
    };
  }
  return result;
}


/* ═══════ MAIN PAGE ═══════ */
export default function PublicAthleteProfile() {
  const params = useParams();
  const username = params?.username as string;
  const heroRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [profileNotFound, setProfileNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<{ full_name?: string; bio?: string; avatar_url?: string; photos?: { id: string; url: string; title: string; date?: string }[] }>({});
  const [records, setRecords] = useState<Record[]>([]);
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [evolution, setEvolution] = useState<EvolutionPoint[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [processedPerformances, setProcessedPerformances] = useState<{ [key: string]: ProcessedDiscipline }>({});
  const [selectedDiscipline, setSelectedDiscipline] = useState<string | null>(null);

  const { scrollY } = useScroll();
  const heroScale = useTransform(scrollY, [0, 600], [1, 1.15]);
  const heroOpacity = useTransform(scrollY, [0, 400, 600], [1, 0.8, 0]);
  const nameY = useTransform(scrollY, [0, 600], [0, 150]);
  const nameOpacity = useTransform(scrollY, [0, 300, 600], [1, 0.6, 0]);
  const videoY = useTransform(scrollY, [0, 3000], [0, -300]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const { scrollYProgress } = useScroll();
  
  // Appliquer un lissage (Spring) pour un effet cinématique fluide
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 30,
    stiffness: 120,
    mass: 0.1
  });

  // Sync video playback with smooth scroll progress
  useMotionValueEvent(smoothProgress, "change", (latest) => {
    const video = videoRef.current;
    if (!video || isNaN(video.duration) || video.duration === 0) return;

    let progress = 0;
    if (latest > 0.15) {
      progress = (latest - 0.15) / 0.85;
    }
    progress = Math.max(0, Math.min(1, progress));

    requestAnimationFrame(() => {
      if (!video.paused) video.pause();
      const targetTime = video.duration * progress;
      // Seuil de précision pour éviter les micro-saccades
      if (Math.abs(video.currentTime - targetTime) > 0.01) {
        video.currentTime = targetTime;
      }
    });
  });

  useEffect(() => {
    async function fetchAthleteByUsername() {
      if (!username) { setLoading(false); return; }
      try {
        await supabase.from("views").insert([{ count: 1 }]);
        const { data: profile, error: profErr } = await supabase.from("profiles").select("user_id, bio, avatar_url, full_name").eq("username", username.toLowerCase()).maybeSingle() as any;
        if (profErr || !profile?.user_id) { setProfileNotFound(true); setLoading(false); return; }
        
        const uid = profile.user_id;

        // Fetch photo gallery separately
        const { data: photoData } = await supabase.from("photo_gallery").select("*").eq("user_id", uid);
        
        setProfileData({ 
          full_name: profile.full_name, 
          bio: profile.bio, 
          avatar_url: profile.avatar_url, 
          photos: photoData || [] 
        });
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        const isOwner = currentUser && currentUser.id === uid;
        if (!isOwner) {
          try {
            const { error: rpcError } = await supabase.rpc('increment_views', { p_id: uid });
            if (rpcError) { const { data } = await supabase.from("profiles").select("views_count").eq("user_id", uid).single(); if (data) await supabase.from("profiles").update({ views_count: (data.views_count || 0) + 1 }).eq("user_id", uid); }
          } catch (e) { }
        }
        const { data: perfData, error: perfErr } = await supabase.from("performances").select("*").eq("user_id", uid);
        if (!perfErr && perfData && perfData.length > 0) {
          setRecords(perfData.slice(-2).map(p => ({ distance: p.distance, temps: p.temps + "s", competition: p.competition })));
          setEvolution(perfData.map(p => ({ date: p.date, "100m": parseFloat(p.temps) })));
          const processed = processPerformances(perfData);
          setProcessedPerformances(processed);
          const disciplines = Object.keys(processed);
          if (disciplines.length > 0) setSelectedDiscipline(disciplines[0]);
        }
        const { data: linkData, error: linkErr } = await supabase.from("links").select("*").eq("user_id", uid);
        if (!linkErr && linkData) setLinks(linkData);
        const { data: spData, error: spErr } = await supabase.from("sponsors").select("*").eq("user_id", uid);
        if (!spErr && spData) setSponsors(spData);
        const { data: vidData, error: vidErr } = await supabase.from("videos").select("*").eq("user_id", uid);
        if (!vidErr && vidData) setVideos(vidData);
      } catch (err) { console.error("Fetch profile err:", err);
      } finally { setMounted(true); setLoading(false); }
    }
    fetchAthleteByUsername();
  }, [params.username]);

  // Hack pour forcer iOS/Safari à précharger la première frame (Architecte Technique)
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().then(() => {
        if (videoRef.current) videoRef.current.pause();
      }).catch((e) => {
        console.log("Lecture automatique bloquée par le navigateur (normal sur mobile sans interaction) : ", e);
      });
    }
  }, []);

  // Helper to get high-quality logos for links
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

  const formatEmbedUrl = (url: string) => {
    try {
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        const urlObj = new URL(url); let videoId = "";
        if (url.includes("youtu.be")) videoId = urlObj.pathname.slice(1);
        else videoId = urlObj.searchParams.get("v") || "";
        return `https://www.youtube.com/embed/${videoId}`;
      } return url;
    } catch { return url; }
  };

  if (loading) return (
    <div className="min-h-screen mesh-gradient flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
        <p className="text-white/20 text-[10px] tracking-[0.4em] uppercase font-bold animate-pulse">Chargement</p>
      </div>
    </div>
  );

  if (profileNotFound) return (
    <div className="min-h-screen mesh-gradient flex flex-col items-center justify-center gap-6 px-5 text-center">
      <h2 className="text-3xl font-black text-gradient-neon tracking-tight">Athlète non trouvé</h2>
      <p className="text-white/30 text-sm max-w-xs">Le profil que vous cherchez n&apos;existe pas ou a été désactivé.</p>
      <Link href="/" className="px-6 py-3 glass-card rounded-xl text-xs font-bold text-emerald-400 tracking-wide uppercase hover:border-emerald-500/30 transition-all">← Retour</Link>
    </div>
  );

  const equipementiers = sponsors.filter(sp => sp.category === "Équipementier");
  const partenaires = sponsors.filter(sp => sp.category === "Partenaire" || !sp.category);
  const galleryPhotos = profileData.photos && profileData.photos.length > 0 ? profileData.photos : [];

  return (
    <div className="visitor-profile min-h-screen mesh-gradient text-white font-sans selection:bg-emerald-500/30 selection:text-white noise-overlay overflow-x-hidden">
      <FloatingOrbs />
 
      {/* ═══ CINEMATIC VIDEO BACKGROUND ═══ */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none overflow-hidden bg-black">
        {!isVideoLoaded && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-emerald-500/50 text-[10px] tracking-[0.4em] font-bold animate-pulse">
              CHARGEMENT DU MÉDIA...
            </div>
          </div>
        )}
        <video 
          ref={videoRef}
          muted 
          playsInline 
          preload="auto"
          onLoadedMetadata={(e) => {
            setIsVideoLoaded(true);
            e.currentTarget.pause();
          }}
          className={`w-full h-full object-cover contrast-110 brightness-110 transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-50' : 'opacity-0'}`}
        >
          <source src="/Stade_scrub.mp4" type="video/mp4" />
        </video>
        {/* Darkening overlays for readability - softened to allow more video through */}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-transparent to-[#050505]/60" />
      </div>
      <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[100] w-full flex justify-center px-6 pointer-events-none">
        <motion.img 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          src="https://vhbwfqqvsudznnfoqyjm.supabase.co/storage/v1/object/public/Logo/bioathlete_logo_transparent.png" 
          alt="BioAthlete" 
          className="h-10 md:h-12 object-contain logo-visibility-fix invert" 
        />
      </div>

      {/* ═══ HERO CINEMATIC ═══ */}
      <section ref={heroRef} className="relative w-full h-screen overflow-hidden">
        {/* Background image with parallax zoom */}
        <motion.div style={{ scale: heroScale, opacity: heroOpacity }} className="absolute inset-0 w-full h-full">
          {profileData.avatar_url ? (
            <img src={profileData.avatar_url} alt={username} className="w-full h-full object-cover object-top" onError={e => { e.currentTarget.style.display = 'none'; }} />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
              <span className="text-[200px] font-black text-white/[0.03] tracking-tighter select-none">{username?.slice(0, 2).toUpperCase()}</span>
            </div>
          )}
          {/* Cinematic gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/40 via-transparent to-[#050505]/40" />
        </motion.div>

        {/* Name with parallax depth */}
        <motion.div style={{ y: nameY, opacity: nameOpacity }} className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-emerald-400/70 mb-3">Profil Athlète</p>
            <h1 className="text-5xl md:text-9xl font-black tracking-tighter text-white uppercase leading-[0.8]" style={{ textShadow: '0 0 80px rgba(0,255,136,0.15)' }}>
              {(profileData.full_name || username).toUpperCase()}
            </h1>
          </motion.div>

          {/* Quick Stats Bar - Fills the gap and adds immediate impact */}
          {records.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="flex gap-8 mt-8 py-4 border-y border-white/5 max-w-fit pr-12"
            >
              {records.map((rec, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">{rec.distance}</span>
                  <span className="text-2xl md:text-3xl font-black text-white italic tracking-tighter">{rec.temps}</span>
                </div>
              ))}
            </motion.div>
          )}

          {/* Bio */}
          {profileData.bio && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.8 }}
              className="text-white/30 text-sm md:text-base max-w-xl leading-relaxed mt-6 font-light">
              {profileData.bio}
            </motion.p>
          )}

        </motion.div>

        {/* Scroll indicator */}
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
          <div className="w-[1px] h-8 bg-gradient-to-b from-transparent to-emerald-500/40" />
          <span className="text-[8px] text-white/20 uppercase tracking-[0.3em] font-bold">Scroll</span>
        </motion.div>
      </section>

      {/* ═══ CONTENT BENTO GRID ═══ */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 md:px-8 flex flex-col gap-6 pb-32 pt-2">
        
        {/* Cinematic Links List - Positioned right after Hero */}
        <section className="w-full">
          <CinematicLinksList links={links} getLogo={getLinkLogo} />
        </section>

        {/* The Bento Section: Sponsors unified */}
        <section className="flex flex-col gap-4">
          {/* Brand support slogan - positioned between links and sponsors grid */}
          {sponsors.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center justify-center gap-2 mb-2"
            >
              <div className="h-px w-10 bg-emerald-500/30" />
              <p className="text-[9px] md:text-xs uppercase tracking-[0.3em] text-white/40 font-black text-center max-w-2xl leading-relaxed">
                {sponsors.length === 1 ? `${sponsors[0].name} soutient cet athlète` : 
                 sponsors.length === 2 ? `${sponsors[0].name} et ${sponsors[1].name} soutiennent cet athlète` :
                 `${sponsors[0].name}, ${sponsors[1].name} et d'autres soutiennent cet athlète`}
              </p>
            </motion.div>
          )}

          <Sponsors3DSection sponsors={sponsors} hideSlogan={true} />
        </section>

        {/* ═══ GALLERY ═══ */}
        {galleryPhotos.length > 0 && (
          <div className="w-full">
            <SectionTitle accent="Gallery">Moments</SectionTitle>
            <CinemaGallery photos={galleryPhotos} />
          </div>
        )}

        {/* ═══ VIDEOS ═══ */}
        {videos.length > 0 && (
          <ParallaxSection className="w-full">
            <SectionTitle accent="& Médias">Vidéos</SectionTitle>
            <div className="flex flex-col gap-4">
              {videos.map((vid, idx) => (
                <GlassCard key={idx} className="p-4 overflow-hidden">
                  {vid.title && <p className="text-xs font-bold uppercase tracking-wider text-white/60 mb-3 px-1">{vid.title}</p>}
                  <div className="w-full rounded-2xl overflow-hidden border border-white/5">
                    {vid.url.includes("youtube.com") || vid.url.includes("youtu.be") || vid.url.includes("vimeo") ? (
                      <iframe src={formatEmbedUrl(vid.url)} title={vid.title} className="w-full h-48 md:h-64 border-none" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen loading="lazy" />
                    ) : (
                      <video src={vid.url} controls controlsList="nodownload" className="w-full max-h-64 object-contain bg-black" preload="metadata" />
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>
          </ParallaxSection>
        )}


        {/* ═══ PERFORMANCES ═══ */}
        {Object.keys(processedPerformances).length > 0 && selectedDiscipline && processedPerformances[selectedDiscipline] && (
          <ParallaxSection className="w-full">
            <SectionTitle accent="Analytics">Performances</SectionTitle>

            {/* Discipline tabs */}
            <div className="w-full overflow-x-auto pb-3 scrollbar-none mb-6">
              <div className="flex gap-2">
                {Object.keys(processedPerformances).map(disc => (
                  <button key={disc} onClick={() => setSelectedDiscipline(disc)}
                    className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap transition-all duration-500 cursor-pointer ${
                      selectedDiscipline === disc
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_30px_rgba(0,255,136,0.1)]"
                        : "glass-card text-white/30 hover:text-white/60"
                    }`}>
                    {disc}
                  </button>
                ))}
              </div>
            </div>

            {/* Performance card */}
            <motion.div key={selectedDiscipline} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <GlassCard glow className="overflow-hidden">
                {/* PB Section */}
                <div className="p-8 md:p-14 flex flex-col items-center justify-center border-b border-white/5 relative">
                  {/* Glow behind number */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-500/[0.04] rounded-full blur-[80px] pointer-events-none" />
                  <span className="text-white/20 font-black text-[10px] tracking-[0.4em] uppercase mb-8 relative z-10">Record Personnel</span>
                  <div className="text-7xl md:text-9xl font-black text-white tracking-tighter flex items-baseline relative z-10" style={{ textShadow: '0 0 60px rgba(0,255,136,0.08)' }}>
                    {processedPerformances[selectedDiscipline].bestRecord.temps}
                    <span className="text-2xl md:text-4xl text-white/15 ml-2 font-bold">s</span>
                  </div>
                  <div className="mt-8 relative z-10">
                    <div className="flex items-center gap-3 px-5 py-2.5 rounded-full border border-emerald-500/20 bg-emerald-500/5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" style={{ animation: "subtlePulse 2s ease-in-out infinite" }} />
                      <span className="text-emerald-400/80 text-[10px] font-black tracking-[0.2em] uppercase">
                        {processedPerformances[selectedDiscipline].improvementPercentage} d&apos;évolution
                      </span>
                    </div>
                  </div>
                </div>

                {/* Chart */}
                {mounted && processedPerformances[selectedDiscipline].records.length > 0 && (
                  <div className="p-3 md:p-6 bg-white/[0.01]">
                    <Custom3DChart records={processedPerformances[selectedDiscipline].records} isEmbedded={true} />
                  </div>
                )}
              </GlassCard>
            </motion.div>
          </ParallaxSection>
        )}

        {/* ═══ FOOTER ═══ */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="w-full pt-12">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent mb-8" />
          <footer className="text-center">
            <p className="text-[9px] text-white/15 font-medium uppercase tracking-[0.3em] flex items-center justify-center gap-2">
              Optimisé par <span className="text-gradient-neon font-bold">BioAthlete.space</span>
            </p>
          </footer>
        </motion.div>
      </div>
    </div>
  );
}
