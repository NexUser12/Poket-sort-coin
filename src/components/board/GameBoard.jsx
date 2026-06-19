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
      
      {/* 3x5 Wooden Board */}
      <div className="wood-board w-full p-4.5 flex flex-col justify-center relative select-none">
        
        {/* Carved recess grid background */}
        <div className="grid grid-cols-5 gap-x-2 gap-y-3.5 w-full">
          {slots.map((_, idx) => (
            <CoinSlot key={idx} slotIndex={idx} />
          ))}
        </div>

        {/* Tutorial Banner Overlay */}
        {isTutorialMode && tutorialMessage && (
          <div className="absolute top-[48%] left-0 right-0 bg-black/85 border-y-3 border-amber-950/40 text-white font-black text-center py-2.5 z-40 text-base uppercase tracking-widest shadow-xl pointer-events-none select-none">
            {tutorialMessage}
          </div>
        )}
      </div>

      {/* Floating Settings Button in bottom right */}
      <button
        onClick={() => setSettingsOpen(true)}
        className="absolute bottom-2.5 right-4 w-13 h-13 bg-sky-500 hover:bg-sky-400 border-4 border-white rounded-full flex items-center justify-center text-xl shadow-[0_5px_12px_rgba(0,0,0,0.6)] cursor-pointer active:translate-y-0.5 transition-all z-30"
      >
        ⚙️
      </button>

      {/* Settings Modal Overlay */}
      {settingsOpen && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-6 rounded-3xl text-center">
          <div className="settings-wood-modal max-w-xs w-full p-6 text-white flex flex-col gap-4 shadow-2xl">
            <h2 className="text-xl font-black text-yellow-400 uppercase tracking-widest text-shadow-md">SETTINGS</h2>
            <p className="text-xs text-amber-200/70">Need a fresh start? Modify your game below.</p>
            <div className="flex flex-col gap-2.5 mt-2">
              <button
                onClick={() => {
                  resetLevel();
                  setSettingsOpen(false);
                }}
                className="btn-wood-3d py-2.5 text-xs font-black uppercase text-white rounded-xl"
              >
                RESET LEVEL
              </button>
              <button
                onClick={() => {
                  initLevel(1);
                  setSettingsOpen(false);
                }}
                className="btn-blue-3d py-2.5 text-xs font-black uppercase text-white rounded-xl"
              >
                RESTART GAME (Lvl 1)
              </button>
              <button
                onClick={() => setSettingsOpen(false)}
                className="btn-green-3d py-2.5 text-xs font-black uppercase text-white rounded-xl"
              >
                RESUME PLAY
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Win Modal Overlay */}
      {isWon && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-6 rounded-3xl text-center">
          <div className="settings-wood-modal max-w-xs w-full p-6 text-white flex flex-col items-center gap-3 border-4 border-yellow-500 shadow-[0_0_40px_rgba(245,158,11,0.5)]">
            <span className="text-5xl animate-bounce">🏆</span>
            <h2 className="text-2xl font-black text-yellow-400 uppercase tracking-widest text-shadow-md mt-1">
              LEVEL CLEAR!
            </h2>
            <p className="text-xs text-amber-100/80 mb-4">
              Awesome job! You successfully merged the coin stacks.
            </p>
            <div className="flex flex-col gap-2.5 w-full">
              <button
                onClick={nextLevel}
                className="w-full py-3 btn-green-3d text-white font-black rounded-xl tracking-wider text-sm"
              >
                NEXT LEVEL
              </button>
              <button
                onClick={resetLevel}
                className="w-full py-2 btn-wood-3d text-amber-200 font-bold text-xs rounded-xl"
              >
                REPLAY LEVEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal Overlay */}
      {isGameOver && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-6 rounded-3xl text-center">
          <div className="settings-wood-modal max-w-xs w-full p-6 text-white flex flex-col items-center gap-3 border-4 border-red-800 shadow-[0_0_40px_rgba(220,38,38,0.4)]">
            <span className="text-5xl">💀</span>
            <h2 className="text-2xl font-black text-red-500 uppercase tracking-widest text-shadow-md mt-1">
              OUT OF MOVES!
            </h2>
            <p className="text-xs text-amber-100/70 mb-4">
              All slots are locked or full, with no valid moves left.
            </p>
            <button
              onClick={resetLevel}
              className="w-full py-3 btn-wood-3d text-white font-black rounded-xl tracking-wider text-sm"
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
