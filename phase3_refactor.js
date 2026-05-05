const fs = require('fs');
const file = 'src/app/u/[username]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Remove Left Column
const leftColStart = '{/* COLONNE DE GAUCHE */}';
const leftColEndMatch = code.indexOf('</motion.div>', code.indexOf(leftColStart));
if (leftColStart !== -1 && leftColEndMatch !== -1) {
    code = code.substring(0, code.indexOf(leftColStart)) + code.substring(leftColEndMatch + 13);
}

// 2. Adjust main containers to be centered max-w-4xl
code = code.replace(
  '<div className="relative z-10 flex flex-col md:flex-row min-h-screen w-full max-w-[1400px] mx-auto">',
  '<div className="relative z-10 flex flex-col items-center min-h-screen w-full max-w-4xl mx-auto px-4 md:px-8">'
);

code = code.replace(
  '        {/* COLONNE DE DROITE */}\n        <motion.div\n          variants={staggerContainer}\n          initial="hidden"\n          animate="show"\n          className="w-full md:w-2/3 flex flex-col gap-12 pb-24 select-none"\n        >',
  `        {/* CONTENU PRINCIPAL */}\n        <motion.div\n          variants={staggerContainer}\n          initial="hidden"\n          animate="show"\n          className="w-full flex flex-col gap-16 pb-32 pt-8 select-none"\n        >`
);

// 3. Remove bottom bar (starts with {/* MOBILE NAVIGATION BAR)
const bottomBarStart = '{/* MOBILE NAVIGATION BAR (Bottom Sticky) */}';
const bottomBarEnd = '</div>\n        </div>';
const startIdx = code.indexOf(bottomBarStart);
if (startIdx !== -1) {
    const endIdx = code.indexOf(bottomBarEnd, startIdx);
    if (endIdx !== -1) {
        code = code.substring(0, startIdx) + code.substring(endIdx + bottomBarEnd.length);
    }
}

// 4. Update absolute logo
code = code.replace(
  '<div className="md:hidden absolute top-6 left-6 z-50 pointer-events-none">',
  '<div className="absolute top-6 left-6 z-50 pointer-events-none">'
);

// 5. Add social links under bio
const searchBio = '{profileData.bio || "Athlète passionné visant l\'excellence sur les pistes nationales et internationales."}\n            </p>\n          </div>';
const socialLinksHtml = `
            {links.length > 0 && (
              <div className="flex gap-3 mt-4">
                {links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-lg hover:bg-white/20 hover:border-[#00FF88]/50 hover:text-[#00FF88] transition-all duration-300 shadow-lg"
                    title={link.title}
                  >
                    {link.icon || "🔗"}
                  </a>
                ))}
              </div>
            )}`;
code = code.replace(
  searchBio,
  `{profileData.bio || "Athlète passionné visant l'excellence sur les pistes nationales et internationales."}\n            </p>\n${socialLinksHtml}\n          </div>`
);

// 6. Refactor Sponsors to Bento Grid
const bentoHtml = `        {/* BENTO GRID SPONSORS */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-10%" }}
          className="w-full flex flex-col gap-6 select-none"
        >
          <h3 className="text-sm font-black uppercase tracking-widest text-white px-2">
            Partenaires <span className="text-[#00FF88]">&</span> Sponsors
          </h3>

          {(equipementiers.length === 0 && partenaires.length === 0) ? (
            <div className="w-full backdrop-blur-xl bg-gradient-to-br from-white/5 to-[#00FF88]/5 border border-[#00FF88]/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(0,255,136,0.1)]">
              <span className="text-4xl mb-4">🤝</span>
              <h4 className="text-white font-black text-lg tracking-wide uppercase mb-2">Espace Sponsoring Disponible</h4>
              <p className="text-gray-400 text-sm max-w-sm">Associez votre marque à l'excellence et soutenez la progression de cet athlète vers les sommets.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {equipementiers.map((eq, idx) => (
                <div key={\`eq-\${idx}\`} className="col-span-2 backdrop-blur-xl bg-white/5 border border-[#00FF88]/30 hover:bg-white/10 hover:border-[#00FF88]/60 transition-all duration-300 rounded-3xl p-6 md:p-8 flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute top-4 left-4 text-[9px] font-black uppercase tracking-widest text-[#00FF88] opacity-70 group-hover:opacity-100 transition-opacity">Équipementier Officiel</div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#00FF88]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <span className="text-5xl md:text-6xl drop-shadow-lg scale-100 group-hover:scale-110 transition-transform duration-500">{eq.logo}</span>
                </div>
              ))}

              {partenaires.map((sp, idx) => (
                <div key={\`sp-\${idx}\`} className="col-span-1 backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-300 rounded-3xl p-6 flex items-center justify-center relative group">
                  <span className="text-3xl md:text-4xl drop-shadow-md scale-100 group-hover:scale-110 transition-transform duration-300">{sp.logo}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>`;

// The sponsors block starts right after the Performances. Let's find '<div id="sponsors" className="w-full"></div>'
const sponsorsStartStr = '<div id="sponsors" className="w-full"></div>\n        {equipementiers.length > 0 && (';
const spStart = code.indexOf(sponsorsStartStr);

if (spStart !== -1) {
    // Find the end of the partenaires block
    const partEndStr = '</motion.div>\n        )}';
    let tempIdx = spStart;
    for (let i = 0; i < 3; i++) {
        tempIdx = code.indexOf(partEndStr, tempIdx) + partEndStr.length;
    }

    code = code.substring(0, spStart) + bentoHtml + code.substring(tempIdx);
} else {
    console.log("Could not find sponsors start block.");
}

fs.writeFileSync(file, code);
