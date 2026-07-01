import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import Coin from './Coin';

const COIN_VFX_COLORS = {
  1: ['#ff8e6e', '#ff5722', '#ffd8cc'], // Copper/Bronze
  2: ['#ffffff', '#eceff1', '#90a4ae'], // Silver
  3: ['#ffd54f', '#ffb300', '#fffde7'], // Gold
  4: ['#00e5ff', '#00bcd4', '#e0f7fa'], // Cyan
  5: ['#40c4ff', '#0091ea', '#d0f0ff'], // Blue
  6: ['#ff1744', '#d50000', '#ffcdd2'], // Red
  8: ['#00e676', '#00c853', '#e8f5e9'], // Green
  10: ['#d500f9', '#aa00ff', '#f3e5f5'], // Purple
  13: ['#ff4081', '#f50057', '#f8bbd0'], // Pink
  15: ['#ffea00', '#ffd600', '#ffffff'], // Legendary
};

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
  const isSmashing = mergeState?.phase === 'smash';
  const isMerging = isMergingReveal;
  const totalCoins = slot.coins.length;

  const newCoinVal = slot.coins.length > 0 ? slot.coins[slot.coins.length - 1] : 3;

  // Generate explosion details if merging
  const explosionVFX = React.useMemo(() => {
    if (!isMergingReveal) return null;

    const colors = COIN_VFX_COLORS[newCoinVal] || ['#ffd54f', '#ffb300', '#ffffff'];

    // Generate Sparks (colored circles)
    const sparks = Array.from({ length: 14 }).map((_, idx) => {
      const angle = (idx / 14) * 2 * Math.PI + (Math.random() - 0.5) * 0.25;
      const distance = 35 + Math.random() * 60; // 35px to 95px
      const size = 5 + Math.random() * 6; // 5px to 11px
      return {
        id: `spark-${idx}`,
        tx: `${Math.cos(angle) * distance}px`,
        ty: `${Math.sin(angle) * distance}px`,
        delay: `${Math.random() * 0.12}s`,
        duration: `${0.45 + Math.random() * 0.25}s`,
        size: `${size}px`,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    });

    // Generate Stars (text characters like ⭐, ✨, ✦)
    const starSymbols = Array.from({ length: 10 }).map((_, idx) => {
      const angle = ((idx + 0.5) / 10) * 2 * Math.PI + (Math.random() - 0.5) * 0.3;
      const distance = 40 + Math.random() * 55; // 40px to 95px
      const size = 10 + Math.random() * 8; // 10px to 18px
      const char = ['⭐', '✨', '✦'][Math.floor(Math.random() * 3)];
      return {
        id: `star-${idx}`,
        tx: `${Math.cos(angle) * distance}px`,
        ty: `${Math.sin(angle) * distance}px`,
        delay: `${Math.random() * 0.1}s`,
        duration: `${0.55 + Math.random() * 0.25}s`,
        size: `${size}px`,
        char,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    });

    return {
      sparks,
      starSymbols,
      primaryColor: colors[0],
      glowColor: colors[1] || colors[0],
    };
  }, [isMergingReveal, newCoinVal]);

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
  if (slot.status === 'locked' || slot.status === 'locked-extra') {
    const isFree = slot.unlockType === 'free';
    const isTimer = slot.unlockType === 'timer';
    const isUnavailable = slot.unlockType === 'unavailable';
    const isExtra = slot.status === 'locked-extra';
    
    let cardClass = "slot-card slot-card-wood";
    if (isFree) cardClass = "slot-card slot-card-green";
    else if (isTimer) cardClass = "slot-card slot-card-orange";
    else if (isExtra) cardClass = "slot-card border-2 border-dashed border-yellow-500/40 bg-black/40 shadow-inner";

    return (
      <div
        onClick={isUnavailable ? undefined : () => selectSlot(slotIndex)}
        className={`relative aspect-[1/2.4] w-full min-h-[140px] ${ // Matches unlocked slot dimensions
          isUnavailable 
            ? 'opacity-40 cursor-not-allowed filter grayscale pointer-events-none' 
            : 'cursor-pointer hover:scale-[1.03] active:scale-[0.98]'
        } ${cardClass} transition-all duration-200 flex flex-col justify-center items-center p-2`}
      >
        {/* Card gloss sheen */}
        <div className="absolute inset-1 rounded-[14px] border border-white/10 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-10" />

        <div className="flex flex-col justify-center items-center gap-2.5 z-20">
          {/* Padlock Icon Badge */}
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-base shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] bg-black/20 border border-white/10 text-yellow-400 filter drop-shadow-[0_1px_1px_rgba(255,255,255,0.2)]">
            {isTimer ? '🕒' : isExtra ? '➕' : '🔒'}
          </div>
          
          {/* Specific lock information */}
          {slot.unlockType === 'free' && (
            <span className="text-[11px] font-black tracking-widest text-white text-stroke-brown mt-0.5 animate-pulse">
              FREE
            </span>
          )}

          {slot.unlockType === 'timer' && (
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[11px] font-black tracking-widest text-white text-stroke-brown mt-0.5">
                {slot.timerStarted ? `${slot.unlockTimer}s` : '60 Sec'}
              </span>
              {!slot.timerStarted && (
                <span className="text-[7.5px] text-white/80 font-black uppercase tracking-wider scale-95">
                  Tap to Start
                </span>
              )}
            </div>
          )}

          {!isFree && !isTimer && slot.unlockType !== 'unavailable' && (
            <span className="text-[10px] font-black tracking-wider text-yellow-300 text-stroke-brown mt-0.5 flex items-center gap-0.5">
              🪙 {slot.unlockCost}
            </span>
          )}
        </div>
        {hasPointer && <HandPointer />}
      </div>
    );
  }

  // Render Unlocked Slot
  const isExpired = slot.isExtraSlot && slot.expiryTimer === 0;

  return (
    <div
      onClick={() => selectSlot(slotIndex)}
      className={`relative aspect-[1/2.4] w-full min-h-[140px] cursor-pointer slot-trough flex flex-col justify-between items-center py-2 transition-all duration-200
        ${isSelected ? 'slot-trough-selected scale-[1.02]' : 'hover:scale-[1.01]'}
        ${isExpired ? 'slot-trough-expired' : ''}
        ${isSmashing ? 'slot-shaking' : ''}`}
    >
      {/* Timer Badge for Extra Slot */}
      {slot.isExtraSlot && slot.expiryTimer > 0 && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-950 border border-yellow-500 rounded-full px-2 py-0.5 text-[8.5px] font-black text-yellow-400 whitespace-nowrap shadow-md z-30 animate-pulse flex items-center gap-0.5">
          🕒 {slot.expiryTimer}s
        </div>
      )}
      {slot.isExtraSlot && slot.expiryTimer === 0 && slot.coins.length > 0 && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-red-950 border border-red-500 rounded-full px-2 py-0.5 text-[8.5px] font-black text-red-400 whitespace-nowrap shadow-md z-30 animate-pulse flex items-center gap-0.5">
          ⚠️ OUT ONLY
        </div>
      )}

      {/* Wipe Sweep VFX */}
      {showUnlockWipe && <div className="unlock-wipe-effect"></div>}

      {/* Hammer smash VFX */}
      {isSmashing && <span className="hammer-animation">🔨</span>}

      {/* Rich explosion VFX on merge */}
      {isMergingReveal && explosionVFX && (
        <div className="absolute inset-0 pointer-events-none z-40 overflow-visible">
          {/* Central Glow Flash */}
          <div 
            className="explosion-glow"
            style={{
              '--glow-color': explosionVFX.glowColor,
              left: '50%',
              top: '45%',
            }}
          />

          {/* Expanding Shockwave Ring */}
          <div 
            className="explosion-shockwave"
            style={{
              '--shockwave-color': explosionVFX.primaryColor,
              left: '50%',
              top: '45%',
            }}
          />

          {/* Spark circle particles */}
          {explosionVFX.sparks.map((s) => (
            <div
              key={s.id}
              className="vfx-particle-spark"
              style={{
                '--tx': s.tx,
                '--ty': s.ty,
                '--color': s.color,
                '--size': s.size,
                left: '50%',
                top: '45%',
                animationDelay: s.delay,
                animationDuration: s.duration,
              }}
            />
          ))}

          {/* Star symbol particles */}
          {explosionVFX.starSymbols.map((st) => (
            <span
              key={st.id}
              className="vfx-particle-star"
              style={{
                '--tx': st.tx,
                '--ty': st.ty,
                color: st.color,
                fontSize: st.size,
                left: '50%',
                top: '45%',
                animationDelay: st.delay,
                animationDuration: st.duration,
              }}
            >
              {st.char}
            </span>
          ))}
        </div>
      )}



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
                className={isMergingCollapse && isTopSeq ? '' : `transition-all duration-200 ${isSmashing ? 'coin-shattering' : ''}`}
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
