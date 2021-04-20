export interface dailyData {
  id?: number;
  date?: string;
  image?: string;
  category?: string;
  contents?: [string, string[]][];
}
export interface weeklyData {
  id?: number;
  date?: string;
  image?: string;
  category?: string;
  korea?: culture;
  world?: culture;
}

export interface culture {
  title?: string;
  poster?: string;
  singer?: string;
}
