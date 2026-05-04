const fs = require('fs');
const file = 'src/app/u/[username]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const replacement = `<div id="performances" className="w-full"></div>
        {Object.keys(processedPerformances).length > 0 && selectedDiscipline && processedPerformances[selectedDiscipline] && (
          <motion.div variants={staggerItem} className="w-full flex flex-col gap-6 select-none">
            {/* TABS FOR DISCIPLINES */}
            <div className="w-full overflow-x-auto pb-2 scrollbar-none snap-x">
              <div className="flex gap-2">
                {Object.keys(processedPerformances).map((disc) => (
                  <button
                    key={disc}
                    onClick={() => setSelectedDiscipline(disc)}
                    className={\`snap-center px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-300 \${
                      selectedDiscipline === disc
                        ? "bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/30 shadow-[0_0_15px_rgba(0,255,136,0.15)]"
                        : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
                    }\`}
                  >
                    {disc}
                  </button>
                ))}
              </div>
            </div>

            {/* PB CARD */}
            <motion.div
              key={selectedDiscipline}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00FF88] to-transparent opacity-50"></div>

              <div className="text-[#00FF88] font-black text-xs tracking-widest uppercase mb-2">Record Personnel</div>

              <div className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tighter drop-shadow-md">
                {processedPerformances[selectedDiscipline].bestRecord.temps}
                <span className="text-2xl md:text-3xl text-gray-500">s</span>
              </div>

              <div className="mt-4 flex flex-col items-center gap-1 text-center">
                <div className="flex items-center gap-2 bg-[#00FF88]/10 border border-[#00FF88]/20 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse"></span>
                  <span className="text-[#00FF88] text-[10px] font-bold tracking-widest">
                    {processedPerformances[selectedDiscipline].improvementPercentage} D'ÉVOLUTION
                  </span>
                </div>

                {processedPerformances[selectedDiscipline].bestRecord.competition && (
                  <div className="text-gray-400 text-xs font-medium uppercase tracking-wider mt-2">
                    {processedPerformances[selectedDiscipline].bestRecord.competition}
                  </div>
                )}
                <div className="text-gray-500 text-[10px] mt-1">
                  {new Date(processedPerformances[selectedDiscipline].bestRecord.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}
                </div>
              </div>
            </motion.div>

            {/* CHART */}
            <motion.div
              key={\`chart-\${selectedDiscipline}\`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="w-full h-[200px] mt-2 relative"
            >
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={processedPerformances[selectedDiscipline].records.map(r => ({
                      ...r,
                      tempsVal: parseFloat(r.temps.toString())
                    }))}
                  >
                    <Tooltip
                      contentStyle={{ background: '#0a0a0a', border: '1px solid #1f1f1f', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                      labelStyle={{ color: '#888888', fontSize: 10, textTransform: 'uppercase', marginBottom: '4px' }}
                      itemStyle={{ color: '#00FF88', fontSize: 14, fontWeight: '900' }}
                      formatter={(value) => [\`\${value}s\`, 'Chrono']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                    />
                    <Area
                      type="monotone"
                      dataKey="tempsVal"
                      stroke="#00FF88"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#glow-gradient)"
                      activeDot={{ r: 6, fill: '#00FF88', stroke: '#000000', strokeWidth: 3 }}
                      dot={processedPerformances[selectedDiscipline].records.length === 1 ? { r: 6, fill: '#00FF88', stroke: '#000000', strokeWidth: 3 } : false}
                      isAnimationActive={true}
                    />
                    <defs>
                      <linearGradient id="glow-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00FF88" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#00FF88" stopOpacity={0.0} />
                      </linearGradient>
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          </motion.div>
        )}`;

code = code.replace(/<div id="performances" className="w-full"><\/div>\s*\{records\.length > 0 && \([\s\S]*?<\/AreaChart>\s*<\/ResponsiveContainer>\s*\)\}\s*<\/div>\s*<\/motion\.div>\s*\)\}/, replacement);

fs.writeFileSync(file, code);
