export interface SiteStat {
  id: string;
  label: string;
  value: string;
  suffix?: string;
  prefix?: string;
  icon?: string;
  color?: string;
  order: number;
  createdAt?: string;
}
