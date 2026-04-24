import React from 'react';
import { motion } from 'motion/react';
import { Activity, Clock, MapPin, Tv, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

interface DashboardProps {
  games: any[];
  onSelectGame: (id: string) => void;
}

export default function Dashboard({ games, onSelectGame }: DashboardProps) {
  if (games.length === 0) {
    return (
      <div className="glass rounded-3xl p-12 text-center text-gray-400">
        <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
        <p className="text-xl font-medium">No games scheduled for today.</p>
        <p className="text-sm">The arena is quiet... for now.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {games.map((game, idx) => (
        <GameCard 
          key={game.id} 
          game={game} 
          idx={idx} 
          onClick={() => onSelectGame(game.id)} 
        />
      ))}
    </div>
  );
}

function GameCard({ game, onClick, idx }: { game: any, onClick: () => void, idx: number, key?: any }) {
  const comp = game.competitions[0];
  const away = comp.competitors.find((c: any) => c.homeAway === 'away');
  const home = comp.competitors.find((c: any) => c.homeAway === 'home');
  const status = game.status.type;
  const isLive = status.state === 'in';
  const isFinal = status.completed;
  
  const isCrunchTime = isLive && 
    game.status.period >= 4 && 
    Math.abs((parseInt(away.score) || 0) - (parseInt(home.score) || 0)) <= 5;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: idx * 0.05 }}
      onClick={onClick}
      className={cn(
        "editorial-card p-8 cursor-pointer group hover:bg-white/[0.08] relative overflow-hidden",
        isCrunchTime && "border-gold border-t-4"
      )}
    >
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          {isLive ? (
            <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest italic">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              Live / {status.displayClock}
            </div>
          ) : isFinal ? (
            <div className="bg-white/20 text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest italic">
              Final Report
            </div>
          ) : (
            <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-gold" />
              {new Date(game.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
        
        <div className="text-gold text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-1">
          {comp.venue?.address?.city || 'NBA Central'}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 space-y-8">
          <TeamRow team={away} winning={parseInt(away.score) > parseInt(home.score) && (isLive || isFinal)} />
          <div className="flex items-center gap-4">
             <div className="h-[1px] flex-1 bg-white/10" />
             <span className="font-editorial-serif text-gold text-lg opacity-40">vs</span>
             <div className="h-[1px] flex-1 bg-white/10" />
          </div>
          <TeamRow team={home} winning={parseInt(home.score) > parseInt(away.score) && (isLive || isFinal)} />
        </div>
      </div>

      {isCrunchTime && (
        <div className="mt-8 pt-4 border-t border-gold/10 text-gold text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 italic">
          <Zap className="w-3 h-3 fill-gold" /> High Stakes Momentum <Zap className="w-3 h-3 fill-gold" />
        </div>
      )}
    </motion.div>
  );
}

function TeamRow({ team, winning }: { team: any, winning: boolean }) {
  const score = parseInt(team.score) || 0;
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-6">
        <img 
          src={team.team.logos?.[0]?.href || `https://a.espncdn.com/i/teamlogos/nba/500/${team.team.abbreviation?.toLowerCase()}.png`} 
          alt={team.team.name}
          className={cn("w-14 h-14 object-contain transition-all duration-700", winning ? "scale-110" : "opacity-40 grayscale")}
        />
        <div>
          <div className={cn(
            "text-3xl font-black tracking-tighter uppercase italic transition-colors leading-none",
            winning ? "text-white" : "text-gray-600"
          )}>
            {team.team.abbreviation}
          </div>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
            {team.team.shortDisplayName}
          </div>
        </div>
      </div>
      <div className={cn(
        "text-5xl font-black tabular-nums transition-all italic",
        winning ? "text-gold" : "text-gray-800"
      )}>
        {score}
      </div>
    </div>
  );
}
