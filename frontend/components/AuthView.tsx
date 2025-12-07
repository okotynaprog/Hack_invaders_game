import React, { useState } from 'react';
import { api } from '../services/api';
import { Button } from './Button';
import { UserPlus, LogIn } from 'lucide-react';

interface AuthViewProps {
  onSuccess: () => void;
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
                <circle cx="1980" cy="1042" r="534" fill="url(#auth_Linear1)"/>
            </g>
            <g transform="matrix(1.632538,0,0,1.632538,-1478.488191,-460.947094)">
                <circle cx="1980" cy="1042" r="534"/>
            </g>
            <g transform="matrix(1.498997,0,0,1.498997,-1214.077132,-321.797436)">
                <circle cx="1980" cy="1042" r="534" fill="url(#auth_Linear2)"/>
            </g>
            <g transform="matrix(1.26061,0,0,1.26061,-742.07048,-73.397975)">
                <circle cx="1980" cy="1042" r="534" fill="url(#auth_Linear3)"/>
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
        <linearGradient id="auth_Linear1" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="matrix(527.062992,744,-744,527.062992,1753.937008,698)">
          <stop offset="0" stopColor="rgb(37,37,38)" stopOpacity="1"/>
          <stop offset="1" stopColor="rgb(106,106,106)" stopOpacity="1"/>
        </linearGradient>
        <linearGradient id="auth_Linear2" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="matrix(636.280624,720.721604,-720.721604,636.280624,1648.182628,674.503341)">
          <stop offset="0" stopColor="rgb(207,0,212)" stopOpacity="1"/>
          <stop offset="1" stopColor="rgb(0,162,244)" stopOpacity="1"/>
        </linearGradient>
        <linearGradient id="auth_Linear3" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="matrix(646.384682,745.290547,-745.290547,646.384682,1660.298651,637.534921)">
          <stop offset="0" stopColor="rgb(252,206,255)" stopOpacity="1"/>
          <stop offset="1" stopColor="rgb(163,207,255)" stopOpacity="1"/>
        </linearGradient>
    </defs>
  </svg>
);

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegister) {
        await api.register(username, password, email);
        // Assuming user needs to login after register or we auto-login
        // Let's try to auto-login for UX
        await api.login(username, password);
      } else {
        await api.login(username, password);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Błąd połączenia z serwerem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black cyber-grid p-4">
      <div className="max-w-md w-full bg-gray-900 border border-cyan-500/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(0,255,204,0.1)] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
        
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-6">
            <LensLogo />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-wider">
            HACK<span className="text-cyan-400">INVADERS</span>
          </h1>
          <p className="text-gray-500 font-mono text-sm mt-2">BRAMA DOSTĘPOWA v2.0</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-cyan-400 text-xs font-mono mb-1">NAZWA UŻYTKOWNIKA</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
              placeholder="Neo"
            />
          </div>

          <div>
            <label className="block text-cyan-400 text-xs font-mono mb-1">HASŁO DOSTĘPU</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
              placeholder="••••••••"
            />
          </div>

          {isRegister && (
             <div>
               <label className="block text-cyan-400 text-xs font-mono mb-1">EMAIL (OPCJONALNIE)</label>
               <input
                 type="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                 placeholder="neo@matrix.com"
               />
             </div>
          )}

          {error && (
            <div className="p-3 bg-red-900/30 border border-red-500/50 rounded text-red-400 text-xs font-mono">
              ⚠ BŁĄD: {error}
            </div>
          )}

          <Button type="submit" isLoading={loading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 shadow-[0_0_20px_rgba(0,255,204,0.3)]">
            {isRegister ? 'UTWÓRZ KONTO' : 'ZALOGUJ SIĘ'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="text-gray-500 hover:text-cyan-400 text-xs font-mono underline transition-colors"
          >
            {isRegister ? 'MASZ JUŻ KONTO? ZALOGUJ SIĘ' : 'BRAK DOSTĘPU? ZAREJESTRUJ SIĘ'}
          </button>
        </div>
      </div>
    </div>
  );
};