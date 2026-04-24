import { motion } from 'motion/react';
import { Trophy, Swords, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Bracket({ events, onSelectGame }: { events: any[], onSelectGame: (id: string) => void }) {
  if (events.length === 0) {
    return (
      <div className="editorial-card px-12 py-24 text-center text-gray-500 border-dashed border-2">
        <Trophy className="w-16 h-16 mx-auto mb-6 opacity-5 text-gold" />
        <p className="text-2xl font-black italic uppercase tracking-tighter">Drafting the Bracket</p>
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] mt-2">Seeds Pending / Postseason Launch</p>
      </div>
    );
  }

  // Group events by requested pairings
  const matchups = [
    { a: 'OKC', b: 'PHX' },
    { a: 'SAS', b: 'POR' },
    { a: 'DEN', b: 'MIN' },
    { a: 'LAL', b: 'HOU' },
    { a: 'DET', b: 'ORL' },
    { a: 'BOS', b: 'PHI' },
    { a: 'NYK', b: 'ATL' },
    { a: 'CLE', b: 'TOR' }
  ];

  const seriesMap = new Map();

  // Pre-populate series map with requested matchups
  matchups.forEach((m) => {
    const key = [m.a, m.b].sort().join('-');
    seriesMap.set(key, {
      id: key,
      gameId: null,
      summary: 'Playoff Series / RD 1',
      home: { abbreviation: m.a, shortDisplayName: m.a, logos: [{ href: `https://a.espncdn.com/i/teamlogos/nba/500/${m.a.toLowerCase()}.png` }] },
      away: { abbreviation: m.b, shortDisplayName: m.b, logos: [{ href: `https://a.espncdn.com/i/teamlogos/nba/500/${m.b.toLowerCase()}.png` }] },
      homeWins: 0,
      awayWins: 0,
      isFinal: false
    });
  });

  // Overlay real data if available
  events.forEach(event => {
    const comp = event.competitions[0];
    const home = comp.competitors.find((c: any) => c.homeAway === 'home');
    const away = comp.competitors.find((c: any) => c.homeAway === 'away');
    if (!home || !away) return;

    const hAbbr = home.team.abbreviation;
    const aAbbr = away.team.abbreviation;
    const key = [hAbbr, aAbbr].sort().join('-');

    if (seriesMap.has(key)) {
      const s = seriesMap.get(key);
      const series = comp.series;
      s.gameId = event.id;
      if (series) {
        // Construct a prominent summary for the series status
        const hWins = series.competitors?.find((c: any) => c.id === home.team.id)?.wins || 0;
        const aWins = series.competitors?.find((c: any) => c.id === away.team.id)?.wins || 0;
        
        if (hWins > 0 || aWins > 0) {
          if (hWins === aWins) {
            s.summary = `SERIES TIED ${hWins}-${aWins}`;
          } else if (hWins > aWins) {
            s.summary = `${home.team.abbreviation} LEADS ${hWins}-${aWins}`;
          } else {
            s.summary = `${away.team.abbreviation} LEADS ${aWins}-${hWins}`;
          }
          if (hWins === 4 || aWins === 4) {
             s.summary = `SERIES: ${hWins === 4 ? home.team.abbreviation : away.team.abbreviation} WINS 4-${Math.min(hWins, aWins)}`;
          }
        } else {
          s.summary = series.summary?.toUpperCase() || 'SERIES STARTING';
        }
        
        s.homeWins = hWins;
        s.awayWins = aWins;
      }
      s.isFinal = comp.status.type.completed;
      
      // Sync names and logos from API
      if (hAbbr === s.home.abbreviation) {
        s.home = home.team;
        s.away = away.team;
      } else {
        s.home = away.team;
        s.away = home.team;
      }
    }
  });

  const series = Array.from(seriesMap.values());

  return (
    <div className="space-y-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center space-y-4 mb-16"
      >
        <div className="flex items-center gap-4 text-gold">
          <Zap className="w-4 h-4 fill-current animate-pulse" />
          <span className="font-black italic uppercase tracking-[0.5em] text-[11px] opacity-60">2026 NBA Postseason</span>
          <Zap className="w-4 h-4 fill-current animate-pulse" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="px-4 py-1 bg-gold text-black font-black text-[10px] uppercase tracking-[0.3em] italic skew-x-[-12deg]">
             Current Round: Quarterfinals
          </div>
          <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-white leading-none text-center">
            First Round <span className="text-gold">Matchups</span>
          </h2>
        </div>
        <div className="flex items-center gap-6 w-full max-w-2xl px-4">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gold/30 to-gold" />
          <Trophy className="w-8 h-8 text-gold drop-shadow-[0_0_15px_rgba(255,184,0,0.5)]" />
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-gold/30 to-gold" />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {series.map((s, idx) => (
        <motion.div
           key={s.id}
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: idx * 0.04, ease: [0.19, 1, 0.22, 1], duration: 0.8 }}
           onClick={() => onSelectGame(s.gameId)}
           className="editorial-card p-10 relative group overflow-hidden border-l-4 border-l-gold cursor-pointer hover:bg-gold/5 transition-all"
        >
          <div className="absolute -right-4 -bottom-4 text-[120px] font-black text-white/[0.03] select-none leading-none z-0 italic">
            {idx + 1}
          </div>
          
          <div className="relative z-10 space-y-10">
             <BracketRow team={s.away} wins={s.awayWins} opponentWins={s.homeWins} />
             <div className="flex items-center gap-6">
                <div className="h-[1px] flex-1 bg-white/10" />
                <span className="font-editorial-serif text-gold text-2xl opacity-40">vs</span>
                <div className="h-[1px] flex-1 bg-white/10" />
             </div>
             <BracketRow team={s.home} wins={s.homeWins} opponentWins={s.awayWins} />
          </div>

          <div className="mt-12 pt-6 border-t border-white/10 flex items-center justify-between relative z-10">
             <div className="text-[10px] font-black text-gold tracking-[0.2em] uppercase italic">
               {s.summary}
             </div>
             <div className="h-4 flex items-center gap-1.5">
               {Array.from({ length: 4 }).map((_, i) => (
                 <div 
                   key={i} 
                   className={cn(
                     "w-1 h-4 transition-all duration-700",
                     i < Math.max(s.homeWins, s.awayWins) ? "bg-white" : "bg-white/10"
                   )} 
                 />
               ))}
             </div>
          </div>
        </motion.div>
      ))}
      </div>
    </div>
  );
}

function BracketRow({ team, wins, opponentWins }: { team: any, wins: number, opponentWins: number }) {
  const isLeading = wins > opponentWins;
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-6">
        <img 
          src={team.logos?.[0]?.href || `https://a.espncdn.com/i/teamlogos/nba/500/${team.abbreviation?.toLowerCase()}.png`} 
          className={cn("w-14 h-14 object-contain transition-all duration-500", isLeading ? "scale-110" : "opacity-20 grayscale scale-90")}
          alt="" 
        />
        <div>
          <div className={cn("font-black tracking-tighter text-3xl uppercase italic leading-none transition-colors", isLeading ? "text-white" : "text-gray-700")}>
            {team.abbreviation}
          </div>
          <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">{team.shortDisplayName}</div>
        </div>
      </div>
      <div className={cn(
        "text-5xl font-black tabular-nums transition-all italic",
        isLeading ? "text-gold glow-orange" : "text-gray-800"
      )}>
        {wins}
      </div>
    </div>
  );
}
