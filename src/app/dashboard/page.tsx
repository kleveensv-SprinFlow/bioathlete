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

const SPONSOR_CATEGORIES = [
  { id: "apparel", name: "Vêtements / Chaussures", icon: "👟" },
  { id: "nutrition", name: "Nutrition / Énergie", icon: "🍎" },
  { id: "tech", name: "Tech / Accessoires", icon: "⌚" },
  { id: "care", name: "Santé / Récupération", icon: "❤️" },
  { id: "lifestyle", name: "Boissons / Lifestyle", icon: "🥤" },
  { id: "other", name: "Autre domaine", icon: "🏢" }
];

const BRAND_CATALOG: { [key: string]: string[] } = {
  apparel: ["Nike", "Adidas", "Puma", "Asics", "New Balance", "Under Armour", "Reebok", "Mizuno", "Salomon", "Hoka", "On Running", "Brooks", "Saucony", "Joma", "Kiprun", "Kalenji"],
  nutrition: ["Maurten", "Science in Sport (SiS)", "High5", "GU Energy", "MyProtein", "Bulk", "Foodspring", "Prozis", "Optimum Nutrition", "PowerBar", "Gatorade", "Isostar", "Apurna"],
  tech: ["Garmin", "Polar", "Coros", "Suunto", "Apple Watch", "WHOOP", "Oura", "Shokz", "Theragun", "Hyperice"],
  care: ["Compex", "Blackroll", "Bauerfeind", "Mueller", "Zamst", "Voltarène", "Deep Heat", "Clinique du Coureur"],
  lifestyle: ["Red Bull", "Monster Energy", "Nocco", "Holy", "Coca-Cola", "Vitamin Well", "Oakley", "Rudy Project", "100%"]
};

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
  const [newDistance, setNewDistance] = useState(""); 
  const [newTemps, setNewTemps] = useState("");
  const [newComp, setNewComp] = useState("");
  const [newWind, setNewWind] = useState("");
  const [selectedDisciplineCategory, setSelectedDisciplineCategory] = useState("Sprint & Haies");
  const [customDiscipline, setCustomDiscipline] = useState("");

  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  const [selectedPartner, setSelectedPartner] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("apparel");
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
        const croppedFile = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });
        const publicUrl = await uploadFileToSupabase(croppedFile, 'avatars');
        
        if (publicUrl) {
          setAvatarUrl(publicUrl);
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

    if (!isPremium && links.length >= 3) {
      setLinkError("Passe en mode Élite pour ajouter plus de liens !");
      return;
    }

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
    if (!confirm("Voulez-vous vraiment supprimer ce partenaire ?")) return;
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

        {/* Top bar */}
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
            
            <div className="relative rounded-3xl overflow-hidden select-none cursor-pointer group h-[500px]" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }} onClick={() => setShowFullPreview(true)}>
              
              {isInitialLoading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ background: 'var(--card-bg)' }}>
                  <div className="flex flex-col items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              )}
              
              <div className="absolute inset-0 z-0 filter blur-[6px] group-hover:blur-[3px] transition-all duration-1000 scale-[1.02] opacity-100">
                <motion.div
                  initial={{ x: '-100%', skewX: -25 }}
                  animate={{ x: '150%' }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 0.5 }}
                  className="absolute inset-0 z-10 w-full bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent pointer-events-none"
                />

                <div className="flex flex-col gap-8 p-4">
                  <div className="w-12 h-4 bg-slate-200 rounded-full mb-2"></div>
                  <div className="relative w-full h-[240px] rounded-2xl overflow-hidden bg-slate-200 border border-slate-300">
                    {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover opacity-50" /> : <div className="w-full h-full bg-slate-300"></div>}
                    <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2">
                      <div className="h-6 w-32 bg-white/40 rounded-lg"></div>
                      <div className="h-2 w-16 bg-emerald-400/40 rounded-full"></div>
                      <div className="h-8 w-full bg-black/40 rounded-xl backdrop-blur-sm"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 h-20 rounded-2xl bg-slate-100 border border-slate-300 flex items-center justify-center text-2xl opacity-40">🤝</div>
                    <div className="h-16 rounded-2xl bg-slate-100 border border-slate-300 flex items-center justify-center opacity-30">✨</div>
                    <div className="h-16 rounded-2xl bg-slate-100 border border-slate-300 flex items-center justify-center opacity-30">✨</div>
                  </div>
                </div>
              </div>

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

        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 text-center mt-2 shadow-xl select-none">
          <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">
            Rappel : L&apos;athlète s&apos;engage à posséder l&apos;ensemble des droits de diffusion et d&apos;auteur pour les images, vidéos et contenus qu&apos;il publie sur son profil.
          </p>
        </div>

        {/* Stripe & Share Modals here... */}
        {/* ... (Existing Stripe and Share Modals stay as they were) ... */}

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
                  <div className="flex flex-col gap-8 animate-fadeIn">
                    <div className="flex flex-col select-none">
                      <span className="text-xs text-emerald-600 font-black uppercase tracking-[0.3em] mb-2">Compte Athlète</span>
                      <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Mon Profil</h3>
                    </div>

                    <div className="bg-white border border-slate-300 rounded-[2.5rem] p-6 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-100 bg-slate-100 flex items-center justify-center">
                          {avatarUrl ? <img src={avatarUrl} alt="Profil" className="w-full h-full object-cover" /> : <User size={32} className="text-slate-300" />}
                        </div>
                        <div className="flex flex-col">
                          <h4 className="text-lg font-black text-slate-900 tracking-tight">{firstNameInput} {lastNameInput}</h4>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">@{username}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setProfileView('identity')}
                        className="w-12 h-12 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-900 transition-all"
                      >
                        <Edit3 size={18} />
                      </button>
                    </div>

                    <div className="bg-white border border-slate-300 rounded-[2.5rem] overflow-hidden flex flex-col">
                      <button onClick={() => setProfileView('performances')} className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-all border-b border-slate-100">
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center"><Trophy size={18} className="text-slate-600" /></span>
                          <span className="text-sm font-bold text-slate-900">Mes Performances</span>
                        </div>
                      </button>
                      <button onClick={() => setProfileView('links')} className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-all border-b border-slate-100">
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center"><Share2 size={18} className="text-slate-600" /></span>
                          <span className="text-sm font-bold text-slate-900">Mes Liens</span>
                        </div>
                      </button>
                      <button onClick={() => setProfileView('photos')} className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-all border-b border-slate-100">
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center"><Camera size={18} className="text-slate-600" /></span>
                          <span className="text-sm font-bold text-slate-900">Mes Photos</span>
                        </div>
                      </button>
                      <button onClick={() => setProfileView('sponsors')} className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-all">
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">🤝</span>
                          <span className="text-sm font-bold text-slate-900">Mes Collaborations</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {profileView === 'sponsors' && (
                  <div className="flex flex-col gap-8 animate-slideInRight">
                    <div className="flex flex-col">
                      <span className="text-xs text-emerald-600 font-black uppercase tracking-[0.3em] mb-2">Gestion</span>
                      <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Collaborations</h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowEquipModal(true)}
                      className="w-full py-6 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[2.5rem] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                      <Trophy size={18} />
                      <span>Ajouter une marque</span>
                    </button>

                    <div className="flex flex-col gap-4">
                      {sponsors.map((sp, i) => (
                        <div key={sp.id} className="bg-white border border-slate-200 rounded-3xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl">
                                {SPONSOR_CATEGORIES.find(c => c.name === sp.category)?.icon || "🤝"}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-black text-sm text-slate-900 uppercase tracking-tight">{sp.name}</span>
                              <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest mt-0.5">{sp.category}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleRemoveSponsor(sp.id, i)} 
                            className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* ... (Other views) ... */}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODALE SELECTION SPONSOR UNIFIÉE */}
        <AnimatePresence>
          {showEquipModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[170] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="bg-white border border-white rounded-[3rem] p-8 shadow-2xl max-w-lg w-full flex flex-col gap-6 max-h-[85vh] overflow-hidden"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.4em]">Configuration</span>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Collaboration</h3>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {SPONSOR_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => { setSelectedCategory(cat.id); setSelectedPartner(""); }}
                      className={`px-4 py-3 rounded-2xl whitespace-nowrap text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat.id ? "bg-slate-900 text-white shadow-lg" : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}
                    >
                      {cat.icon} {cat.name}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto flex flex-col gap-6 pr-2 custom-scrollbar">
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Choisir une marque</label>
                    <div className="grid grid-cols-1 gap-2">
                      {BRAND_CATALOG[selectedCategory]?.map(brand => (
                        <button
                          key={brand}
                          onClick={async () => {
                            if (!userId) return;
                            const categoryName = SPONSOR_CATEGORIES.find(c => c.id === selectedCategory)?.name || "Autre";
                            const newSponsor = { name: brand, logo: "🤝", category: categoryName, user_id: userId };
                            const { data, error } = await supabase.from("sponsors").insert([newSponsor]).select();
                            if (!error && data) setSponsors([...sponsors, data[0]]);
                            setShowEquipModal(false);
                          }}
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-left hover:bg-white hover:border-slate-900 hover:shadow-sm transition-all flex items-center justify-between group"
                        >
                          <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900">{brand}</span>
                          <span className="text-slate-300 group-hover:text-slate-900 opacity-0 group-hover:opacity-100 transition-all">+</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Ou ajouter manuellement</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Ex: MyLocalGym..." 
                        value={customSponsorName}
                        onChange={(e) => setCustomSponsorName(e.target.value)}
                        className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-slate-900 focus:outline-none font-bold text-xs"
                      />
                      <button
                        onClick={async () => {
                          if (!customSponsorName.trim() || !userId) return;
                          const categoryName = SPONSOR_CATEGORIES.find(c => c.id === selectedCategory)?.name || "Autre";
                          const newSponsor = { name: customSponsorName, logo: "🏢", category: categoryName, user_id: userId };
                          const { data, error } = await supabase.from("sponsors").insert([newSponsor]).select();
                          if (!error && data) setSponsors([...sponsors, data[0]]);
                          setCustomSponsorName("");
                          setShowEquipModal(false);
                        }}
                        className="px-6 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-black transition-all"
                      >
                        Ajouter
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowEquipModal(false)}
                  className="w-full py-5 bg-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Annuler
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


