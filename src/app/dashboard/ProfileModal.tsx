"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit3, Share2, Trophy, LogOut, Trash2, User, Camera, X, ArrowLeft, Check
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { PerformanceRaw, SocialLink, Sponsor } from "@/types";
import { SPONSOR_CATEGORIES } from "./constants";

interface ProfileModalProps {
  showProfileModal: boolean;
  setShowProfileModal: (v: boolean) => void;
  profileView: 'menu' | 'identity' | 'performances' | 'links' | 'sponsors' | 'photos';
  setProfileView: (v: 'menu' | 'identity' | 'performances' | 'links' | 'sponsors' | 'photos') => void;
  avatarUrl: string;
  firstNameInput: string;
  setFirstNameInput: (v: string) => void;
  lastNameInput: string;
  setLastNameInput: (v: string) => void;
  username: string;
  usernameInput: string;
  setUsernameInput: (v: string) => void;
  phoneInput: string;
  setPhoneInput: (v: string) => void;
  bioInput: string;
  setBioInput: (v: string) => void;
  handleSaveProfile: (e: React.FormEvent) => void;
  performances: PerformanceRaw[];
  setShowAddPerfModal: (v: boolean) => void;
  handleRemovePerf: (e: React.MouseEvent, id: string) => void;
  links: SocialLink[];
  newLinkTitle: string;
  setNewLinkTitle: (v: string) => void;
  newLinkUrl: string;
  setNewLinkUrl: (v: string) => void;
  handleAddLink: (e: React.FormEvent) => void;
  handleRemoveLink: (e: React.MouseEvent, id: string | number) => void;
  photoGallery: { id: string; url: string; title: string; date?: string }[];
  setShowAddPhotoModal: (v: boolean) => void;
  handleRemoveGalleryPhoto: (id: string) => void;
  sponsors: Sponsor[];
  setShowEquipModal: (v: boolean) => void;
  handleRemoveSponsor: (e: React.MouseEvent, id: string | number, i: number) => void;
  deletingId: string | number | null;
}

export default function ProfileModal({
  showProfileModal, setShowProfileModal,
  profileView, setProfileView,
  avatarUrl, firstNameInput, setFirstNameInput, lastNameInput, setLastNameInput,
  username, usernameInput, setUsernameInput,
  phoneInput, setPhoneInput, bioInput, setBioInput,
  handleSaveProfile,
  performances, setShowAddPerfModal, handleRemovePerf,
  links, newLinkTitle, setNewLinkTitle, newLinkUrl, setNewLinkUrl, handleAddLink, handleRemoveLink,
  photoGallery, setShowAddPhotoModal, handleRemoveGalleryPhoto,
  sponsors, setShowEquipModal, handleRemoveSponsor, deletingId
}: ProfileModalProps) {
  const router = useRouter();

  return (
    <AnimatePresence>
      {showProfileModal && (
        <div className="fixed inset-0 z-[200] flex flex-col justify-end">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowProfileModal(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Drawer Content */}
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
            className="relative w-full h-[92vh] rounded-t-[3rem] overflow-hidden border-t shadow-[0_-20px_50px_rgba(0,0,0,0.3)] flex flex-col"
            style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}
          >
            {/* Visual Handle (Drawer aesthetic) */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full opacity-20" style={{ background: 'var(--text-primary)' }} />

            {/* Close / Back Button */}
            <button 
              onClick={() => {
                if (profileView !== 'menu') {
                  setProfileView('menu');
                } else {
                  setShowProfileModal(false);
                }
              }} 
              className="absolute top-6 right-6 w-11 h-11 rounded-full flex items-center justify-center transition-all z-[130]"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            >
              {profileView !== 'menu' ? <ArrowLeft size={18} /> : <X size={18} />}
            </button>

            <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-12 pb-24 scrollbar-none">
              <div className="max-w-xl mx-auto flex flex-col gap-8">
                
                {/* MENU VIEW */}
                {profileView === 'menu' && (
                  <div className="flex flex-col gap-8">
                    <div className="flex flex-col pt-4">
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] mb-2" style={{ color: 'var(--accent)' }}>Espace Athlète</span>
                      <h3 className="text-4xl font-black tracking-tighter uppercase" style={{ color: 'var(--text-primary)' }}>Mon Profil</h3>
                    </div>

                    {/* Quick Identity Card */}
                    <div 
                      className="rounded-[2rem] p-6 flex items-center justify-between shadow-sm border"
                      style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 flex items-center justify-center" style={{ borderColor: 'var(--border)', background: 'var(--bg-base)' }}>
                          {avatarUrl ? <img src={avatarUrl} alt="Profil" className="w-full h-full object-cover" /> : <User size={32} style={{ color: 'var(--text-muted)' }} />}
                        </div>
                        <div className="flex flex-col">
                          <h4 className="text-lg font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>{firstNameInput} {lastNameInput}</h4>
                          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>@{username}</p>
                        </div>
                      </div>
                      <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setProfileView('identity')}
                        className="w-11 h-11 rounded-xl flex items-center justify-center transition-all"
                        style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                      >
                        <Edit3 size={18} />
                      </motion.button>
                    </div>

                    {/* Navigation List */}
                    <div className="rounded-[2.5rem] overflow-hidden flex flex-col border" style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}>
                      {[
                        { key: 'performances', label: 'Mes Performances', icon: <Trophy size={18} /> },
                        { key: 'links', label: 'Mes Liens', icon: <Share2 size={18} /> },
                        { key: 'photos', label: 'Mes Photos', icon: <Camera size={18} /> },
                        { key: 'sponsors', label: 'Mes Collaborations', icon: <span>🤝</span> }
                      ].map((item, i, arr) => (
                        <button 
                          key={item.key} 
                          onClick={() => setProfileView(item.key as any)} 
                          className={`w-full p-6 flex items-center justify-between hover:bg-black/5 transition-all ${i !== arr.length - 1 ? 'border-b' : ''}`}
                          style={{ borderColor: 'var(--border)' }}
                        >
                          <div className="flex items-center gap-4">
                            <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>{item.icon}</span>
                            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{item.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Logout Button */}
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={async () => {
                        await supabase.auth.signOut();
                        router.push('/login');
                      }}
                      className="w-full py-5 text-[10px] font-black uppercase tracking-[0.2em] rounded-[2rem] border transition-all flex items-center justify-center gap-3"
                      style={{ background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
                    >
                      <LogOut size={16} />
                      <span>Se déconnecter</span>
                    </motion.button>
                  </div>
                )}

                {/* OTHER VIEWS (Identity, Performances, etc.) */}
                {profileView !== 'menu' && (
                  <div className="flex flex-col gap-8">
                    <div className="flex flex-col pt-4">
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] mb-2" style={{ color: 'var(--accent)' }}>Configuration</span>
                      <h3 className="text-4xl font-black tracking-tighter uppercase leading-none" style={{ color: 'var(--text-primary)' }}>
                        {profileView === 'identity' ? 'Identité' : 
                         profileView === 'performances' ? 'Performances' : 
                         profileView === 'links' ? 'Mes Liens' : 
                         profileView === 'photos' ? 'Ma Galerie' : 'Collaborations'}
                      </h3>
                    </div>

                    {/* Content will be injected here based on profileView */}
                    {profileView === 'identity' && (
                      <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(e); }} className="flex flex-col gap-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest px-1" style={{ color: 'var(--text-muted)' }}>Prénom</label>
                            <input type="text" value={firstNameInput} onChange={e => setFirstNameInput(e.target.value)} className="w-full rounded-2xl p-4 font-bold outline-none border transition-all" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest px-1" style={{ color: 'var(--text-muted)' }}>Nom</label>
                            <input type="text" value={lastNameInput} onChange={e => setLastNameInput(e.target.value)} className="w-full rounded-2xl p-4 font-bold outline-none border transition-all" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest px-1" style={{ color: 'var(--text-muted)' }}>Nom d&apos;utilisateur</label>
                          <div className="flex items-center rounded-2xl overflow-hidden border transition-all" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                            <span className="px-4 font-bold opacity-30" style={{ color: 'var(--text-primary)' }}>@</span>
                            <input type="text" value={usernameInput} onChange={e => setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} className="w-full bg-transparent p-4 outline-none font-bold" style={{ color: 'var(--text-primary)' }} />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest px-1" style={{ color: 'var(--text-muted)' }}>Biographie</label>
                          <textarea value={bioInput} onChange={e => setBioInput(e.target.value)} rows={3} className="w-full rounded-2xl p-4 font-bold outline-none border transition-all resize-none" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                        </div>
                        <motion.button whileTap={{ scale: 0.98 }} type="submit" className="w-full py-5 bg-emerald-500 text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:bg-emerald-400 transition-all">Enregistrer</motion.button>
                      </form>
                    )}

                    {profileView === 'performances' && (
                      <div className="flex flex-col gap-6">
                        <motion.button onClick={() => setShowAddPerfModal(true)} whileTap={{ scale: 0.98 }} className="w-full py-5 bg-black text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl flex items-center justify-center gap-3" style={{ background: 'var(--text-primary)', color: 'var(--bg-base)' }}>
                          <Trophy size={18} /><span>Ajouter un chrono</span>
                        </motion.button>
                        <div className="flex flex-col gap-3">
                          {performances.map((perf) => (
                            <div key={perf.id} className="rounded-2xl p-5 flex justify-between items-center border shadow-sm" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                              <div>
                                <p className="font-black text-sm uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>{perf.distance}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--text-muted)' }}>{perf.temps}s • {perf.competition}</p>
                              </div>
                              <button onClick={(e) => handleRemovePerf(e, perf.id!)} className="w-10 h-10 rounded-xl flex items-center justify-center transition-all" style={{ background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444' }}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {profileView === 'links' && (
                      <div className="flex flex-col gap-6">
                        <form onSubmit={handleAddLink} className="flex flex-col gap-4 p-6 rounded-[2rem] border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                          <input type="text" value={newLinkTitle} onChange={e => setNewLinkTitle(e.target.value)} placeholder="Titre (ex: Instagram)" required className="w-full bg-transparent border rounded-xl p-4 font-bold outline-none" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                          <input type="url" value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} placeholder="https://..." required className="w-full bg-transparent border rounded-xl p-4 font-bold outline-none" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                          <button type="submit" className="w-full py-4 bg-emerald-500 text-black font-black text-xs uppercase tracking-widest rounded-xl">Ajouter</button>
                        </form>
                        <div className="flex flex-col gap-3">
                          {links.map((link) => (
                            <div key={link.id} className="rounded-2xl p-4 flex justify-between items-center border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                              <div className="truncate pr-4">
                                <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{link.title}</p>
                                <p className="text-[10px] font-medium truncate" style={{ color: 'var(--text-muted)' }}>{link.url}</p>
                              </div>
                              <button onClick={(e) => handleRemoveLink(e, link.id)} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0" style={{ background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444' }}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {profileView === 'sponsors' && (
                      <div className="flex flex-col gap-6">
                        <button onClick={() => setShowEquipModal(true)} className="w-full py-5 text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3" style={{ background: 'var(--text-primary)', color: 'var(--bg-base)' }}>
                          🤝 <span>Nouvelle collaboration</span>
                        </button>
                        <div className="flex flex-col gap-3">
                          {sponsors.map((sp, i) => (
                            <div key={sp.id} className="rounded-2xl p-4 flex items-center justify-between border shadow-sm" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'var(--bg-base)' }}>
                                    {SPONSOR_CATEGORIES.find(c => c.name === sp.category)?.icon || "🤝"}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-black text-sm uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>{sp.name}</span>
                                  <span className="text-[9px] font-black uppercase tracking-widest mt-0.5 text-emerald-500">{sp.category}</span>
                                </div>
                              </div>
                              <button onClick={(e) => handleRemoveSponsor(e, sp.id, i)} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0" style={{ background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444' }}>
                                {deletingId === sp.id ? <Check size={16} /> : <Trash2 size={16} />}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {profileView === 'photos' && (
                      <div className="flex flex-col gap-6">
                        <button onClick={() => setShowAddPhotoModal(true)} className="w-full py-5 text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3" style={{ background: 'var(--text-primary)', color: 'var(--bg-base)' }}>
                          <Camera size={18} /><span>Ajouter une photo</span>
                        </button>
                        <div className="grid grid-cols-2 gap-4">
                          {photoGallery.map((photo) => (
                            <div key={photo.id} className="relative group rounded-2xl overflow-hidden aspect-square border" style={{ borderColor: 'var(--border)' }}>
                              <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                              <button onClick={() => handleRemoveGalleryPhoto(photo.id)} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

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
