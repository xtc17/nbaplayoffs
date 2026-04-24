import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function MomentumChart({ away, home }: { away: any, home: any }) {
  // We'll generate a momentum curve based on quarter linescores
  // In a real app, this would be based on play-by-play scoring runs
  
  const awayScores = away.linescores || [];
  const homeScores = home.linescores || [];
  
  const data = Array.from({ length: Math.max(awayScores.length, 4) }).map((_, i) => {
    const a = awayScores[i]?.value || 0;
    const h = homeScores[i]?.value || 0;
    const momentum = h - a; // Positive means home is winning that quarter intensity
    
    return {
      period: `Q${i + 1}`,
      momentum: momentum,
      home: h,
      away: a
    };
  });

  return (
    <div className="h-64 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="momentumGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C8A951" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#C8A951" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
          <XAxis 
            dataKey="period" 
            stroke="#ffffff20" 
            fontSize={10} 
            fontWeight="bold" 
            tickLine={false} 
            axisLine={false}
          />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111118', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '12px' }}
            itemStyle={{ fontWeight: 'bold' }}
          />
          <Area 
            type="monotone" 
            dataKey="momentum" 
            stroke="#C8A951" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#momentumGradient)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
