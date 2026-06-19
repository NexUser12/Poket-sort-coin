import React, { useEffect } from 'react';
import Header from './components/ui/Header';
import GameBoard from './components/board/GameBoard';
import BoosterBar from './components/ui/BoosterBar';
import { useGameStore } from './store/useGameStore';

function App() {
  const initLevel = useGameStore((state) => state.initLevel);
  const currentLevel = useGameStore((state) => state.currentLevel);

  // Initialize first level on mount
  useEffect(() => {
    initLevel(currentLevel);
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between max-w-md mx-auto bg-[#1b0a05]/30 border-x-4 border-[#140803]/80 shadow-[0_0_60px_rgba(0,0,0,0.95)]">
      {/* Top Header stats */}
      <Header />

      {/* Main Board Area */}
      <GameBoard />

      {/* Bottom Boosters and Instructions */}
      <div className="flex flex-col">
        <BoosterBar />
        
        <footer className="w-full text-center pb-4 pt-2.5 px-4 bg-[#140803]/50">
          <p className="text-[10px] text-amber-600/70 font-black uppercase tracking-widest">
            Sort coins into matching stacks to merge them!
          </p>
          <p className="text-[8px] text-amber-800/60 font-semibold uppercase mt-0.5 tracking-wider">
            Collect 10 identical coins in a stack to trigger a merge.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
