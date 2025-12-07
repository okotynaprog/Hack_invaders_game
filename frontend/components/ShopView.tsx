import React, { useState, useEffect } from 'react';
import { SKINS_DB } from '../services/storageService';
import { api } from '../services/api';
import { Check, Lock, Shield, AlertTriangle, Loader2 } from 'lucide-react';

interface ShopViewProps {
  onUpdate: () => void;
}

export const ShopView: React.FC<ShopViewProps> = ({ onUpdate }) => {
  const [user, setUser] = useState(api.user);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUser(api.user);
  }, []);

  const handleBuy = async (skinId: string, cost: number) => {
    setError(null);
    setProcessingId(skinId);

    try {
      const updatedUser = await api.buySkin(skinId, cost);
      setUser(updatedUser);
      onUpdate();
    } catch (err: any) {
      setError(err.message || "Błąd transakcji");
      setTimeout(() => setError(null), 3000);
    } finally {
      setProcessingId(null);
    }
  };

  const handleEquip = async (skinId: string) => {
    setProcessingId(skinId);
    try {
      const updatedUser = await api.equipSkin(skinId);
      setUser(updatedUser);
      onUpdate();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const unlockedSkins = user?.unlockedSkins || ['default'];
  const equippedSkin = user?.equippedSkin || 'default';
  const currentCredits = user?.credits || 0;

  return (
    <div className="h-full w-full overflow-y-auto px-2 pb-24 scrollbar-hide">
      <div className="text-center py-4 relative sticky top-0 bg-black/90 z-20 backdrop-blur-sm border-b border-gray-800 mb-4">
        <h2 className="text-2xl font-bold text-white tracking-widest font-mono">
          DARKNET <span className="text-cyan-400">MARKET</span>
        </h2>
        
        <div className="mt-2 inline-flex items-center gap-2 bg-gray-900 border border-gray-700 px-3 py-1 rounded-full">
           <span className="text-gray-400 text-xs">SALDO:</span>
           <span className="text-cyan-400 font-bold font-mono text-sm">{currentCredits} 💎</span>
        </div>

        {error && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max inline-flex items-center gap-2 bg-red-900/90 border border-red-500 text-red-200 px-3 py-1 rounded animate-bounce z-50">
            <AlertTriangle size={12} />
            <span className="text-xs font-mono">{error}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-6xl mx-auto">
        {SKINS_DB.map((skin) => {
          const isUnlocked = unlockedSkins.includes(skin.id);
          const isEquipped = equippedSkin === skin.id;
          const canAfford = currentCredits >= skin.cost;
          const isProcessing = processingId === skin.id;

          return (
            <div 
              key={skin.id} 
              className={`
                relative group overflow-hidden rounded-lg border transition-all duration-200 flex flex-col
                ${isEquipped 
                  ? 'bg-gray-900/80 border-cyan-500 shadow-[0_0_15px_rgba(0,255,204,0.15)]' 
                  : 'bg-black/60 border-gray-800 hover:border-gray-600'
                }
              `}
            >
              <div className="p-3 flex items-center justify-center bg-gradient-to-b from-gray-900 to-transparent">
                <Shield 
                  className={`w-10 h-10 md:w-14 md:h-14 transition-transform duration-300 ${isEquipped ? 'scale-110 drop-shadow-[0_0_10px_rgba(0,255,204,0.5)]' : 'group-hover:scale-105'}`} 
                  style={{ color: skin.color }} 
                />
              </div>

              <div className="p-3 pt-0 flex flex-col flex-grow">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-xs md:text-sm font-bold text-white font-mono truncate">{skin.name}</h3>
                  {isEquipped && <Check size={12} className="text-cyan-400" />}
                </div>
                
                <p className="text-[10px] text-gray-500 mb-3 font-mono leading-tight line-clamp-2 min-h-[2.5em]">{skin.desc}</p>
                
                <div className="mt-auto">
                  {isUnlocked ? (
                    <button 
                      onClick={() => handleEquip(skin.id)}
                      disabled={isEquipped || isProcessing}
                      className={`
                        w-full py-2 rounded font-bold font-mono text-[10px] md:text-xs tracking-wider flex items-center justify-center gap-1 transition-all
                        ${isEquipped 
                          ? 'bg-gray-800 text-gray-500 cursor-default' 
                          : 'bg-cyan-900/30 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500 hover:text-black'
                        }
                      `}
                    >
                      {isProcessing ? <Loader2 className="animate-spin" size={12} /> : (isEquipped ? 'AKTYWNY' : 'WYBIERZ')}
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleBuy(skin.id, skin.cost)}
                      disabled={!canAfford || isProcessing}
                      className={`
                        w-full py-2 rounded font-bold font-mono text-[10px] md:text-xs tracking-wider flex items-center justify-center gap-1 transition-all
                        ${canAfford 
                          ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20' 
                          : 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'
                        }
                      `}
                    >
                       {isProcessing ? (
                         <Loader2 className="animate-spin" size={12} />
                       ) : (
                         <>
                           <Lock size={10} /> {skin.cost}
                         </>
                       )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};