import React, { useState } from 'react';
import { ViewState } from '../types';
import { Terminal, ShieldAlert, ShoppingBag, Trophy, Menu, X, LogOut } from 'lucide-react';
import { api } from '../services/api';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  credits: number;
  onSecretClick?: () => void;
}

const LensLogo = () => (
  <svg 
    viewBox="0 0 1904 1904" 
    className="w-full h-full hover:rotate-90 transition-transform duration-700 ease-in-out"
    style={{ fillRule: 'evenodd', clipRule: 'evenodd', strokeLinejoin: 'round', strokeMiterlimit: 2 }}
  >
    <g transform="matrix(1,0,0,1,-801.937008,-288.15748)">
        <g id="Obiektyw">
            <g transform="matrix(1.782772,0,0,1.782772,-1775.950633,-617.49046)">
                <circle cx="1980" cy="1042" r="534" fill="url(#_Linear1)"/>
            </g>
            <g transform="matrix(1.632538,0,0,1.632538,-1478.488191,-460.947094)">
                <circle cx="1980" cy="1042" r="534"/>
            </g>
            <g transform="matrix(1.498997,0,0,1.498997,-1214.077132,-321.797436)">
                <circle cx="1980" cy="1042" r="534" fill="url(#_Linear2)"/>
            </g>
            <g transform="matrix(1.26061,0,0,1.26061,-742.07048,-73.397975)">
                <circle cx="1980" cy="1042" r="534" fill="url(#_Linear3)"/>
            </g>
            <g transform="matrix(1.154379,0,0,1.154379,-531.73277,37.2949)">
                <circle cx="1980" cy="1042" r="534" fill="rgb(5,0,55)"/>
            </g>
            <g transform="matrix(0.891386,0,0,0.891386,-11.006812,311.33351)">
                <circle cx="1980" cy="1042" r="534" fill="rgb(58,153,255)"/>
            </g>
            <g transform="matrix(0.741152,0,0,0.741152,286.455629,467.876876)">
                <circle cx="1980" cy="1042" r="534" fill="rgb(132,190,252)"/>
            </g>
            <g transform="matrix(0.206988,0,0,0.206988,1190.781514,874.722701)">
                <circle cx="1980" cy="1042" r="534" fill="rgb(213,232,252)"/>
            </g>
        </g>
    </g>
    <defs>
        <linearGradient id="_Linear1" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="matrix(527.062992,744,-744,527.062992,1753.937008,698)">
          <stop offset="0" stopColor="rgb(37,37,38)" stopOpacity="1"/>
          <stop offset="1" stopColor="rgb(106,106,106)" stopOpacity="1"/>
        </linearGradient>
        <linearGradient id="_Linear2" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="matrix(636.280624,720.721604,-720.721604,636.280624,1648.182628,674.503341)">
          <stop offset="0" stopColor="rgb(207,0,212)" stopOpacity="1"/>
          <stop offset="1" stopColor="rgb(0,162,244)" stopOpacity="1"/>
        </linearGradient>
        <linearGradient id="_Linear3" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="matrix(646.384682,745.290547,-745.290547,646.384682,1660.298651,637.534921)">
          <stop offset="0" stopColor="rgb(252,206,255)" stopOpacity="1"/>
          <stop offset="1" stopColor="rgb(163,207,255)" stopOpacity="1"/>
        </linearGradient>
    </defs>
  </svg>
);

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView, credits, onSecretClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  if (currentView === ViewState.AUTH) return null; // Hide nav on login screen

  const handleLogout = () => {
    api.logout();
    setView(ViewState.AUTH);
  };

  const navItems = [
    { id: ViewState.MENU, label: 'Baza', icon: Terminal },
    { id: ViewState.GAME, label: 'Włam (Gra)', icon: ShieldAlert },
    { id: ViewState.SHOP, label: 'Darknet', icon: ShoppingBag },
    { id: ViewState.LEADERBOARD, label: 'Ranking', icon: Trophy },
  ];

  return (
    <nav className="bg-black/90 border-b border-cyan-900/50 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer group" onClick={() => setView(ViewState.MENU)}>
              <div className="w-10 h-10 flex items-center justify-center">
                 <LensLogo />
              </div>
              <span className="text-xl font-bold text-cyan-400 tracking-wider hidden sm:block">
                HACK<span className="text-white">INVADERS</span>
              </span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`px-3 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all duration-200 ${
                  currentView === item.id
                    ? 'bg-cyan-900/30 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(0,255,204,0.2)]'
                    : 'text-gray-400 hover:text-cyan-200 hover:bg-gray-800'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
             {/* Hidden cheat trigger on click */}
             <div 
                onClick={onSecretClick}
                className="bg-gray-900 border border-purple-500/50 px-3 py-1 rounded text-purple-400 font-mono font-bold flex items-center gap-2 cursor-pointer active:scale-95 transition-transform select-none"
             >
                <span>💎</span>
                <span>{credits}</span>
             </div>

             <button 
                onClick={handleLogout}
                className="hidden md:flex items-center justify-center p-2 text-red-400 hover:text-red-300 transition-colors"
                title="Wyloguj"
             >
               <LogOut size={20} />
             </button>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-cyan-500 hover:text-white hover:bg-gray-800 focus:outline-none"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black border-b border-cyan-900/50 animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-4 rounded-md text-base font-bold flex items-center gap-3 ${
                  currentView === item.id
                    ? 'bg-cyan-900/20 text-cyan-400 border-l-4 border-cyan-500'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
            <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-4 rounded-md text-base font-bold flex items-center gap-3 text-red-400 hover:bg-red-900/20"
              >
                <LogOut size={20} />
                Wyloguj
              </button>
          </div>
        </div>
      )}
    </nav>
  );
};