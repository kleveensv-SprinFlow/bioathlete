import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  LabelList
} from 'recharts';
import { PerformanceRaw } from '@/types';

interface Props {
  records: PerformanceRaw[];
  isEmbedded?: boolean;
}

const CustomLabel = (props: any) => {
  const { x, y, value, index, data } = props;
  const currentData = data[index];
  const delta = currentData.delta;

  return (
    <g style={{ pointerEvents: 'none' }}>
      {/* Badge Chrono Principal */}
      <rect x={x - 22} y={y - 35} width="44" height="22" rx="11" fill="rgba(0,255,136,0.1)" stroke="rgba(0,255,136,0.2)" strokeWidth="0.5" />
      <text x={x} y={y - 20} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="900">
        {value}s
      </text>

      {/* Badge Evolution (Delta) - Affiché si ce n'est pas le premier point */}
      {delta && (
        <g>
          <rect 
            x={x - 45} 
            y={y + 12} 
            width="36" 
            height="16" 
            rx="8" 
            fill={parseFloat(delta) <= 0 ? "#10b981" : "#ef4444"} 
            fillOpacity="0.1" 
            stroke={parseFloat(delta) <= 0 ? "#10b981" : "#ef4444"} 
            strokeWidth="1"
          />
          <text 
            x={x - 27} 
            y={y + 23} 
            textAnchor="middle" 
            fill={parseFloat(delta) <= 0 ? "#059669" : "#dc2626"} 
            fontSize="8" 
            fontWeight="900"
          >
            {delta}s
          </text>
        </g>
      )}
    </g>
  );
};

export function Custom3DChart({ records, isEmbedded = false }: Props) {
  const data = useMemo(() => {
    const sorted = [...records]
      .map(r => ({
        ...r,
        tempsVal: parseFloat(r.temps.toString()),
        dateObj: new Date(r.date)
      }))
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

    return sorted.map((r, index) => {
      let delta = null;
      if (index > 0) {
        const diff = r.tempsVal - sorted[index - 1].tempsVal;
        delta = diff.toFixed(2);
      }
      return {
        ...r,
        tempsVal: r.tempsVal,
        delta: delta ? (parseFloat(delta) > 0 ? `+${delta}` : delta) : null,
        formattedDate: new Date(r.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      };
    });
  }, [records]);

  const { minTime, maxTime } = useMemo(() => {
    if (data.length === 0) return { minTime: 0, maxTime: 0 };
    const times = data.map(d => d.tempsVal);
    const min = Math.min(...times);
    const max = Math.max(...times);
    const margin = (max - min) * 0.5 || 0.3;
    return {
      minTime: min - margin,
      maxTime: max + margin
    };
  }, [data]);

  if (data.length < 2) {
    return null; // Don't show empty chart if embedded
  }

  const totalGain = (data[data.length - 1].tempsVal - data[0].tempsVal).toFixed(2);

  const containerClasses = isEmbedded 
    ? "w-full pointer-events-none" 
    : "w-full glass-card rounded-[2.5rem] p-6 md:p-10 mt-8 relative overflow-hidden pointer-events-none";

  return (
    <motion.div 
      initial={!isEmbedded ? { opacity: 0, y: 20 } : {}}
      whileInView={!isEmbedded ? { opacity: 1, y: 0 } : {}}
      viewport={{ once: true }}
      className={containerClasses}
    >
      <div className="flex justify-between items-start mb-16">
        <h3 className="text-xl font-black text-white/80 uppercase tracking-tighter leading-none px-2">Analyse de Progression</h3>
        <div className={`px-4 py-2 rounded-xl flex flex-col items-end ${parseFloat(totalGain) <= 0 ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
          <span className={`${parseFloat(totalGain) <= 0 ? "text-emerald-600" : "text-red-600"} text-[10px] font-black uppercase tracking-widest`}>
            {parseFloat(totalGain) <= 0 ? "Gain" : "Recul"} : {totalGain}s
          </span>
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 50, right: 50, left: 50, bottom: 20 }}>
            <defs>
              <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
            <XAxis 
              dataKey="formattedDate" 
              axisLine={false} 
              tickLine={false} 
              tick={{fontSize: 9, fill: 'rgba(255,255,255,0.25)', fontWeight: 800}} 
              dy={15}
            />
            <YAxis 
              domain={[minTime, maxTime]} 
              hide={true}
              reversed={true}
            />
            <Area 
              type="monotone" 
              dataKey="tempsVal" 
              stroke="#10b981" 
              strokeWidth={5} 
              fillOpacity={1} 
              fill="url(#colorPerf)" 
              animationDuration={2000}
              isAnimationActive={true}
              dot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 3 }}
              activeDot={false}
            >
              <LabelList content={<CustomLabel data={data} />} />
            </Area>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {!isEmbedded && (
        <div className="mt-8 flex justify-between items-center px-2">
          <div className="flex gap-8">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Départ</span>
              <span className="text-sm font-black text-white/70">{data[0].tempsVal}s</span>
            </div>
            <div className="w-px h-10 bg-white/10"></div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Record Actuel</span>
              <span className="text-sm font-black text-white/70">{data[data.length-1].tempsVal}s</span>
            </div>
          </div>
          <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest italic">
            {data.length} Performances
          </div>
        </div>
      )}
    </motion.div>
  );
}
