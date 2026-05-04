const fs = require('fs');
const file = 'src/app/u/[username]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Add `processedPerformances` state and `selectedDiscipline` state
const stateDeclarations = `  const [evolution, setEvolution] = useState<EvolutionPoint[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [processedPerformances, setProcessedPerformances] = useState<Record<string, ProcessedDiscipline>>({});
  const [selectedDiscipline, setSelectedDiscipline] = useState<string | null>(null);`;

code = code.replace(
  `  const [evolution, setEvolution] = useState<EvolutionPoint[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);`,
  stateDeclarations
);

// 2. Process performances and set the first discipline as selected
const fetchLogic = `        // Fetch records
        const { data: perfData, error: perfErr } = await supabase
          .from("performances")
          .select("*")
          .eq("user_id", uid);

        if (!perfErr && perfData && perfData.length > 0) {
          const mappedRecords = perfData.slice(-2).map((p) => ({
            distance: p.distance,
            temps: p.temps + "s",
            competition: p.competition,
          }));
          setRecords(mappedRecords);

          const mappedEvolution = perfData.map((p) => ({
            date: p.date,
            "100m": parseFloat(p.temps),
          }));
          setEvolution(mappedEvolution);

          const processed = processPerformances(perfData);
          setProcessedPerformances(processed);
          const disciplines = Object.keys(processed);
          if (disciplines.length > 0) {
            setSelectedDiscipline(disciplines[0]);
          }
        }`;

code = code.replace(
  /\/\/ Fetch records[\s\S]*?setEvolution\(mappedEvolution\);\s*\}/,
  fetchLogic
);

fs.writeFileSync(file, code);
