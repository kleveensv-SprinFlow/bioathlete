"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "../ThemeProvider";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import jsPDF from "jspdf";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts";
import Cropper from 'react-easy-crop';
import { 
  Edit3, 
  FileText, 
  Share2, 
  Trophy, 
  LogOut, 
  Trash2, 
  User, 
  ChevronRight, 
  ChevronDown,
  X, 
  ArrowLeft,
  Camera,
  Eye
} from "lucide-react";

// Components & Types
import { Custom3DChart } from "@/components/CustomChart";
import { Skeleton } from "@/components/Skeleton";
import { Sponsors3DSection } from "@/components/Sponsors3DSection";
import LivePreviewModal from "./LivePreviewModal";
import { PerformanceRaw, SocialLink, Sponsor, Video } from "@/types";

// Re-map internal Performance type to shared PerformanceRaw for consistency
type Performance = PerformanceRaw;

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
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

const PREDEFINED_EQUIPEMENTIERS = [
  { name: "Nike", logo: "https://www.google.com/s2/favicons?domain=nike.com&sz=128" },
  { name: "Adidas", logo: "https://www.google.com/s2/favicons?domain=adidas.com&sz=128" },
  { name: "Puma", logo: "https://www.google.com/s2/favicons?domain=puma.com&sz=128" },
  { name: "Asics", logo: "https://www.google.com/s2/favicons?domain=asics.com&sz=128" },
  { name: "New Balance", logo: "https://www.google.com/s2/favicons?domain=newbalance.com&sz=128" },
  { name: "Kiprun", logo: "https://www.google.com/s2/favicons?domain=kiprun.com&sz=128" },
  { name: "Mizuno", logo: "https://www.google.com/s2/favicons?domain=mizuno.com&sz=128" },
  { name: "Hoka", logo: "https://www.google.com/s2/favicons?domain=hoka.com&sz=128" },
  { name: "Saucony", logo: "https://www.google.com/s2/favicons?domain=saucony.com&sz=128" },
  { name: "On Running", logo: "https://www.google.com/s2/favicons?domain=on-running.com&sz=128" },
  { name: "Joma", logo: "https://www.google.com/s2/favicons?domain=joma-sport.com&sz=128" },
];


const PREDEFINED_PARTENAIRES = [
  { name: "Red Bull", logo: "https://www.google.com/s2/favicons?domain=redbull.com&sz=128" },
  { name: "Oakley", logo: "https://www.google.com/s2/favicons?domain=oakley.com&sz=128" },
  { name: "Monster Energy", logo: "https://www.google.com/s2/favicons?domain=monsterenergy.com&sz=128" },
  { name: "Garmin", logo: "https://www.google.com/s2/favicons?domain=garmin.com&sz=128" },
  { name: "Maurten", logo: "https://www.google.com/s2/favicons?domain=maurten.com&sz=128" },
  { name: "SiS", logo: "https://www.google.com/s2/favicons?domain=scienceinsport.com&sz=128" },
  { name: "Polar", logo: "https://www.google.com/s2/favicons?domain=polar.com&sz=128" },
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


export function processPerformances(performances: any[]): { [key: string]: any } {
  const grouped: { [key: string]: any[] } = {};

  performances.forEach(perf => {
    const dist = perf.distance || "Inconnu";
    if (!grouped[dist]) {
      grouped[dist] = [];
    }
    grouped[dist].push(perf);
  });

  const result: { [key: string]: any } = {};

  for (const [distance, records] of Object.entries(grouped)) {
    const sortedByDate = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const sortedByTime = [...records].sort((a, b) => parseFloat(a.temps.toString()) - parseFloat(b.temps.toString()));

    const firstRecord = sortedByDate[0];
    const bestRecord = sortedByTime[0];

    const firstTime = parseFloat(firstRecord.temps.toString());
    const bestTime = parseFloat(bestRecord.temps.toString());

    let improvementTimeVal = bestTime - firstTime;
    let improvementPercentageVal = firstTime > 0 ? (improvementTimeVal / firstTime) * 100 : 0;

    let improvementTime = improvementTimeVal <= 0 ? `${improvementTimeVal.toFixed(2)}s` : `+${improvementTimeVal.toFixed(2)}s`;
    let improvementPercentage = improvementTimeVal <= 0 ? `${improvementPercentageVal.toFixed(1)}%` : `+${improvementPercentageVal.toFixed(1)}%`;

    result[distance] = {
      distance,
      records: sortedByDate,
      firstRecord,
      bestRecord,
      improvementTime,
      improvementPercentage
    };
  }

  return result;
}

/**
 * Utility to generate a high quality cropped image
 */
async function getCroppedImg(imageSrc: string, pixelCrop: any) {
  const image: HTMLImageElement = await new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (error) => reject(error));
    img.setAttribute('crossOrigin', 'anonymous');
    img.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  // Set canvas size to the cropped area
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw the cropped image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Return as blob with high quality
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg', 1.0); // 1.0 = Highest quality
  });
}

const formatEmbedUrl = (url: string) => {
  try {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const urlObj = new URL(url);
      let videoId = "";
      if (url.includes("youtu.be")) {
        videoId = urlObj.pathname.slice(1);
      } else {
        videoId = urlObj.searchParams.get("v") || "";
      }
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  } catch {
    return url;
  }
};

// LivePreviewModal is now imported from ./LivePreviewModal.tsx

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
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEquipModal, setShowEquipModal] = useState(false);
  const [showAddPerfModal, setShowAddPerfModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [profileView, setProfileView] = useState<'menu' | 'identity' | 'performances' | 'links' | 'sponsors' | 'photos'>('menu');
  const [justSaved, setJustSaved] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Profile enhancements
  const [bioInput, setBioInput] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [birthDateInput, setBirthDateInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [photoGallery, setPhotoGallery] = useState<{ id: string; url: string; title: string; date?: string }[]>([]);
  const [newGalleryPhotoFile, setNewGalleryPhotoFile] = useState<File | null>(null);
  const [newGalleryPhotoTitle, setNewGalleryPhotoTitle] = useState("");
  const [newGalleryPhotoDate, setNewGalleryPhotoDate] = useState("");
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<{ id: string; url: string; title: string; date?: string } | null>(null);

  const [performances, setPerformances] = useState<Performance[]>([]);
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [views, setViews] = useState(0);
  const [modalMode, setModalMode] = useState<'equipementier' | 'partenaire'>('equipementier');
  const [expandedDisciplines, setExpandedDisciplines] = useState<string[]>([]);

  // Preview handler
  useEffect(() => {
    if (!newGalleryPhotoFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(newGalleryPhotoFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [newGalleryPhotoFile]);

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

  // Crop States
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);

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
            .select("username, is_premium, bio, avatar_url, full_name, views_count, birth_date")
            .eq("user_id", uid)
            .maybeSingle();

          if (existingProf) {
            profData = existingProf;
          } else if (!profErr) {
            // It doesn't exist, let's create a default one only if there was no query error
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
          } else {
            console.error("Erreur lors de la récupération du profil:", profErr);
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
          setBirthDateInput(profData.birth_date || "");
        }

        // Fetch related data
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
        if (!spErr && spData) {
          setSponsors(spData);
          const equip = spData.find((s: any) => s.category === "Équipementier");
          if (equip) setSelectedEquip(equip.name);
        }

        const { data: photoData, error: photoErr } = await supabase
          .from("photo_gallery")
          .select("*")
          .eq("user_id", uid);
        if (!photoErr && photoData) setPhotoGallery(photoData);

        const { data: vidData, error: vidErr } = await supabase
          .from("videos")
          .select("*")
          .eq("user_id", uid);
        if (!vidErr && vidData) setVideos(vidData);

      } catch (err) {
        console.error("Erreur chargement Supabase:", err);
      } finally {
        setIsInitialLoading(false);
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
    
    // Create a preview for cropping
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setShowCropModal(true);
    };
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleConfirmCrop = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;
    
    setIsUploading(true);
    setShowCropModal(false);

    try {
      const croppedBlob: any = await getCroppedImg(imageToCrop, croppedAreaPixels);
      if (croppedBlob) {
        // Create a File object from Blob to use existing upload function
        const croppedFile = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });
        const publicUrl = await uploadFileToSupabase(croppedFile, 'avatars');
        
        if (publicUrl) {
          setAvatarUrl(publicUrl);
          // Utilisation de update plutôt que upsert pour une modification partielle plus fiable
          const { error: updateErr } = await supabase
            .from("profiles")
            .update({ avatar_url: publicUrl })
            .eq("user_id", userId);
            
          if (updateErr) {
            console.error("Erreur lors de la mise à jour de l'avatar en base:", updateErr);
            setProfError("La photo a été envoyée mais n'a pas pu être liée à votre profil.");
          } else {
            setProfSuccess("Photo de profil mise à jour avec succès !");
            setTimeout(() => setProfSuccess(""), 3000);
          }
        }
      }
    } catch (err) {
      console.error("Crop/Upload error:", err);
      setProfError("Erreur lors du traitement de l'image.");
    } finally {
      setIsUploading(false);
      setImageToCrop(null);
    }
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
          avatar_url: avatarUrl,
          birth_date: birthDateInput,
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
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 2000);
      } else {
        setUsername(finalUsername);
        setUsernameInput(finalUsername);
        setFullNameInput(newFullName);
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 2000);
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

    // Limitation check
    if (!isPremium && photoGallery.length >= 2) {
      setProfError("Limite de 2 photos atteinte. Passez Élite pour un stockage illimité !");
      setTimeout(() => setProfError(""), 5000);
      return;
    }

    setIsUploading(true);
    const publicUrl = await uploadFileToSupabase(newGalleryPhotoFile, 'gallery');

    if (publicUrl) {
      try {
        const { data, error } = await supabase
          .from("photo_gallery")
          .insert([{
            user_id: userId,
            url: publicUrl,
            title: newGalleryPhotoTitle || "",
            date: newGalleryPhotoDate || new Date().toISOString().split('T')[0]
          }])
          .select();
 
        if (error) throw error;
 
        if (data && data.length > 0) {
          setPhotoGallery([...photoGallery, data[0]]);
        }
        
        setNewGalleryPhotoFile(null);
        setNewGalleryPhotoTitle("");
        setNewGalleryPhotoDate("");
        setShowAddPhotoModal(false);
      } catch (err) {
        console.error("Error adding photo:", err);
        setProfError("Erreur lors de l'enregistrement de la photo.");
      }
    }
    setIsUploading(false);
  };

  const handleRemoveGalleryPhoto = async (photoId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("photo_gallery")
        .delete()
        .eq("id", photoId);
 
      if (error) throw error;
      setPhotoGallery(photoGallery.filter(p => p.id !== photoId));
      setSelectedPhoto(null);
    } catch (err) {
      console.error("Error removing photo:", err);
    }
  };

  const handleUpdateGalleryPhoto = async (photoId: string, newTitle: string, newDate: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("photo_gallery")
        .update({ title: newTitle, date: newDate })
        .eq("id", photoId);
 
      if (error) throw error;
      
      setPhotoGallery(photoGallery.map(p => 
        p.id === photoId ? { ...p, title: newTitle, date: newDate } : p
      ));
      setSelectedPhoto(null);
    } catch (err) {
      console.error("Error updating photo:", err);
    }
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleUpgradePremium = async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({ is_premium: true })
        .eq("user_id", userId)
        .select();

      if (error) {
        console.error("Erreur SQL lors de l'activation:", error);
        setPromoError("Erreur base de données : " + error.message);
        return;
      }

      if (data && data.length > 0) {
        setIsPremium(true);
        setProfSuccess("Mode Élite débloqué avec succès ! 🔥");
        setTimeout(() => setProfSuccess(""), 4000);
      } else {
         setPromoError("Profil introuvable pour la mise à jour.");
      }
    } catch (err: any) {
      console.error(err);
      setPromoError("Erreur inattendue : " + err.message);
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
    <div className="min-h-screen font-sans selection:bg-emerald-500 selection:text-white pb-16 transition-colors duration-500" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      {/* Background ambient blobs — adapt to theme */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none z-0" style={{ background: 'var(--blob-1)' }}></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none z-0" style={{ background: 'var(--blob-2)' }}></div>

      <div className="relative z-10 max-w-md mx-auto px-5 pt-8 flex flex-col gap-8 min-h-screen">
        
        {/* Success Toast */}
        <AnimatePresence>
          {profSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -50 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-full bg-emerald-500 text-white font-black text-xs uppercase tracking-widest shadow-[0_0_40px_rgba(16,185,129,0.4)] flex items-center gap-3 whitespace-nowrap"
            >
              <span>✨</span> {profSuccess}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top bar with theme toggle, share, and profile */}
        <div className="flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setShowShareModal(true)}
              className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 select-none cursor-pointer"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              title="Partager mon profil"
            >
              <span className="text-base">🔗</span>
            </button>
          </div>
          <div className="flex-1 px-4 flex flex-col items-center">
            {isInitialLoading ? (
              <Skeleton className="h-6 w-32 mb-1" />
            ) : (
              <h1 className="text-xl font-black tracking-tighter uppercase" style={{ color: 'var(--text-primary)' }}>
                Salut, {(firstNameInput || "Athlète").toUpperCase()}
              </h1>
            )}
            {isPremium ? (
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500 flex items-center gap-1">
                <span>✦</span> ÉLITE <span>✦</span>
              </p>
            ) : (
              <p className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>Gestion du Profil</p>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowProfileModal(true)}
              className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center hover:scale-105 transition-all duration-300 select-none cursor-pointer"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}
            >
              {isInitialLoading ? (
                <Skeleton className="w-full h-full rounded-full" />
              ) : avatarUrl ? (
                <img src={avatarUrl} alt="Photo de profil" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-black select-none" style={{ color: 'var(--text-muted)' }}>
                  {(firstNameInput || "A").charAt(0).toUpperCase()}
                </span>
              )}
            </button>
          </div>
        </div>


        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-1 pb-2 scrollbar-none w-full" style={{ borderBottom: '1px solid var(--border)' }}>
          {[
            { key: "apercu", label: "Aperçu" },
            { key: "stats", label: "Statistiques" }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-500 rounded-t-2xl cursor-pointer"
              style={activeTab === tab.key ? { color: 'var(--text-primary)', borderBottom: '2px solid var(--accent)', background: 'var(--card-bg)' } : { color: 'var(--text-muted)' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content: Aperçu */}
        {activeTab === "apercu" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6 w-full">
            
            {/* Blurred Live Preview Card */}
            <div className="relative rounded-3xl overflow-hidden select-none cursor-pointer group h-[500px]" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }} onClick={() => setShowFullPreview(true)}>
              
              {isInitialLoading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ background: 'var(--card-bg)' }}>
                  <div className="flex flex-col items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              )}
              
              {/* MINIATURE REPLICA OF THE REAL PROFILE (BLURRED) */}
              <div className="absolute inset-0 z-0 filter blur-[6px] group-hover:blur-[3px] transition-all duration-1000 scale-[1.02] opacity-100">
                
                {/* Pixel Wave Animation (White) */}
                <motion.div
                  initial={{ x: '-100%', skewX: -25 }}
                  animate={{ x: '150%' }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "linear",
                    repeatDelay: 0.5
                  }}
                  className="absolute inset-0 z-10 w-full bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent pointer-events-none"
                />

                <div className="flex flex-col gap-8 p-4">
                  
                  {/* Mini Logo */}
                  <div className="w-12 h-4 bg-slate-200 rounded-full mb-2"></div>

                  {/* Mini Hero */}
                  <div className="relative w-full h-[240px] rounded-2xl overflow-hidden bg-slate-200 border border-slate-300">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="w-full h-full object-cover opacity-50" />
                    ) : (
                      <div className="w-full h-full bg-slate-300"></div>
                    )}
                    <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2">
                      <div className="h-6 w-32 bg-white/40 rounded-lg"></div>
                      <div className="h-2 w-16 bg-emerald-400/40 rounded-full"></div>
                      <div className="h-8 w-full bg-black/40 rounded-xl backdrop-blur-sm"></div>
                    </div>
                  </div>

                  {/* Mini Bento Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 h-20 rounded-2xl bg-slate-100 border border-slate-300 flex items-center justify-center text-2xl opacity-40">🤝</div>
                    <div className="h-16 rounded-2xl bg-slate-100 border border-slate-300 flex items-center justify-center opacity-30">✨</div>
                    <div className="h-16 rounded-2xl bg-slate-100 border border-slate-300 flex items-center justify-center opacity-30">✨</div>
                  </div>

                  {/* Mini Stats Card */}
                  <div className="w-full h-24 rounded-2xl bg-slate-100 border border-slate-300 flex flex-col items-center justify-center gap-2">
                    <div className="h-8 w-20 bg-slate-200 rounded-lg"></div>
                    <div className="h-3 w-24 bg-emerald-500/20 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* OVERLAY WITH CTA */}
              <div className="absolute inset-0 bg-white/30 group-hover:bg-white/10 transition-all duration-500 flex items-center justify-center z-10">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-slate-900 text-white font-black text-sm uppercase tracking-wider rounded-2xl border-2 border-slate-800"
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
                  performances={performances}
                  sponsors={sponsors}
                  links={links}
                  videos={videos}
                  username={username}
                  photoGallery={photoGallery}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Tab Content: Statistiques */}
        {activeTab === "stats" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6 w-full">
            
            {/* Visit stats */}
            <div className="themed-card rounded-[2rem] p-6 flex items-center justify-between">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-1">Visibilité</h3>
                {isInitialLoading ? (
                  <Skeleton className="h-9 w-24" />
                ) : (
                  <p className="text-3xl font-black tracking-tighter" style={{ color: 'var(--text-primary)' }}>
                    {views || 0} <span className="text-[10px] font-bold uppercase tracking-widest ml-1" style={{ color: 'var(--text-muted)' }}>Vues totales</span>
                  </p>
                )}
              </div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--accent-soft)' }}>
                <Share2 className="text-emerald-500" size={24} />
              </div>
            </div>
 
            {/* Simple Audience Chart */}
            <div className="themed-card rounded-[2rem] p-6 flex flex-col gap-4">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>Audience</h3>
                <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>Activité des 7 derniers jours</p>
              </div>
              <div className="h-48 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { day: 'Lun', val: Math.floor((views || 10) * 0.1) },
                    { day: 'Mar', val: Math.floor((views || 10) * 0.15) },
                    { day: 'Mer', val: Math.floor((views || 10) * 0.12) },
                    { day: 'Jeu', val: Math.floor((views || 10) * 0.25) },
                    { day: 'Ven', val: Math.floor((views || 10) * 0.35) },
                    { day: 'Sam', val: Math.floor((views || 10) * 0.45) },
                    { day: 'Dim', val: (views || 10) }
                  ]}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 700}} />
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: '900'}} />
                    <Area type="monotone" dataKey="val" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorViews)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}


        {/* IP rights reminder mention */}
        <div className="backdrop-blur-xl bg-white/5 border border-slate-300 rounded-2xl p-4 text-center mt-2 shadow-sm select-none bg-white">
          <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-widest">
            Rappel : L&apos;athlète s&apos;engage à posséder l&apos;ensemble des droits de diffusion et d&apos;auteur.
          </p>
        </div>



        {/* IP rights reminder mention */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 text-center mt-2 shadow-xl select-none">
          <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">
            Rappel : L&apos;athlète s&apos;engage à posséder l&apos;ensemble des droits de diffusion et d&apos;auteur pour les images, vidéos et contenus qu&apos;il publie sur son profil.
          </p>
        </div>

        {/* Premium Upgrade Stripe Modal */}
        <AnimatePresence>
          {showStripeModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[150] flex items-center justify-center p-4 select-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 15 }}
                transition={{ duration: 0.3 }}
                className="backdrop-blur-3xl bg-white/90 border border-white rounded-[2.5rem] p-8 shadow-2xl max-w-sm w-full flex flex-col gap-6"
              >
                <div className="flex flex-col select-none">
                  <span className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.3em] mb-1">
                    Élévation de statut
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                    Mode Élite
                  </h3>
                  <p className="text-slate-500 text-[10px] font-bold mt-2 uppercase tracking-tight">
                    Abonnement mensuel de 9.99 €
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 text-xs text-slate-600 font-bold">
                    <span className="w-6 h-6 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500">⚡</span> Liens illimités
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-600 font-bold">
                    <span className="w-6 h-6 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500">🏆</span> Vitrine certifiée Élite
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-600 font-bold">
                    <span className="w-6 h-6 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500">📊</span> Statistiques avancées
                  </div>
                </div>

                {/* Fake Stripe Credit Card Fields / Promo Code */}
                <div className="flex flex-col gap-4 pt-4 border-t border-slate-100 select-none">
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                      Code Promotionnel (Optionnel)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: ELITE50"
                      value={promoCode}
                      onChange={(e) => { setPromoCode(e.target.value); setPromoError(""); }}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 focus:outline-none transition-all text-sm text-slate-900 font-bold uppercase"
                    />
                    {promoError && (
                      <span className="text-[10px] text-red-500 font-bold px-1">{promoError}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 px-1 py-2">
                    <div className="h-px bg-slate-100 flex-1" />
                    <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Ou payer par carte</span>
                    <div className="h-px bg-slate-100 flex-1" />
                  </div>

                  <div className="flex flex-col gap-1.5 opacity-50 pointer-events-none">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                      Numéro de carte
                    </label>
                    <input
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      defaultValue="4242424242424242"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 opacity-50 pointer-events-none">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                        Expiration
                      </label>
                      <input type="text" placeholder="MM/YY" defaultValue="12/26" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 font-bold" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                        CVC
                      </label>
                      <input type="text" placeholder="123" defaultValue="123" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 font-bold" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <button
                    onClick={async () => {
                      if (promoCode.trim().toLowerCase() === "kleveens") {
                        await handleUpgradePremium();
                        setShowStripeModal(false);
                        setPromoCode("");
                      } else if (promoCode.trim().length > 0) {
                        setPromoError("Code promotionnel invalide");
                      } else {
                        await handleUpgradePremiumReal();
                        setShowStripeModal(false);
                      }
                    }}
                    className="w-full py-5 bg-slate-900 hover:bg-black text-white font-black text-xs tracking-widest uppercase rounded-2xl shadow-xl transition-all"
                  >
                    🚀 Activer mon abonnement {promoCode.trim() ? "" : "(9.99€)"}
                  </button>
                  <button
                    onClick={() => { setShowStripeModal(false); setPromoCode(""); setPromoError(""); }}
                    className="w-full py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 transition-all"
                  >
                    Annuler
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showShareModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[150] flex items-center justify-center p-4 select-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-white/95 border border-white rounded-[2rem] p-8 shadow-2xl max-w-sm w-full flex flex-col gap-6"
              >
                <div className="flex flex-col select-none">
                  <span className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.3em] mb-1">
                    Partager mon profil
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                    Lien Public
                  </h3>
                  <p className="text-slate-500 text-[10px] font-bold mt-2 uppercase tracking-tight">
                    Maximisez votre visibilité athlétique
                  </p>
                </div>

                <div className="flex flex-col gap-4 pt-4 border-t border-slate-100 select-none">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                      URL de votre vitrine
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${typeof window !== "undefined" ? window.location.origin : ""}/u/${username}`}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 font-bold select-all focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <button
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        navigator.clipboard.writeText(`${window.location.origin}/u/${username}`);
                        setShareText("Copié !");
                        setTimeout(() => setShareText(""), 3000);
                        setShowShareModal(false);
                      }
                    }}
                    className="w-full py-5 bg-slate-900 hover:bg-black text-white font-black text-xs tracking-widest uppercase rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    {shareText || "📋 Copier le lien"}
                  </button>
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="w-full py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 transition-all"
                  >
                    Fermer
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Add Performance Modal */}
        <AnimatePresence>
          {showAddPerfModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[150] flex items-center justify-center p-4 select-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 15 }}
                transition={{ duration: 0.3 }}
                className="backdrop-blur-3xl bg-white/90 border border-white rounded-[2.5rem] p-8 shadow-2xl max-w-lg w-full flex flex-col gap-6 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex flex-col select-none">
                  <span className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.3em] mb-1">
                    Nouvelle performance
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                    Ajouter un record
                  </h3>
                </div>

                <form
                  onSubmit={(e) => {
                    handleAddPerformance(e);
                    setShowAddPerfModal(false);
                  }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">
                      Catégorie de discipline
                    </label>
                    <div className="flex flex-wrap gap-2 p-2 bg-slate-50 border border-slate-200 rounded-2xl">
                      {Object.keys(ATHLETIC_DISCIPLINES).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setSelectedDisciplineCategory(cat);
                            setNewDistance("");
                          }}
                          className={`flex-1 min-w-[90px] px-3 py-2.5 text-[9px] font-black tracking-wider uppercase rounded-xl transition-all duration-300 select-none ${
                            selectedDisciplineCategory === cat
                              ? "bg-slate-900 text-white shadow-md"
                              : "text-slate-400 hover:text-slate-600 hover:bg-white"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">
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
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-slate-900 focus:outline-none transition-all text-sm text-slate-900 font-bold"
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
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-slate-900 focus:outline-none transition-all text-sm text-slate-900 font-bold mt-2"
                          required
                        />
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">
                        Chrono / Perf
                      </label>
                      <input
                        type="text"
                        placeholder="9.98"
                        value={newTemps}
                        onChange={(e) => setNewTemps(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-slate-900 focus:outline-none transition-all text-sm text-slate-900 font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-slate-900 focus:outline-none transition-all text-sm text-slate-900 font-bold"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">
                        Compétition
                      </label>
                      <input
                        type="text"
                        placeholder="Championnats"
                        value={newComp}
                        onChange={(e) => setNewComp(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-slate-900 focus:outline-none transition-all text-sm text-slate-900 font-bold"
                      />
                    </div>
                  </div>

                  {["Sprint & Haies", "Sauts"].includes(selectedDisciplineCategory) && (
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">
                        Vent (m/s)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: +1.2 ou -0.5"
                        value={newWind}
                        onChange={(e) => setNewWind(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-slate-900 focus:outline-none transition-all text-sm text-slate-900 font-bold"
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-3 mt-4 pt-6 border-t border-slate-100">
                    <button
                      type="submit"
                      className="w-full py-5 bg-slate-900 hover:bg-black text-white font-black text-xs tracking-widest uppercase rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3"
                    >
                      🚀 Ajouter Performance
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddPerfModal(false)}
                      className="w-full py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 transition-all"
                    >
                      Fermer
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showAddPhotoModal && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[150] flex items-center justify-center p-4 select-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 15 }}
                transition={{ duration: 0.3 }}
                className="backdrop-blur-3xl bg-white/90 border border-white rounded-[2.5rem] p-8 shadow-2xl max-w-lg w-full flex flex-col gap-6 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex flex-col select-none">
                  <span className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.3em] mb-1">
                    Galerie Media
                  </span>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                    Ajouter une photo
                  </h3>
                </div>

                <form
                  onSubmit={handleAddGalleryPhoto}
                  className="flex flex-col gap-5"
                >
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">
                      Titre de la photo
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Podium Championnats"
                      value={newGalleryPhotoTitle}
                      onChange={(e) => setNewGalleryPhotoTitle(e.target.value)}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-slate-900 focus:outline-none transition-all duration-300 text-sm text-slate-900 placeholder-slate-300 font-bold"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">
                      Date de l&apos;événement
                    </label>
                    <input
                      type="date"
                      value={newGalleryPhotoDate}
                      onChange={(e) => setNewGalleryPhotoDate(e.target.value)}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-slate-900 focus:outline-none transition-all duration-300 text-sm text-slate-900 font-bold"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">
                      Sélectionner l&apos;image
                    </label>
                    <div className="relative">
                      <input 
                        type="file" 
                        id="gallery-photo-upload-modal"
                        accept="image/*"
                        onChange={(e) => setNewGalleryPhotoFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <label 
                        htmlFor="gallery-photo-upload-modal"
                        className="w-full relative bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl hover:border-slate-400 cursor-pointer flex flex-col items-center justify-center min-h-[200px] transition-all overflow-hidden"
                      >
                        {previewUrl ? (
                          <div className="flex flex-col items-center justify-center w-full p-2">
                            <img 
                              src={previewUrl} 
                              alt="Preview" 
                              className="max-w-full max-h-[350px] object-contain rounded-2xl shadow-md"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-white text-[10px] font-black uppercase tracking-widest bg-black/60 px-4 py-2 rounded-full backdrop-blur-md border border-white/20">Changer l&apos;image</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-3 p-10">
                            <Camera size={40} className="text-slate-300" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Choisir un fichier</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 mt-4 pt-6 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={isUploading || !newGalleryPhotoFile}
                      className={`w-full py-5 font-black text-xs tracking-[0.2em] uppercase rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-center gap-3 ${isUploading || !newGalleryPhotoFile ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-slate-900 hover:bg-black text-white shadow-slate-900/20"}`}
                    >
                      {isUploading ? "🚀 Envoi en cours..." : "🚀 Ajouter à ma galerie"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddPhotoModal(false)}
                      className="w-full py-4 bg-white border border-slate-200 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Photo Details Modal */}
        <AnimatePresence>
          {selectedPhoto && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[160] flex items-center justify-center p-4 select-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto"
              >
                {/* Photo Section */}
                <div className="flex-1 bg-black flex items-center justify-center overflow-hidden">
                  <img src={selectedPhoto.url} alt={selectedPhoto.title} className="max-w-full max-h-full object-contain" />
                </div>

                {/* Edit Section */}
                <div className="w-full md:w-80 p-8 flex flex-col gap-6 bg-slate-50 border-l border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.3em] mb-1">Détails Photo</span>
                    <h4 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">Modifier</h4>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 px-1">Titre</label>
                      <input 
                        type="text" 
                        defaultValue={selectedPhoto.title}
                        id="edit-photo-title"
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 px-1">Date</label>
                      <input 
                        type="date" 
                        defaultValue={selectedPhoto.date}
                        id="edit-photo-date"
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 mt-auto">
                    <button 
                      onClick={() => {
                        const title = (document.getElementById('edit-photo-title') as HTMLInputElement).value;
                        const date = (document.getElementById('edit-photo-date') as HTMLInputElement).value;
                        handleUpdateGalleryPhoto(selectedPhoto.id, title, date);
                      }}
                      className="w-full py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-lg"
                    >
                      Enregistrer
                    </button>
                    <button 
                      onClick={() => handleRemoveGalleryPhoto(selectedPhoto.id)}
                      className="w-full py-3 bg-red-50 text-red-500 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 size={14} /> Supprimer
                    </button>
                    <button 
                      onClick={() => setSelectedPhoto(null)}
                      className="w-full py-3 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 transition-all"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Profile and Identity Edit Modal */}
        {/* Profile and Identity Edit Modal */}
        <AnimatePresence>
          {showProfileModal && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 bg-slate-200 z-[120] overflow-y-auto font-sans p-6 md:p-12"
            >
              {/* Close/Back Button Fixed */}
              <button 
                onClick={() => {
                  if (profileView !== 'menu') {
                    setProfileView('menu');
                  } else {
                    setShowProfileModal(false);
                  }
                }} 
                className="fixed top-6 right-6 w-12 h-12 bg-white/40 hover:bg-white/60 backdrop-blur-xl border border-slate-300 rounded-full flex items-center justify-center text-slate-900 transition-all z-[130]"
              >
                {profileView !== 'menu' ? <ArrowLeft size={20} strokeWidth={3} /> : <X size={20} strokeWidth={3} />}
              </button>

              <div className="max-w-xl mx-auto flex flex-col gap-8 py-12">
                
                {profileView === 'menu' && (
                  /* PROFILE MENU VIEW */
                  <div className="flex flex-col gap-8 animate-fadeIn">
                    <div className="flex flex-col select-none">
                      <span className="text-xs text-emerald-600 font-black uppercase tracking-[0.3em] mb-2">
                        Compte Athlète
                      </span>
                      <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
                        Mon Profil
                      </h3>
                    </div>

                    {/* USER CARD */}
                    <div className="bg-white border border-slate-300 rounded-[2.5rem] p-6 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-100 bg-slate-100 flex items-center justify-center">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt="Profil" className="w-full h-full object-cover" />
                          ) : (
                            <User size={32} className="text-slate-300" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <h4 className="text-lg font-black text-slate-900 tracking-tight">
                            {firstNameInput} {lastNameInput}
                          </h4>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            @{username}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setProfileView('identity')}
                        className="w-12 h-12 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-900 transition-all"
                      >
                        <Edit3 size={18} />
                      </button>
                    </div>

                    {/* ELITE UPGRADE CARD (Glued to profile) */}
                    {!isPremium ? (
                      <button
                        onClick={() => setShowStripeModal(true)}
                        className="relative overflow-hidden w-full p-7 bg-slate-900 text-white rounded-[2.5rem] hover:bg-black transition-all flex items-center justify-between group shadow-lg -mt-4"
                      >
                        <div className="flex items-center gap-5">
                          <span className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                            <Trophy size={22} className="text-emerald-400" />
                          </span>
                          <div className="flex flex-col items-start text-left">
                            <span className="text-sm font-black uppercase tracking-widest text-emerald-400">Passer Élite</span>
                            <span className="text-[10px] text-slate-400 font-bold mt-0.5">Accès illimité à toutes les fonctions</span>
                          </div>
                        </div>
                        <ChevronRight size={20} className="text-white/30 group-hover:translate-x-1 transition-transform" />
                        
                        <div className="absolute inset-0 w-full h-full pointer-events-none">
                          <div className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent skew-x-[-25deg] animate-[shimmer_3s_infinite] blur-sm"></div>
                        </div>
                      </button>
                    ) : (
                      <div className="relative overflow-hidden w-full p-7 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-[2.5rem] flex items-center justify-between shadow-lg -mt-4">
                        <div className="flex items-center gap-5">
                          <span className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                            <span className="text-2xl">✨</span>
                          </span>
                          <div className="flex flex-col items-start text-left">
                            <span className="text-sm font-black uppercase tracking-widest text-emerald-400">Statut Élite</span>
                            <span className="text-[10px] text-emerald-600/70 font-bold mt-0.5">Abonnement premium actif</span>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <span className="text-emerald-500 font-black">✓</span>
                        </div>
                      </div>
                    )}

                    {/* MANAGEMENT GROUP */}
                    <div className="bg-white border border-slate-300 rounded-[2.5rem] overflow-hidden flex flex-col">
                      <button 
                        onClick={() => setProfileView('performances')}
                        className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-all border-b border-slate-100"
                      >
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                            <Trophy size={18} className="text-slate-600" />
                          </span>
                          <span className="text-sm font-bold text-slate-900">Mes Performances</span>
                        </div>
                        <ChevronRight size={18} className="text-slate-300" />
                      </button>

                      <button 
                        onClick={() => setProfileView('links')}
                        className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-all border-b border-slate-100"
                      >
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                            <Share2 size={18} className="text-slate-600" />
                          </span>
                          <span className="text-sm font-bold text-slate-900">Mes Liens & Réseaux</span>
                        </div>
                        <ChevronRight size={18} className="text-slate-300" />
                      </button>

                      <button 
                        onClick={() => setProfileView('photos')}
                        className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-all border-b border-slate-100"
                      >
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                            <Camera size={18} className="text-slate-600" />
                          </span>
                          <span className="text-sm font-bold text-slate-900">Mes Photos</span>
                        </div>
                        <ChevronRight size={18} className="text-slate-300" />
                      </button>

                      <button 
                        onClick={() => setProfileView('sponsors')}
                        className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                            <span className="text-lg">🤝</span>
                          </span>
                          <span className="text-sm font-bold text-slate-900">Mes Sponsors</span>
                        </div>
                        <ChevronRight size={18} className="text-slate-300" />
                      </button>
                    </div>

                    {/* MENU ITEMS GROUP 2 */}
                    <div className="bg-white border border-slate-300 rounded-[2.5rem] overflow-hidden flex flex-col">
                      <button 
                        onClick={() => {
                          setShowProfileModal(false);
                          handleGenerateMediaKit();
                        }}
                        className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-all border-b border-slate-100"
                      >
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                            <FileText size={18} className="text-slate-600" />
                          </span>
                          <span className="text-sm font-bold text-slate-900">Mon Media Kit (PDF)</span>
                        </div>
                        <ChevronRight size={18} className="text-slate-300" />
                      </button>

                      <button 
                        onClick={() => {
                          setShowProfileModal(false);
                          setShowShareModal(true);
                        }}
                        className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                            <Share2 size={18} className="text-slate-600" />
                          </span>
                          <span className="text-sm font-bold text-slate-900">Partager mon profil</span>
                        </div>
                        <ChevronRight size={18} className="text-slate-300" />
                      </button>
                    </div>

                    {/* DANGER ZONE */}
                    <div className="bg-white border border-slate-300 rounded-[2.5rem] overflow-hidden flex flex-col mt-4">
                      <button 
                        onClick={handleLogout}
                        className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-all border-b border-slate-100"
                      >
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                            <LogOut size={18} className="text-slate-600" />
                          </span>
                          <span className="text-sm font-bold text-slate-900">Se déconnecter</span>
                        </div>
                        <ChevronRight size={18} className="text-slate-300" />
                      </button>

                      <button 
                        onClick={handleDeleteAccount}
                        className="w-full p-6 flex items-center justify-between hover:bg-red-50 transition-all text-red-600"
                      >
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                            <Trash2 size={18} />
                          </span>
                          <span className="text-sm font-bold">Supprimer le compte</span>
                        </div>
                        <ChevronRight size={18} className="opacity-30" />
                      </button>
                    </div>
                  </div>
                )}

                {profileView === 'identity' && (
                  /* EDIT PROFILE VIEW */
                  <div className="flex flex-col gap-10 animate-slideInRight">
                    <div className="flex flex-col select-none">
                      <span className="text-xs text-emerald-600 font-black uppercase tracking-[0.3em] mb-2">
                        Modification
                      </span>
                      <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
                        Profil & Identité
                      </h3>
                    </div>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        await handleSaveProfileInfo(e);
                      }}
                      className="flex flex-col gap-10"
                    >
                      {/* TOP AVATAR SECTION */}
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative group">
                          <input
                            type="file"
                            id="avatar-upload-top"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={handleAvatarUpload}
                            disabled={isUploading}
                            className="hidden"
                          />
                          <label 
                            htmlFor="avatar-upload-top"
                            className="cursor-pointer block relative"
                          >
                            <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-100 flex items-center justify-center transition-transform duration-500 group-hover:scale-[1.02]">
                              {avatarUrl ? (
                                <img src={avatarUrl} alt="Profil" className="w-full h-full object-cover" />
                              ) : (
                                <User size={64} className="text-slate-300" />
                              )}
                            </div>
                            
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 text-white">
                                <Camera size={24} />
                              </div>
                            </div>

                            {/* Loading State */}
                            {isUploading && (
                              <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center z-10">
                                <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            )}
                          </label>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cliquer pour changer la photo</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">
                            Prénom
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Usain"
                            value={firstNameInput}
                            onChange={(e) => setFirstNameInput(e.target.value)}
                            className="w-full p-4 bg-white border border-slate-300 rounded-2xl focus:border-slate-900 focus:outline-none transition-all duration-300 text-sm text-slate-900 placeholder-slate-300 font-bold"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">
                            Nom
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Bolt"
                            value={lastNameInput}
                            onChange={(e) => setLastNameInput(e.target.value)}
                            className="w-full p-4 bg-white border border-slate-300 rounded-2xl focus:border-slate-900 focus:outline-none transition-all duration-300 text-sm text-slate-900 placeholder-slate-300 font-bold"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">
                          Date de naissance
                        </label>
                        <input
                          type="date"
                          value={birthDateInput}
                          onChange={(e) => setBirthDateInput(e.target.value)}
                          className="w-full p-4 bg-white border border-slate-300 rounded-2xl focus:border-slate-900 focus:outline-none transition-all duration-300 text-sm text-slate-900 font-bold"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">
                          Bio / Description Professionnelle
                        </label>
                        <textarea
                          placeholder="Athlète passionné visant l'excellence..."
                          value={bioInput}
                          onChange={(e) => setBioInput(e.target.value)}
                          rows={4}
                          className="w-full p-4 bg-white border border-slate-300 rounded-2xl focus:border-slate-900 focus:outline-none transition-all duration-300 text-sm text-slate-900 placeholder-slate-300 font-bold resize-none"
                        />
                      </div>


                      {profSuccess && (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs font-bold flex items-center gap-2">
                          <span>✅</span> {profSuccess}
                        </div>
                      )}
                      {profError && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-bold flex items-center gap-2">
                          <span>⚠️</span> {profError}
                        </div>
                      )}

                      <div className="flex flex-col gap-4 mt-4 pt-8 border-t border-slate-300">
                        <button
                          type="submit"
                          className="relative overflow-hidden w-full py-5 bg-slate-900 hover:bg-black text-white font-black text-sm tracking-[0.2em] uppercase rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-center gap-3 group"
                        >
                          <span>{justSaved ? "✓ Enregistré" : "Enregistrer"}</span>
                          {/* Shine Effect */}
                          {(justSaved || isLoading) && (
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg] animate-[shimmer_1.5s_infinite]"></span>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {profileView === 'performances' && (
                  <div className="flex flex-col gap-8 animate-slideInRight">
                    <div className="flex flex-col">
                      <span className="text-xs text-emerald-600 font-black uppercase tracking-[0.3em] mb-2">Gestion</span>
                      <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Performances</h3>
                    </div>
                    
                    <button onClick={() => setShowAddPerfModal(true)} className="w-full py-6 bg-slate-900 text-white font-black text-xs tracking-[0.2em] uppercase rounded-[2rem] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3">
                      <Trophy size={18} /> Nouvelle Performance
                    </button>

                    <div className="flex flex-col gap-4">
                      {performances.length === 0 ? (
                        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center">
                          <p className="text-slate-400 font-bold text-sm">Aucun record ajouté.</p>
                        </div>
                      ) : (
                        (() => {
                          const grouped = performances.reduce((acc, perf) => {
                            if (!acc[perf.distance]) acc[perf.distance] = [];
                            acc[perf.distance].push(perf);
                            return acc;
                          }, {} as { [key: string]: Performance[] });

                          return Object.entries(grouped).map(([distance, items]) => {
                            const isExpanded = expandedDisciplines.includes(distance);
                            const hasMultiple = items.length > 1;

                            return (
                              <div key={distance} className="flex flex-col gap-2">
                                <button 
                                  onClick={() => hasMultiple && setExpandedDisciplines(prev => prev.includes(distance) ? prev.filter(d => d !== distance) : [...prev, distance])}
                                  className={`flex items-center justify-between p-4 rounded-2xl transition-all ${hasMultiple ? 'hover:bg-slate-50 cursor-pointer' : 'cursor-default'}`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-[10px]">
                                      {items.length}
                                    </div>
                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900">{distance}</h4>
                                  </div>
                                  {hasMultiple && (
                                    <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                  )}
                                </button>

                                <AnimatePresence>
                                  {(!hasMultiple || isExpanded) && (
                                    <motion.div 
                                      initial={hasMultiple ? { height: 0, opacity: 0 } : false}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="flex flex-col gap-2 overflow-hidden px-1"
                                    >
                                      {items.map((perf, i) => (
                                        <div key={perf.id || i} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                                          <div className="flex items-center gap-4">
                                            <div className="flex flex-col">
                                              <span className="font-black text-lg text-slate-900 leading-none">{perf.temps}s</span>
                                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight mt-1 truncate max-w-[150px]">
                                                {perf.competition} • {perf.date}
                                              </span>
                                            </div>
                                          </div>
                                          <button 
                                            onClick={() => handleRemovePerformance(perf.id, i)} 
                                            className="w-9 h-9 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                                          >
                                            <Trash2 size={14} />
                                          </button>
                                        </div>
                                      ))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          });
                        })()
                      )}
                    </div>
                  </div>
                )}

                {profileView === 'links' && (
                  <div className="flex flex-col gap-8 animate-slideInRight">
                    <div className="flex flex-col">
                      <span className="text-xs text-emerald-600 font-black uppercase tracking-[0.3em] mb-2">Gestion</span>
                      <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Liens & Réseaux</h3>
                    </div>

                    <div className="bg-white border border-slate-300 rounded-[2.5rem] p-6 flex flex-col gap-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ajouter un lien</span>
                        {!isPremium && <span className="text-[9px] font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-lg uppercase">{links.length}/3 gratuit</span>}
                      </div>
                      
                      <form onSubmit={handleAddLink} className="flex flex-col gap-4">
                        <input type="text" placeholder="Nom (ex: Instagram)" value={newLinkTitle} onChange={(e) => setNewLinkTitle(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-slate-900 focus:outline-none font-bold text-sm" required />
                        <input type="url" placeholder="https://..." value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-slate-900 focus:outline-none font-bold text-sm" required />
                        {linkError && <p className="text-red-500 text-[10px] font-bold px-1">{linkError}</p>}
                        <button type="submit" disabled={!isPremium && links.length >= 3} className={`w-full py-5 font-black text-xs tracking-widest uppercase rounded-2xl transition-all ${!isPremium && links.length >= 3 ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-slate-900 text-white hover:bg-black shadow-lg"}`}>
                          {!isPremium && links.length >= 3 ? "🔒 Limite atteinte" : "Ajouter au profil"}
                        </button>
                      </form>
                    </div>

                    <div className="flex flex-col gap-3">
                      {links.map((link, i) => (
                        <div key={link.id} className="bg-white border border-slate-200 rounded-3xl p-4 flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-4 truncate">
                            <span className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">{link.icon}</span>
                            <div className="truncate pr-4">
                              <span className="font-black text-sm text-slate-900 block truncate">{link.title}</span>
                              <span className="text-[10px] text-slate-400 font-bold block truncate">{link.url}</span>
                            </div>
                          </div>
                          <button onClick={() => handleRemoveLink(link.id, i)} className="w-10 h-10 text-slate-300 hover:text-red-500 transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {profileView === 'photos' && (
                  <div className="flex flex-col gap-8 animate-slideInRight">
                    <div className="flex flex-col">
                      <span className="text-xs text-emerald-600 font-black uppercase tracking-[0.3em] mb-2">Gestion</span>
                      <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Galerie Photos</h3>
                    </div>

                    <div className="flex flex-col gap-6">
                      {photoGallery.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-6">
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowAddPhotoModal(true)}
                            className="relative w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl overflow-hidden group"
                          >
                            <span className="text-3xl font-light">+</span>
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-25deg] translate-x-[-150%] group-active:translate-x-[150%] transition-transform duration-500 pointer-events-none"></div>
                          </motion.button>
                          <div className="text-center">
                            <p className="text-slate-900 font-black text-sm uppercase tracking-widest">Aucune photo</p>
                            <p className="text-slate-400 text-[10px] font-bold uppercase mt-1">Appuyez sur + pour commencer</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            {photoGallery.map((photo) => (
                              <div 
                                key={photo.id} 
                                onClick={() => setSelectedPhoto(photo)}
                                className="relative group bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm aspect-square cursor-pointer"
                              >
                                <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-end justify-start p-3">
                                  <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl border border-white/30 text-white">
                                    <Eye size={16} />
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                            {/* Small add button in grid */}
                            <motion.button 
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setShowAddPhotoModal(true)}
                              className={`relative aspect-square border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-2 transition-all ${!isPremium && photoGallery.length >= 2 ? "bg-slate-50 border-slate-200 cursor-not-allowed opacity-50" : "bg-white border-slate-300 hover:border-slate-900 group overflow-hidden"}`}
                            >
                              <span className="text-2xl font-light text-slate-400">+</span>
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Ajouter</span>
                              {!isPremium && photoGallery.length >= 2 && <span className="absolute bottom-2 text-[7px] font-black text-slate-900 bg-slate-200 px-2 py-0.5 rounded-full">ELITE REQUIS</span>}
                              
                              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-slate-900/10 to-transparent skew-x-[-25deg] translate-x-[-150%] group-active:translate-x-[150%] transition-transform duration-500 pointer-events-none"></div>
                            </motion.button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {profileView === 'sponsors' && (
                  <div className="flex flex-col gap-8 animate-slideInRight">
                    <div className="flex flex-col">
                      <span className="text-xs text-emerald-600 font-black uppercase tracking-[0.3em] mb-2">Gestion</span>
                      <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Sponsors & Partenaires</h3>
                    </div>

                    <div className="bg-white border border-slate-300 rounded-[2.5rem] p-6 flex flex-col gap-8 shadow-sm">
                      {/* EQUIPEMENTIER SECTION */}
                      <div className="flex flex-col gap-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Équipementier Principal</label>
                        <button
                          type="button"
                          onClick={() => { setModalMode('equipementier'); setShowEquipModal(true); }}
                          className="w-full p-5 bg-slate-50 border-2 border-slate-200 rounded-[2rem] flex items-center justify-between hover:border-slate-900 hover:bg-white transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            {selectedEquip !== "Aucun" && selectedEquip !== "Autre" ? (
                              <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 p-2 flex items-center justify-center">
                                <img 
                                  src={PREDEFINED_EQUIPEMENTIERS.find(e => e.name === selectedEquip)?.logo} 
                                  alt="" 
                                  className="max-w-full max-h-full object-contain"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">
                                {selectedEquip === "Autre" ? "🏢" : "👟"}
                              </div>
                            )}
                            <div className="flex flex-col items-start text-left">
                              <span className="text-slate-900 font-black text-sm">{selectedEquip === "Aucun" ? "Choisir ma marque" : (selectedEquip === "Autre" ? (customEquipName || "Marque personnalisée") : selectedEquip)}</span>
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Équipementier Officiel</span>
                            </div>
                          </div>
                          <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center group-hover:border-slate-900 transition-all">
                            <span className="text-slate-900 text-lg">→</span>
                          </div>
                        </button>
                      </div>

                      {/* PARTENAIRES SECTION */}
                      <div className="flex flex-col gap-4 pt-8 border-t border-slate-100">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Partenaires Officiels</label>
                        <button
                          type="button"
                          onClick={() => { setModalMode('partenaire'); setShowEquipModal(true); }}
                          className="w-full py-5 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[2rem] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3"
                        >
                          <span>+ Ajouter un partenaire</span>
                        </button>

                        <div className="flex flex-col gap-3 mt-4">
                          {sponsors.filter(s => s.category !== "Équipementier").map((sp, i) => (
                            <div key={sp.id} className="bg-slate-50 border border-slate-200 rounded-3xl p-4 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center overflow-hidden p-1">
                                  {sp.logo?.startsWith('http') ? (
                                    <img src={sp.logo} alt="" className="w-full h-full object-contain" />
                                  ) : (
                                    <span className="text-lg">{sp.logo || "🤝"}</span>
                                  )}
                                </div>
                                <span className="font-black text-xs text-slate-900 uppercase tracking-tight">{sp.name}</span>
                              </div>
                              <button onClick={() => handleRemoveSponsor(sp.id, i)} className="text-slate-300 hover:text-red-500 transition-colors">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODALE SELECTION EQUIPEMENTIER */}
        <AnimatePresence>
          {showEquipModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[170] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-white rounded-[2.5rem] p-8 shadow-2xl max-w-2xl w-full flex flex-col gap-6 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex flex-col select-none">
                  <span className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.3em] mb-1">
                    {modalMode === 'equipementier' ? 'Galerie Équipementiers' : 'Galerie Partenaires'}
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                    {modalMode === 'equipementier' ? 'Choisir ma marque' : 'Ajouter un partenaire'}
                  </h3>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-4 gap-4 py-4">
                  {modalMode === 'equipementier' && (
                    <button
                      type="button"
                      onClick={() => { 
                        setSelectedEquip("Aucun"); 
                        setCustomEquipName(""); 
                        setShowEquipModal(false);
                        // Auto-save logic handled via useEffect or manual call
                      }}
                      className={`aspect-square rounded-3xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${selectedEquip === "Aucun" ? "border-slate-900 bg-slate-900 text-white shadow-lg" : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"}`}
                    >
                      <span className="text-2xl font-light">✕</span>
                      <span className="text-[9px] font-black uppercase tracking-tighter">Aucun</span>
                    </button>
                  )}

                  {(modalMode === 'equipementier' ? PREDEFINED_EQUIPEMENTIERS : PREDEFINED_PARTENAIRES).map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={async () => { 
                        if (modalMode === 'equipementier') {
                          setSelectedEquip(item.name);
                          setCustomEquipName("");
                          setShowEquipModal(false);
                          // Trigger auto-save for Equip
                          const newSponsor = { id: Date.now().toString(), name: item.name, logo: item.logo, category: "Équipementier" };
                          const otherSponsors = sponsors.filter(s => s.category !== "Équipementier");
                          const updatedSponsors = [...otherSponsors, newSponsor];
                          await supabase.from("profiles").upsert([{ user_id: userId, username: username || "athlete", sponsors: updatedSponsors }], { onConflict: "user_id" });
                          setSponsors(updatedSponsors);
                        } else {
                          // Trigger add for Partner
                          const newSponsor = { id: Date.now().toString(), name: item.name, logo: item.logo, category: "Partenaire" };
                          const updatedSponsors = [...sponsors, newSponsor];
                          await supabase.from("profiles").upsert([{ user_id: userId, username: username || "athlete", sponsors: updatedSponsors }], { onConflict: "user_id" });
                          setSponsors(updatedSponsors);
                          setShowEquipModal(false);
                        }
                      }}
                      className="group relative aspect-square rounded-3xl border-2 border-slate-100 bg-white hover:border-slate-900 hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center p-4"
                    >
                      <img src={item.logo} alt={item.name} className="max-w-full max-h-full object-contain" />
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => { 
                      setShowEquipModal(false);
                      // In partner mode, we could show an input instead
                      if (modalMode === 'equipementier') setSelectedEquip("Autre");
                    }}
                    className="aspect-square rounded-3xl border-2 border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200 flex flex-col items-center justify-center gap-1 transition-all"
                  >
                    <span className="text-2xl font-light">+</span>
                    <span className="text-[9px] font-black uppercase tracking-tighter">Autre</span>
                  </button>
                </div>

                <button
                  onClick={() => setShowEquipModal(false)}
                  className="w-full py-4 bg-slate-100 text-slate-500 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Fermer
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        
        {/* CROP MODAL */}
        <AnimatePresence>
          {showCropModal && imageToCrop && (
            <motion.div
              initial={{ opacity: 0, filter: "blur(20px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(20px)" }}
              className="fixed inset-0 bg-slate-200 z-[200] flex flex-col items-center justify-center p-6"
            >
              <div className="max-w-2xl w-full flex flex-col gap-8">
                <div className="flex flex-col select-none">
                  <span className="text-xs text-emerald-600 font-black uppercase tracking-[0.3em] mb-2">
                    Recadrage photo
                  </span>
                  <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase">
                    Ajuster l&apos;image
                  </h3>
                </div>

                <div className="relative w-full h-[400px] md:h-[500px] bg-white rounded-3xl overflow-hidden border border-slate-300 shadow-sm">
                  <Cropper
                    image={imageToCrop}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                  />
                </div>

                <div className="w-full flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <span>Niveau de Zoom</span>
                      <span>{(zoom * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.1}
                      aria-labelledby="Zoom"
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        setShowCropModal(false);
                        setImageToCrop(null);
                      }}
                      className="py-4 bg-white border border-slate-300 text-slate-900 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleConfirmCrop}
                      className="py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-black shadow-xl transition-all"
                    >
                      Confirmer le recadrage
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}


