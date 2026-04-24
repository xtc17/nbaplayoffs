import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Trophy, Calendar, RefreshCw, ChevronLeft } from 'lucide-react';
import { fetchScoreboard, fetchBracket } from './lib/utils';
import Dashboard from './components/Dashboard';
import Bracket from './components/Bracket';
import GameDetail from './components/GameDetail';
import { cn } from './lib/utils';

export default function App() {
  const [view, setView] = useState<'games' | 'bracket' | 'detail'>('games');
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [games, setGames] = useState<any[]>([]);
  const [bracketData, setBracketData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      setError(`System Panic: ${e.message}`);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const [scores, bracket] = await Promise.all([fetchScoreboard(), fetchBracket()]);
      if (!scores || !bracket) throw new Error('Incomplete data stream received');
      setGames(scores.events || []);
      setBracketData(bracket.events || []);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Failed to sync NBA data:', err);
      setError(err instanceof Error ? err.message : 'Unknown technical disruption');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Sync every 30s
    return () => clearInterval(interval);
  }, [loadData]);

  const handleGameSelect = (id: string) => {
    setSelectedGameId(id);
    setView('detail');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans selection:bg-gold selection:text-black">
      {/* Sidebar - Editorial Style */}
      <nav className="w-full md:w-24 lg:w-32 bg-[#0a0a0a] border-b md:border-b-0 md:border-r border-white/10 flex flex-row md:flex-col items-center justify-around md:justify-start gap-8 p-4 md:py-8 sticky top-0 md:h-screen z-50">
        <div className="hidden md:flex items-center justify-center mb-12">
          <div className="w-12 h-12 bg-gold flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.3)]">
            <span className="text-black font-black text-2xl italic select-none">C</span>
          </div>
        </div>

        <NavBtn 
          active={view === 'games'} 
          onClick={() => setView('games')} 
          icon={<LayoutDashboard className="w-5 h-5" />} 
          label="Live"
        />
        <NavBtn 
          active={view === 'bracket'} 
          onClick={() => setView('bracket')} 
          icon={<Trophy className="w-5 h-5" />} 
          label="Bracket"
        />
        
        <div className="mt-auto hidden md:flex flex-col gap-8 items-center pb-4">
          <button 
            onClick={loadData}
            className={cn(
              "p-3 rounded-full hover:bg-gold/10 transition-all text-gray-500 hover:text-gold",
              isRefreshing && "animate-spin text-gold"
            )}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <div className="flex flex-col items-center gap-1">
            <div className="w-1 h-8 bg-gradient-to-b from-gold to-transparent opacity-20" />
            <div className="w-1.5 h-1.5 bg-gold rounded-full" />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-full overflow-x-hidden relative flex flex-col min-h-screen">
        <header className="px-6 py-10 md:px-12 flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/10 mb-8 mx-6 md:mx-12 gap-6 sm:gap-0">
          <div className="flex items-center gap-6">
            <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
              Courtside
            </h1>
            <div className="flex flex-col">
              <span className="text-[10px] font-black tracking-[0.3em] uppercase text-gold bg-gold/10 px-2 py-1 border border-gold/20">
                Postseason 2026
              </span>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {view === 'detail' && (
              <button 
                onClick={() => setView('games')}
                className="flex items-center gap-2 px-6 py-2 border border-white/20 hover:border-gold/50 text-white transition-all text-[10px] font-black uppercase tracking-widest italic"
              >
                <ChevronLeft className="w-4 h-4" />
                Return to Board
              </button>
            )}
            <div className="text-right hidden sm:block">
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Global Sync Status</div>
              <div className="text-xs font-bold text-white tabular-nums">1.02s Roundtrip / {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        </header>

        <div className="px-6 md:px-12 pb-24 flex-grow">
          <AnimatePresence mode="wait">
            {error ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="h-[50vh] flex flex-col items-center justify-center p-12 glass rounded-3xl text-center border-red-500/20"
              >
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                  <RefreshCw className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-2">Sync Connection Lost</h3>
                <p className="text-gray-400 max-w-md text-sm mb-8">{error}. This is often due to network security restrictions or browser CORS policies.</p>
                <button 
                  onClick={loadData}
                  className="px-8 py-3 bg-white text-black font-black uppercase tracking-widest text-[10px] italic hover:bg-gold transition-colors"
                >
                  Force Data Re-Sync
                </button>
              </motion.div>
            ) : !loading ? (
              <motion.div
                key={view + (selectedGameId || '')}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
              >
                {view === 'games' && (
                  <Dashboard games={games} onSelectGame={handleGameSelect} />
                )}
                {view === 'bracket' && (
                  <Bracket events={bracketData} onSelectGame={handleGameSelect} />
                )}
                {view === 'detail' && selectedGameId && (
                  <GameDetail gameId={selectedGameId} />
                )}
              </motion.div>
            ) : (
              <div className="h-[40vh] flex flex-col items-center justify-center gap-6">
                <div className="w-16 h-1 bg-white/10 relative overflow-hidden">
                   <div className="absolute inset-y-0 left-0 bg-gold w-1/3 animate-marquee-pulse" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse">Initializing Data Stream</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer: Editorial News Marquee */}
        <footer className="h-12 bg-gold text-black flex items-center overflow-hidden border-t-4 border-black relative z-[60]">
          <div className="flex whitespace-nowrap gap-12 text-[11px] font-black uppercase tracking-[0.2em] animate-marquee italic">
             <span className="flex items-center gap-2">• Live Playoffs Coverage 2026</span>
             <span className="opacity-40">|</span>
             <span>Next Game: 48:00 Left to Tip-off</span>
             <span className="opacity-40">|</span>
             <span>Road to the Championship: Underway</span>
             <span className="opacity-40">|</span>
             <span>Western Conference Semifinals Analysis: Active</span>
             <span className="opacity-40">|</span>
             <span className="flex items-center gap-2">• Finals Road Starts Now</span>
             <span className="opacity-40">|</span>
             {/* Duplicate for seamless loop */}
             <span className="flex items-center gap-2">• Live Playoffs Coverage 2026</span>
             <span className="opacity-40">|</span>
             <span>Next Game: 48:00 Left to Tip-off</span>
             <span className="opacity-40">|</span>
             <span>Road to the Championship: Underway</span>
             <span className="opacity-40">|</span>
             <span>Western Conference Semifinals Analysis: Active</span>
             <span className="opacity-40">|</span>
             <span className="flex items-center gap-2">• Finals Road Starts Now</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

function NavBtn({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 group transition-all relative py-2",
        active ? "text-gold" : "text-gray-500 hover:text-white"
      )}
    >
      <div className={cn(
        "w-12 h-12 flex items-center justify-center transition-all duration-500",
        active ? "bg-gold text-black italic font-black shadow-[0_0_15px_rgba(249,115,22,0.4)]" : "group-hover:bg-white/5"
      )}>
        {icon}
      </div>
      <span className="text-[9px] font-black uppercase tracking-widest md:hidden lg:inline">{label}</span>
      {active && (
        <motion.div 
          layoutId="activeTab"
          className="hidden md:absolute -left-4 w-[2px] h-12 bg-gold"
        />
      )}
    </button>
  );
}
