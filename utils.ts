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

const PROXIES = [
  '', // Direct
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?'
];

async function fetchWithRetry(url: string) {
  let lastError = null;
  for (const proxy of PROXIES) {
    try {
      const targetUrl = proxy ? `${proxy}${encodeURIComponent(url)}` : url;
      const res = await fetch(targetUrl, {
        headers: {
          'Accept': 'application/json'
        },
        mode: 'cors'
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      lastError = err;
      console.warn(`Fetch failed with proxy ${proxy || 'direct'}:`, err);
      continue;
    }
  }
  throw lastError || new Error('All fetch attempts failed');
}

export async function fetchScoreboard() {
  return fetchWithRetry(ESPN_API.SCOREBOARD);
}

export async function fetchGameDetail(id: string) {
  return fetchWithRetry(ESPN_API.SUMMARY(id));
}

export async function fetchBracket() {
  return fetchWithRetry(ESPN_API.BRACKET);
}
