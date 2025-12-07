import React, { useState, useEffect, useRef } from 'react';
import { GameLogic } from '../services/gameLogic';
import { api } from '../services/api';
import { SKINS_DB } from '../services/storageService';
import { CellType, GridCell, CellStatus, Skin } from '../types';
import { Button } from './Button';
import { Skull, Gem, Zap, Bug, Target } from 'lucide-react';

interface GameViewProps {
  userCredits: number;
  onUpdateCredits: (newAmount: number) => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  tx: string;
  ty: string;
  size: number;
}

const getSkinVisuals = (skinId: string) => {
  const skin = SKINS_DB.find(s => s.id === skinId) || SKINS_DB[0];
  return skin;
};

export const GameView: React.FC<GameViewProps> = ({ userCredits, onUpdateCredits }) => {
  const [hasLaunched, setHasLaunched] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bet, setBet] = useState(100);
  const [anomalyCount, setAnomalyCount] = useState(5);
  
  const [cells, setCells] = useState<GridCell[]>([]);
  const [logic, setLogic] = useState<GameLogic | null>(null);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [currentPayout, setCurrentPayout] = useState(0);
  const [gameOver, setGameOver] = useState<'WIN' | 'LOSS' | null>(null);
  
  const [activeSkin, setActiveSkin] = useState<Skin>(getSkinVisuals('default'));
  const [shakeScreen, setShakeScreen] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  
  const [manualLaserActive, setManualLaserActive] = useState(false);
  const manualLaserPosRef = useRef<{x: number, y: number} | null>(null);

  const droneRef = useRef<HTMLDivElement>(null);
  const laserRef = useRef<SVGLineElement>(null);
  const laserCoreRef = useRef<SVGLineElement>(null);
  const muzzleFlashRef = useRef<SVGCircleElement>(null);
  const impactRef = useRef<SVGCircleElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const animationFrameRef = useRef<number>(0);
  const mousePos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const dronePos = useRef({ x: 100, y: 100 });

  const [bonusActive, setBonusActive] = useState(false);
  const [bonusTime, setBonusTime] = useState(0);
  const [bonusScore, setBonusScore] = useState(0);
  const [viruses, setViruses] = useState<{id: number, x: number, y: number, isDead: boolean}[]>([]);

  useEffect(() => {
    if (api.user?.equippedSkin) {
      setActiveSkin(getSkinVisuals(api.user.equippedSkin));
    }
    
    if (!isPlaying) {
      const initialCells = Array.from({ length: 36 }, (_, i) => ({
        id: i,
        x: i % 6,
        y: Math.floor(i / 6),
        type: CellType.SAFE,
        status: CellStatus.HIDDEN
      }));
      setCells(initialCells);
    }
  }, [isPlaying]);

  useEffect(() => {
    const updatePhysics = () => {
      const time = Date.now();
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      
      const isMouseLeft = mousePos.current.x < screenW / 2;
      const targetX = isMouseLeft ? screenW * 0.85 : screenW * 0.15;

      const hoverOffset = Math.sin(time * 0.002) * 15;
      const targetY = (screenH * 0.5) + hoverOffset;

      const lerpFactor = 0.06;
      const dx = targetX - dronePos.current.x;
      const dy = targetY - dronePos.current.y;
      
      dronePos.current.x += dx * lerpFactor; 
      dronePos.current.y += dy * lerpFactor;

      if (droneRef.current) {
        droneRef.current.style.transform = `translate(${dronePos.current.x}px, ${dronePos.current.y}px)`;
      }

      let laserTarget = null;
      if (manualLaserPosRef.current) {
        laserTarget = manualLaserPosRef.current;
      }

      if (laserTarget) {
          const startX = dronePos.current.x;
          const startY = dronePos.current.y;
          const endX = laserTarget.x;
          const endY = laserTarget.y;

          const updateLine = (el: SVGElement | null) => {
            if(!el) return;
            el.setAttribute('x1', startX.toFixed(1));
            el.setAttribute('y1', startY.toFixed(1));
            el.setAttribute('x2', endX.toFixed(1));
            el.setAttribute('y2', endY.toFixed(1));
          };

          updateLine(laserRef.current);
          updateLine(laserCoreRef.current);

          if(muzzleFlashRef.current) {
            muzzleFlashRef.current.setAttribute('cx', startX.toFixed(1));
            muzzleFlashRef.current.setAttribute('cy', startY.toFixed(1));
            const r = 10 + Math.random() * 5;
            muzzleFlashRef.current.setAttribute('r', r.toString());
          }

          if(impactRef.current) {
             impactRef.current.setAttribute('cx', endX.toFixed(1));
             impactRef.current.setAttribute('cy', endY.toFixed(1));
             const r = 15 + Math.random() * 8;
             impactRef.current.setAttribute('r', r.toString());
          }
      }
      
      animationFrameRef.current = requestAnimationFrame(updatePhysics);
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    const handleTouchMove = (e: TouchEvent) => {
      mousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    animationFrameRef.current = requestAnimationFrame(updatePhysics);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const spawnSparks = (x: number, y: number, color: string, count: number, explosive = false) => {
    const newParticles: Particle[] = [];
    for(let i=0; i<count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = explosive ? Math.random() * 100 + 50 : Math.random() * 30 + 10;
      newParticles.push({
        id: Math.random(),
        x,
        y,
        color,
        tx: `${Math.cos(angle) * distance}px`,
        ty: `${Math.sin(angle) * distance}px`,
        size: explosive ? Math.random() * 6 + 2 : Math.random() * 3 + 1
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.slice(count));
    }, 800);
  };

  const startGame = () => {
    if (userCredits < bet) return alert("Brak środków!");
    setHasLaunched(true);
    const newLogic = new GameLogic(anomalyCount, bet);
    setLogic(newLogic);
    onUpdateCredits(userCredits - bet);
    setIsPlaying(true);
    setGameOver(null);
    setCurrentMultiplier(1.0);
    setCurrentPayout(bet);
    setCells(prev => prev.map(c => ({ ...c, status: CellStatus.HIDDEN, type: CellType.SAFE })));
  };

  const commitMove = (index: number) => {
    setShakeScreen(false);

    if (!logic) return;
    const actualType = logic.getCellType(index);
    const isAnomaly = actualType === CellType.ANOMALY;
    
    const rect = document.getElementById(`cell-${index}`)?.getBoundingClientRect();
    if (rect) {
      spawnSparks(rect.left + rect.width/2, rect.top + rect.height/2, isAnomaly ? '#ff0000' : activeSkin.color, 25, true);
    }

    const newCells = [...cells];
    newCells[index] = { ...newCells[index], status: CellStatus.REVEALED, type: actualType };
    setCells(newCells);

    if (actualType === CellType.GOLDEN_WORM) {
      startBonusRound();
      return;
    }

    if (!isAnomaly) {
      logic.remainingCells--;
      logic.currentMultiplier = logic.calculateNextMultiplier();
      setCurrentMultiplier(logic.currentMultiplier);
      setCurrentPayout(Math.floor(bet * logic.currentMultiplier));
    } else {
      handleGameOver('LOSS');
    }
  };

  const startHacking = (index: number) => {
    if (cells[index].status !== CellStatus.HIDDEN || gameOver || bonusActive) return;
    
    // Visuals: 1:1 Copy of shootVirus logic
    const rect = document.getElementById(`cell-${index}`)?.getBoundingClientRect();
    if(rect) {
        const targetX = rect.left + rect.width / 2;
        const targetY = rect.top + rect.height / 2;
        
        manualLaserPosRef.current = { x: targetX, y: targetY };
        setManualLaserActive(true);
        
        // Instant visual feedback like the bonus game
        spawnSparks(targetX, targetY, activeSkin.color, 10, true); 
        
        setTimeout(() => {
             setManualLaserActive(false);
             manualLaserPosRef.current = null;
        }, 40); // 40ms flash
    }

    // Logic: Instant reveal
    commitMove(index);
  };

  const handleCashout = () => handleGameOver('WIN');

  const handleGameOver = async (result: 'WIN' | 'LOSS') => {
    setGameOver(result);
    setManualLaserActive(false);
    if (!logic) return;

    const revealed = cells.map((cell, idx) => ({
      ...cell,
      status: CellStatus.REVEALED,
      type: logic.getCellType(idx)
    }));
    setCells(revealed);

    let finalCredits = userCredits;
    if (result === 'WIN') {
      finalCredits += currentPayout;
      onUpdateCredits(finalCredits);
    }

    try {
      await api.syncData({
        totalMbCollected: 0,
        highscoreSession: result === 'WIN' ? currentPayout : 0,
        credits: finalCredits
      });
      setTimeout(() => setIsPlaying(false), 4000);
    } catch(e) { console.error(e); setIsPlaying(false); }
  };

  const startBonusRound = () => {
    setBonusActive(true);
    setBonusTime(10);
    setBonusScore(0);
    setViruses([]);
  };

  useEffect(() => {
    if (!bonusActive) return;
    const timer = setInterval(() => {
      setBonusTime(t => {
        if (t <= 1) {
          setBonusActive(false);
          setCurrentPayout(p => p + bonusScore);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    const spawner = setInterval(() => {
      const id = Date.now();
      setViruses(v => [...v, { id, x: Math.random()*80+10, y: Math.random()*80+10, isDead: false }]);
      setTimeout(() => setViruses(v => v.filter(i => i.id !== id)), 1200);
    }, 600);

    return () => { clearInterval(timer); clearInterval(spawner); };
  }, [bonusActive, bonusScore]);

  const shootVirus = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const targetX = rect.left + rect.width / 2;
    const targetY = rect.top + rect.height / 2;

    manualLaserPosRef.current = { x: targetX, y: targetY };
    setManualLaserActive(true);
    setTimeout(() => {
        setManualLaserActive(false);
        manualLaserPosRef.current = null;
    }, 40);

    spawnSparks(targetX, targetY, '#ffff00', 10, true);
    setViruses(v => v.map(i => i.id === id ? { ...i, isDead: true } : i));
    setBonusScore(s => s + 200); 
  };

  const renderDrone = () => {
    if (!hasLaunched) return null;

    return (
      <>
        <div 
          ref={droneRef}
          className="fixed pointer-events-none z-50 w-32 h-32 flex items-center justify-center will-change-transform"
          style={{ left: 0, top: 0, marginTop: '-4rem', marginLeft: '-4rem' }} 
        >
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_currentColor]" style={{ color: activeSkin.color }}>
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <path d="M20 20 L80 80 M80 20 L20 80" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
            <circle cx="50" cy="50" r="16" fill="black" stroke="currentColor" strokeWidth="2" />
            <circle cx="50" cy="50" r="8" fill="currentColor" className="animate-pulse" />
            {[
              {cx: 20, cy: 20}, {cx: 80, cy: 20}, {cx: 80, cy: 80}, {cx: 20, cy: 80}
            ].map((pos, i) => (
              <g key={i} className="origin-center" style={{ transformBox: 'fill-box', transformOrigin: `${pos.cx}px ${pos.cy}px` }}>
                  <circle cx={pos.cx} cy={pos.cy} r="14" stroke="currentColor" strokeWidth="1" fill="black" opacity="0.6" />
                  <g className="animate-spin" style={{ animationDuration: '0.15s', transformOrigin: `${pos.cx}px ${pos.cy}px` }}>
                    <line x1={pos.cx - 12} y1={pos.cy} x2={pos.cx + 12} y2={pos.cy} stroke="currentColor" strokeWidth="3" opacity="0.9" />
                    <line x1={pos.cx} y1={pos.cy - 12} x2={pos.cx} y2={pos.cy + 12} stroke="currentColor" strokeWidth="3" opacity="0.9" />
                  </g>
              </g>
            ))}
            <g className="origin-center animate-spin-reverse" style={{ animationDuration: '4s' }}>
                <circle cx="50" cy="50" r="24" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="4 4" opacity="0.5" />
                <path d="M50 20 L50 10 M50 80 L50 90 M20 50 L10 50 M80 50 L90 50" stroke="currentColor" strokeWidth="1" />
            </g>
          </svg>
        </div>

        <svg className={`fixed inset-0 w-full h-full pointer-events-none z-40 overflow-visible ${manualLaserActive ? 'opacity-100' : 'opacity-0'}`}>
          <defs>
            <linearGradient id="laserGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={activeSkin.color} stopOpacity="0.8" />
              <stop offset="100%" stopColor="white" stopOpacity="0.9" />
            </linearGradient>
            <filter id="laserGlowFX">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          <circle 
              ref={muzzleFlashRef}
              fill={activeSkin.color}
              filter="url(#laserGlowFX)"
              opacity="0.8"
          />

          <line 
              ref={laserRef}
              stroke={activeSkin.color}
              strokeWidth="6"
              strokeLinecap="round"
              filter="url(#laserGlowFX)"
              className="laser-beam"
          />

          <line 
              ref={laserCoreRef}
              stroke="white"
              strokeWidth="2"
              opacity="0.9"
          />

          <circle 
              ref={impactRef}
              fill="white"
              stroke={activeSkin.color}
              strokeWidth="2"
              filter="url(#laserGlowFX)"
              opacity="0.9"
          />
        </svg>
      </>
    );
  };

  return (
    <div className={`w-full h-full flex flex-col justify-center items-center relative ${shakeScreen ? 'shake-heavy' : ''}`}>
      
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {particles.map(p => (
          <div 
            key={p.id}
            className="particle rounded-full"
            style={{
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
              '--tx': p.tx,
              '--ty': p.ty
            } as React.CSSProperties}
          />
        ))}
      </div>

      {renderDrone()}

      {!isPlaying ? (
        <div className="flex flex-col justify-center h-full w-full max-w-md px-4">
            <div className="bg-gray-900 border border-cyan-800 rounded-xl p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h2 className="text-xl font-bold text-center mb-4 text-cyan-400 tracking-widest relative z-10">INICJALIZACJA WŁAMU</h2>
            
            <div className="space-y-5 relative z-10">
                <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">KWOTA TRANSFERU</label>
                <div className="flex gap-2">
                    <input 
                    type="number" 
                    value={bet} 
                    onChange={(e) => setBet(Number(e.target.value))}
                    className="w-full bg-black border border-cyan-700 rounded p-2 text-cyan-400 font-mono focus:outline-none focus:border-cyan-400 text-center text-lg"
                    />
                    <button onClick={() => setBet(userCredits)} className="px-3 bg-gray-800 text-xs rounded border border-gray-700 hover:bg-gray-700">MAX</button>
                </div>
                </div>

                <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">POZIOM ZABEZPIECZEŃ ({anomalyCount})</label>
                <input 
                    type="range" 
                    min="1" 
                    max="24" 
                    value={anomalyCount} 
                    onChange={(e) => setAnomalyCount(Number(e.target.value))}
                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                </div>

                <Button onClick={startGame} className="w-full py-3 text-lg bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_20px_rgba(0,255,204,0.3)]">
                AKTYWUJ DRONA
                </Button>
            </div>
            </div>
        </div>
      ) : (
        <div className="flex flex-col h-full w-full max-w-lg px-2 pb-2">
          
          <div className="flex justify-between items-center bg-black/80 p-2 rounded-xl border border-cyan-900/50 backdrop-blur z-30 shadow-lg mb-2 mt-2">
            <div className="text-center">
              <div className="text-[10px] text-gray-400 font-mono">MNOŻNIK</div>
              <div className="text-xl font-bold text-cyan-400 font-mono animate-pulse">x{currentMultiplier.toFixed(2)}</div>
            </div>
            
            {gameOver ? (
               <div className={`text-lg font-bold font-mono px-4 py-1 rounded border ${gameOver === 'WIN' ? 'bg-green-900/50 border-green-500 text-green-400' : 'bg-red-900/50 border-red-500 text-red-500'}`}>
                 {gameOver === 'WIN' ? 'PRZEJĘTE' : 'BŁĄD'}
               </div>
            ) : (
              <button 
                onClick={handleCashout}
                disabled={currentMultiplier <= 1.0 || bonusActive}
                className={`px-4 py-2 rounded font-bold font-mono text-sm transition-all border-b-2 active:border-b-0 active:translate-y-0.5 ${
                  currentMultiplier > 1.0 
                    ? 'bg-green-600 border-green-800 hover:bg-green-500 text-white shadow-[0_0_25px_rgba(0,255,0,0.3)]' 
                    : 'bg-gray-700 border-gray-900 text-gray-500 cursor-not-allowed'
                }`}
              >
                WYPŁAĆ {currentPayout}
              </button>
            )}

            <div className="text-center">
               <div className="text-[10px] text-gray-400 font-mono">RYZYKO</div>
               <div className="text-lg font-bold text-red-400 font-mono">
                 {((logic?.remainingMines! / logic?.remainingCells!) * 100).toFixed(0)}%
               </div>
            </div>
          </div>

          <div className="flex-grow flex items-center justify-center relative w-full overflow-hidden">
             <div 
                ref={gridRef}
                className={`grid grid-cols-6 gap-1 sm:gap-2 bg-black p-2 rounded-xl border-2 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative w-full aspect-square max-h-[65vh] content-center ${bonusActive ? 'opacity-20 blur-sm pointer-events-none' : ''}`}
                style={{ borderColor: activeSkin.color }}
            >
                <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: `linear-gradient(${activeSkin.color} 1px, transparent 1px), linear-gradient(90deg, ${activeSkin.color} 1px, transparent 1px)`, backgroundSize: '20px 20px' }}></div>

                {cells.map((cell) => {
                  return (
                    <div
                        key={cell.id}
                        id={`cell-${cell.id}`}
                        onClick={() => startHacking(cell.id)}
                        className={`
                        relative rounded flex items-center justify-center transition-all duration-100 overflow-hidden cursor-crosshair aspect-square active:scale-95
                        ${cell.status === CellStatus.HIDDEN 
                            ? 'bg-gray-900 border border-gray-800 hover:border-white/20' 
                            : cell.type === CellType.ANOMALY 
                                ? 'bg-red-900/50 border-2 border-red-500' 
                                : 'bg-cyan-900/30 border border-cyan-500/50'
                        }
                        `}
                    >
                        {cell.status !== CellStatus.HIDDEN && (
                            <div className="animate-pop-in">
                                {cell.type === CellType.ANOMALY && <Skull className="w-4 h-4 sm:w-6 sm:h-6 text-red-500 animate-bounce" />}
                                {cell.type === CellType.GOLDEN_WORM && <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-400 animate-ping" />}
                                {cell.type === CellType.SAFE && <Gem className="w-4 h-4 sm:w-6 sm:h-6 text-cyan-400 animate-pulse" />}
                            </div>
                        )}
                    </div>
                  );
                })}
            </div>

            {bonusActive && (
                <div className="absolute inset-0 z-40 rounded-xl border-4 border-red-500 animate-pulse-fast bg-black/20 backdrop-blur-sm m-2">
                   <div className="absolute top-4 w-full text-center text-red-500 font-bold font-mono text-2xl animate-bounce">
                     ATAK WIRUSA! {bonusTime}s
                   </div>
                   
                   {viruses.map((v) => (
                        <div
                            key={v.id}
                            onMouseDown={(e) => shootVirus(e, v.id)}
                            className={`absolute transition-all duration-100 cursor-pointer ${v.isDead ? 'scale-150 opacity-0' : 'scale-100 animate-bounce'}`}
                            style={{ left: `${v.x}%`, top: `${v.y}%`, transform: 'translate(-50%, -50%)' }}
                        >
                            {!v.isDead && (
                                <div className="relative">
                                    <Bug className="w-12 h-12 text-red-600 drop-shadow-[0_0_10px_red]" />
                                    <div className="absolute -inset-2 border-2 border-red-500 rounded-full animate-ping opacity-50"></div>
                                </div>
                            )}
                            {v.isDead && <Target className="w-12 h-12 text-yellow-400" />}
                        </div>
                   ))}
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};