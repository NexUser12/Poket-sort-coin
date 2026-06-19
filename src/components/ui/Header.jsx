import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import avatarImg from '../../avatar.png'; // Path to the copied avatar image

export const Header = () => {
  const currentLevel = useGameStore((state) => state.currentLevel);
  const coins = useGameStore((state) => state.coins);
  const score = useGameStore((state) => state.score);
  const slots = useGameStore((state) => state.slots) || [];
  const levelProgress = useGameStore((state) => state.levelProgress);

  // Find the highest value coin currently on the board
  const maxCoinVal = Math.max(0, ...slots.flatMap((s) => s.coins || []));

  // Threshold bubbles in the merge chain
  const bubbles = [5, 8, 10, 13, 15];

  return (
    <header className="w-full flex flex-col items-center gap-3 p-4 bg-gradient-to-b from-[#1c0b05] to-transparent">
      {/* Top Level & Progress Bar & Coin counter Row */}
      <div className="w-full flex items-center justify-between gap-3">
        {/* Level badge */}
        <div className="flex items-center gap-1.5">
          <div className="relative w-12 h-12 flex items-center justify-center filter drop-shadow-md">
            {/* Wooden Level Badge Shield */}
            <div className="absolute inset-0 bg-gradient-to-b from-amber-400 to-amber-600 rounded-lg rotate-45 border-4 border-[#250f03] shadow-md"></div>
            <div className="absolute inset-1 bg-gradient-to-b from-amber-500 to-amber-700 rounded-lg rotate-45"></div>
            <span className="relative text-white font-black text-lg text-shadow-sm select-none z-10">
              {currentLevel}
            </span>
          </div>
        </div>

        {/* Progress Bar (wood container, green fill) */}
        <div className="flex-1 max-w-xs bar-glass rounded-full h-7 px-1 flex items-center relative shadow-lg">
          <div
            style={{ width: `${levelProgress}%` }}
            className="h-4 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_12px_#10b981] relative overflow-hidden"
          >
            {/* Sheen effect inside progress bar */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
          </div>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-white text-shadow-md select-none">
            {levelProgress}%
          </span>
        </div>

        {/* Coins display */}
        <div className="flex items-center bg-[#250f03]/80 border-2 border-amber-900/40 px-3 py-1.5 rounded-full shadow-inner select-none">
          <span className="text-sm font-black text-yellow-400 flex items-center gap-1">
            🪙 <span className="text-white font-black">{coins}</span>
          </span>
        </div>
      </div>

      {/* Threshold Bubble Chain */}
      <div className="flex justify-center items-center gap-2 mt-1">
        {bubbles.map((val) => {
          const isUnlocked = maxCoinVal >= val;
          return (
            <div
              key={val}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black border-3 transition-all duration-300 relative select-none
                ${
                  isUnlocked
                    ? 'bg-gradient-to-b from-yellow-300 to-yellow-500 border-white text-yellow-950 shadow-[0_0_15px_#fbbf24] scale-110 animate-pulse'
                    : 'bg-[#150a04]/90 border-amber-950/40 text-gray-500'
                }`}
            >
              {isUnlocked && (
                <div className="absolute inset-0.5 rounded-full border border-white/40 pointer-events-none"></div>
              )}
              {val}
            </div>
          );
        })}
      </div>

      {/* Player Avatar */}
      <div className="relative w-16 h-16 rounded-full border-4 border-amber-900/60 shadow-[0_4px_10px_rgba(0,0,0,0.5)] overflow-hidden bg-[#2a1307]">
        <img
          src={avatarImg}
          alt="Player Avatar"
          className="w-full h-full object-cover pointer-events-none"
        />
        {/* Glow ring around avatar */}
        <div className="absolute inset-0 rounded-full border-2 border-yellow-500/20 pointer-events-none"></div>
      </div>
    </header>
  );
};

export default Header;
