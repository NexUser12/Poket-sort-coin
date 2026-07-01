import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';
import Coin from '../board/Coin';

export const Header = () => {
  const goalType = useGameStore((state) => state.goalType) || 5;
  const goalAmount = useGameStore((state) => state.goalAmount) || 5;
  const goalCollected = useGameStore((state) => state.goalCollected) || 0;
  const currentLevel = useGameStore((state) => state.currentLevel) || 1;
  const coins = useGameStore((state) => state.coins) || 0;

  const [animate, setAnimate] = useState(false);
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 450);
    return () => clearTimeout(timer);
  }, [goalCollected]);

  return (
    <header className="w-full flex flex-col items-center gap-3.5 p-4 bg-gradient-to-b from-[#1c0803]/80 to-transparent">
      {/* Top HUD Row */}
      <div className="w-full flex items-center justify-between gap-3">
        {/* Left Side: Level Badge */}
        <div className="flex items-center h-12 bg-gradient-to-b from-[#2a1307] to-[#140803] border-3 border-amber-800 px-4 rounded-2xl shadow-[0_6px_12px_rgba(0,0,0,0.6)] select-none">
          <span className="text-sm font-black text-amber-300 uppercase tracking-widest text-stroke-brown">
            LEVEL {currentLevel}
          </span>
        </div>

        {/* Center: Coins Badge */}
        <div className="flex items-center h-12 bg-gradient-to-b from-[#2a1307] to-[#140803] border-3 border-amber-800 px-3.5 rounded-2xl shadow-[0_6px_12px_rgba(0,0,0,0.6)] gap-1.5 select-none">
          <span className="text-xl filter drop-shadow-md">🪙</span>
          <span className="text-sm font-black text-yellow-400 text-stroke-brown">
            {coins}
          </span>
        </div>

        {/* Right Side: Redesigned Goal Badge */}
        <div className="flex flex-col items-end gap-1.5 select-none">
          <div 
            className={`relative flex items-center h-12 pl-10 pr-4 rounded-2xl bg-gradient-to-b from-[#2a1307] to-[#140803] border-3 border-amber-800 shadow-[0_6px_12px_rgba(0,0,0,0.6)] gap-2 transition-all duration-75 ${
              animate ? 'animate-hud-bump' : ''
            }`}
          >
            {/* Enlarged 3D Coin overlapping the border */}
            <div className="absolute -left-5 top-1/2 -translate-y-1/2 scale-80 origin-center z-10 pointer-events-none">
              <Coin value={goalType} showNumber={true} />
            </div>

            {/* Labels */}
            <div className="flex flex-col items-start justify-center">
              <span className="text-[8px] font-black text-amber-400 uppercase tracking-wider text-stroke-brown leading-none">
                GOAL
              </span>
              <span className="text-base font-black text-white text-stroke-brown leading-none mt-0.5">
                {goalCollected} <span className="text-amber-500/80">/</span> {goalAmount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
