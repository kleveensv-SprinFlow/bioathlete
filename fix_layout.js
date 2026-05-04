const fs = require('fs');
const file = 'src/app/u/[username]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Logo on mobile: We need it absolute top left, but on desktop in the left column.
// We can modify the left column class to be hidden on mobile, and add the bottom bar for mobile.
// Also add the absolute logo for mobile in the right column (which is the main container on mobile).

// Modify the left column
code = code.replace(
  'className="w-full md:w-1/3 md:sticky md:top-0 md:h-screen flex flex-col justify-between p-8 md:p-12 border-b md:border-b-0 md:border-r border-white/5 bg-black/40 backdrop-blur-md z-20"',
  'className="hidden md:flex w-full md:w-1/3 md:sticky md:top-0 md:h-screen flex-col justify-between p-8 md:p-12 border-b md:border-b-0 md:border-r border-white/5 bg-black/40 backdrop-blur-md z-20"'
);

// Add mobile bottom bar and top left logo
const bottomBar = `
        {/* MOBILE NAVIGATION BAR (Bottom Sticky) */}
        <div className="md:hidden fixed bottom-0 left-0 w-full z-50 p-4 select-none pb-safe">
          <div className="w-full backdrop-blur-2xl bg-black/60 border border-white/10 rounded-2xl flex items-center justify-around p-3 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
            <a href="#performances" className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#00FF88] transition-colors">
              <span className="text-xl">⏱️</span>
              <span className="text-[9px] font-black uppercase tracking-wider">Perfs</span>
            </a>
            <a href="#sponsors" className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#00FF88] transition-colors">
              <span className="text-xl">🤝</span>
              <span className="text-[9px] font-black uppercase tracking-wider">Sponsors</span>
            </a>
            <a href="#medias" className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#00FF88] transition-colors">
              <span className="text-xl">📸</span>
              <span className="text-[9px] font-black uppercase tracking-wider">Médias</span>
            </a>
            <div className="w-[1px] h-8 bg-white/10 mx-1"></div>
            <div className="flex gap-2">
              {links.slice(0, 2).map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm hover:bg-white/20 hover:text-[#00FF88] transition-colors"
                >
                  {link.icon || "🔗"}
                </a>
              ))}
            </div>
          </div>
        </div>
`;

// Insert the bottom bar right before the closing of the main layout div
code = code.replace(
  '      </motion.div>\n      </div>\n    </div>\n  );\n}',
  `${bottomBar}\n      </motion.div>\n      </div>\n    </div>\n  );\n}`
);

// Add absolute logo for mobile in the right column (which is w-full on mobile)
code = code.replace(
  '{/* HERO SECTION */}',
  `{/* MOBILE TOP LEFT LOGO */}
        <div className="md:hidden absolute top-6 left-6 z-50 pointer-events-none">
          <img
            src="https://vhbwfqqvsudznnfoqyjm.supabase.co/storage/v1/object/public/Logo/bioathlete_logo_transparent.png"
            alt="BioAthlete Logo"
            className="h-8 object-contain brightness-0 invert drop-shadow-md"
          />
        </div>

        {/* HERO SECTION */}`
);

fs.writeFileSync(file, code);
