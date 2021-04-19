export interface dailyData {
  id?: number;
  date?: string;
  image?: string;
  contents?: [string, string[]][];
}
export interface weeklyData {
  id?: number;
  date?: string;
  image?: string;
  korea?: culture;
  world?: culture;
}

export interface culture {
  title?: string;
  poster?: string;
  singer?: string;
}
