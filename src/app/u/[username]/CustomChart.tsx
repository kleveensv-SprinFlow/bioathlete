import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PerformanceRaw } from './page';

interface Props {
  records: PerformanceRaw[];
}

export function Custom3DChart({ records }: Props) {
  const data = useMemo(() => {
    return records.map(r => ({
      ...r,
      tempsVal: parseFloat(r.temps.toString()),
      dateObj: new Date(r.date)
    })).sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  }, [records]);

  const { minTime, maxTime, timeRange } = useMemo(() => {
    if (data.length === 0) return { minTime: 0, maxTime: 0, timeRange: 1 };
    const times = data.map(d => d.tempsVal);
    const min = Math.min(...times);
    const max = Math.max(...times);
    // Add some padding to min and max so chart doesn't hit the very edges
    const range = (max - min) || 1; // avoid division by 0
    return {
      minTime: min - range * 0.2,
      maxTime: max + range * 0.2,
      timeRange: range * 1.4
    };
  }, [data]);

  if (data.length < 2) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center text-slate-400 text-xs uppercase tracking-widest font-bold">
        Pas assez de données pour la courbe
      </div>
    );
  }

  // Define canvas dimensions
  const width = 800;
  const height = 300;

  // Points generation
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    // Invert Y axis: lower time = higher on chart (better performance usually)
    // Adjust if user wants it differently, but usually for racing lower time is better
    // Actually, usually charts show lower time at bottom. Let's do lower time at bottom
    // so y = height means minTime, y = 0 means maxTime
    // Therefore y = ((tempsVal - minTime) / timeRange) * height
    // So if temps is high, y is close to height. Let's do higher time is lower on screen
    // y = height - ((tempsVal - minTime) / timeRange) * height
    const normalizedY = (d.tempsVal - minTime) / timeRange;
    const y = height - (normalizedY * height);
    return { x, y, d };
  });

  // SVG Path generator (straight lines for exact points, or curved)
  const pathD = points.reduce((acc, point, i) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    // Simple cubic bezier for curve
    const prevPoint = points[i - 1];
    const cp1x = prevPoint.x + (point.x - prevPoint.x) / 2;
    const cp1y = prevPoint.y;
    const cp2x = prevPoint.x + (point.x - prevPoint.x) / 2;
    const cp2y = point.y;
    return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${point.x},${point.y}`;
  }, "");

  const draw: any = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { type: "spring" as const, duration: 2, bounce: 0 },
        opacity: { duration: 0.1 }
      }
    }
  };

  return (
    <div className="w-full h-[400px] mt-8 relative perspective-1000 flex items-center justify-center">
      <motion.div
        className="w-full h-full relative"
        initial={{ rotateX: 45, opacity: 0, y: 50, scale: 0.9 }}
        whileInView={{ rotateX: 20, opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          style={{ filter: "drop-shadow(0px 20px 10px rgba(0,0,0,0.1))" }}
        >
          {/* Grid lines behind */}
          <line x1="0" y1={height * 0.25} x2={width} y2={height * 0.25} stroke="#cbd5e1" strokeDasharray="4 4" strokeWidth="1" opacity="0.5"/>
          <line x1="0" y1={height * 0.5} x2={width} y2={height * 0.5} stroke="#cbd5e1" strokeDasharray="4 4" strokeWidth="1" opacity="0.5"/>
          <line x1="0" y1={height * 0.75} x2={width} y2={height * 0.75} stroke="#cbd5e1" strokeDasharray="4 4" strokeWidth="1" opacity="0.5"/>

          {/* Glow Line */}
          <motion.path
            d={pathD}
            fill="none"
            stroke="#10b981"
            strokeWidth="10"
            opacity="0.2"
            variants={draw}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-20%" }}
            style={{ filter: "blur(8px)" }}
          />

          {/* Main Line */}
          <motion.path
            d={pathD}
            fill="none"
            stroke="#0f172a"
            strokeWidth="4"
            variants={draw}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-20%" }}
          />

          {/* Points */}
          {points.map((p, i) => (
            <motion.g
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + (i * 0.1), type: "spring" }}
              viewport={{ once: true }}
            >
              <circle cx={p.x} cy={p.y} r="6" fill="#10b981" stroke="#ffffff" strokeWidth="3" />

              {/* Tooltip / Label */}
              <foreignObject x={p.x - 75} y={p.y - 70} width="150" height="60" className="overflow-visible">
                <div className="flex flex-col items-center justify-end h-full">
                  <div className="bg-slate-900 text-white text-[10px] px-3 py-1.5 rounded-lg shadow-xl font-bold uppercase tracking-widest text-center relative border border-slate-700">
                    <div className="text-emerald-400 text-sm mb-0.5">{p.d.tempsVal}s</div>
                    <div className="text-slate-400 text-[8px] whitespace-nowrap">{new Date(p.d.date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}</div>
                    {p.d.competition && (
                      <div className="text-white text-[8px] truncate max-w-[120px] opacity-80 mt-0.5">{p.d.competition}</div>
                    )}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-b border-r border-slate-700 rotate-45"></div>
                  </div>
                </div>
              </foreignObject>
            </motion.g>
          ))}
        </svg>
      </motion.div>
    </div>
  );
}
