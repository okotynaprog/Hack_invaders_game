import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { GameView } from './components/GameView';
import { ShopView } from './components/ShopView';
import { AuthView } from './components/AuthView';
import { LeaderboardView } from './components/LeaderboardView';
import { ViewState } from './types';
import { api } from './services/api';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.AUTH);
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    if (api.isAuthenticated()) {
      setCurrentView(ViewState.MENU);
      refreshUserData();
    }
  }, []);

  const refreshUserData = () => {
    if (api.user) {
      setCredits(api.user.credits || 0);
    }
  };

  const handleUpdateCredits = (newAmount: number) => {
    setCredits(newAmount);
    if (api.user) {
      api.user.credits = newAmount;
      localStorage.setItem('echo_user', JSON.stringify(api.user));
    }
  };

  const handleSecretCheat = async () => {
    const newAmount = credits + 1000;
    setCredits(newAmount);
    
    if (api.user) {
      api.user.credits = newAmount;
      localStorage.setItem('echo_user', JSON.stringify(api.user));
      await api.syncData({
        totalMbCollected: 0,
        highscoreSession: 0,
        credits: newAmount
      });
    }
  };

  const onLoginSuccess = () => {
    setCurrentView(ViewState.MENU);
    refreshUserData();
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewState.AUTH:
        return <AuthView onSuccess={onLoginSuccess} />;
      case ViewState.MENU:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-fade-in px-4">
            <h1 className="text-4xl md:text-6xl font-bold text-cyan-400 tracking-tighter neon-text">
              HACK<span className="text-white">INVADERS</span>
            </h1>
            <p className="text-gray-400 max-w-lg mx-auto font-mono text-sm md:text-base">
              SYSTEM NARUSZONY. TWOIM CELEM JEST EKSTRAKCJA DANYCH (DIAMENTÓW) Z SERWERA KORPORACJI BEZ AKTYWACJI SYSTEMÓW OBRONNYCH (WIRUSÓW).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
              <button 
                onClick={() => setCurrentView(ViewState.GAME)}
                className="bg-cyan-600 hover:bg-cyan-500 text-white py-4 rounded font-bold tracking-widest shadow-[0_0_15px_rgba(0,255,204,0.4)] transition-all"
              >
                ROZPOCZNIJ WŁAM
              </button>
              <button 
                onClick={() => setCurrentView(ViewState.SHOP)}
                className="bg-purple-900/50 hover:bg-purple-800/50 border border-purple-500 text-purple-300 py-4 rounded font-bold tracking-widest transition-all"
              >
                DARKNET SKLEP
              </button>
            </div>
          </div>
        );
      case ViewState.GAME:
        return <GameView userCredits={credits} onUpdateCredits={handleUpdateCredits} />;
      case ViewState.SHOP:
        return <ShopView onUpdate={refreshUserData} />;
      case ViewState.LEADERBOARD:
        return <LeaderboardView />;
      default:
        return <AuthView onSuccess={onLoginSuccess} />;
    }
  };

  return (
    <div className="h-screen bg-black cyber-grid flex flex-col overflow-hidden">
      {currentView !== ViewState.AUTH && (
         <Navigation 
            currentView={currentView} 
            setView={setCurrentView} 
            credits={credits} 
            onSecretClick={handleSecretCheat}
         />
      )}
      
      <main className="flex-grow w-full h-full relative overflow-hidden flex flex-col">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;