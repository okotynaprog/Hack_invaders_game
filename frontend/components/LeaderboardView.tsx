import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Trophy, Activity, User } from 'lucide-react';
import { LeaderboardEntry } from '../types';

export const LeaderboardView: React.FC = () => {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUsername = api.user?.username;

  useEffect(() => {
    api.getLeaderboard().then((res) => {
      // Sort locally by credits (descending) to ensure correct order
      const sorted = [...res].sort((a, b) => (b.credits || 0) - (a.credits || 0));
      setData(sorted);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4 text-center animate-fade-in pb-20">
       <div className="relative inline-block">
         <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full"></div>
         <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4 relative z-10 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]" />
       </div>
       
       <h2 className="text-2xl font-bold text-yellow-500 mb-2 tracking-widest">TOP HAKERZY</h2>
       <p className="text-gray-500 text-sm font-mono mb-8">RANKING WG POSIADANYCH DIAMENTÓW</p>
       
       {loading ? (
         <div className="flex justify-center p-10">
           <Activity className="animate-spin text-cyan-500" />
         </div>
       ) : (
         <div className="bg-black/80 rounded-xl overflow-hidden border border-gray-800 shadow-2xl backdrop-blur-sm">
           <div className="grid grid-cols-12 bg-gray-900/50 p-3 text-xs text-gray-500 font-mono border-b border-gray-800">
              <div className="col-span-2 text-left pl-2">POZ</div>
              <div className="col-span-6 text-left">UŻYTKOWNIK</div>
              <div className="col-span-4 text-right pr-2">SALDO</div>
           </div>

           {data.length === 0 ? (
             <div className="p-8 text-gray-500 font-mono">BRAK DANYCH W BAZIE</div>
           ) : (
             data.map((entry, idx) => {
               const isMe = entry.username === currentUsername;
               
               return (
                 <div 
                    key={idx} 
                    className={`
                      grid grid-cols-12 p-4 items-center transition-all duration-300
                      ${isMe 
                        ? 'bg-cyan-900/20 border-y border-cyan-500/50 shadow-[inset_0_0_20px_rgba(0,255,204,0.1)] relative z-10 scale-[1.02] my-1 rounded' 
                        : 'border-b border-gray-800 hover:bg-gray-800/30'
                      }
                    `}
                 >
                    {/* Rank Position */}
                    <div className="col-span-2 text-left pl-2">
                       {idx === 0 && <span className="text-xl">🥇</span>}
                       {idx === 1 && <span className="text-xl">🥈</span>}
                       {idx === 2 && <span className="text-xl">🥉</span>}
                       {idx > 2 && <span className={`font-mono font-bold ${isMe ? 'text-cyan-400' : 'text-gray-600'}`}>#{idx + 1}</span>}
                    </div>

                    {/* Username */}
                    <div className="col-span-6 text-left flex items-center gap-2">
                      <span className={`font-mono truncate ${isMe ? 'text-cyan-300 font-bold' : 'text-gray-300'}`}>
                        {entry.username}
                      </span>
                      {isMe && <User size={14} className="text-cyan-500" />}
                    </div>

                    {/* Credits */}
                    <div className="col-span-4 text-right pr-2">
                      <div className={`font-mono font-bold text-lg ${isMe ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(0,255,204,0.5)]' : 'text-purple-400'}`}>
                        {entry.credits || 0} 💎
                      </div>
                    </div>
                 </div>
               );
             })
           )}
         </div>
       )}
    </div>
  );
};