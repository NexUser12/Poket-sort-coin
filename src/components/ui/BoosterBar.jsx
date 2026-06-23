import React from 'react';
import { useGameStore } from '../../store/useGameStore';

export const BoosterBar = () => {
  const coins = useGameStore((state) => state.coins);
  const undoStack = useGameStore((state) => state.undoStack) || [];
  const selectedSlot = useGameStore((state) => state.selectedSlot);
  const useUndo = useGameStore((state) => state.useUndo);
  const useShuffle = useGameStore((state) => state.useShuffle);
  const isWon = useGameStore((state) => state.isWon);
  const isGameOver = useGameStore((state) => state.isGameOver);

  const canUndo = undoStack.length > 0 && coins >= 20 && !isWon && !isGameOver;
  const canShuffle = coins >= 30 && !isWon && !isGameOver;

  return (
    <div className="w-full flex justify-around gap-3 p-4 bg-[#1f0d05] border-t-8 border-[#130702] rounded-t-3xl shadow-[0_-8px_20px_rgba(0,0,0,0.7)] select-none">
      {/* Undo Booster */}
      <button
        onClick={useUndo}
        disabled={!canUndo}
        className={`flex-1 py-2.5 px-1 rounded-2xl flex flex-col items-center justify-center transition-all duration-75
          ${
            canUndo
              ? 'btn-blue-3d text-white font-black cursor-pointer'
              : 'bg-[#150a04]/60 text-slate-600 border-2 border-[#2b170f]/50 cursor-not-allowed opacity-50'
          }`}
      >
        <span className="text-xl filter drop-shadow-md">↩️</span>
        <span className="text-[10px] font-black mt-1 uppercase tracking-wider text-stroke-brown">UNDO</span>
        <span className="text-[9px] font-black text-yellow-400 mt-0.5 text-stroke-brown">🪙 20</span>
      </button>

      {/* Shuffle Booster */}
      <button
        onClick={useShuffle}
        disabled={!canShuffle}
        className={`flex-1 py-2.5 px-1 rounded-2xl flex flex-col items-center justify-center transition-all duration-75
          ${
            canShuffle
              ? 'btn-wood-3d text-white font-black cursor-pointer'
              : 'bg-[#150a04]/60 text-slate-600 border-2 border-[#2b170f]/50 cursor-not-allowed opacity-50'
          }`}
      >
        <span className="text-xl filter drop-shadow-md">🔀</span>
        <span className="text-[10px] font-black mt-1 uppercase tracking-wider text-stroke-brown">SHUFFLE</span>
        <span className="text-[9px] font-black text-yellow-400 mt-0.5 text-stroke-brown">🪙 30</span>
      </button>
    </div>
  );
};

export default BoosterBar;
