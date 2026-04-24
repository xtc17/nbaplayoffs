import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ESPN_API = {
  SCOREBOARD: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
  SUMMARY: (id: string) => `https://site.web.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${id}`,
  BRACKET: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?seasontype=3&limit=100&dates=20260401-20260630',
  LOGO: (id: string) => `https://a.espncdn.com/i/teamlogos/nba/500/${id}.png`
};

export async function fetchScoreboard() {
  const res = await fetch(ESPN_API.SCOREBOARD);
  return res.json();
}

export async function fetchGameDetail(id: string) {
  const res = await fetch(ESPN_API.SUMMARY(id));
  return res.json();
}

export async function fetchBracket() {
  const res = await fetch(ESPN_API.BRACKET);
  return res.json();
}
