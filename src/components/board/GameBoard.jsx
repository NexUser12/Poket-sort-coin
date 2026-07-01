import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import CoinSlot from './CoinSlot';

export const GameBoard = () => {
  const slots = useGameStore((state) => state.slots) || [];
  const selectedSlot = useGameStore((state) => state.selectedSlot);
  const isWon = useGameStore((state) => state.isWon);
  const isGameOver = useGameStore((state) => state.isGameOver);
  const nextLevel = useGameStore((state) => state.nextLevel);
  const resetLevel = useGameStore((state) => state.resetLevel);
  const initLevel = useGameStore((state) => state.initLevel);
  const tickTimers = useGameStore((state) => state.tickTimers);
  const currentLevel = useGameStore((state) => state.currentLevel);
  const undoStack = useGameStore((state) => state.undoStack) || [];
  const dealCoins = useGameStore((state) => state.dealCoins);
  const isAnimating = useGameStore((state) => state.isAnimating);
  const activeMagnetEffect = useGameStore((state) => state.activeMagnetEffect);
  const activeBooster = useGameStore((state) => state.activeBooster);

  const canDeal = slots.some((s) => s.status === 'unlocked' && s.coins.length < 10) && !isWon && !isGameOver && !isAnimating;

  const [settingsOpen, setSettingsOpen] = useState(false);

  // Background timer ticker
  useEffect(() => {
    const timer = setInterval(() => {
      tickTimers();
    }, 1000);
    return () => clearInterval(timer);
  }, [tickTimers]);

  // Tutorial overlay conditions & messaging
  const isTutorialMode = currentLevel === 1 && undoStack.length === 0;
  let tutorialMessage = '';
  if (isTutorialMode) {
    const isSlot5Locked = slots[5]?.status === 'locked';
    if (isSlot5Locked) {
      tutorialMessage = 'Tap to UNLOCK';
    } else {
      if (selectedSlot === null) {
        tutorialMessage = 'Tap to TAKE';
      } else if (selectedSlot === 10) {
        tutorialMessage = 'Tap to PLACE';
      }
    }
  }

  return (
    <main className="w-full max-w-md mx-auto px-4 py-4 flex-1 flex flex-col justify-center items-center gap-6 relative">
      {/* Magnet Effect Overlay */}
      {activeMagnetEffect && (
        <div className="absolute inset-0 bg-black/40 rounded-3xl z-50 flex items-center justify-center pointer-events-none">
          <span className="magnet-overlay-effect">🧲</span>
        </div>
      )}

      {/* Hammer Active Banner */}
      {activeBooster === 'hammer' && (
        <div className="absolute top-[48%] left-0 right-0 bg-red-950/90 border-y-3 border-red-700/80 text-white font-black text-center py-2.5 z-40 text-xs uppercase tracking-widest shadow-2xl animate-pulse">
          🔨 Hammer Active! Tap a stack to smash
        </div>
      )}
      
      {/* 3D Perspective Container for Camera Angle */}
      <div className="perspective-container">
        {/* 3x5 Wooden Board */}
        <div className="wood-board w-full py-6 px-4 flex flex-col justify-center relative select-none">
          
          {/* Grid Rows aligned vertically */}
          <div className="flex flex-col gap-y-3 w-full relative z-10">
            {/* Row 0 (slots 0-4) */}
            <div className="flex justify-center gap-x-2.5 w-full z-10">
              {slots.slice(0, 5).map((s) => (
                <div key={s.index} className="w-[18%] max-w-[70px]">
                  <CoinSlot slotIndex={s.index} />
                </div>
              ))}
            </div>

            {/* Row 1 (slots 5-9) */}
            <div className="flex justify-center gap-x-2.5 w-full z-20">
              {slots.slice(5, 10).map((s) => (
                <div key={s.index} className="w-[18%] max-w-[70px]">
                  <CoinSlot slotIndex={s.index} />
                </div>
              ))}
            </div>

            {/* Row 2 (slots 10-14) */}
            <div className="flex justify-center gap-x-2.5 w-full z-30">
              {slots.slice(10, 15).map((s) => (
                <div key={s.index} className="w-[18%] max-w-[70px]">
                  <CoinSlot slotIndex={s.index} />
                </div>
              ))}
            </div>
          </div>

          {/* Tutorial Banner Overlay */}
          {isTutorialMode && tutorialMessage && (
            <div className="absolute top-[48%] left-0 right-0 bg-black/85 border-y-3 border-amber-950/40 text-white font-black text-center py-2.5 z-40 text-base uppercase tracking-widest shadow-xl pointer-events-none select-none">
              {tutorialMessage}
            </div>
          )}
        </div>
      </div>

      {/* Extra Pocket slots if purchased */}
      {slots.some((s) => s.isExtraSlot && (s.expiryTimer > 0 || s.coins.length > 0)) && (
        <div className="w-full max-w-[280px] flex flex-col items-center gap-1.5 p-3 bg-[#180904]/90 border-4 border-[#2d1102] rounded-2xl shadow-[inset_0_4px_10px_rgba(0,0,0,0.8),0_4px_15px_rgba(0,0,0,0.5)] -mt-2 z-20 animate-fade-in">
          <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest text-stroke-brown">
            💼 EXTRA POCKETS
          </span>
          <div className="flex gap-4 justify-center w-full">
            {slots.filter((s) => s.isExtraSlot && (s.expiryTimer > 0 || s.coins.length > 0)).map((s) => (
              <div key={s.index} className="w-[20%] max-w-[70px]">
                <CoinSlot slotIndex={s.index} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deal Button */}
      <div className="w-full flex justify-center -mt-2 z-20">
        <button
          onClick={dealCoins}
          disabled={!canDeal}
          className={`w-full max-w-xs py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all duration-75
            ${
              canDeal
                ? 'btn-green-3d text-white cursor-pointer'
                : 'bg-[#150a04]/60 text-slate-600 border-2 border-[#2b170f]/50 cursor-not-allowed opacity-50'
            }`}
        >
          <span>🃏</span> DEAL COINS
        </button>
      </div>

      {/* Floating Settings Button in bottom right */}
      <button
        onClick={() => setSettingsOpen(true)}
        className="absolute bottom-2.5 right-4 w-12 h-12 rounded-full flex items-center justify-center text-xl btn-gear-themed z-30"
      >
        ⚙️
      </button>

      {/* Settings Modal Overlay */}
      {settingsOpen && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-6 rounded-3xl text-center animate-fade-in">
          <div className="settings-wood-modal max-w-xs w-full p-6 text-white flex flex-col gap-4 shadow-2xl">
            <h2 className="text-2xl font-black text-yellow-400 uppercase tracking-widest text-stroke-brown">SETTINGS</h2>
            <p className="text-xs text-amber-200/80 font-semibold uppercase tracking-wider">Need a fresh start? Modify your game below.</p>
            <div className="flex flex-col gap-3 mt-2">
              <button
                onClick={() => {
                  resetLevel();
                  setSettingsOpen(false);
                }}
                className="btn-wood-3d py-3 text-xs font-black uppercase text-white rounded-2xl"
              >
                RESET LEVEL
              </button>
              <button
                onClick={() => {
                  initLevel(1);
                  setSettingsOpen(false);
                }}
                className="btn-blue-3d py-3 text-xs font-black uppercase text-white rounded-2xl"
              >
                RESTART GAME (Lvl 1)
              </button>
              <button
                onClick={() => setSettingsOpen(false)}
                className="btn-green-3d py-3 text-xs font-black uppercase text-white rounded-2xl"
              >
                RESUME PLAY
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Win Modal Overlay */}
      {isWon && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-6 rounded-3xl text-center">
          <div className="settings-wood-modal max-w-xs w-full p-6 text-white flex flex-col items-center gap-3 border-4 border-yellow-500 shadow-[0_0_50px_rgba(245,158,11,0.6)]">
            <span className="text-6xl animate-bounce filter drop-shadow-md">🏆</span>
            <h2 className="text-3xl font-black text-yellow-400 uppercase tracking-widest text-stroke-brown mt-1">
              LEVEL CLEAR!
            </h2>
            <p className="text-xs text-amber-100/90 font-bold uppercase tracking-wider mb-3">
              Awesome job! You successfully merged the coin stacks.
            </p>
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={nextLevel}
                className="w-full py-3.5 btn-green-3d text-white font-black rounded-2xl tracking-wider text-sm"
              >
                NEXT LEVEL
              </button>
              <button
                onClick={resetLevel}
                className="w-full py-2.5 btn-wood-3d text-amber-200 font-black text-xs rounded-2xl"
              >
                REPLAY LEVEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal Overlay */}
      {isGameOver && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-6 rounded-3xl text-center">
          <div className="settings-wood-modal max-w-xs w-full p-6 text-white flex flex-col items-center gap-3 border-4 border-red-700 shadow-[0_0_50px_rgba(220,38,38,0.5)]">
            <span className="text-6xl animate-pulse filter drop-shadow-md">💀</span>
            <h2 className="text-3xl font-black text-red-500 uppercase tracking-widest text-stroke-brown mt-1">
              OUT OF MOVES!
            </h2>
            <p className="text-xs text-amber-100/90 font-bold uppercase tracking-wider mb-3">
              All slots are locked or full, with no valid moves left.
            </p>
            <button
              onClick={resetLevel}
              className="w-full py-3.5 btn-wood-3d text-white font-black rounded-2xl tracking-wider text-sm"
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default GameBoard;
