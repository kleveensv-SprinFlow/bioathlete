"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Plus, Check } from "lucide-react";
import { SPONSOR_CATEGORIES, BRAND_CATALOG } from "./constants";

interface SponsorPickerModalProps {
  showEquipModal: boolean;
  setShowEquipModal: (v: boolean) => void;
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  selectedPartner: string;
  setSelectedPartner: (v: string) => void;
  customSponsorName: string;
  setCustomSponsorName: (v: string) => void;
  handleAddSponsor: () => void;
  isPremium: boolean;
}

export default function SponsorPickerModal({
  showEquipModal, setShowEquipModal,
  selectedCategory, setSelectedCategory,
  selectedPartner, setSelectedPartner,
  customSponsorName, setCustomSponsorName,
  handleAddSponsor, isPremium
}: SponsorPickerModalProps) {
  return (
    <AnimatePresence>
      {showEquipModal && (
        <div className="fixed inset-0 z-[300] flex flex-col justify-end">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEquipModal(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Drawer Content */}
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
            className="relative w-full h-[85vh] rounded-t-[3rem] overflow-hidden border-t shadow-[0_-20px_50px_rgba(0,0,0,0.3)] flex flex-col"
            style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}
          >
            {/* Handle */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full opacity-20" style={{ background: 'var(--text-primary)' }} />

            {/* Close */}
            <button 
              onClick={() => setShowEquipModal(false)} 
              className="absolute top-6 right-6 w-11 h-11 rounded-full flex items-center justify-center transition-all z-[130]"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            >
              <X size={18} />
            </button>

            <div className="flex-1 overflow-y-auto p-6 md:p-12 pb-24 scrollbar-none">
              <div className="max-w-xl mx-auto flex flex-col gap-8">
                <div className="flex flex-col pt-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] mb-2" style={{ color: 'var(--accent)' }}>Collaborations</span>
                  <h3 className="text-4xl font-black tracking-tighter uppercase leading-none" style={{ color: 'var(--text-primary)' }}>Nouvelle Marque</h3>
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none border-b" style={{ borderColor: 'var(--border)' }}>
                  {SPONSOR_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => { setSelectedCategory(cat.id); setSelectedPartner(""); }}
                      className={`px-6 py-3 rounded-2xl whitespace-nowrap text-[10px] font-black uppercase tracking-widest transition-all ${
                        selectedCategory === cat.id 
                        ? "bg-emerald-500 text-black shadow-lg" 
                        : "bg-black/5 text-muted hover:bg-black/10"
                      }`}
                      style={selectedCategory !== cat.id ? { background: 'var(--bg-elevated)', color: 'var(--text-muted)' } : {}}
                    >
                      {cat.icon} {cat.name}
                    </button>
                  ))}
                </div>

                {/* Catalog */}
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest px-1" style={{ color: 'var(--text-muted)' }}>Marques suggérées</label>
                    <div className="grid grid-cols-1 gap-2">
                      {BRAND_CATALOG[selectedCategory]?.map(brand => (
                        <button
                          key={brand}
                          onClick={() => {
                            setCustomSponsorName(brand);
                            // Auto-trigger handleAddSponsor or wait for user to click Add?
                            // For catalog brands, we can just select it.
                          }}
                          className={`w-full p-5 rounded-2xl text-left transition-all flex items-center justify-between group border ${
                            customSponsorName === brand ? 'border-emerald-500/50 bg-emerald-500/5' : ''
                          }`}
                          style={{ background: 'var(--bg-elevated)', borderColor: customSponsorName === brand ? 'var(--accent)' : 'var(--border)' }}
                        >
                          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{brand}</span>
                          {customSponsorName === brand ? <Check size={16} className="text-emerald-500" /> : <Plus size={16} className="opacity-0 group-hover:opacity-100" style={{ color: 'var(--text-muted)' }} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Manual Entry */}
                  <div className="flex flex-col gap-4 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                    <label className="text-[10px] font-bold uppercase tracking-widest px-1" style={{ color: 'var(--text-muted)' }}>Nom de la marque</label>
                    <div className="flex flex-col gap-3">
                      <input 
                        type="text" 
                        placeholder="Ex: Nike, FFA, Sponsor Local..." 
                        value={customSponsorName}
                        onChange={(e) => setCustomSponsorName(e.target.value)}
                        className="w-full p-5 rounded-2xl font-bold outline-none border transition-all"
                        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                      />
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAddSponsor}
                        className="w-full py-5 bg-emerald-500 text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-3"
                      >
                        <Plus size={18} />
                        <span>Confirmer l'ajout</span>
                      </motion.button>
                    </div>
                  </div>
                </div>

                {!isPremium && (
                  <div className="p-6 rounded-3xl border border-dashed text-center" style={{ borderColor: 'var(--accent)', background: 'var(--accent-soft)' }}>
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>
                      💎 Passe Élite pour ajouter <br /> plus de 3 collaborations
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
