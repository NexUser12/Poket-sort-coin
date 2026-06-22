import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import Coin from './Coin';

const HandPointer = () => (
  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 pointer-events-none z-50 animate-bounce">
    <svg width="56" height="56" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow */}
      <path
        d="M50 85 C55 90, 75 90, 80 80 C85 70, 85 50, 80 40 C75 30, 65 35, 60 30 C55 25, 55 15, 50 10 C45 5, 38 5, 35 15 C32 25, 32 35, 30 40 C28 45, 18 50, 15 58 C10 66, 12 76, 22 80 C32 84, 45 80, 50 85 Z"
        fill="black"
        opacity="0.3"
      />
      {/* Glove outline */}
      <path
        d="M48 83 C53 88, 73 88, 78 78 C83 68, 83 48, 78 38 C73 28, 63 33, 58 28 C53 23, 53 13, 48 8 C43 3, 36 3, 33 13 C30 23, 30 33, 28 38 C26 43, 16 48, 13 56 C8 64, 10 74, 20 78 C30 82, 43 78, 48 83 Z"
        fill="black"
      />
      {/* Glove body */}
      <path
        d="M48 81 C52 85, 71 85, 76 76 C81 67, 81 49, 76 39 C71 29, 62 34, 57 29 C52 24, 52 15, 48 10 C44 5, 38 5, 35 14 C32 23, 32 32, 30 37 C28 42, 18 47, 15 54 C11 61, 13 70, 22 74 C31 78, 44 74, 48 81 Z"
        fill="white"
      />
      {/* Cuff detail */}
      <rect x="35" y="73" width="20" height="5" rx="2" fill="#d1d5db" stroke="black" strokeWidth="1.5" />
    </svg>
  </div>
);

export const CoinSlot = ({ slotIndex }) => {
  const slot = useGameStore((state) => state.slots[slotIndex]);
  const slots = useGameStore((state) => state.slots) || [];
  const selectedSlot = useGameStore((state) => state.selectedSlot);
  const selectSlot = useGameStore((state) => state.selectSlot);
  const mergeEffects = useGameStore((state) => state.mergeEffects) || [];
  const currentLevel = useGameStore((state) => state.currentLevel);
  const undoStack = useGameStore((state) => state.undoStack) || [];

  if (!slot) return null;

  const isSelected = selectedSlot === slotIndex;
  const isMerging = mergeEffects.includes(slotIndex);
  const totalCoins = slot.coins.length;

  // Identify top sequence of identical coins to lift them when selected
  const getTopSequenceLength = (coins) => {
    if (coins.length === 0) return 0;
    const topCoin = coins[coins.length - 1];
    let count = 0;
    for (let i = coins.length - 1; i >= 0; i--) {
      if (coins[i] === topCoin) {
        count++;
      } else {
        break;
      }
    }
    return count;
  };

  const topSeqLength = getTopSequenceLength(slot.coins);

  // Tutorial logic
  const isTutorialMode = currentLevel === 1 && undoStack.length === 0;
  let hasPointer = false;

  if (isTutorialMode) {
    const isSlot5Locked = slots[5]?.status === 'locked';
    if (isSlot5Locked) {
      hasPointer = slotIndex === 5;
    } else {
      if (selectedSlot === null) {
        hasPointer = slotIndex === 10;
      } else if (selectedSlot === 10) {
        hasPointer = slotIndex === 5;
      }
    }
  }

  // Render Locked Slot Overlay
  if (slot.status === 'locked') {
    return (
      <div
        onClick={() => selectSlot(slotIndex)}
        className="relative aspect-[1/2.4] w-full min-h-[140px] rounded-2xl cursor-pointer slot-carved slot-carved-locked flex flex-col justify-between items-center p-2 border-2 border-dashed border-yellow-950 hover:border-amber-700/60 transition-all duration-200"
      >
        <div className="flex-1 flex flex-col justify-center items-center gap-2">
          {/* Padlock Icon */}
          <div className="w-10 h-10 rounded-full bg-yellow-950/80 border-2 border-amber-500/30 flex items-center justify-center text-lg shadow-inner">
            🔒
          </div>
          
          {/* Specific lock information */}
          {slot.unlockType === 'free' && (
            <span className="text-[10px] font-black tracking-widest text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30 animate-pulse">
              FREE
            </span>
          )}

          {slot.unlockType === 'timer' && (
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] font-black tracking-wider text-orange-400 bg-orange-950/80 px-1.5 py-0.5 rounded-full border border-orange-500/20">
                ⏰ {slot.timerStarted ? `${slot.unlockTimer}s` : '60 SEC'}
              </span>
              {!slot.timerStarted && (
                <span className="text-[8px] text-gray-500 font-bold uppercase mt-0.5">
                  Tap to Start
                </span>
              )}
              {slot.timerStarted && (
                <span className="text-[8px] text-yellow-500 bg-yellow-950/60 px-1 py-0.5 rounded font-black border border-yellow-600/20">
                  🪙 {slot.unlockCost} NOW
                </span>
              )}
            </div>
          )}

          {slot.unlockType === 'coins' && (
            <span className="text-[10px] font-black tracking-wider text-yellow-400 bg-yellow-950/80 px-1.5 py-0.5 rounded-full border border-yellow-500/20 flex items-center gap-0.5 shadow-sm">
              🪙 {slot.unlockCost}
            </span>
          )}
        </div>
        {hasPointer && <HandPointer />}
      </div>
    );
  }

  // Render Unlocked Slot
  return (
    <div
      onClick={() => selectSlot(slotIndex)}
      className={`relative aspect-[1/2.4] w-full min-h-[140px] rounded-2xl cursor-pointer slot-carved flex flex-col justify-between items-center py-2 transition-all duration-200
        ${isSelected ? 'slot-carved-selected scale-[1.03]' : 'hover:border-amber-900/60 hover:shadow-lg'}`}
    >
      {/* Capacity Counter */}
      <div className="text-[9px] font-black text-amber-500/70 bg-black/60 px-1.5 py-0.5 rounded-full z-20 border border-amber-950/30">
        <span className={totalCoins >= 10 ? 'text-red-500 font-black animate-pulse' : 'text-amber-400'}>
          {totalCoins}
        </span>
        /10
      </div>

      {/* Coin Stack Container */}
      <div className="flex-1 w-full flex flex-col-reverse justify-start items-center pt-8 pb-1 relative">
        {slot.coins.map((coinVal, idx) => {
          const isTopSeq = idx >= totalCoins - topSeqLength;
          return (
            <div
              key={idx}
              style={{
                marginTop: idx > 0 ? '-22px' : '0px',
                zIndex: totalCoins - idx + 5,
              }}
              className="transition-all duration-200"
            >
              <Coin
                value={coinVal}
                isLifted={isTopSeq && isSelected}
                isMerging={isMerging}
                showNumber={idx === 0}
              />
            </div>
          );
        })}

        {/* Empty Slot Indicator */}
        {totalCoins === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 z-10">
            <span className="text-[8px] font-black tracking-widest text-amber-900 uppercase rotate-90 scale-90">
              EMPTY
            </span>
          </div>
        )}
      </div>

      {/* Carved recess base shadow */}
      <div className="w-10 h-1.5 bg-black/55 rounded-full filter blur-[1px] border border-yellow-950/30 shadow-inner z-0"></div>
      
      {hasPointer && <HandPointer />}
    </div>
  );
};

export default CoinSlot;
