'use client'
import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, MousePointer2, Share2, Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function AnalyticsPage() {
  const [totalViews, setTotalViews] = useState<number | string>('...');

  useEffect(() => {
    async function fetchTotalViews() {
      try {
        const { count, error } = await supabase
          .from('profile_views')
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.error('Erreur lors de la récupération des vues:', error);
          setTotalViews(0);
        } else {
          setTotalViews(count || 0);
        }
      } catch (err) {
        console.error('Erreur:', err);
        setTotalViews(0);
      }
    }
    fetchTotalViews();
  }, []);

  const stats = [
    { label: 'Vues Totales', value: totalViews, icon: Users },
    { label: 'Taux de Clic', value: '12.4%', icon: MousePointer2 },
    { label: 'Partages', value: '48', icon: Share2 },
    { label: 'Croissance', value: '+15%', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-6 sm:p-12 font-sans selection:bg-emerald-500/30">
      
      {/* En-tête */}
      <header className="mb-12 max-w-6xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center text-sm text-zinc-400 hover:text-emerald-400 transition-colors mb-6 group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Retour au Dashboard
        </Link>
        
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Media Kit <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Analytics</span>
        </h1>
        <p className="text-zinc-400 mt-4 text-lg max-w-2xl">
          Suivez votre influence en temps réel et préparez vos dossiers pour les sponsors.
        </p>
      </header>

      {/* Grille de stats (Glassmorphism BioAthlete) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {stats.map((stat, i) => (
          <div key={i} className="relative group overflow-hidden rounded-3xl bg-zinc-900/50 border border-zinc-800/50 p-6 backdrop-blur-xl hover:border-emerald-500/30 transition-colors duration-300">
            {/* Lueur au survol */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-zinc-500 bg-zinc-900 px-2 py-1 rounded-full border border-zinc-800">30 jours</span>
              </div>
              <div className="text-3xl font-bold text-zinc-50 mb-1">{stat.value}</div>
              <div className="text-sm font-medium text-zinc-400">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Zone Premium "Export PDF" */}
      <div className="mt-12 max-w-6xl mx-auto relative overflow-hidden rounded-[2.5rem] bg-zinc-900/30 border border-zinc-800/50 p-8 sm:p-12 text-center backdrop-blur-md flex flex-col items-center">
        {/* Décoration d'arrière-plan */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-emerald-400 mb-6 inline-flex relative z-10 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
          <Download className="w-8 h-8" />
        </div>
        
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-50 mb-4 relative z-10">Générez votre Media Kit PDF</h2>
        <p className="text-zinc-400 text-base max-w-xl mx-auto mb-8 relative z-10">
          Prouvez votre valeur aux sponsors avec un document professionnel généré automatiquement. Il inclut vos audiences vérifiées, votre biographie et vos meilleurs liens.
        </p>
        
        <button className="relative z-10 group flex items-center justify-center gap-2 px-8 py-3.5 bg-zinc-50 text-zinc-950 font-bold rounded-full hover:bg-emerald-400 hover:text-zinc-950 transition-all duration-300 transform hover:scale-105 shadow-xl">
          Déverrouiller avec BioAthlete PRO
        </button>
      </div>
    </div>
  );
}
