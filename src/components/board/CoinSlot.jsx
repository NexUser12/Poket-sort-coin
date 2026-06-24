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
    
    // Choose theme colors for hexagonal border stroke
    const strokeColor = isFree ? '#22c55e' : isTimer ? '#f97316' : '#522b18';
    const highlightColor = isFree ? '#86efac' : isTimer ? '#fdba74' : '#783f24';
    const svgFilter = isFree 
      ? 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.6))' 
      : isTimer 
      ? 'drop-shadow(0 0 6px rgba(249, 115, 22, 0.6))' 
      : 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))';

    return (
      <div
        onClick={() => selectSlot(slotIndex)}
        className="relative aspect-[1/2.4] w-full min-h-[140px] cursor-pointer slot-carved hover:scale-[1.02] transition-transform duration-200 flex flex-col justify-between items-center p-2"
      >
        {/* Hexagonal Background Recess */}
        <div className="absolute inset-0 slot-hex-bg slot-hex-bg-locked shadow-inner" />
        {/* Inner shadow overlay */}
        <div className="absolute inset-0 slot-hex-bg bg-gradient-to-b from-black/60 via-transparent to-black/40 pointer-events-none" />

        {/* Hexagonal 3D border SVG overlay */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none slot-svg-border z-10" 
          viewBox="0 0 100 240" 
          preserveAspectRatio="none"
          style={{ filter: svgFilter }}
        >
          {/* Bevel shadow border */}
          <polygon
            points="50,0 100,36 100,204 50,240 0,204 0,36"
            fill="none"
            stroke="#100603"
            strokeWidth="8"
          />
          {/* Main border stroke */}
          <polygon
            points="50,0 100,36 100,204 50,240 0,204 0,36"
            fill="none"
            stroke={strokeColor}
            strokeWidth="4"
          />
          {/* Highlight stroke */}
          <polygon
            points="50,1 99,36 99,203 50,239 1,203 1,36"
            fill="none"
            stroke={highlightColor}
            strokeWidth="1.5"
          />
        </svg>

        <div className="flex-1 flex flex-col justify-center items-center gap-2 z-20">
          {/* Padlock Icon */}
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm shadow-md border-2
            ${isFree ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-400' : ''}
            ${isTimer ? 'bg-orange-950/90 border-orange-500/50 text-orange-400' : ''}
            ${!isFree && !isTimer ? 'bg-yellow-950/90 border-amber-500/30 text-yellow-500' : ''}`}
          >
            🔒
          </div>
          
          {/* Specific lock information */}
          {slot.unlockType === 'free' && (
            <span className="text-[9px] font-black tracking-widest text-emerald-400 bg-emerald-950/90 px-1.5 py-0.5 rounded-full border border-emerald-500/40 animate-pulse shadow-sm">
              FREE
            </span>
          )}

          {slot.unlockType === 'timer' && (
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[8px] font-black tracking-wider text-orange-400 bg-orange-950/90 px-1.5 py-0.5 rounded-full border border-orange-500/30 shadow-sm">
                ⏰ {slot.timerStarted ? `${slot.unlockTimer}s` : '60 SEC'}
              </span>
              {!slot.timerStarted && (
                <span className="text-[7px] text-orange-300/70 font-bold uppercase mt-0.5 tracking-wider">
                  Tap to Start
                </span>
              )}
              {slot.timerStarted && (
                <span className="text-[7px] text-yellow-400 bg-yellow-950/80 px-1 py-0.5 rounded font-black border border-yellow-600/30 shadow-sm">
                  🪙 {slot.unlockCost} NOW
                </span>
              )}
            </div>
          )}
        </div>
        {hasPointer && <HandPointer />}
      </div>
    );
  }

  // Render Unlocked Slot
  const strokeColor = isSelected ? '#f59e0b' : '#3e1b0c';
  const highlightColor = isSelected ? '#fef08a' : '#6d3118';
  const svgFilter = isSelected 
    ? 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.7))' 
    : 'drop-shadow(0 3px 5px rgba(0,0,0,0.6))';

  return (
    <div
      onClick={() => selectSlot(slotIndex)}
      className={`relative aspect-[1/2.4] w-full min-h-[140px] cursor-pointer slot-carved flex flex-col justify-between items-center py-2 transition-all duration-200
        ${isSelected ? 'scale-[1.03]' : 'hover:scale-[1.01]'}`}
    >
      {/* Wipe Sweep VFX */}
      {showUnlockWipe && <div className="unlock-wipe-effect"></div>}

      {/* Hexagonal Background Recess */}
      <div className="absolute inset-0 slot-hex-bg slot-hex-bg-dark shadow-inner" />
      {/* Inner shadow overlay */}
      <div className="absolute inset-0 slot-hex-bg bg-gradient-to-b from-black/80 via-transparent to-black/60 pointer-events-none" />

      {/* Hexagonal 3D border SVG overlay */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none slot-svg-border z-10" 
        viewBox="0 0 100 240" 
        preserveAspectRatio="none"
        style={{ filter: svgFilter }}
      >
        {/* Bevel shadow border */}
        <polygon
          points="50,0 100,36 100,204 50,240 0,204 0,36"
          fill="none"
          stroke="#100603"
          strokeWidth="8"
          strokeLinejoin="round"
        />
        {/* Main border stroke */}
        <polygon
          points="50,0 100,36 100,204 50,240 0,204 0,36"
          fill="none"
          stroke={strokeColor}
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {/* Highlight stroke */}
        <polygon
          points="50,1 99,36 99,203 50,239 1,203 1,36"
          fill="none"
          stroke={highlightColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>

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

      {/* Capacity Counter */}
      <div className="text-[9px] font-black text-amber-500/80 bg-black/75 px-1.5 py-0.5 rounded-full z-20 border border-amber-950/40 mt-1 shadow-md">
        <span className={totalCoins >= 10 ? 'text-red-500 font-black animate-pulse' : 'text-amber-400'}>
          {totalCoins}
        </span>
        /10
      </div>

      {/* Coin Stack Container — coins render from back (top of slot) to front (bottom of slot) */}
      <div 
        ref={containerRef}
        className="flex-1 w-full relative z-20"
      >
        {(() => {
          const bottomPadding = 14; // pb-3.5 is 14px
          const maxStackHeight = Math.max(40, containerHeight - bottomPadding);
          const coinHeight = 38;
          const defaultStep = 12; // 38px height - 26px overlap = 12px step
          
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

            // Set default styles
            let style = {
              position: 'absolute',
              bottom: `${bottomPadding + bottomIdx * dy}px`,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: totalCoins - visualIdx + 5,
            };

            // If this slot is currently in the collapse phase of a merge,
            // we animate the top merging coins to collapse down to the bottom-most coin of the sequence.
            if (isMergingCollapse && isTopSeq) {
              const baseIdx = totalCoins - topSeqLength;
              const offsetCount = bottomIdx - baseIdx;
              style.transform = `translateX(-50%) translateY(${offsetCount * dy}px) scale(0)`;
              style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease-out';
              style.opacity = 0;
            }

            // Determine if the coin is one of the newly revealed coins (which will pop in)
            const isCoinRevealing = isMergingReveal && (realIdx >= totalCoins - (mergeState?.count || 0));

            return (
              <div
                key={realIdx}
                style={style}
                className={isMergingCollapse && isTopSeq ? '' : 'transition-all duration-200'}
              >
                <Coin
                  value={coinVal}
                  isLifted={isTopSeq && isSelected}
                  isRevealing={isCoinRevealing}
                  showNumber={visualIdx === 0}
                />
              </div>
            );
          });
        })()}

        {/* Empty Slot Indicator */}
        {totalCoins === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 z-10">
            <span className="text-[8px] font-black tracking-widest text-amber-900/90 uppercase rotate-90 scale-90">
              EMPTY
            </span>
          </div>
        )}
      </div>

      {/* Carved recess base shadow */}
      <div className="w-10 h-1.5 bg-black/50 rounded-full filter blur-[1px] border border-yellow-950/20 shadow-inner z-0 mb-2"></div>
      
      {hasPointer && <HandPointer />}
    </div>
  );
};

export default CoinSlot;
