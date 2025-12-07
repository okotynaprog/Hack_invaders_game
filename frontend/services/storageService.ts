
import { Skin } from '../types';

export const SKINS_DB: Skin[] = [
  { id: 'default', name: 'MK.1 BASIC', cost: 0, color: '#00ffcc', desc: 'Standardowy protokół' },
  { id: 'neon', name: 'CYBER-X', cost: 2500, color: '#ff00ff', desc: 'Zwiększona szybkość transferu' },
  { id: 'tank', name: 'IRON CLAD', cost: 6000, color: '#44aa44', desc: 'Wzmocniony pancerz logiczny' },
  { id: 'stealth', name: 'NIGHTSHADE', cost: 12000, color: '#555555', desc: 'Niewykrywalny dla prostych firewalli' },
  { id: 'hacker', name: 'ZERO COOL', cost: 500, color: '#00ff00', desc: 'PREMIUM: Legenda lat 90-tych' },
  { id: 'inferno', name: 'HELLFIRE', cost: 800, color: '#ff4400', desc: 'PREMIUM: Agresywny algorytm' },
  { id: 'gold', name: 'MIDAS PRIME', cost: 20000, color: '#ffd700', desc: 'LEGENDA: Złoty kod źródłowy' },
];

// Helper to get skin details by ID
export const getSkinById = (id: string): Skin | undefined => {
  return SKINS_DB.find(s => s.id === id);
};
