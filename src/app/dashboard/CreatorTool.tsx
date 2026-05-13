"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trophy, Type, Download, X, Check, Video, Camera, ArrowLeft, Play } from "lucide-react";
import { ATHLETIC_DISCIPLINES } from "./constants";

interface CreatorToolProps {
  performances: any[];
  photoGallery: any[];
  videos: any[];
  isPremium: boolean;
}

const CINEMA_EASE = [0.16, 1, 0.3, 1];

export default function CreatorTool({ performances, photoGallery, videos, isPremium }: CreatorToolProps) {
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [selectedType, setSelectedType] = useState<"photo" | "video">("photo");
  const [selectedPerf, setSelectedPerf] = useState<any | null>(null);
  const [customMessage, setCustomMessage] = useState("");
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [showPerfPicker, setShowPerfPicker] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [exportedImageUrl, setExportedImageUrl] = useState<string | null>(null);
  const [showFullScreenPreview, setShowFullScreenPreview] = useState(false);
  
  const [isRecordingLive, setIsRecordingLive] = useState(false);
  
  const [showRecordingMode, setShowRecordingMode] = useState(false);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);

  // Simple clean states
  const [showOutro, setShowOutro] = useState(false);
  const [hideInfoForOutro, setHideInfoForOutro] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  
  // Manual Performance States
  const [perfStep, setPerfStep] = useState<"discipline" | "value">("discipline");
  const [tempDiscipline, setTempDiscipline] = useState("");
  const [tempValue, setTempValue] = useState("");
  const [tempComp, setTempComp] = useState("");
  const [tempWind, setTempWind] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [whiteLogoDataUrl, setWhiteLogoDataUrl] = useState<string>("https://vhbwfqqvsudznnfoqyjm.supabase.co/storage/v1/object/public/Logo/bioathlete_logo_transparent.png");

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "https://vhbwfqqvsudznnfoqyjm.supabase.co/storage/v1/object/public/Logo/bioathlete_logo_transparent.png";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
         ctx.filter = "invert(1) brightness(2)";
         ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
         setWhiteLogoDataUrl(canvas.toDataURL("image/png"));
      }
    };
  }, []);

  // Reset states when asset changes
  useEffect(() => {
    setShowOutro(false);
    setHideInfoForOutro(false);
    setVideoProgress(0);
  }, [selectedAsset]);

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setVideoProgress(progress);
    }
  };

  const handleVideoEnd = () => {
    if (selectedType === 'video') {
      setHideInfoForOutro(true);
      setTimeout(() => {
        setShowOutro(true);
      }, 400);

      setTimeout(() => {
        setShowOutro(false);
        setHideInfoForOutro(false);
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play();
        }
      }, 3400);
    }
  };

  const needsWind = (discipline: string) => {
    const d = discipline.toLowerCase();
    return d.includes('100m') || d.includes('200m') || d.includes('haies') || d.includes('longueur') || d.includes('triple');
  };

  const getUnitType = (discipline: string) => {
    const d = discipline.toLowerCase();
    if (d.includes('lancer') || d.includes('saut') || d.includes('longueur') || d.includes('perche') || d.includes('hauteur') || d.includes('triple')) return 'distance';
    if (d.includes('poids') && !d.includes('lancer')) return 'weight';
    if (d.includes('muscu') || d.includes('bench') || d.includes('squat')) return 'weight';
    return 'time';
  };

  const formatSmartValue = (val: string, type: 'distance' | 'weight' | 'time') => {
    const digits = val.replace(/\D/g, '');
    if (!digits) return '';
    if (type === 'distance' || type === 'weight') {
      if (digits.length <= 2) return (parseInt(digits) / 100).toFixed(2);
      return (parseInt(digits) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    if (digits.length <= 2) return (parseInt(digits) / 100).toFixed(2);
    if (digits.length <= 4) return `${parseInt(digits.slice(0, -2))}.${digits.slice(-2)}`;
    return `${parseInt(digits.slice(0, -4))}:${digits.slice(-4, -2)}.${digits.slice(-2)}`;
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const type = getUnitType(tempDiscipline);
    setTempValue(formatSmartValue(raw, type as any));
  };

  const handleManualPerfSubmit = () => {
    if (!tempDiscipline || !tempValue) return;
    setSelectedPerf({ id: 'manual-' + Date.now(), discipline: tempDiscipline, value: tempValue, competition: tempComp, wind: tempWind });
    setShowPerfPicker(false);
    setPerfStep("discipline");
    setSearchQuery("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const type = file.type.startsWith('video/') ? 'video' : 'photo';
    setSelectedType(type);
    setSelectedAsset({ url, id: 'local', title: file.name });
    setShowAssetPicker(false);
  };

  const handleDownload = async () => {
    if (!selectedAsset) return;

    if (selectedType === 'video') {
       setShowRecordingMode(true);
       setIsPlayingRecording(false);
       setShowOutro(false);
       if (videoRef.current) {
         videoRef.current.currentTime = 0;
         videoRef.current.pause();
       }
       return;
    }
    
    setIsGenerating(true);
    
    try {
      if (selectedType === 'photo') {
        const htmlToImage = await import('html-to-image');
        const container = document.getElementById('export-container');
        if (container) {
          const dataUrl = await htmlToImage.toJpeg(container, {
            quality: 0.95,
            pixelRatio: 3,
            backgroundColor: '#000000'
          });
          setExportedImageUrl(dataUrl);
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = `bioathlete_${Date.now()}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        // Video export simulation: since client-side DOM-to-video compositing is too heavy for browsers without FFmpeg.wasm,
        // we simulate a short processing time and download the original media. 
        // In a real prod environment, this would hit an API endpoint that uses FFmpeg to burn the overlays.
        await new Promise(resolve => setTimeout(resolve, 2500));
        const link = document.createElement("a");
        link.href = selectedAsset.url;
        link.download = `bioathlete_${Date.now()}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      setShowSuccessScreen(true);
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const allDisciplines = Object.values(ATHLETIC_DISCIPLINES).flat();
  const filteredDisciplines = allDisciplines.filter(d => d.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="hidden" />
      
      {/* INITIAL STATE: JUST THE PLUS BUTTON */}
      {!selectedAsset && (
        <div className="flex flex-col items-center gap-6">
          <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setShowAssetPicker(true)}
            className="w-24 h-24 rounded-full border-2 border-dashed border-zinc-300 flex items-center justify-center text-zinc-400 hover:border-emerald-500 hover:text-emerald-500 transition-all shadow-sm"
          >
            <Plus size={40} strokeWidth={1.5} />
          </motion.button>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Partager une performance</p>
        </div>
      )}

      {/* FULL SCREEN CREATOR MODAL */}
      <AnimatePresence>
        {selectedAsset && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4, ease: CINEMA_EASE }}
            className="fixed inset-0 z-[1000] flex flex-col bg-black overflow-y-auto"
            style={{ background: 'var(--bg-base)' }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 sticky top-0 z-[60] backdrop-blur-xl bg-black/20">
              <button 
                onClick={() => { setSelectedAsset(null); setSelectedPerf(null); }}
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-90 transition-all"
              >
                <X size={24} />
              </button>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Studio Créateur</span>
                <span className="text-[8px] text-white/40 uppercase tracking-widest">{selectedType === 'photo' ? 'Photo' : 'Vidéo'} native</span>
              </div>
              <div className="w-12" /> {/* Spacer */}
            </div>

            <div className="flex flex-col gap-10 pb-32 max-w-2xl mx-auto w-full px-4">
              {/* PREVIEW AREA */}
              <div className="flex flex-col gap-8 w-full animate-fadeIn">
                {/* PURE MEDIA CANVAS */}
                <div id="export-container" className="relative w-full overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.5)] bg-black group transition-all duration-700 rounded-[2.5rem]" style={{ border: '1px solid var(--border)', aspectRatio: '4/5' }}>
                  
                  {/* THE MEDIA */}
                  <div className="relative w-full h-full">
                    {selectedType === 'photo' ? (
                      <img src={selectedAsset.url} className="w-full h-full object-cover brightness-[0.95]" />
                    ) : (
                      <div className="relative w-full h-full">
                        <video 
                          ref={videoRef}
                          src={selectedAsset.url} 
                          className="w-full h-full object-cover brightness-[0.95]" 
                          autoPlay 
                          muted 
                          playsInline 
                          onTimeUpdate={handleVideoTimeUpdate}
                          onEnded={handleVideoEnd}
                        />
                        {/* YOUTUBE STYLE PROGRESS BAR (Interactive) */}
                        {!showOutro && (
                          <div 
                            className="absolute bottom-0 left-0 right-0 h-3 bg-white/10 backdrop-blur-sm cursor-pointer group/progress flex items-end"
                            onClick={(e) => {
                              if (videoRef.current) {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                const percentage = x / rect.width;
                                videoRef.current.currentTime = percentage * videoRef.current.duration;
                              }
                            }}
                          >
                            <div className="w-full h-1.5 relative overflow-hidden">
                              <motion.div 
                                className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]"
                                style={{ width: `${videoProgress}%` }}
                              />
                            </div>
                            <div className="absolute inset-0 opacity-0 group-hover/progress:opacity-100 transition-opacity bg-white/5 pointer-events-none" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* OVERLAYS - DIRECTLY ON MEDIA */}
                    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8">
                      {/* Branding (Top Left) */}
                      <div className="flex justify-start w-full">
                        <AnimatePresence>
                          {(selectedType === 'photo' && !showOutro) && (
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="opacity-90 drop-shadow-2xl">
                              <img src={whiteLogoDataUrl} alt="Logo" className="w-40 h-auto ml-[-20px] mt-[-20px]" crossOrigin="anonymous" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Scrim for legibility */}
                      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                      {/* Data Content */}
                      <div className="relative flex flex-col gap-5 z-10">
                        <AnimatePresence>
                          {selectedPerf && !showOutro && !hideInfoForOutro && (
                            <motion.div 
                              initial="hidden" animate="visible" exit="hidden"
                              variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.15, delayChildren: 0.3 } }
                              }}
                              className="flex items-start pl-5 relative"
                            >
                              <motion.div variants={{ hidden: { scaleY: 0 }, visible: { scaleY: 1 } }} className="absolute left-0 top-1 bottom-[-6px] w-1.5 bg-emerald-500 rounded-full origin-top" />
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2 mb-1">
                                    <motion.span variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] drop-shadow-md leading-none">{selectedPerf.discipline}</motion.span>
                                    {selectedPerf.competition && (
                                      <>
                                        <motion.span variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="text-[10px] text-white/50 leading-none">•</motion.span>
                                        <motion.span variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="text-[9px] font-bold text-white/90 uppercase tracking-widest drop-shadow-md leading-none">{selectedPerf.competition}</motion.span>
                                      </>
                                    )}
                                  </div>
                                  <div className="flex items-baseline gap-2 -mt-1.5">
                                  <motion.span variants={{ hidden: { opacity: 0, y: 20, filter: 'blur(10px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { ease: CINEMA_EASE, duration: 0.8 } } }} className="text-6xl font-black text-white tracking-tighter leading-none italic drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">{selectedPerf.value}</motion.span>
                                  <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="flex flex-col gap-1">
                                     {getUnitType(selectedPerf.discipline) === 'distance' && <span className="text-xl font-black text-white/60 uppercase italic leading-none">m</span>}
                                     {getUnitType(selectedPerf.discipline) === 'weight' && <span className="text-xl font-black text-white/60 uppercase italic leading-none">kg</span>}
                                     {selectedPerf.wind !== null && (
                                       <span className="text-[10px] font-black text-emerald-400 uppercase tracking-tighter leading-none">w: {selectedPerf.wind > 0 ? '+' : ''}{selectedPerf.wind.toFixed(1)}</span>
                                     )}
                                  </motion.div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        {customMessage && !showOutro && !hideInfoForOutro && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="pl-4 border-l-2 border-white/30">
                            <p className="text-sm text-white/95 font-medium italic leading-relaxed drop-shadow-md">"{customMessage}"</p>
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* OUTRO AD */}
                    <AnimatePresence>
                      {showOutro && (
                        <motion.div 
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="absolute inset-0 z-50 flex items-center justify-center bg-black p-8"
                        >
                          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.6, ease: CINEMA_EASE }} className="flex flex-col items-center gap-4 text-center">
                             <img src="https://vhbwfqqvsudznnfoqyjm.supabase.co/storage/v1/object/public/Logo/bioathlete_logo_transparent.png" alt="Logo Outro" className="w-56 h-56 object-contain brightness-0 invert drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]" />
                             <div className="flex flex-col gap-2">
                                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.4em]">Partage tes exploits avec</motion.p>
                                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="text-2xl font-black text-white uppercase tracking-tighter italic">bioathlete.space</motion.p>
                             </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* CONTROLS AREA */}
                <div className="flex flex-col gap-8">
                  <div className="flex gap-4">
                    <button onClick={() => { setPerfStep("discipline"); setShowPerfPicker(true); }} className="flex-1 themed-card rounded-3xl p-6 flex items-center justify-center gap-3 active:scale-95 transition-all" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                      <Trophy size={20} className="text-emerald-500" />
                      <span className="text-[12px] font-black uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>{selectedPerf ? "Modifier la Perf" : "Associer une Performance"}</span>
                    </button>
                    <button onClick={handleDownload} disabled={isGenerating} className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center text-black shadow-xl shadow-emerald-500/20 active:scale-90 transition-all disabled:opacity-50">
                      {isGenerating ? <div className="w-8 h-8 border-3 border-black border-t-transparent animate-spin rounded-full" /> : <Download size={28} />}
                    </button>
                  </div>

                  <div className="flex flex-col gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Message Personnel</span>
                    <div className="relative">
                      <input type="text" maxLength={60} value={customMessage} onChange={(e) => setCustomMessage(e.target.value)} placeholder="Ajouter un petit mot..." className="w-full p-6 themed-card rounded-3xl text-sm font-bold outline-none border focus:border-emerald-500 transition-all pr-14" style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', borderColor: 'var(--border)' }} />
                      <Type className="absolute right-6 top-1/2 -translate-y-1/2 opacity-30" size={18} style={{ color: 'var(--text-primary)' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODALS (Asset Picker, Perf Picker) */}
      <AnimatePresence>
        {showAssetPicker && (
          <div className="fixed inset-0 z-[9999] flex flex-col justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAssetPicker(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl pointer-events-auto" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="relative w-full rounded-t-[3rem] p-8 flex flex-col gap-6 pb-12 overflow-hidden border-t" style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}>
              <div className="w-12 h-1.5 rounded-full opacity-20 mx-auto mb-2" style={{ background: 'var(--text-primary)' }} />
              <button onClick={() => fileInputRef.current?.click()} className="w-full p-6 rounded-3xl bg-emerald-500 text-black font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all"><Download size={20} className="rotate-180" />Importer un fichier</button>
              <div className="flex items-center gap-4 py-2"><div className="h-px flex-1 bg-zinc-500/10" /><span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Ou depuis ta galerie</span><div className="h-px flex-1 bg-zinc-500/10" /></div>
              <div className="grid grid-cols-2 gap-3 mb-2">
                <button onClick={() => setSelectedType('photo')} className={`p-4 rounded-2xl border font-black uppercase text-[10px] tracking-widest transition-all ${selectedType === 'photo' ? 'bg-white text-black border-white' : 'bg-zinc-500/5 text-zinc-400 border-transparent'}`}>Photos</button>
                <button onClick={() => setSelectedType('video')} className={`p-4 rounded-2xl border font-black uppercase text-[10px] tracking-widest transition-all ${selectedType === 'video' ? 'bg-white text-black border-white' : 'bg-zinc-500/5 text-zinc-400 border-transparent'}`}>Vidéos</button>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[35vh] grid grid-cols-3 gap-3 pr-1 custom-scrollbar">
                {selectedType === 'photo' ? (photoGallery?.length > 0 ? photoGallery.map(photo => (<button key={photo.id} onClick={() => { setSelectedAsset(photo); setShowAssetPicker(false); }} className="aspect-square rounded-xl overflow-hidden relative group border border-white/5"><img src={photo.url} className="w-full h-full object-cover" alt={photo.title} /></button>)) : <p className="col-span-3 text-center py-8 text-zinc-500 italic text-[10px]">Galerie vide.</p>) : (videos?.length > 0 ? videos.map(vid => (<button key={vid.id} onClick={() => { setSelectedAsset(vid); setShowAssetPicker(false); }} className="aspect-square rounded-xl overflow-hidden relative group bg-black border border-white/5"><video src={vid.url} className="w-full h-full object-cover opacity-60" /></button>)) : <p className="col-span-3 text-center py-8 text-zinc-500 italic text-[10px]">Vidéos vides.</p>)}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPerfPicker && (
          <div className="fixed inset-0 z-[10000] flex flex-col justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPerfPicker(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl pointer-events-auto" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="relative w-full h-[85vh] rounded-t-[3rem] p-8 flex flex-col gap-6 pb-12 overflow-hidden border-t" style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}>
              <div className="w-12 h-1.5 bg-zinc-500/20 rounded-full mx-auto mb-2" />
              <AnimatePresence mode="wait">
                {perfStep === "discipline" ? (
                  <motion.div key="discipline" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6 flex-1 overflow-hidden">
                    <div className="flex items-center justify-between"><h3 className="text-3xl font-black tracking-tighter uppercase" style={{ color: 'var(--text-primary)' }}>Discipline</h3><button onClick={() => setShowPerfPicker(false)} className="p-2 bg-zinc-500/10 rounded-full text-zinc-500"><X size={20} /></button></div>
                    <input type="text" placeholder="Chercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full p-5 themed-card rounded-2xl font-bold outline-none border focus:border-emerald-500 transition-all" style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', borderColor: 'var(--border)' }} />
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-2">
                      {searchQuery && !filteredDisciplines.includes(searchQuery) && (<button onClick={() => { setTempDiscipline(searchQuery); setPerfStep("value"); setTempWind(0); }} className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-left font-bold flex justify-between items-center group"><span>Créer "{searchQuery}"</span><Plus size={18} /></button>)}
                      {filteredDisciplines.map(d => (<button key={d} onClick={() => { setTempDiscipline(d); setPerfStep("value"); setTempWind(needsWind(d) ? 0 : null); }} className="p-5 rounded-2xl bg-zinc-500/5 text-left font-bold text-sm hover:bg-zinc-500/10 transition-all" style={{ color: 'var(--text-primary)' }}>{d}</button>))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="value" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    <div className="flex items-center gap-4"><button onClick={() => setPerfStep("discipline")} className="p-3 bg-zinc-500/10 rounded-2xl text-zinc-500"><ArrowLeft size={24} /></button><div className="flex flex-col"><span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{tempDiscipline}</span><h3 className="text-2xl font-black uppercase" style={{ color: 'var(--text-primary)' }}>Performance</h3></div></div>
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col gap-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Valeur</label>
                        <input type="text" inputMode="numeric" placeholder="0.00" value={tempValue} onChange={handleValueChange} className="w-full p-8 text-8xl font-black tracking-tighter text-center bg-zinc-500/5 rounded-[2.5rem] outline-none border-2 border-transparent focus:border-emerald-500 transition-all italic" style={{ color: 'var(--text-primary)' }} />
                      </div>
                      
                      {tempWind !== null && (
                        <div className="flex flex-col gap-3 p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10">
                          <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Vent (m/s)</label>
                          <div className="flex items-center justify-between gap-6">
                            <button onClick={() => setTempWind(prev => parseFloat(((prev || 0) - 0.1).toFixed(1)))} className="w-16 h-16 rounded-2xl bg-zinc-500/10 flex items-center justify-center text-white text-3xl font-black active:scale-90 transition-all">-</button>
                            <span className="text-4xl font-black italic tracking-tighter" style={{ color: 'var(--text-primary)' }}>{tempWind > 0 ? '+' : ''}{tempWind.toFixed(1)}</span>
                            <button onClick={() => setTempWind(prev => parseFloat(((prev || 0) + 0.1).toFixed(1)))} className="w-16 h-16 rounded-2xl bg-zinc-500/10 flex items-center justify-center text-white text-3xl font-black active:scale-90 transition-all">+</button>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col gap-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Lieu / Compétition</label>
                        <input type="text" placeholder="Ex: Paris 2024" value={tempComp} onChange={(e) => setTempComp(e.target.value)} className="w-full p-5 bg-zinc-500/5 rounded-2xl font-bold outline-none border border-transparent focus:border-emerald-500 transition-all" style={{ color: 'var(--text-primary)' }} />
                      </div>
                      <button onClick={handleManualPerfSubmit} className="w-full py-6 rounded-[2.5rem] bg-emerald-500 text-black font-black uppercase tracking-widest shadow-2xl shadow-emerald-500/40 active:scale-95 transition-all italic text-lg">Valider</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SUCCESS SCREEN */}
      <AnimatePresence>
        {showSuccessScreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center p-6"
          >
            <div className="max-w-md w-full flex flex-col items-center gap-10 text-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", damping: 15 }}
                className="w-28 h-28 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.5)]"
              >
                <Check size={56} className="text-black" />
              </motion.div>
              
              <div className="flex flex-col gap-3">
                <motion.h2 
                  initial={{ y: 20, opacity: 0 }} 
                  animate={{ y: 0, opacity: 1 }} 
                  transition={{ delay: 0.2 }}
                  className="text-4xl font-black uppercase tracking-tighter text-white"
                >
                  Félicitations !
                </motion.h2>
                <motion.p 
                  initial={{ y: 20, opacity: 0 }} 
                  animate={{ y: 0, opacity: 1 }} 
                  transition={{ delay: 0.3 }}
                  className="text-zinc-400 font-medium text-lg leading-relaxed"
                >
                  Retrouve ta {selectedType === 'photo' ? 'photo' : 'vidéo'} directement dans ta galerie téléphone.
                </motion.p>
              </div>

              {/* Aperçu */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.4 }}
                onClick={() => setShowFullScreenPreview(true)}
                className="w-48 h-64 rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl relative bg-black flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
              >
                {selectedType === 'photo' ? (
                  exportedImageUrl ? (
                    <img src={exportedImageUrl} className="w-full h-full object-contain" alt="Aperçu final" />
                  ) : (
                    <img src={selectedAsset.url} className="w-full h-full object-contain" alt="Aperçu" />
                  )
                ) : (
                  <div className="relative w-full h-full">
                    <video 
                      src={selectedAsset.url} 
                      className="w-full h-full object-cover" 
                      autoPlay 
                      muted 
                      playsInline 
                      onTimeUpdate={handleVideoTimeUpdate}
                      onEnded={handleVideoEnd}
                    />
                    
                    {!showOutro && (
                      <>
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                        <div className="absolute inset-0 p-3 flex flex-col justify-end pointer-events-none z-10">
                          <div className="flex flex-col gap-2">
                            {selectedPerf && !hideInfoForOutro && (
                              <div className="flex items-start gap-1">
                                <div className="w-0.5 self-stretch bg-emerald-500 rounded-full" />
                                <div className="flex flex-col">
                                  <span className="text-[6px] font-black text-emerald-400 uppercase tracking-widest">{selectedPerf.discipline}</span>
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-black text-white tracking-tighter leading-none italic">{selectedPerf.value}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                            {customMessage && !hideInfoForOutro && (
                              <div className="pl-1 border-l border-white/30">
                                <p className="text-[6px] text-white/95 font-medium italic line-clamp-2">"{customMessage}"</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {showOutro && (
                      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black p-4">
                        <div className="flex flex-col items-center gap-2 text-center">
                           <img src="https://vhbwfqqvsudznnfoqyjm.supabase.co/storage/v1/object/public/Logo/bioathlete_logo_transparent.png" alt="Logo Outro" className="w-16 h-16 object-contain brightness-0 invert drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                           <div className="flex flex-col gap-1">
                              <p className="text-[5px] font-black text-emerald-500 uppercase tracking-[0.4em]">Partage tes exploits avec</p>
                              <p className="text-[10px] font-black text-white uppercase tracking-tighter italic">bioathlete.space</p>
                           </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>

              <motion.button 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.5 }}
                onClick={() => {
                  setShowSuccessScreen(false);
                  setSelectedAsset(null);
                  setSelectedPerf(null);
                  setExportedImageUrl(null);
                }}
                className="w-full py-6 rounded-[2rem] bg-white/10 text-white font-black uppercase tracking-widest hover:bg-white/20 active:scale-95 transition-all mt-4"
              >
                Retour au Dashboard
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL SCREEN PREVIEW MODAL */}
      <AnimatePresence>
        {showFullScreenPreview && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3, ease: CINEMA_EASE }}
            className="fixed inset-0 z-[20000] bg-black flex items-center justify-center"
          >
            <button 
              onClick={() => setShowFullScreenPreview(false)}
              className="absolute top-6 left-6 w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white active:scale-90 transition-all z-[20010]"
            >
              <X size={24} />
            </button>
            
            {selectedType === 'photo' ? (
              <img src={exportedImageUrl || selectedAsset.url} className="w-full h-full object-contain" alt="Aperçu Plein Écran" />
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                <video 
                  src={selectedAsset.url} 
                  className="w-full h-full object-cover" 
                  autoPlay 
                  muted 
                  playsInline 
                  onTimeUpdate={handleVideoTimeUpdate}
                  onEnded={handleVideoEnd}
                />
                
                {!showOutro && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-end p-8">
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                    <div className="relative flex flex-col gap-5 z-10">
                      {selectedPerf && !hideInfoForOutro && (
                        <div className="flex items-start pl-5 relative">
                          <div className="absolute left-0 top-1 bottom-[-6px] w-1.5 bg-emerald-500 rounded-full origin-top" />
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] drop-shadow-md leading-none">{selectedPerf.discipline}</span>
                              {selectedPerf.competition && (
                                <>
                                  <span className="text-[10px] text-white/50 leading-none">•</span>
                                  <span className="text-[9px] font-bold text-white/90 uppercase tracking-widest drop-shadow-md leading-none">{selectedPerf.competition}</span>
                                </>
                              )}
                            </div>
                            <div className="flex items-baseline gap-2 -mt-1.5">
                              <span className="text-6xl font-black text-white tracking-tighter leading-none italic drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">{selectedPerf.value}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      {customMessage && !hideInfoForOutro && (
                        <div className="pl-4 border-l-2 border-white/30">
                          <p className="text-sm text-white/95 font-medium italic leading-relaxed drop-shadow-md">"{customMessage}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {showOutro && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-black p-8">
                    <div className="flex flex-col items-center gap-4 text-center">
                       <img src="https://vhbwfqqvsudznnfoqyjm.supabase.co/storage/v1/object/public/Logo/bioathlete_logo_transparent.png" alt="Logo Outro" className="w-40 h-40 object-contain brightness-0 invert drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]" />
                       <div className="flex flex-col gap-2">
                          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Partage tes exploits avec</p>
                          <p className="text-2xl font-black text-white uppercase tracking-tighter italic">bioathlete.space</p>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* NATIVE SCREEN RECORDING MODE */}
      <AnimatePresence>
        {showRecordingMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[40000] bg-black flex items-center justify-center"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <video 
                ref={videoRef}
                src={selectedAsset?.url} 
                className="w-full h-full object-cover" 
                playsInline 
                onEnded={() => setShowOutro(true)}
              />
              
              {/* Overlays - Only show when playing, using identical DOM as the preview */}
              {isPlayingRecording && !showOutro && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-end p-8">
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                    <div className="relative flex flex-col gap-5 z-10">
                      {selectedPerf && !hideInfoForOutro && (
                        <motion.div 
                          initial="hidden" animate="visible"
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.15, delayChildren: 0.3 } }
                          }}
                          className="flex items-start pl-5 relative"
                        >
                          <motion.div variants={{ hidden: { scaleY: 0 }, visible: { scaleY: 1 } }} className="absolute left-0 top-1 bottom-[-6px] w-1.5 bg-emerald-500 rounded-full origin-top" />
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-1">
                              <motion.span variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] drop-shadow-md leading-none">{selectedPerf.discipline}</motion.span>
                              {selectedPerf.competition && (
                                <>
                                  <motion.span variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="text-[10px] text-white/50 leading-none">•</motion.span>
                                  <motion.span variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="text-[9px] font-bold text-white/90 uppercase tracking-widest drop-shadow-md leading-none">{selectedPerf.competition}</motion.span>
                                </>
                              )}
                            </div>
                            <div className="flex items-baseline gap-2 -mt-1.5">
                              <motion.span variants={{ hidden: { opacity: 0, y: 20, filter: 'blur(10px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { ease: CINEMA_EASE, duration: 0.8 } } }} className="text-6xl font-black text-white tracking-tighter leading-none italic drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">{selectedPerf.value}</motion.span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
              )}

              {/* Outro */}
              <AnimatePresence>
                {showOutro && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
                    className="absolute inset-0 z-50 flex items-center justify-center bg-black p-8"
                  >
                    <div className="flex flex-col items-center gap-4 text-center">
                       <motion.img initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: 'spring' }} src="https://vhbwfqqvsudznnfoqyjm.supabase.co/storage/v1/object/public/Logo/bioathlete_logo_transparent.png" alt="Logo Outro" className="w-40 h-40 object-contain brightness-0 invert drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]" />
                       <div className="flex flex-col gap-2">
                          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Partage tes exploits avec</motion.p>
                          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-2xl font-black text-white uppercase tracking-tighter italic">bioathlete.space</motion.p>
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Controls UI (Hidden when playing) */}
              {!isPlayingRecording && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-[40010]">
                  <button onClick={() => { setShowRecordingMode(false); setIsRecordingLive(false); setShowOutro(false); }} className="absolute top-6 left-6 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white"><X size={24} /></button>
                  <div className="text-center max-w-sm flex flex-col items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-2">
                       <div className="w-6 h-6 rounded-full bg-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Enregistrement</h2>
                    <p className="text-white/70 text-sm leading-relaxed">
                      Pour conserver la qualité cinéma et vos animations :<br/><br/>
                      <span className="inline-block bg-white/10 px-3 py-1 rounded-lg text-white font-bold mt-2 mb-2">1. Lancez l'enregistrement d'écran natif de votre téléphone.</span><br/>
                      <span className="inline-block bg-white/10 px-3 py-1 rounded-lg text-white font-bold mb-2">2. Cliquez sur Lancer la vidéo.</span><br/>
                      <span className="inline-block bg-white/10 px-3 py-1 rounded-lg text-white font-bold">3. Arrêtez l'enregistrement à la fin.</span>
                    </p>
                    <button 
                      onClick={() => {
                        setIsPlayingRecording(true);
                        videoRef.current?.play();
                      }}
                      className="mt-4 w-full py-5 rounded-2xl bg-emerald-500 text-white font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all"
                    >
                      <Play size={20} fill="currentColor" />
                      Lancer la vidéo
                    </button>
                  </div>
                </div>
              )}
              
              {/* Invisible overlay to tap to stop recording playback early */}
              {isPlayingRecording && (
                <button 
                  className="absolute inset-0 z-[40020] opacity-0"
                  onClick={() => {
                    setIsPlayingRecording(false);
                    videoRef.current?.pause();
                  }}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
