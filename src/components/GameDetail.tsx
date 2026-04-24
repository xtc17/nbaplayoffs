import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { fetchGameDetail } from '../lib/utils';
import { Activity, Users, List, TrendingUp, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import MomentumChart from './MomentumChart';

export default function GameDetail({ gameId }: { gameId: string }) {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'pbp'>('stats');

  useEffect(() => {
    async function loadDetail() {
      try {
        const detail = await fetchGameDetail(gameId);
        setData(detail);
      } catch (err) {
        console.error("Failed to load game detail:", err);
      }
    }
    loadDetail();
  }, [gameId]);

  if (!data) return (
    <div className="p-24 flex flex-col items-center justify-center gap-6">
      <div className="w-16 h-1 bg-white/10 relative overflow-hidden">
        <div className="absolute inset-y-0 left-0 bg-gold w-1/3 animate-marquee-pulse" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse">Syncing with Courtside Data Stream</p>
    </div>
  );

  const comp = data.header.competitions[0];
  const away = comp.competitors.find((c: any) => c.homeAway === 'away');
  const home = comp.competitors.find((c: any) => c.homeAway === 'home');

  return (
    <div className="space-y-12 max-w-6xl mx-auto pb-12">
      {/* Editorial Header */}
      <div className="editorial-card p-12 relative overflow-hidden bg-gradient-to-br from-white/5 to-transparent">
        <div className="absolute top-0 right-0 p-8 flex gap-3 z-10">
          {comp.status.type.state === 'in' && (
             <div className="bg-red-600 text-white px-4 py-1.5 text-[10px] font-black uppercase tracking-widest italic flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Live Feed / Q{comp.status.period} {comp.status.displayClock}
             </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24 relative z-10">
          <TeamDetail team={away} alignment="left" />
          
          <div className="flex flex-col items-center gap-4">
             <div className="font-editorial-serif text-3xl text-gold opacity-50 uppercase">vs</div>
             <div className="editorial-accent-line" />
             <div className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 whitespace-nowrap">
               Locked in: {comp.venue?.fullName || 'NBA Arena'}
             </div>
          </div>

          <TeamDetail team={home} alignment="right" />
        </div>

        {/* Box Score Summary */}
        <div className="mt-16 flex justify-center">
          <div className="editorial-card bg-black/40 p-4 w-full max-w-2xl">
            <table className="w-full text-[10px] font-black uppercase tracking-widest">
              <thead>
                <tr className="text-gray-500 border-b border-white/10">
                  <th className="px-4 py-3 text-left">Rotation</th>
                  {away.linescores?.map((_: any, i: number) => <th key={i} className="px-4 py-3">Q{i+1}</th>)}
                  <th className="px-4 py-3 text-gold">Final</th>
                </tr>
              </thead>
              <tbody className="text-center tabular-nums">
                <tr>
                  <td className="px-4 py-4 text-left text-white">{away.team.abbreviation}</td>
                  {away.linescores?.map((q: any, i: number) => <td key={i} className="px-4 py-4 text-gray-400">{q.value}</td>)}
                  <td className="px-4 py-4 text-white text-xl italic">{away.score}</td>
                </tr>
                <tr className="border-t border-white/5">
                  <td className="px-4 py-4 text-left text-white">{home.team.abbreviation}</td>
                  {home.linescores?.map((q: any, i: number) => <td key={i} className="px-4 py-4 text-gray-400">{q.value}</td>)}
                  <td className="px-4 py-4 text-white text-xl italic">{home.score}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          {/* Momentum */}
          <div className="editorial-card p-10 relative">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-gray-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gold" />
                Game Momentum Index
              </h3>
              <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Real-time Oscillations</div>
            </div>
            <MomentumChart away={away} home={home} />
          </div>

          {/* Tabs */}
          <div className="space-y-6">
            <div className="flex gap-8 border-b border-white/10 pb-4">
               <TabBtn active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<Users className="w-4 h-4" />} label="Box Score" />
               {comp.status.type.state === 'in' && (
                 <TabBtn active={activeTab === 'pbp'} onClick={() => setActiveTab('pbp')} icon={<List className="w-4 h-4" />} label="Plays" />
               )}
            </div>

            {activeTab === 'stats' || comp.status.type.state !== 'in' ? (
              <div className="space-y-12">
                {data.boxscore?.players ? (
                  <>
                    <StatTable teamData={data.boxscore.players[0]} />
                    <StatTable teamData={data.boxscore.players[1]} />
                  </>
                ) : (
                  <div className="editorial-card p-12 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p className="text-xl font-black italic uppercase">Roster Data Pending</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest mt-2">Check back at Tip-off</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="editorial-card p-12 max-h-[700px] overflow-y-auto space-y-6 custom-scrollbar">
                {data.plays?.reverse().map((play: any, i: number) => (
                  <div key={i} className="flex gap-8 items-start py-5 border-b border-white/10 last:border-0 hover:bg-white/5 transition-all">
                    <span className="text-[11px] font-black text-gold italic min-w-[70px]">Q{play.period.number} / {play.clock.displayValue}</span>
                    <p className="text-sm font-bold leading-relaxed uppercase tracking-tight">{play.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Leaders */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit space-y-12">
           <div className="bg-gold p-8 text-black shadow-[10px_10px_0_rgba(249,115,22,0.2)]">
              <h3 className="font-black text-[11px] uppercase tracking-[0.3em] border-b border-black/20 pb-4 mb-8 italic">
                Playoff Heroics
              </h3>
              
              <div className="space-y-10">
                {data.leaders?.length > 0 ? data.leaders.map((teamLeader: any, i: number) => (
                  <div key={i} className="space-y-6">
                    <div className="flex items-center gap-3">
                      <img src={teamLeader.team?.logos?.[0]?.href} className="w-6 h-6 object-contain grayscale" alt="" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-black/60 italic">{teamLeader.team?.displayName}</span>
                    </div>
                    {teamLeader.leaders?.slice(0, 3).map((cat: any, j: number) => (
                      <div key={j} className="flex items-center justify-between border-b border-black/10 pb-4 last:border-0 group">
                        <div className="flex items-center gap-4">
                           <div>
                             <div className="text-xl font-black tracking-tighter uppercase italic">{cat.leaders?.[0]?.athlete?.shortName || '--'}</div>
                             <div className="text-[9px] font-black uppercase tracking-widest">{cat.displayName}</div>
                           </div>
                        </div>
                        <div className="text-3xl font-black italic tabular-nums">{cat.leaders?.[0]?.displayValue || '0'}</div>
                      </div>
                    ))}
                  </div>
                )) : (
                  <div className="text-center py-12 opacity-40">
                    <Star className="w-8 h-8 mx-auto mb-3" />
                    <p className="text-[10px] font-black uppercase">Stat Leaders Pending</p>
                  </div>
                )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function TeamDetail({ team, alignment }: { team: any, alignment: 'left' | 'right' }) {
  return (
    <div className={cn("flex items-center gap-10 flex-col sm:flex-row flex-1", alignment === 'right' && "sm:flex-row-reverse sm:text-right")}>
      <motion.img 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        src={team.team.logos[0].href} 
        className="w-24 h-24 md:w-32 md:h-32 object-contain grayscale brightness-150"
        alt=""
      />
      <div>
        <h2 className="text-7xl md:text-9xl font-black tracking-tighter uppercase italic text-white leading-none">
          {team.team.abbreviation}
        </h2>
        <div className="text-gold text-[10px] font-black tracking-[0.4em] uppercase mt-4">
          {team.team.shortDisplayName} / {team.records?.[0]?.summary || '--'}
        </div>
      </div>
    </div>
  );
}

function StatTable({ teamData }: { teamData: any }) {
  if (!teamData || !teamData.statistics || !teamData.statistics[0]) return null;
  const stats = teamData.statistics[0].athletes || [];
  const labels = teamData.statistics[0].labels || [];
  const keys = teamData.statistics[0].names || [];

  const getIdx = (targets: string[], fallback: number) => {
    for (const target of targets) {
      const idx = keys.findIndex((k: string) => k.toLowerCase() === target.toLowerCase());
      if (idx !== -1) return idx;
      const lIdx = labels.findIndex((l: string) => l.toLowerCase() === target.toLowerCase());
      if (lIdx !== -1) return lIdx;
    }
    return fallback;
  };

  const pI = getIdx(['points', 'pts'], 13);
  const pmI = getIdx(['plusminus', '+/-', 'plus_minus'], 14);
  const rI = getIdx(['rebounds', 'reb', 'tot_reb'], 6);
  const aI = getIdx(['assists', 'ast'], 7);
  const mI = getIdx(['minutes', 'min'], 0);
  const fgIdx = getIdx(['fieldgoalsmade-fieldgoalsattempted', 'fgm-fga', 'fg'], 1);
  const tpIdx = getIdx(['threepointfieldgoalsmade-threepointfieldgoalsattempted', '3pm-3pa', '3p'], 2);

  return (
    <div className="editorial-card overflow-hidden">
      <div className="p-8 border-b border-white/20 flex items-center justify-between bg-white/[0.03]">
         <div className="flex items-center gap-4">
           <img src={teamData.team.logo} className="w-8 h-8 object-contain grayscale" alt="" />
           <span className="font-black text-xl italic tracking-tighter uppercase">{teamData.team.displayName} Personnel</span>
         </div>
         <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest italic">Official Stats Bureau</span>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-[13px] tabular-nums">
           <thead className="bg-[#0a0a0a] text-gray-500 font-black uppercase tracking-[0.2em] text-[9px]">
             <tr>
               <th className="px-10 py-5 text-left text-gray-400">Roster</th>
               <th className="px-4 py-5 italic">Min</th>
               <th className="px-4 py-5 italic text-white text-xs">Pts</th>
               <th className="px-4 py-5 italic">Reb</th>
               <th className="px-4 py-5 italic">Ast</th>
               <th className="px-4 py-5 italic">FG</th>
               <th className="px-4 py-5 italic">3P</th>
               <th className="px-4 py-5 italic">+/-</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-white/5">
             {stats.map((a: any, i: number) => {
               const s = a.stats;
               if (!s) return null;
               const pmVal = s[pmI];
               return (
                 <tr key={i} className="hover:bg-gold/5 transition-colors group">
                    <td className="px-10 py-6 font-black text-white italic text-lg tracking-tighter uppercase group-hover:text-gold transition-colors">{a.athlete.displayName}</td>
                    <td className="px-4 py-6 text-center text-gray-600 font-mono text-xs">{s[mI] || '--'}</td>
                    <td className="px-4 py-6 text-center font-black text-white text-2xl italic">{s[pI] || 0}</td>
                    <td className="px-4 py-6 text-center text-gray-400 font-bold">{s[rI] || 0}</td>
                    <td className="px-4 py-6 text-center text-gray-400 font-bold">{s[aI] || 0}</td>
                    <td className="px-4 py-6 text-center text-gray-500 text-xs">{s[fgIdx] || '--'}</td>
                    <td className="px-4 py-6 text-center text-gray-500 text-xs">{s[tpIdx] || '--'}</td>
                    <td className={cn("px-4 py-6 text-center font-black italic text-base", parseInt(pmVal) > 0 ? "text-green-500" : parseInt(pmVal) < 0 ? "text-red-500" : "text-gray-700")}>
                      {parseInt(pmVal) > 0 ? `+${pmVal}` : pmVal || 0}
                    </td>
                 </tr>
               );
             })}
           </tbody>
        </table>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] transition-all border-b-4 italic",
        active ? "border-gold text-white" : "border-transparent text-gray-600 hover:text-gray-400"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
