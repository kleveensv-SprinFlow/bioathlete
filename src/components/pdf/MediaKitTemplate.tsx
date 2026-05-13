import React from 'react';
import { Award, Link as LinkIcon, Globe, Mail, Phone, Heart } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface MediaKitTemplateProps {
  profileData: {
    fullName: string;
    bio: string;
    avatarUrl: string;
    email: string;
    phone: string;
  };
  socialLinks: any[];
  records: any[];
  sponsors: any[];
}

export function MediaKitTemplate({ profileData, socialLinks, records, sponsors }: MediaKitTemplateProps) {
  const getIconForUrl = (url: string) => {
    if (url.includes('instagram.com')) return <Globe className="text-pink-500" />;
    if (url.includes('youtube.com') || url.includes('youtu.be')) return <Globe className="text-red-500" />;
    if (url.includes('twitter.com') || url.includes('x.com')) return <Globe className="text-blue-400" />;
    if (url.includes('facebook.com')) return <Globe className="text-blue-600" />;
    if (url.includes('tiktok.com')) return <span className="font-bold text-[10px]">TikTok</span>;
    return <LinkIcon className="text-emerald-400" />;
  };

  // Group records by distance/discipline
  const disciplines: { [key: string]: any[] } = {};
  records.forEach(rec => {
    if (!disciplines[rec.distance]) {
      disciplines[rec.distance] = [];
    }
    disciplines[rec.distance].push({
      date: rec.date || 'Inconnu',
      temps: parseFloat(rec.temps),
      competition: rec.competition
    });
  });

  // Sort each discipline by date/value to make a clean chart if possible
  Object.keys(disciplines).forEach(key => {
    disciplines[key].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  return (
    <div 
      id="media-kit-pdf-template" 
      className="bg-[#09090b] text-white overflow-hidden flex flex-col font-sans relative"
      style={{ width: '794px', minHeight: '1123px', padding: '40px' }}
    >
      {/* Fond décoratif */}
      <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* HEADER : Photo + Nom + Bio */}
      <div className="flex flex-col items-center text-center gap-6 mb-10 relative z-10 mt-6">
        <div className="w-[150px] h-[150px] rounded-full overflow-hidden border-4 border-zinc-800 shadow-2xl relative">
          {profileData.avatarUrl ? (
            <img src={profileData.avatarUrl} crossOrigin="anonymous" alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-5xl font-black text-zinc-600">
              {profileData.fullName.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-[48px] font-black uppercase tracking-tighter leading-none mb-4">
            {profileData.fullName}
          </h1>
          {profileData.bio && (
            <p className="text-zinc-400 text-[16px] max-w-[600px] mx-auto leading-relaxed">
              {profileData.bio}
            </p>
          )}
        </div>
      </div>

      {/* CONTACT */}
      <div className="flex justify-center gap-8 mb-12 relative z-10 border-y border-zinc-800 py-4">
        {profileData.email && (
          <div className="flex items-center gap-2 text-zinc-300">
            <Mail size={16} className="text-emerald-400" />
            <span className="text-[14px] font-medium">{profileData.email}</span>
          </div>
        )}
        {profileData.phone && (
          <div className="flex items-center gap-2 text-zinc-300">
            <Phone size={16} className="text-emerald-400" />
            <span className="text-[14px] font-medium">{profileData.phone}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-8 relative z-10 flex-grow">
        {/* PALMARÈS / RECORDS */}
        <div className="flex flex-col">
          <h2 className="text-[16px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-6 flex items-center gap-3">
            <Award size={20} /> Évolution & Palmarès
          </h2>
          <div className="flex flex-col gap-6">
            {Object.keys(disciplines).length > 0 ? Object.keys(disciplines).map((dist, i) => {
              const perfs = disciplines[dist];
              return (
                <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4">
                  <h3 className="text-[14px] font-black text-white">{dist}</h3>
                  {perfs.length === 1 ? (
                    <div className="flex justify-between items-center bg-zinc-950 p-4 rounded-xl border border-zinc-800/50">
                      <span className="text-[12px] font-medium text-zinc-500">{perfs[0].competition || 'Performance unique'}</span>
                      <div className="text-[24px] font-black text-emerald-400 tracking-tighter">
                        {perfs[0].temps}<span className="text-[14px] text-zinc-500 ml-1">s</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[120px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={perfs} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id={`colorPerf${i}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                          <XAxis dataKey="competition" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#71717a'}} />
                          <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#71717a'}} />
                          <Area type="monotone" dataKey="temps" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill={`url(#colorPerf${i})`} isAnimationActive={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              );
            }) : (
              <div className="text-zinc-500 text-sm italic">Aucun record enregistré.</div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-10">
          {/* SPONSORS */}
          <div className="flex flex-col">
            <h2 className="text-[16px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-6 flex items-center gap-3">
              <Heart size={20} /> Partenaires & Sponsors
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {sponsors && sponsors.length > 0 ? sponsors.map((sp, i) => (
                <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center gap-2 aspect-video text-center">
                  {sp.logo ? (
                    <img src={sp.logo} crossOrigin="anonymous" alt={sp.name} className="max-h-12 max-w-[80%] object-contain" />
                  ) : (
                    <span className="text-[14px] font-black text-white">{sp.name}</span>
                  )}
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{sp.category || 'Sponsor'}</span>
                </div>
              )) : (
                <div className="text-zinc-500 text-sm italic col-span-2">À la recherche de partenaires.</div>
              )}
            </div>
          </div>

          {/* RÉSEAUX SOCIAUX */}
          <div className="flex flex-col">
            <h2 className="text-[16px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-6 flex items-center gap-3">
              <Globe size={20} /> Présence en Ligne
            </h2>
            <div className="flex flex-col gap-3">
              {socialLinks && socialLinks.length > 0 ? socialLinks.slice(0, 5).map((link, i) => (
                <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                    {getIconForUrl(link.url)}
                  </div>
                  <div className="flex flex-col overflow-hidden w-full">
                    <span className="text-[14px] font-bold text-white truncate">{link.title || 'Lien'}</span>
                    <span className="text-[10px] text-zinc-500 truncate">{link.url.replace(/^https?:\/\//, '')}</span>
                  </div>
                </div>
              )) : (
                <div className="text-zinc-500 text-sm italic">Aucun lien enregistré.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER PDF */}
      <div className="mt-8 text-center border-t border-zinc-800 pt-6">
        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.4em]">
          BioAthlete Media Kit • {new Date().getFullYear()}
        </p>
      </div>

    </div>
  );
}
