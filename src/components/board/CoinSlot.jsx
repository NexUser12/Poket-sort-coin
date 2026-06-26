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
  const mergeStates = useGameStore((state) => state.mergeStates) || {};
  const currentLevel = useGameStore((state) => state.currentLevel);
  const undoStack = useGameStore((state) => state.undoStack) || [];

  const [prevStatus, setPrevStatus] = React.useState(slot?.status || 'locked');
  const [showUnlockWipe, setShowUnlockWipe] = React.useState(false);

  const containerRef = React.useRef(null);
  const [containerHeight, setContainerHeight] = React.useState(120);

  React.useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateHeight = () => {
      const rect = el.getBoundingClientRect();
      if (rect.height > 0) {
        setContainerHeight(rect.height);
      }
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (slot && prevStatus === 'locked' && slot.status === 'unlocked') {
      setShowUnlockWipe(true);
      const timer = setTimeout(() => setShowUnlockWipe(false), 600);
      return () => clearTimeout(timer);
    }
    if (slot) {
      setPrevStatus(slot.status);
    }
  }, [slot?.status, prevStatus]);

  if (!slot) return null;

  const isSelected = selectedSlot === slotIndex;
  const mergeState = mergeStates[slotIndex];
  const isMergingCollapse = mergeState?.phase === 'collapse';
  const isMergingReveal = mergeState?.phase === 'reveal';
  const isMerging = isMergingReveal;
  const totalCoins = slot.coins.length;

  // Generate particles if merging
  const particles = React.useMemo(() => {
    if (!isMerging) return [];
    return Array.from({ length: 10 }).map((_, idx) => {
      const angle = (idx / 10) * 2 * Math.PI + (Math.random() - 0.5) * 0.3;
      const distance = 40 + Math.random() * 45; // 40px to 85px
      return {
        tx: `${Math.cos(angle) * distance}px`,
        ty: `${Math.sin(angle) * distance}px`,
        delay: `${Math.random() * 0.1}s`,
        char: Math.random() > 0.5 ? '⭐' : '✨',
      };
    });
  }, [isMerging]);

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
    const isFree = slot.unlockType === 'free';
    const isTimer = slot.unlockType === 'timer';
    const isUnavailable = slot.unlockType === 'unavailable';
    
    let cardClass = "slot-card slot-card-wood";
    if (isFree) cardClass = "slot-card slot-card-green";
    else if (isTimer) cardClass = "slot-card slot-card-orange";

    return (
      <div
        onClick={isUnavailable ? undefined : () => selectSlot(slotIndex)}
        className={`relative aspect-[1/1.5] w-full min-h-[90px] ${
          isUnavailable 
            ? 'opacity-40 cursor-not-allowed filter grayscale pointer-events-none' 
            : 'cursor-pointer hover:scale-[1.03] active:scale-[0.98]'
        } ${cardClass} transition-all duration-200 flex flex-col justify-center items-center p-2`}
      >
        {/* Card gloss sheen */}
        <div className="absolute inset-1 rounded-[14px] border border-white/10 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-10" />

        <div className="flex flex-col justify-center items-center gap-1.5 z-20">
          {/* Padlock Icon Badge */}
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] bg-black/20 border border-white/10 text-yellow-400 filter drop-shadow-[0_1px_1px_rgba(255,255,255,0.2)]">
            {isTimer ? '🕒' : '🔒'}
          </div>
          
          {/* Specific lock information */}
          {slot.unlockType === 'free' && (
            <span className="text-[10px] font-black tracking-wider text-white text-stroke-brown mt-0.5 animate-pulse">
              FREE
            </span>
          )}

          {slot.unlockType === 'timer' && (
            <div className="flex flex-col items-center gap-0">
              <span className="text-[10px] font-black tracking-wider text-white text-stroke-brown mt-0.5">
                {slot.timerStarted ? `${slot.unlockTimer}s` : '60 Sec'}
              </span>
              {!slot.timerStarted && (
                <span className="text-[7px] text-white/80 font-bold uppercase tracking-wider scale-90">
                  Tap to Start
                </span>
              )}
            </div>
          )}

          {!isFree && !isTimer && slot.unlockType !== 'unavailable' && (
            <span className="text-[9px] font-black tracking-wider text-yellow-300 text-stroke-brown mt-0.5 flex items-center gap-0.5">
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
      className={`relative aspect-[1/2.4] w-full min-h-[140px] cursor-pointer slot-trough flex flex-col justify-between items-center py-2 transition-all duration-200
        ${isSelected ? 'slot-trough-selected scale-[1.02]' : 'hover:scale-[1.01]'}`}
    >
      {/* Wipe Sweep VFX */}
      {showUnlockWipe && <div className="unlock-wipe-effect"></div>}

      {/* Spark particles on merge */}
      {isMerging && particles.map((p, idx) => (
        <span
          key={idx}
          className="spark-particle text-yellow-400"
          style={{
            '--tx': p.tx,
            '--ty': p.ty,
            left: '50%',
            top: '45%',
            marginLeft: '-7px',
            marginTop: '-7px',
            animationDelay: p.delay,
          }}
        >
          {p.char}
        </span>
      ))}



      {/* Coin Stack Container — coins render from back (top of slot) to front (bottom of slot) */}
      <div 
        ref={containerRef}
        className="flex-1 w-full relative z-20"
      >
        {(() => {
          const bottomPadding = 10;
          const maxStackHeight = Math.max(40, containerHeight - bottomPadding);
          const coinHeight = 36;
          const defaultStep = 10; // overlap step
          
          let dy = defaultStep;
          if (totalCoins > 1) {
            const neededHeight = coinHeight + (totalCoins - 1) * defaultStep;
            if (neededHeight > maxStackHeight) {
              dy = (maxStackHeight - coinHeight) / (totalCoins - 1);
            }
          }

          return [...slot.coins].reverse().map((coinVal, visualIdx) => {
            const realIdx = totalCoins - 1 - visualIdx;
            const bottomIdx = totalCoins - 1 - visualIdx;
            const isTopSeq = realIdx >= totalCoins - topSeqLength;
            const isLifted = isTopSeq && isSelected;

            // zIndex reverse so bottom coin overlaps top coins
            let zIndexValue = 20 + visualIdx;
            if (isLifted) zIndexValue = 50 + visualIdx;

            // Set default styles
            let style = {
              position: 'absolute',
              bottom: `${bottomPadding + bottomIdx * dy}px`,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: zIndexValue,
            };

            // Collapse animation for merge
            if (isMergingCollapse && isTopSeq) {
              const baseIdx = totalCoins - topSeqLength;
              const offsetCount = bottomIdx - baseIdx;
              style.transform = `translateX(-50%) translateY(${offsetCount * dy}px) scale(0)`;
              style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease-out';
              style.opacity = 0;
            }

            // Determine if the coin is one of the newly revealed coins
            const isCoinRevealing = isMergingReveal && (realIdx >= totalCoins - (mergeState?.count || 0));

            return (
              <div
                key={realIdx}
                style={style}
                className={isMergingCollapse && isTopSeq ? '' : 'transition-all duration-200'}
              >
                <Coin
                  value={coinVal}
                  isLifted={isLifted}
                  isRevealing={isCoinRevealing}
                  showNumber={realIdx === 0 || (visualIdx === 0 && isSelected)}
                />
              </div>
            );
          });
        })()}

        {/* Empty Slot Indicator */}
        {totalCoins === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25 z-10">
            <span className="text-[8px] font-black tracking-widest text-amber-900/90 uppercase rotate-90 scale-90">
              EMPTY
            </span>
          </div>
        )}
      </div>

      {hasPointer && <HandPointer />}
    </div>
  );
};

export default CoinSlot;
