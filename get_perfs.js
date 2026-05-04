const fs = require('fs');
const file = 'src/app/u/[username]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const match = code.match(/<div id="performances" className="w-full"><\/div>\s*\{records\.length > 0 && \([\s\S]*?<\/AreaChart>\s*<\/ResponsiveContainer>\s*\)\}\s*<\/div>\s*<\/motion\.div>\s*\)\}/);
if (match) {
    console.log("Found performances section");
} else {
    console.log("Could not find performances section easily, need more grep.");
}
