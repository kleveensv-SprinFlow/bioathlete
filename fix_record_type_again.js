const fs = require('fs');
const file = 'src/app/u/[username]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace Record<string, ProcessedDiscipline> because of local interface shadowing
code = code.replace(/useState<Record<string, ProcessedDiscipline>>/g, 'useState<{ [key: string]: ProcessedDiscipline }>');

fs.writeFileSync(file, code);
