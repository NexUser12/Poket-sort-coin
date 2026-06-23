import React from 'react';
import { useGameStore } from '../../store/useGameStore';

export const Header = () => {
  const goalType = useGameStore((state) => state.goalType) || 5;
  const goalAmount = useGameStore((state) => state.goalAmount) || 5;
  const goalCollected = useGameStore((state) => state.goalCollected) || 0;

  return (
    <header className="w-full flex flex-col items-center gap-3.5 p-4 bg-gradient-to-b from-[#1c0803] to-transparent">
      {/* Top Level & Progress Bar & Coin counter Row */}
      <div className="w-full flex items-center justify-end gap-3">
        {/* Goal display */}
        <div className="flex flex-col items-end gap-1.5 select-none">
          <div className="flex items-center bg-gradient-to-b from-[#2a1307] to-[#140803] border-3 border-amber-800 px-2 py-0.5 rounded-full shadow-lg gap-1.5">
            <span className="text-[9px] font-black text-amber-300 uppercase tracking-wider text-stroke-brown">GOAL</span>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border coin-face-${goalType}`}>
              {goalType}
            </div>
            <span className="text-xs font-black text-white text-stroke-brown">
              {goalCollected}/{goalAmount}
            </span>
          </div>
        </div>
      </div>

    </header>
  );
};

export default Header;
