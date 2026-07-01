import React from 'react';
import { useGameStore } from '../../store/useGameStore';

export const BoosterBar = () => {
  const coins = useGameStore((state) => state.coins);
  const undoStack = useGameStore((state) => state.undoStack) || [];
  const useUndo = useGameStore((state) => state.useUndo);
  const useShuffle = useGameStore((state) => state.useShuffle);
  const activateHammer = useGameStore((state) => state.activateHammer);
  const useMagnet = useGameStore((state) => state.useMagnet);
  const useExtraSlot = useGameStore((state) => state.useExtraSlot);
  const activeBooster = useGameStore((state) => state.activeBooster);
  const slots = useGameStore((state) => state.slots) || [];
  const isWon = useGameStore((state) => state.isWon);
  const isGameOver = useGameStore((state) => state.isGameOver);
  const isAnimating = useGameStore((state) => state.isAnimating);

  const canUndo = undoStack.length > 0 && !isWon && !isGameOver && !isAnimating;
  const canHammer = (coins >= 40 || activeBooster === 'hammer') && !isWon && !isGameOver && !isAnimating;
  const canMagnet = coins >= 50 && !isWon && !isGameOver && !isAnimating;
  const canShuffle = coins >= 30 && !isWon && !isGameOver && !isAnimating;

  const extraSlotsCount = slots.filter((s) => s.isExtraSlot).length;
  const canExtraSlot = coins >= 50 && extraSlotsCount < 2 && !isWon && !isGameOver && !isAnimating;

  return (
    <div className="w-full flex justify-around gap-1.5 p-3 bg-[#1f0d05] border-t-8 border-[#130702] rounded-t-3xl shadow-[0_-8px_20px_rgba(0,0,0,0.7)] select-none">
      {/* Undo Booster */}
      <button
        onClick={useUndo}
        disabled={!canUndo}
        className={`flex-1 py-2 px-0.5 rounded-2xl flex flex-col items-center justify-center transition-all duration-75
          ${
            canUndo
              ? 'btn-blue-3d text-white font-black cursor-pointer'
              : 'bg-[#150a04]/60 text-slate-600 border-2 border-[#2b170f]/50 cursor-not-allowed opacity-50'
          }`}
      >
        <span className="text-xl filter drop-shadow-md">↩️</span>
        <span className="text-[9px] font-black mt-1 uppercase tracking-wider text-stroke-brown">UNDO</span>
        <span className="text-[8px] font-black text-emerald-400 mt-0.5 text-stroke-brown">FREE</span>
      </button>

      {/* Hammer Booster */}
      <button
        onClick={activateHammer}
        disabled={!canHammer}
        className={`flex-1 py-2 px-0.5 rounded-2xl flex flex-col items-center justify-center transition-all duration-75
          ${activeBooster === 'hammer' ? 'btn-booster-active btn-red-3d text-white font-black cursor-pointer' : ''}
          ${
            canHammer && activeBooster !== 'hammer'
              ? 'btn-wood-3d text-white font-black cursor-pointer'
              : activeBooster === 'hammer'
              ? ''
              : 'bg-[#150a04]/60 text-slate-600 border-2 border-[#2b170f]/50 cursor-not-allowed opacity-50'
          }`}
      >
        <span className="text-xl filter drop-shadow-md">🔨</span>
        <span className="text-[9px] font-black mt-1 uppercase tracking-wider text-stroke-brown">HAMMER</span>
        <span className="text-[8px] font-black text-yellow-400 mt-0.5 text-stroke-brown">🪙 40</span>
      </button>

      {/* Magnet Booster */}
      <button
        onClick={useMagnet}
        disabled={!canMagnet}
        className={`flex-1 py-2 px-0.5 rounded-2xl flex flex-col items-center justify-center transition-all duration-75
          ${
            canMagnet
              ? 'btn-wood-3d text-white font-black cursor-pointer'
              : 'bg-[#150a04]/60 text-slate-600 border-2 border-[#2b170f]/50 cursor-not-allowed opacity-50'
          }`}
      >
        <span className="text-xl filter drop-shadow-md">🧲</span>
        <span className="text-[9px] font-black mt-1 uppercase tracking-wider text-stroke-brown">MAGNET</span>
        <span className="text-[8px] font-black text-yellow-400 mt-0.5 text-stroke-brown">🪙 50</span>
      </button>

      {/* Shuffle Booster */}
      <button
        onClick={useShuffle}
        disabled={!canShuffle}
        className={`flex-1 py-2 px-0.5 rounded-2xl flex flex-col items-center justify-center transition-all duration-75
          ${
            canShuffle
              ? 'btn-wood-3d text-white font-black cursor-pointer'
              : 'bg-[#150a04]/60 text-slate-600 border-2 border-[#2b170f]/50 cursor-not-allowed opacity-50'
          }`}
      >
        <span className="text-xl filter drop-shadow-md">🔀</span>
        <span className="text-[9px] font-black mt-1 uppercase tracking-wider text-stroke-brown">SHUFFLE</span>
        <span className="text-[8px] font-black text-yellow-400 mt-0.5 text-stroke-brown">🪙 30</span>
      </button>

      {/* Extra Slot Booster */}
      <button
        onClick={useExtraSlot}
        disabled={!canExtraSlot}
        className={`flex-1 py-2 px-0.5 rounded-2xl flex flex-col items-center justify-center transition-all duration-75
          ${
            canExtraSlot
              ? 'btn-wood-3d text-white font-black cursor-pointer'
              : 'bg-[#150a04]/60 text-slate-600 border-2 border-[#2b170f]/50 cursor-not-allowed opacity-50'
          }`}
      >
        <span className="text-xl filter drop-shadow-md">💼</span>
        <span className="text-[9px] font-black mt-1 uppercase tracking-wider text-stroke-brown">POCKET</span>
        <span className="text-[8px] font-black text-yellow-400 mt-0.5 text-stroke-brown">
          {extraSlotsCount >= 2 ? 'MAX' : '🪙 50'}
        </span>
      </button>
    </div>
  );
};

export default BoosterBar;
