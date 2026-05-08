export interface PerformanceRaw {
  id?: string | number;
  distance: string;
  temps: string | number;
  date: string;
  competition?: string;
  [key: string]: any;
}

export interface ProcessedDiscipline {
  distance: string;
  records: PerformanceRaw[];
  firstRecord: PerformanceRaw;
  bestRecord: PerformanceRaw;
  improvementTime: string;
  improvementPercentage: string;
}

export interface Sponsor {
  id: string | number;
  name: string;
  logo: string;
  category?: string;
  user_id?: string;
}

export interface SocialLink {
  id: string | number;
  title: string;
  url: string;
  icon: string;
  user_id?: string;
}

export interface Video {
  id: string | number;
  url: string;
  title: string;
  user_id?: string;
}
