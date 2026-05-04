"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import jsPDF from "jspdf";

interface Performance {
  id?: string;
  date: string;
  distance: string;
  temps: string;
  competition: string;
  user_id?: string;
}

interface SocialLink {
  id: string | number;
  title: string;
  url: string;
  icon: string;
  user_id?: string;
}

interface Sponsor {
  id: string | number;
  name: string;
  logo: string;
  category?: string; // "Équipementier" or "Partenaire"
  user_id?: string;
}

interface Video {
  id: string | number;
  url: string;
  title: string;
  user_id?: string;
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const PREDEFINED_EQUIPEMENTIERS = [
  { name: "Nike", logo: "👟 Nike" },
  { name: "Adidas", logo: "👟 Adidas" },
  { name: "Puma", logo: "👟 Puma" },
  { name: "Asics", logo: "👟 Asics" },
  { name: "New Balance", logo: "👟 NB" },
  { name: "Kiprun", logo: "👟 Kiprun" },
  { name: "Decathlon", logo: "👟 Decathlon" },
  { name: "Mizuno", logo: "👟 Mizuno" },
  { name: "Hoka", logo: "👟 Hoka" },
  { name: "Saucony", logo: "👟 Saucony" },
];

const PREDEFINED_PARTENAIRES = [
  { name: "Red Bull", logo: "🥤 Red Bull" },
  { name: "Oakley", logo: "🕶️ Oakley" },
  { name: "Yazio", logo: "🥗 Yazio" },
];

const ATHLETIC_DISCIPLINES: { [key: string]: string[] } = {
  "Sprint & Haies": [
    "60m", "100m", "200m", "400m",
    "60m Haies", "100m Haies", "110m Haies", "400m Haies"
  ],
  "Demi-fond & Fond": [
    "800m", "1500m", "3000m", "5000m", "10000m", "3000m Steeple"
  ],
  "Sauts": [
    "Saut en hauteur", "Saut à la perche", "Saut en longueur", "Triple saut"
  ],
  "Lancers": [
    "Lancer du poids", "Lancer du disque", "Lancer du marteau", "Lancer du javelot"
  ],
  "Épreuves Combinées / Marche": [
    "Pentathlon", "Heptathlon", "Décathlon",
    "10km Marche", "20km Marche"
  ]
};

function LivePreviewModal({
  setShowFullPreview,
  avatarUrl,
  firstNameInput,
  lastNameInput,
  bioInput,
  temps60m,
  temps100m,
  performances,
  sponsors,
  links
}: any) {
  const previewRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: previewRef });
  const headerY = useTransform(scrollYProgress, [0, 1], [0, 150]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[100] flex flex-col items-center overflow-y-auto"
      onClick={() => setShowFullPreview(false)}
      ref={previewRef}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 40 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="relative max-w-md w-full px-5 py-8 flex flex-col items-center gap-6 min-h-screen"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={() => setShowFullPreview(false)} className="absolute top-4 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all z-10">✕</button>
        
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex flex-col items-center gap-6 w-full pt-8 pb-8">
          {/* Main Logo for the Preview */}
          <div className="flex justify-center select-none">
            <img 
              src="https://vhbwfqqvsudznnfoqyjm.supabase.co/storage/v1/object/public/Logo/bioathlete_logo_transparent.png" 
              alt="BioAthlete Logo" 
              className="h-9 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          {/* Header with Parallax */}
          <motion.div variants={staggerItem} style={{ y: headerY }} className="flex flex-col items-center gap-3 text-center w-full z-0">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#00FF88] to-emerald-400 p-1 shadow-[0_0_25px_rgba(0,255,136,0.4)] overflow-hidden">
              {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover rounded-full" /> : <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-3xl font-black text-[#00FF88]">{(firstNameInput || "A").charAt(0)}</div>}
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white uppercase drop-shadow-[0_0_15px_rgba(0,255,136,0.3)]">{(firstNameInput || "Prénom").toUpperCase()} {(lastNameInput || "Nom").toUpperCase()}</h1>
            <p className="text-[#00FF88] text-xs font-extrabold uppercase tracking-widest drop-shadow-[0_0_8px_rgba(0,255,136,0.5)]">Athlète</p>
            <p className="text-gray-300 text-sm max-w-sm leading-relaxed">{bioInput || "Aucune biographie rédigée."}</p>
          </motion.div>
          
          {/* Performance section in preview */}
          {(performances.length > 0 || temps60m || temps100m) && (
            <motion.div variants={staggerItem} className="grid grid-cols-2 gap-3 w-full relative z-10">
              {temps60m && (
                <div className="backdrop-blur-xl bg-white/5 border border-[#00FF88]/20 rounded-2xl p-4 flex flex-col gap-1 shadow-[0_0_15px_rgba(0,255,136,0.1)] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00FF88]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider relative z-10">60m</span>
                  <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00FF88] drop-shadow-[0_0_10px_rgba(0,255,136,0.4)] relative z-10">{temps60m}</span>
                </div>
              )}
              {temps100m && (
                <div className="backdrop-blur-xl bg-white/5 border border-[#00FF88]/20 rounded-2xl p-4 flex flex-col gap-1 shadow-[0_0_15px_rgba(0,255,136,0.1)] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00FF88]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider relative z-10">100m</span>
                  <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00FF88] drop-shadow-[0_0_10px_rgba(0,255,136,0.4)] relative z-10">{temps100m}</span>
                </div>
              )}
              {performances.slice(0, 4).map((perf: any, i: number) => (
                <div key={i} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-1 shadow-[0_0_10px_rgba(0,255,136,0.05)]">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{perf.distance}</span>
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-300 drop-shadow-[0_0_5px_rgba(0,255,136,0.2)]">{perf.temps}</span>
                  <span className="text-[9px] text-gray-500 truncate">{perf.competition}</span>
                </div>
              ))}
            </motion.div>
          )}
          
          {sponsors.length > 0 && (
            <motion.div variants={staggerItem} className="flex flex-wrap items-center justify-center gap-2 w-full mt-2 relative z-10">
              {sponsors.map((sp: any, i: number) => (
                <motion.div whileHover={{ scale: 1.05 }} key={i} className="backdrop-blur-xl bg-white/5 border border-white/10 hover:border-[#00FF88]/40 rounded-xl px-3 py-2 text-xs font-bold flex items-center justify-center transition-colors shadow-lg hover:shadow-[0_0_15px_rgba(0,255,136,0.3)] cursor-pointer">
                  <span className="text-lg mr-2">{sp.logo}</span>{sp.name}
                </motion.div>
              ))}
            </motion.div>
          )}
          
          {links.length > 0 && (
            <motion.div variants={staggerItem} className="flex flex-col gap-2 w-full mt-2 relative z-10">
              {links.map((link: any, i: number) => (
                <motion.div whileHover={{ scale: 1.03 }} key={i} className="w-full flex items-center gap-3 p-4 backdrop-blur-xl bg-white/5 border border-white/10 hover:border-[#00FF88]/50 rounded-2xl transition-all shadow-xl hover:shadow-[0_0_20px_rgba(0,255,136,0.2)] cursor-pointer group">
                  <span className="text-xl p-2 bg-neutral-900 group-hover:bg-[#00FF88]/20 transition-colors rounded-xl flex items-center justify-center">{link.icon}</span>
                  <span className="font-bold text-sm text-white group-hover:text-[#00FF88] transition-colors">{link.title}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
          
          <motion.p variants={staggerItem} className="text-[9px] text-gray-600 font-medium uppercase tracking-widest mt-6">
            Optimisé par <span className="text-[#00FF88]/80 font-bold">BioAthlete.space</span>
          </motion.p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [fullNameInput, setFullNameInput] = useState("");
  const [firstNameInput, setFirstNameInput] = useState("");
  const [lastNameInput, setLastNameInput] = useState("");
  const [profSuccess, setProfSuccess] = useState("");
  const [profError, setProfError] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAddPerfModal, setShowAddPerfModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);

  // Profile enhancements
  const [bioInput, setBioInput] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [photoGallery, setPhotoGallery] = useState<{ id: string; url: string; title: string }[]>([]);
  const [newGalleryPhotoFile, setNewGalleryPhotoFile] = useState<File | null>(null);
  const [newGalleryPhotoTitle, setNewGalleryPhotoTitle] = useState("");

  const [performances, setPerformances] = useState<Performance[]>([]);
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [views, setViews] = useState(0);

  // Form states
  const [activeTab, setActiveTab] = useState("apercu");
  const [newDate, setNewDate] = useState("");
  const [newDistance, setNewDistance] = useState(""); // Remplacé par "Discipline"
  const [newTemps, setNewTemps] = useState("");
  const [newComp, setNewComp] = useState("");
  const [newWind, setNewWind] = useState("");
  const [selectedDisciplineCategory, setSelectedDisciplineCategory] = useState("Sprint & Haies");
  const [customDiscipline, setCustomDiscipline] = useState("");

  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  const [selectedEquip, setSelectedEquip] = useState("Aucun");
  const [customEquipName, setCustomEquipName] = useState("");
  const [selectedPartner, setSelectedPartner] = useState("Red Bull");
  const [customSponsorName, setCustomSponsorName] = useState("");

  const [newVideoFile, setNewVideoFile] = useState<File | null>(null);
  const [newVideoTitle, setNewVideoTitle] = useState("");

  const [shareText, setShareText] = useState("");
  const [linkError, setLinkError] = useState("");
  const [temps60m, setTemps60m] = useState("");
  const [temps100m, setTemps100m] = useState("");

  // Load user data and content
  useEffect(() => {
    async function loadUserAndContent() {
      try {
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !user) {
          router.push("/login");
          return;
        }

        const uid = user.id;
        setUserId(uid);

        let profData = null;
        try {
          const { data: existingProf, error: profErr } = await supabase
            .from("profiles")
            .select("username, is_premium, bio, avatar_url, photos, full_name, views_count")
            .eq("user_id", uid)
            .maybeSingle();

          if (!profErr && existingProf) {
            profData = existingProf;
          } else if (!existingProf) {
            // It doesn't exist, let's create a default one
            const generatedUsername = "athlete-" + uid.slice(0, 5);
            const { data: newProf, error: createErr } = await supabase
              .from("profiles")
              .upsert([{
                user_id: uid,
                username: generatedUsername,
                full_name: "Nouvel Athlète",
                is_premium: false
              }], { onConflict: "user_id" })
              .select()
              .maybeSingle();

            if (!createErr && newProf) {
              profData = newProf;
            }
          }
        } catch (e) {
          console.error(e);
        }

        if (profData) {
          setUsername(profData.username || "");
          setUsernameInput(profData.username || "");
          setFullNameInput(profData.full_name || "");
          const [first, ...rest] = (profData.full_name || "").split(" ");
          setFirstNameInput(first || "");
          setLastNameInput(rest.join(" ") || "");
          setIsPremium(profData.is_premium || false);
          setBioInput(profData.bio || "");
          setAvatarUrl(profData.avatar_url || "");
          setViews(profData.views_count || 0);

          if (profData.photos && Array.isArray(profData.photos)) {
            setPhotoGallery(profData.photos);
          }
        }

        // Fetch filtered data
        const { data: perfData, error: perfErr } = await supabase
          .from("performances")
          .select("*")
          .eq("user_id", uid);
        if (!perfErr && perfData) setPerformances(perfData);

        const { data: linkData, error: linkErr } = await supabase
          .from("links")
          .select("*")
          .eq("user_id", uid);
        if (!linkErr && linkData) setLinks(linkData);

        const { data: spData, error: spErr } = await supabase
          .from("sponsors")
          .select("*")
          .eq("user_id", uid);
        if (!spErr && spData) setSponsors(spData);

        const { data: vidData, error: vidErr } = await supabase
          .from("videos")
          .select("*")
          .eq("user_id", uid);
        if (!vidErr && vidData) setVideos(vidData);

      } catch (err) {
        console.error("Erreur chargement Supabase:", err);
      }
    }
    loadUserAndContent();
  }, [router]);

  const uploadFileToSupabase = async (file: File, folder: string) => {
    if (!userId) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${userId}/${folder}/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('media').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);

    const publicUrl = await uploadFileToSupabase(file, 'avatars');
    if (publicUrl) {
      setAvatarUrl(publicUrl);
      try {
        await supabase.from("profiles").upsert([{ user_id: userId, avatar_url: publicUrl }], { onConflict: "user_id" });
      } catch (err) {
        console.error("Error saving avatar URL:", err);
      }
    }
    setIsUploading(false);
  };

  const handleSaveProfileInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setProfSuccess("");
    setProfError("");

    const newFullName = `${firstNameInput.trim()} ${lastNameInput.trim()}`.trim() || fullNameInput;
    const finalUsername = `${firstNameInput.trim()}-${lastNameInput.trim()}`
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "") || "athlete";

    try {
      // 1. Client-side check before upserting to ensure no other user owns this username
      if (finalUsername !== username) {
        const { data: existingUser } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("username", finalUsername)
          .maybeSingle();

        if (existingUser && existingUser.user_id !== userId) {
          setProfError("Ce lien d'URL est déjà pris, veuillez en choisir un autre (ex: ajoutez un chiffre).");
          setTimeout(() => setProfError(""), 5000);
          return;
        }
      }

      const { data, error } = await supabase
        .from("profiles")
        .upsert([{
          user_id: userId,
          username: finalUsername,
          full_name: newFullName,
          bio: bioInput,
          avatar_url: avatarUrl
        }], { onConflict: "user_id" })
        .select();

      if (error) {
        if (error.code === "23505" || error.message?.includes("unique")) {
          setProfError("Ce lien d'URL est déjà pris, veuillez en choisir un autre (ex: ajoutez un chiffre).");
          setTimeout(() => setProfError(""), 5000);
          return;
        }
        throw error;
      }

      if (data && data.length > 0) {
        setUsername(data[0].username);
        setUsernameInput(data[0].username);
        setFullNameInput(data[0].full_name || "");
        const [first, ...rest] = (data[0].full_name || "").split(" ");
        setFirstNameInput(first || "");
        setLastNameInput(rest.join(" ") || "");
        setProfSuccess("Informations de profil enregistrées avec succès !");
        setTimeout(() => {
          setProfSuccess("");
          setShowProfileModal(false);
        }, 1500);
      } else {
        setUsername(finalUsername);
        setUsernameInput(finalUsername);
        setFullNameInput(newFullName);
        setProfSuccess("Informations de profil enregistrées avec succès !");
        setTimeout(() => {
          setProfSuccess("");
          setShowProfileModal(false);
        }, 1500);
      }
    } catch (err: any) {
      console.error(err);
      setProfError("Erreur lors de la sauvegarde : " + (err.message || "Impossible de mettre à jour votre profil."));
      setTimeout(() => setProfError(""), 5000);
    }
  };

  const handleAddGalleryPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !newGalleryPhotoFile) return;

    setIsUploading(true);
    const publicUrl = await uploadFileToSupabase(newGalleryPhotoFile, 'gallery');

    if (publicUrl) {
      const newPhoto = {
        id: Date.now().toString(),
        url: publicUrl,
        title: newGalleryPhotoTitle || ""
      };

      const updatedPhotos = [...photoGallery, newPhoto];

      try {
        await supabase
          .from("profiles")
          .upsert([{
            user_id: userId,
            username: username || "athlete",
            photos: updatedPhotos
          }]);

        setPhotoGallery(updatedPhotos);
        setNewGalleryPhotoFile(null);
        setNewGalleryPhotoTitle("");
      } catch (err) {
        console.error(err);
      }
    }
    setIsUploading(false);
  };

  const handleRemoveGalleryPhoto = async (photoId: string) => {
    if (!userId) return;

    const updatedPhotos = photoGallery.filter(p => p.id !== photoId);

    try {
      await supabase
        .from("profiles")
        .upsert([{
          user_id: userId,
          username: username || "athlete",
          photos: updatedPhotos
        }]);

      setPhotoGallery(updatedPhotos);
    } catch (err) {
      console.error(err);
    }
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleUpgradePremium = async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .upsert([{ user_id: userId, username: username || "athlete", is_premium: true }])
        .select();

      if (!error && data && data.length > 0) {
        setIsPremium(true);
        setProfSuccess("Mode Élite débloqué avec succès ! 🔥");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpgradePremiumReal = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId, email: "kleveensv@gmail.com" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        await handleUpgradePremium();
      }
    } catch (error) {
      console.error("Erreur Stripe:", error);
      await handleUpgradePremium();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPerformance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newTemps || !userId) return;

    const finalDistance = newDistance === "Autre" ? customDiscipline : newDistance;
    if (!finalDistance) return;

    const finalComp = newWind ? `${newComp || "Meeting"} (Vent: ${newWind} m/s)` : (newComp || "Meeting");

    const newItem: Performance = {
      date: newDate,
      distance: finalDistance,
      temps: newTemps,
      competition: finalComp,
      user_id: userId,
    };

    try {
      const { data, error } = await supabase.from("performances").insert([newItem]).select();
      if (!error && data && data.length > 0) {
        setPerformances([...performances, data[0]]);
      } else {
        setPerformances([...performances, { ...newItem, id: Date.now().toString() }]);
      }
    } catch (err) {
      setPerformances([...performances, { ...newItem, id: Date.now().toString() }]);
    }

    setNewDate("");
    setNewTemps("");
    setNewComp("");
    setNewWind("");
    setCustomDiscipline("");
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkTitle || !newLinkUrl || !userId) return;
    setLinkError("");

    // Freemium restriction check: 3 links limit
    if (!isPremium && links.length >= 3) {
      setLinkError("Passe en mode Élite pour ajouter plus de liens !");
      return;
    }

    // Détection automatique de l'icône/logo
    let detectedIcon = "🔗";
    const urlLower = newLinkUrl.toLowerCase();
    if (urlLower.includes("instagram.com")) detectedIcon = "📸";
    else if (urlLower.includes("tiktok.com")) detectedIcon = "🎵";
    else if (urlLower.includes("youtube.com") || urlLower.includes("youtu.be")) detectedIcon = "▶️";
    else if (urlLower.includes("facebook.com")) detectedIcon = "📘";
    else if (urlLower.includes("x.com") || urlLower.includes("twitter.com")) detectedIcon = "𝕏";
    else if (urlLower.includes("athle.fr") || urlLower.includes("ffa")) detectedIcon = "🏃";
    else if (urlLower.includes("worldathletics.org")) detectedIcon = "🌍";

    const newItem: Omit<SocialLink, "id"> = {
      title: newLinkTitle,
      url: newLinkUrl,
      icon: detectedIcon,
      user_id: userId,
    };

    try {
      const { data, error } = await supabase.from("links").insert([newItem]).select();
      if (!error && data && data.length > 0) {
        setLinks([...links, data[0]]);
      } else {
        setLinks([...links, { ...newItem, id: Date.now().toString() }]);
      }
    } catch (err) {
      setLinks([...links, { ...newItem, id: Date.now().toString() }]);
    }

    setNewLinkTitle("");
    setNewLinkUrl("");
  };

  // Step 1: Handling Category and exclusivity for Equipment Manufacturer (Équipementier)
  const handleAddEquipementier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      // Exclusivity: Remove all previous "Équipementier" category sponsors for the user
      await supabase
        .from("sponsors")
        .delete()
        .eq("user_id", userId)
        .eq("category", "Équipementier");

      if (selectedEquip !== "Aucun") {
        const sponsorName = selectedEquip === "Autre" ? customEquipName : selectedEquip;
        const matched = PREDEFINED_EQUIPEMENTIERS.find((eq) => eq.name === sponsorName);
        const newItem: Omit<Sponsor, "id"> = {
          name: sponsorName,
          logo: matched ? matched.logo : "🏢 " + sponsorName,
          category: "Équipementier",
          user_id: userId,
        };
        await supabase.from("sponsors").insert([newItem]);
      }

      // Refresh list
      const { data: spData } = await supabase
        .from("sponsors")
        .select("*")
        .eq("user_id", userId);
      if (spData) setSponsors(spData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    let newItem: Omit<Sponsor, "id">;
    if (customSponsorName.trim() !== "") {
      newItem = {
        name: customSponsorName,
        logo: "🏢 " + customSponsorName,
        category: "Partenaire",
        user_id: userId,
      };
    } else {
      const matched = PREDEFINED_PARTENAIRES.find((p) => p.name === selectedPartner);
      newItem = {
        name: selectedPartner,
        logo: matched ? matched.logo : "🏢 " + selectedPartner,
        category: "Partenaire",
        user_id: userId,
      };
    }

    try {
      const { data, error } = await supabase.from("sponsors").insert([newItem]).select();
      if (!error && data && data.length > 0) {
        setSponsors([...sponsors, data[0]]);
      } else {
        setSponsors([...sponsors, { ...newItem, id: Date.now().toString() }]);
      }
    } catch (err) {
      setSponsors([...sponsors, { ...newItem, id: Date.now().toString() }]);
    }

    setCustomSponsorName("");
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !newVideoFile) return;

    // Limitation 1 vidéo pour les comptes gratuits, 3 max sinon
    const maxVideos = isPremium ? 3 : 1;
    if (videos.length >= maxVideos) {
      alert(`Limite atteinte : Vous pouvez ajouter un maximum de ${maxVideos} vidéo(s).`);
      return;
    }

    setIsUploading(true);
    const publicUrl = await uploadFileToSupabase(newVideoFile, 'videos');

    if (publicUrl) {
      const newItem: Omit<Video, "id"> = {
        url: publicUrl,
        title: newVideoTitle || "Vidéo d'athlétisme",
        user_id: userId,
      };

      try {
        const { data, error } = await supabase.from("videos").insert([newItem]).select();
        if (!error && data && data.length > 0) {
          setVideos([...videos, data[0]]);
        } else {
          setVideos([...videos, { ...newItem, id: Date.now().toString() }]);
        }
      } catch (err) {
        setVideos([...videos, { ...newItem, id: Date.now().toString() }]);
      }

      setNewVideoFile(null);
      setNewVideoTitle("");
    }
    setIsUploading(false);
  };

  const handleShareProfile = () => {
    if (!username) return;
    const profileUrl = `${window.location.origin}/u/${username}`;
    navigator.clipboard.writeText(profileUrl);
    setShareText("Lien copié dans le presse-papier !");
    setTimeout(() => setShareText(""), 3000);
  };

  const handleRemovePerformance = async (id: string | undefined, i: number) => {
    if (id) {
      try {
        await supabase.from("performances").delete().eq("id", id);
      } catch (err) {
        console.error(err);
      }
    }
    setPerformances(performances.filter((_, idx) => idx !== i));
  };

  const handleRemoveLink = async (id: string | number, i: number) => {
    if (id && typeof id === "string") {
      try {
        await supabase.from("links").delete().eq("id", id);
      } catch (err) {
        console.error(err);
      }
    }
    setLinks(links.filter((_, idx) => idx !== i));
  };

  const handleRemoveSponsor = async (id: string | number, i: number) => {
    if (id && typeof id === "string") {
      try {
        await supabase.from("sponsors").delete().eq("id", id);
      } catch (err) {
        console.error(err);
      }
    }
    setSponsors(sponsors.filter((_, idx) => idx !== i));
  };

  const handleRemoveVideo = async (id: string | number, i: number) => {
    if (id && typeof id === "string") {
      try {
        await supabase.from("videos").delete().eq("id", id);
      } catch (err) {
        console.error(err);
      }
    }
    setVideos(videos.filter((_, idx) => idx !== i));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer définitivement votre compte et toutes vos données ? Cette action est irréversible.")) return;
    if (!userId) return;

    try {
      await supabase.from("profiles").delete().eq("user_id", userId);
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la suppression du compte.");
    }
  };

  const handleGenerateMediaKit = () => {
    const doc = new jsPDF();
    doc.setFillColor(15, 15, 15);
    doc.rect(0, 0, 210, 297, "F");

    doc.setTextColor(16, 185, 129);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text("MEDIA KIT ATHLÈTE", 20, 35);

    doc.setFontSize(12);
    doc.setTextColor(160, 160, 160);
    doc.text("Optimisé par BioAthlete.space", 20, 45);

    doc.setDrawColor(40, 40, 40);
    doc.setLineWidth(1);
    doc.line(20, 52, 190, 52);

    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text("PROFIL ET PERFORMANCES", 20, 65);

    doc.setFontSize(11);
    doc.setTextColor(200, 200, 200);
    doc.text(`Nom de l'athlète : ${username || "Sprinteur N1"}`, 20, 75);
    doc.text("Activités sportives : 100m, 60m", 20, 82);

    doc.save("Media_Kit_BioAthlete.pdf");
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-emerald-500 selection:text-black pb-16">
      {/* Radial neon effects */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-md mx-auto px-5 pt-8 flex flex-col gap-8 min-h-screen">
        {/* Top bar with logo, share icon and profile */}
        <div className="flex items-center justify-between select-none">
          <button
            onClick={() => setShowShareModal(true)}
            className="w-11 h-11 bg-white/5 border border-white/10 text-white rounded-2xl flex items-center justify-center hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-300 shadow-xl select-none"
            title="Partager mon profil"
          >
            <span className="text-base">🔗</span>
          </button>
          <div className="flex-1 px-4 text-center">
            <h1 className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-300">
              Bienvenue {(firstNameInput || "Athlète").toUpperCase()}
            </h1>
            <p className="text-gray-500 text-[10px] font-medium tracking-wide">Tableau de bord</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowProfileModal(true)}
              className="w-12 h-12 rounded-full border-2 border-emerald-500 overflow-hidden bg-neutral-900 flex items-center justify-center hover:scale-105 hover:shadow-[0_0_12px_rgba(16,185,129,0.4)] transition-all duration-300 select-none cursor-pointer"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Photo de profil" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl text-emerald-400 font-bold select-none">
                  {(firstNameInput || "A").charAt(0).toUpperCase()}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Freemium Banner & Option Élite */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col gap-4 select-none"
        >
          <div className="flex items-center justify-between select-none">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Statut de votre compte
              </h3>
              <p className="text-gray-300 text-sm font-black uppercase tracking-wide mt-1">
                {isPremium ? "🏆 Mode Élite Actif" : "🆓 Compte Standard (Gratuit)"}
              </p>
            </div>
            {!isPremium && (
              <button
                onClick={() => setShowStripeModal(true)}
                className="px-4 py-2 bg-emerald-500 text-black font-extrabold text-xs tracking-wider uppercase rounded-xl hover:bg-emerald-400 shadow-lg transition-all"
              >
                Devenir Élite
              </button>
            )}
          </div>
          {!isPremium && (
            <p className="text-[10px] text-emerald-400 font-medium">
              Version Gratuite : Limite de 3 liens active
            </p>
          )}
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-1 pb-2 scrollbar-none w-full border-b border-white/10">
          {[
            { key: "apercu", label: "Aperçu" },
            { key: "performances", label: "Performances" },
            { key: "liens", label: "Mes Liens" },
            { key: "sponsors", label: "Mes Sponsors" }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all duration-300 rounded-t-xl ${activeTab === tab.key ? "text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/5" : "text-gray-500 hover:text-gray-300"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content: Aperçu */}
        {activeTab === "apercu" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6 w-full">
            
            {/* Blurred Live Preview Card */}
            <div className="relative rounded-3xl overflow-hidden select-none cursor-pointer group" onClick={() => setShowFullPreview(true)}>
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col items-center text-center relative overflow-hidden filter blur-[3px] group-hover:blur-[2px] transition-all duration-500">
                <div className="absolute top-4 right-4 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl z-10">
                  <span className="text-[9px] font-black tracking-wider uppercase text-emerald-400">Aperçu Visiteur</span>
                </div>
                {avatarUrl ? (
                  <div className="w-20 h-20 rounded-full border-2 border-emerald-500 p-0.5 overflow-hidden bg-neutral-900 mt-2 flex-shrink-0 shadow-[0_0_16px_rgba(16,185,129,0.2)]">
                    <img src={avatarUrl} alt="Photo" className="w-full h-full object-cover rounded-full" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full border border-white/10 bg-neutral-900 mt-2 flex items-center justify-center text-2xl flex-shrink-0">👤</div>
                )}
                <h2 className="text-lg font-black tracking-tight text-white uppercase mt-3">
                  {(firstNameInput || "Prénom").toUpperCase()} {(lastNameInput || "Nom").toUpperCase()}
                </h2>
                <p className="text-gray-400 text-[10px] mt-1 max-w-xs leading-relaxed line-clamp-2">{bioInput || "Aucune biographie."}</p>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                  <span className="text-[9px] text-gray-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded-lg">{performances.length} Perf{performances.length > 1 ? "s" : ""}</span>
                  <span className="text-[9px] text-gray-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded-lg">{sponsors.length} Sponsor{sponsors.length > 1 ? "s" : ""}</span>
                  <span className="text-[9px] text-gray-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded-lg">{links.length} Lien{links.length > 1 ? "s" : ""}</span>
                </div>
              </div>
              
              {/* Overlay CTA */}
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-emerald-500 text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-2xl shadow-emerald-500/30 pointer-events-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFullPreview(true);
                  }}
                >
                  👁️ Afficher l&apos;aperçu
                </motion.button>
              </div>
            </div>

            {/* Fullscreen Preview with AnimatePresence */}
            <AnimatePresence>
              {showFullPreview && (
                <LivePreviewModal
                  setShowFullPreview={setShowFullPreview}
                  avatarUrl={avatarUrl}
                  firstNameInput={firstNameInput}
                  lastNameInput={lastNameInput}
                  bioInput={bioInput}
                  temps60m={temps60m}
                  temps100m={temps100m}
                  performances={performances}
                  sponsors={sponsors}
                  links={links}
                />
              )}
            </AnimatePresence>

          </motion.div>
        )}

        {/* Tab Content: Performances */}
        {activeTab === "performances" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6 w-full">

            {/* Visit stats */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-5 shadow-xl flex items-center justify-between hover:border-emerald-500/20 transition-all duration-300 select-none">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Statistiques de visites</h3>
                <p className="text-2xl font-black text-white mt-1 tracking-tight">{views || 0} <span className="text-xs text-gray-400 font-semibold">vues</span></p>
              </div>
              <div className="text-3xl text-emerald-400/30">👁️</div>
            </div>

            {/* Performances Section */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col gap-4 select-none">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400">Mes Performances</h3>
                <p className="text-[10px] text-gray-500 mt-1">Gérez vos chronos et records sportifs.</p>
              </div>
              <div className="flex flex-col gap-2">
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => setShowAddPerfModal(true)} className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 font-extrabold text-xs tracking-wider uppercase text-black rounded-2xl shadow-xl hover:shadow-[0_4px_24px_rgba(16,185,129,0.3)] transition-all duration-300 flex items-center justify-center gap-2">
                  <span>➕</span><span>Ajouter une performance</span>
                </motion.button>
              </div>
              <div className="flex flex-col gap-4">
                {performances.length === 0 ? (
                  <p className="text-xs text-gray-500 italic p-2">Aucune performance ajoutée.</p>
                ) : (
                  Object.keys(performances.reduce((acc, perf) => { if (!acc[perf.distance]) acc[perf.distance] = []; acc[perf.distance].push(perf); return acc; }, {} as { [key: string]: Performance[] })).map((distance) => (
                    <div key={distance} className="flex flex-col gap-2">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400 bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl self-start">{distance}</h4>
                      <div className="flex flex-col gap-2">
                        {performances.filter((p) => p.distance === distance).map((perf, i) => (
                          <div key={perf.id || i} className="w-full flex items-center justify-between p-4 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors duration-300">
                            <div><span className="font-extrabold text-sm text-emerald-400 mr-2">{perf.distance}</span><span className="font-semibold text-sm text-white mr-1">{perf.temps}</span><span className="text-[10px] text-gray-500 block">{perf.competition} • {perf.date}</span></div>
                            <button onClick={() => handleRemovePerformance(perf.id, i)} className="text-gray-600 hover:text-red-400 text-xs font-semibold px-2 transition-colors duration-300">Supprimer</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Button Média Kit PDF */}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleGenerateMediaKit} className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 font-extrabold text-sm text-center text-white rounded-2xl shadow-xl transition-all duration-300 tracking-wide uppercase select-none mt-1">
              📄 Générer mon Média Kit (PDF)
            </motion.button>
          </motion.div>
        )}

        {/* Tab Content: Mes Liens */}
        {activeTab === "liens" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8 w-full">
            {/* Réseaux & Liens */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl select-none">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400">🔗 Réseaux & Liens</h2>
                {!isPremium && <span className="text-[9px] text-gray-500 bg-white/5 border border-white/5 px-2 py-1 rounded-lg">{links.length}/3 gratuit</span>}
              </div>
              <form onSubmit={handleAddLink} className="flex flex-col gap-3">
                <input type="text" placeholder="Nom (ex: Instagram)" value={newLinkTitle} onChange={(e) => setNewLinkTitle(e.target.value)} className="w-full p-3 bg-neutral-900 border border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none text-xs text-white" required />
                <input type="url" placeholder="https://..." value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} className="w-full p-3 bg-neutral-900 border border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none text-xs text-white" required />
                {linkError && <p className="text-red-400 text-xs font-semibold">{linkError}</p>}
                <button type="submit" disabled={!isPremium && links.length >= 3} className={`w-full py-3.5 font-extrabold text-xs tracking-wider uppercase rounded-xl transition-all duration-300 ${!isPremium && links.length >= 3 ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5" : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-xl"}`}>
                  {!isPremium && links.length >= 3 ? "🔒 Limite atteinte — Passer Élite" : "Ajouter Lien"}
                </button>
              </form>
              <div className="flex flex-col gap-2 mt-4">
                {links.length === 0 && <p className="text-xs text-gray-500 italic p-2">Aucun lien ajouté.</p>}
                {links.map((link, i) => (
                  <div key={link.id} className="w-full flex items-center justify-between p-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl">
                    <div className="flex items-center gap-3 truncate pr-2">
                      <span className="text-xl p-2 bg-neutral-900 rounded-xl">{link.icon}</span>
                      <div className="truncate"><span className="font-semibold text-sm text-white block truncate">{link.title}</span><span className="text-[10px] text-gray-500 block truncate">{link.url}</span></div>
                    </div>
                    <button onClick={() => handleRemoveLink(link.id, i)} className="text-gray-600 hover:text-red-400 text-xs font-semibold px-2">Supprimer</button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab Content: Sponsors */}
        {activeTab === "sponsors" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6 w-full"
          >
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl select-none">
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-4 select-none">
                Sponsors & Partenaires
              </h2>

              <form onSubmit={handleAddEquipementier} className="flex flex-col gap-3 mb-6 pb-6 border-b border-white/5">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                    Équipementier Principal (Exclusif)
                  </label>
                  <select
                    value={selectedEquip}
                    onChange={(e) => {
                      setSelectedEquip(e.target.value);
                      if (e.target.value !== "Autre") setCustomEquipName("");
                    }}
                    className="w-full p-3 bg-neutral-900 border border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white mb-2"
                  >
                    <option value="Aucun">Aucun</option>
                    {PREDEFINED_EQUIPEMENTIERS.map((eq) => (
                      <option key={eq.name} value={eq.name}>
                        {eq.name}
                      </option>
                    ))}
                    <option value="Autre">Autre (personnalisé)</option>
                  </select>

                  {selectedEquip === "Autre" && (
                    <input
                      type="text"
                      placeholder="Nom de l'équipementier..."
                      value={customEquipName}
                      onChange={(e) => setCustomEquipName(e.target.value)}
                      className="w-full p-3 bg-neutral-900 border border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white mt-1"
                      required
                    />
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-extrabold text-xs tracking-wider uppercase rounded-xl transition-all duration-300"
                >
                  Définir Équipementier
                </button>
              </form>

              <form onSubmit={handleAddPartner} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                    Ajouter un Partenaire
                  </label>
                  <select
                    value={selectedPartner}
                    onChange={(e) => setSelectedPartner(e.target.value)}
                    className="w-full p-3 bg-neutral-900 border border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white"
                  >
                    {PREDEFINED_PARTENAIRES.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                    Ou partenaire personnalisé
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Oakley"
                    value={customSponsorName}
                    onChange={(e) => setCustomSponsorName(e.target.value)}
                    className="w-full p-3 bg-neutral-900 border border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 font-extrabold text-xs tracking-wider uppercase text-white rounded-xl transition-all duration-300"
                >
                  Ajouter Partenaire
                </button>
              </form>

              <div className="flex flex-col gap-2 mt-6">
                {sponsors.length === 0 && <p className="text-xs text-gray-500 italic p-2">Aucun sponsor ajouté.</p>}
                {sponsors.map((sp, i) => (
                  <div
                    key={sp.id}
                    className="w-full flex items-center justify-between p-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base p-1.5 bg-neutral-900 border border-white/5 rounded-xl">
                        {sp.logo}
                      </span>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm text-white">{sp.name}</span>
                        <span className="text-[9px] text-emerald-400 font-bold uppercase">{sp.category || "Sponsor"}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveSponsor(sp.id, i)}
                      className="text-gray-600 hover:text-red-400 text-xs font-semibold px-2"
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}


        {/* IP rights reminder mention */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 text-center mt-2 shadow-xl select-none">
          <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">
            Rappel : L&apos;athlète s&apos;engage à posséder l&apos;ensemble des droits de diffusion et d&apos;auteur pour les images, vidéos et contenus qu&apos;il publie sur son profil.
          </p>
        </div>

        {/* Premium Upgrade Stripe Modal */}
        {showStripeModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="backdrop-blur-2xl bg-neutral-900/90 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl max-w-sm w-full flex flex-col gap-5 border-t-emerald-400"
            >
              <div className="flex flex-col select-none">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  Élévation de statut
                </span>
                <h3 className="text-lg font-black text-white tracking-tight leading-snug">
                  Abonnement Mode Élite
                </h3>
                <p className="text-gray-400 text-xs">
                  Abonnement mensuel de 9.99 € • Annulable à tout moment
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2 text-xs text-gray-300 font-medium">
                  <span className="text-emerald-400 text-sm">⚡</span> Liens illimités (Plus de limites)
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-300 font-medium">
                  <span className="text-emerald-400 text-sm">🏆</span> Vitrine certifiée Élite Pro
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-300 font-medium">
                  <span className="text-emerald-400 text-sm">📄</span> Génération illimitée de Media Kit
                </div>
              </div>

              {/* Fake Stripe Credit Card Fields */}
              <div className="flex flex-col gap-3 pt-2 border-t border-white/5 select-none">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                    Numéro de carte
                  </label>
                  <input
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    defaultValue="4242424242424242"
                    className="w-full p-3 bg-neutral-950 border border-white/10 focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white placeholder-gray-600 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                      Expiration
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      defaultValue="12/26"
                      className="w-full p-3 bg-neutral-950 border border-white/10 focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white placeholder-gray-600 rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                      CVC
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      defaultValue="123"
                      className="w-full p-3 bg-neutral-950 border border-white/10 focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white placeholder-gray-600 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <button
                  onClick={async () => {
                    await handleUpgradePremiumReal();
                    setShowStripeModal(false);
                  }}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs tracking-wider uppercase rounded-2xl shadow-xl hover:shadow-[0_4px_24px_rgba(16,185,129,0.3)] transition-all duration-300"
                >
                  Activer mon abonnement (9.99€)
                </button>
                <button
                  onClick={() => setShowStripeModal(false)}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {showShareModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="backdrop-blur-2xl bg-neutral-900/90 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl max-w-sm w-full flex flex-col gap-5 border-t-emerald-400"
            >
              <div className="flex flex-col select-none">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  Partager mon profil
                </span>
                <h3 className="text-lg font-black text-white tracking-tight leading-snug">
                  Lien de votre vitrine
                </h3>
                <p className="text-gray-400 text-xs">
                  Partagez ce lien avec vos partenaires, sponsors et clubs pour maximiser votre visibilité.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-white/5 select-none">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                    Adresse Web
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${typeof window !== "undefined" ? window.location.origin : ""}/u/${username}`}
                      className="w-full p-3 bg-neutral-950 border border-white/10 focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white rounded-xl select-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      navigator.clipboard.writeText(`${window.location.origin}/u/${username}`);
                      setShareText("Lien copié dans le presse-papier !");
                      setTimeout(() => setShareText(""), 3000);
                      setShowShareModal(false);
                    }
                  }}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs tracking-wider uppercase rounded-2xl shadow-xl hover:shadow-[0_4px_24px_rgba(16,185,129,0.3)] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  📋 Copier le lien
                </button>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Add Performance Modal */}
        {showAddPerfModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="backdrop-blur-2xl bg-neutral-900/90 border border-white/10 rounded-3xl p-6 shadow-2xl max-w-lg w-full flex flex-col gap-5 border-t-emerald-400 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex flex-col select-none">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  Nouvelle performance
                </span>
                <h3 className="text-lg font-black text-white tracking-tight leading-snug">
                  Ajouter une performance
                </h3>
              </div>

              <form
                onSubmit={(e) => {
                  handleAddPerformance(e);
                  setShowAddPerfModal(false);
                }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                    Catégorie de discipline
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-1 bg-neutral-950/50 border border-white/5 rounded-2xl">
                    {Object.keys(ATHLETIC_DISCIPLINES).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setSelectedDisciplineCategory(cat);
                          setNewDistance("");
                        }}
                        className={`flex-1 min-w-[90px] px-2.5 py-2 text-[9px] font-black tracking-wider uppercase rounded-xl transition-all duration-300 select-none ${
                          selectedDisciplineCategory === cat
                            ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                      Discipline
                    </label>
                    <select
                      value={newDistance}
                      onChange={(e) => {
                        setNewDistance(e.target.value);
                        if (e.target.value !== "Autre") {
                          setCustomDiscipline("");
                        }
                      }}
                      className="w-full p-3 bg-neutral-950 border border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white"
                      required
                    >
                      <option value="">-- Choisir --</option>
                      {ATHLETIC_DISCIPLINES[selectedDisciplineCategory]?.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                      <option value="Autre">Autre (personnalisé)</option>
                    </select>
                    {newDistance === "Autre" && (
                      <input
                        type="text"
                        placeholder="Ex: 1000m"
                        value={customDiscipline}
                        onChange={(e) => setCustomDiscipline(e.target.value)}
                        className="w-full p-3 bg-neutral-950 border border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white placeholder-gray-600 mt-1"
                        required
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                      Chrono / Perf
                    </label>
                    <input
                      type="text"
                      placeholder="9.98"
                      value={newTemps}
                      onChange={(e) => setNewTemps(e.target.value)}
                      className="w-full p-3 bg-neutral-950 border border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white placeholder-gray-600"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full p-3 bg-neutral-950 border border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                      Compétition
                    </label>
                    <input
                      type="text"
                      placeholder="Championnats"
                      value={newComp}
                      onChange={(e) => setNewComp(e.target.value)}
                      className="w-full p-3 bg-neutral-950 border border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white placeholder-gray-600"
                    />
                  </div>
                </div>

                {["Sprint & Haies", "Sauts"].includes(selectedDisciplineCategory) && (
                  <div className="flex flex-col gap-1 animate-fadeIn">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1 flex justify-between select-none">
                      <span>Vent (m/s)</span>
                      <span className="text-[9px] text-gray-600 font-normal lowercase tracking-normal">Optionnel</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: +1.2 ou -0.5"
                      value={newWind}
                      onChange={(e) => setNewWind(e.target.value)}
                      className="w-full p-3 bg-neutral-950 border border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white placeholder-gray-600"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-2 mt-2">
                  <button
                    type="submit"
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs tracking-wider uppercase rounded-2xl shadow-xl hover:shadow-[0_4px_24px_rgba(16,185,129,0.3)] transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    🚀 Ajouter Performance
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddPerfModal(false)}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
         )}

        {/* Profile and Identity Edit Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="backdrop-blur-2xl bg-neutral-900/90 border border-white/10 rounded-3xl p-6 shadow-2xl max-w-md w-full flex flex-col gap-5 border-t-emerald-400 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex flex-col select-none">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  Édition du profil
                </span>
                <h3 className="text-lg font-black text-white tracking-tight leading-snug">
                  Profil & Identité
                </h3>
              </div>

              {/* Shine upgrade option inside the profile menu modal */}
              {!isPremium && (
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    setShowStripeModal(true);
                  }}
                  className="relative overflow-hidden w-full text-center text-xs font-black tracking-wider uppercase text-black bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 py-3.5 rounded-2xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-[0_4px_24px_rgba(16,185,129,0.35)] group"
                >
                  <span>🏆</span>
                  <span>Devenir Élite</span>
                  <span className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-25deg] group-hover:left-[120%] left-[-60%] transition-all duration-700 ease-in-out pointer-events-none"></span>
                </button>
              )}

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await handleSaveProfileInfo(e);
                }}
                className="flex flex-col gap-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                      Prénom
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Usain"
                      value={firstNameInput}
                      onChange={(e) => setFirstNameInput(e.target.value)}
                      className="w-full p-3 bg-neutral-950 border border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white placeholder-gray-600"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                      Nom
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Bolt"
                      value={lastNameInput}
                      onChange={(e) => setLastNameInput(e.target.value)}
                      className="w-full p-3 bg-neutral-950 border border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white placeholder-gray-600"
                    />
                  </div>
                </div>



                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                    Bio / Description
                  </label>
                  <textarea
                    placeholder="Athlète passionné visant l'excellence..."
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                    rows={3}
                    className="w-full p-3 bg-neutral-950 border border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-xs text-white placeholder-gray-600 resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                    Photo de profil (Upload)
                  </label>
                  <div className="flex items-center gap-4">
                    {avatarUrl ? (
                      <div className="w-16 h-16 rounded-full overflow-hidden border border-emerald-500/30 flex-shrink-0">
                        <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full overflow-hidden border border-white/10 bg-neutral-950 flex items-center justify-center text-xl flex-shrink-0">
                        👤
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleAvatarUpload}
                      disabled={isUploading}
                      className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-emerald-400 hover:file:bg-white/20 transition-all cursor-pointer"
                    />
                  </div>
                </div>

                {profSuccess && (
                  <p className="text-[10px] text-emerald-400 font-bold select-none">{profSuccess}</p>
                )}
                {profError && (
                  <p className="text-[10px] text-red-400 font-bold select-none">{profError}</p>
                )}

                <div className="flex flex-col gap-2 mt-2">
                  <button
                    type="submit"
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs tracking-wider uppercase rounded-2xl shadow-xl hover:shadow-[0_4px_24px_rgba(16,185,129,0.3)] transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    💾 Enregistrer les modifications
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileModal(false);
                        handleLogout();
                      }}
                      className="py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      🚪 Déconnexion
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileModal(false);
                        handleDeleteAccount();
                      }}
                      className="py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      ⚠️ Supprimer
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all"
                  >
                    Fermer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

      </div>
    </div>
  );
}


