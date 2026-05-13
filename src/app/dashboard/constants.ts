// Sponsor categories and brand catalog for the collaboration system

export const SPONSOR_CATEGORIES = [
  { id: "apparel", name: "Vêtements / Chaussures", icon: "👟" },
  { id: "nutrition", name: "Nutrition / Énergie", icon: "🍎" },
  { id: "tech", name: "Tech / Accessoires", icon: "⌚" },
  { id: "care", name: "Santé / Récupération", icon: "❤️" },
  { id: "lifestyle", name: "Boissons / Lifestyle", icon: "🥤" },
  { id: "other", name: "Autre domaine", icon: "🏢" }
];

export const BRAND_CATALOG: { [key: string]: string[] } = {
  apparel: ["Nike", "Adidas", "Puma", "Asics", "New Balance", "Under Armour", "Reebok", "Mizuno", "Salomon", "Hoka", "On Running", "Brooks", "Saucony", "Joma", "Kiprun", "Kalenji"],
  nutrition: ["Maurten", "Science in Sport (SiS)", "High5", "GU Energy", "MyProtein", "Bulk", "Foodspring", "Prozis", "Optimum Nutrition", "PowerBar", "Gatorade", "Isostar", "Apurna"],
  tech: ["Garmin", "Polar", "Coros", "Suunto", "Apple Watch", "WHOOP", "Oura", "Shokz", "Theragun", "Hyperice"],
  care: ["Compex", "Blackroll", "Bauerfeind", "Mueller", "Zamst", "Voltarène", "Deep Heat", "Clinique du Coureur"],
  lifestyle: ["Red Bull", "Monster Energy", "Nocco", "Holy", "Coca-Cola", "Vitamin Well", "Oakley", "Rudy Project", "100%"]
};

export const ATHLETIC_DISCIPLINES: { [key: string]: string[] } = {
  "Sprint & Haies": [
    "60m", "100m", "200m", "400m",
    "60m Haies", "100m Haies", "110m Haies", "400m Haies"
  ],
  "Demi-fond & Fond": [
    "800m", "1500m", "3000m", "5000m", "10000m", "3000m Steeple"
  ],
  "Sauts": [
    "Saut en hauteur", "Saut à la perche", "Saut en longueur", "Triple saut"
  ],
  "Lancers": [
    "Lancer du poids", "Lancer du disque", "Lancer du marteau", "Lancer du javelot"
  ],
  "Épreuves Combinées / Marche": [
    "Pentathlon", "Heptathlon", "Décathlon",
    "10km Marche", "20km Marche"
  ]
};
