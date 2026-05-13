"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, QrCode, Share, Check, FileText, Lock } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  onExportPDF: () => void;
  isPremium: boolean;
}

export default function ShareModal({ isOpen, onClose, username, onExportPDF, isPremium }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const publicUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/${username}` 
    : `https://bioathlete.space/${username}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Erreur copie :", err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "BioAthlete - Ma vitrine officielle",
          text: `Découvrez mon profil d'athlète sur BioAthlete !`,
          url: publicUrl,
        });
      } catch (err) {
        console.error("Erreur partage natif :", err);
      }
    } else {
      alert("Le partage natif n'est pas supporté sur ce navigateur.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex flex-col justify-end">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Drawer Content */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
            className="relative w-full rounded-t-[3rem] overflow-hidden border-t shadow-[0_-20px_50px_rgba(0,0,0,0.3)] p-8 pb-16"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
          >
            {/* Visual Handle */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full opacity-20" style={{ background: 'var(--text-primary)' }} />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center gap-8">
              {/* Title */}
              <div className="text-center pt-4">
                <h2 className="text-2xl font-black uppercase tracking-tighter" style={{ color: 'var(--text-primary)' }}>
                  Partage ta vitrine
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--text-muted)' }}>
                  Diffuse tes performances à l'élite
                </p>
              </div>

              {/* URL Display Box */}
              <div 
                className="w-full p-4 border rounded-2xl flex items-center justify-between gap-3 group transition-all"
                style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}
              >
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs truncate font-medium" style={{ color: 'var(--text-muted)' }}>
                    {publicUrl.replace(/^https?:\/\//, '')}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCopy}
                  className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    copied ? "bg-emerald-500 text-black" : ""
                  }`}
                  style={!copied ? { background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)' } : {}}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </motion.button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-4 w-full">
                <div className="grid grid-cols-2 gap-4 w-full">
                  {/* QR Code Button */}
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowQR(!showQR)}
                    className="flex flex-col items-center gap-3 p-5 rounded-3xl border transition-all group"
                    style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                      <QrCode size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Code QR</span>
                  </motion.button>

                  {/* Share native Button */}
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNativeShare}
                    className="flex flex-col items-center gap-3 p-5 rounded-3xl border transition-all group"
                    style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                      <Share size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Partager</span>
                  </motion.button>
                </div>

                {/* Media Kit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onExportPDF}
                  className="w-full p-6 rounded-3xl border border-emerald-500/30 flex items-center justify-between group transition-all"
                  style={{ background: 'var(--accent-soft)' }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-black shadow-lg shadow-emerald-500/20">
                      <FileText size={24} />
                    </div>
                    <div className="flex flex-col items-start text-left">
                      <span className="text-sm font-black uppercase tracking-tighter" style={{ color: 'var(--text-primary)' }}>Media Kit Pro</span>
                      <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Générer le PDF officiel</span>
                    </div>
                  </div>
                  {!isPremium && <Lock size={16} className="text-zinc-500" />}
                </motion.button>
              </div>

              {/* QR Code Expandable Area */}
              <AnimatePresence>
                {showQR && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden flex flex-col items-center"
                  >
                    <div className="p-4 bg-white rounded-3xl mt-4 border shadow-sm relative overflow-hidden">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicUrl)}&bgcolor=ffffff&color=000000&margin=1&ecc=H`}
                        alt="QR Code"
                        className="w-40 h-40"
                      />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-100 overflow-hidden">
                        <img 
                          src="https://vhbwfqqvsudznnfoqyjm.supabase.co/storage/v1/object/public/Logo/bioathlete_logo_transparent.png" 
                          alt="Logo" 
                          className="w-full h-full object-contain brightness-0 scale-[1.8]"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer text */}
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] mt-2" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
                BioAthlete • L'excellence partagée
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
