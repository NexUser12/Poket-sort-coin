import React from 'react';
import { useGameStore } from '../../store/useGameStore';

export const BoosterBar = () => {
  const coins = useGameStore((state) => state.coins);
  const undoStack = useGameStore((state) => state.undoStack) || [];
  const selectedSlot = useGameStore((state) => state.selectedSlot);
  const useUndo = useGameStore((state) => state.useUndo);
  const useShuffle = useGameStore((state) => state.useShuffle);
  const useClearSlot = useGameStore((state) => state.useClearSlot);
  const isWon = useGameStore((state) => state.isWon);
  const isGameOver = useGameStore((state) => state.isGameOver);

  const canUndo = undoStack.length > 0 && coins >= 20 && !isWon && !isGameOver;
  const canShuffle = coins >= 30 && !isWon && !isGameOver;
  const canClearSlot = selectedSlot !== null && coins >= 40 && !isWon && !isGameOver;

  return (
    <div className="w-full flex justify-around gap-3 p-4 bg-[#230f06]/95 border-t-4 border-[#140803] rounded-t-2xl shadow-[0_-5px_15px_rgba(0,0,0,0.5)] select-none">
      {/* Undo Booster */}
      <button
        onClick={useUndo}
        disabled={!canUndo}
        className={`flex-1 py-2.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all duration-75
          ${
            canUndo
              ? 'btn-blue-3d text-white font-bold cursor-pointer'
              : 'bg-blue-950/20 text-blue-900 border border-blue-950/40 cursor-not-allowed'
          }`}
      >
        <span className="text-xl">↩️</span>
        <span className="text-[10px] font-black mt-1 uppercase tracking-wider">UNDO</span>
        <span className="text-[9px] font-black text-yellow-400 mt-0.5">🪙 20</span>
      </button>

      {/* Shuffle Booster */}
      <button
        onClick={useShuffle}
        disabled={!canShuffle}
        className={`flex-1 py-2.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all duration-75
          ${
            canShuffle
              ? 'btn-wood-3d text-white font-bold cursor-pointer'
              : 'bg-amber-950/20 text-amber-900 border border-amber-950/40 cursor-not-allowed'
          }`}
      >
        <span className="text-xl">🔀</span>
        <span className="text-[10px] font-black mt-1 uppercase tracking-wider">SHUFFLE</span>
        <span className="text-[9px] font-black text-yellow-400 mt-0.5">🪙 30</span>
      </button>

      {/* Clear Top Booster */}
      <button
        onClick={useClearSlot}
        disabled={!canClearSlot}
        className={`flex-1 py-2.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all duration-75
          ${
            canClearSlot
              ? 'btn-green-3d text-white font-bold cursor-pointer'
              : 'bg-emerald-950/20 text-emerald-900 border border-emerald-950/40 cursor-not-allowed'
          }`}
      >
        <span className="text-xl">🗑️</span>
        <span className="text-[10px] font-black mt-1 uppercase tracking-wider text-center leading-none">CLEAR SLOT</span>
        <span className="text-[9px] font-black text-yellow-400 mt-0.5">🪙 40</span>
      </button>
    </div>
  );
};

export default BoosterBar;
