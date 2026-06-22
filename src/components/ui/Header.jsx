import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import avatarImg from '../../avatar.png'; // Path to the copied avatar image

export const Header = () => {
  const currentLevel = useGameStore((state) => state.currentLevel);
  const coins = useGameStore((state) => state.coins);
  const score = useGameStore((state) => state.score);
  const slots = useGameStore((state) => state.slots) || [];
  const levelProgress = useGameStore((state) => state.levelProgress);
  const claimDailyReward = useGameStore((state) => state.claimDailyReward);
  const lastClaimedDate = useGameStore((state) => state.lastClaimedDate);
  const goalType = useGameStore((state) => state.goalType) || 8;
  const goalAmount = useGameStore((state) => state.goalAmount) || 5;
  const goalCollected = useGameStore((state) => state.goalCollected) || 0;

  const [showDailyModal, setShowDailyModal] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(null);

  // Find the highest value coin currently on the board
  const maxCoinVal = Math.max(0, ...slots.flatMap((s) => s.coins || []));

  // Threshold bubbles in the merge chain
  const bubbles = [5, 8, 10, 13, 15];

  const handleClaimReward = () => {
    const success = claimDailyReward();
    setClaimSuccess(success);
  };

  return (
    <header className="w-full flex flex-col items-center gap-3.5 p-4 bg-gradient-to-b from-[#1c0803] to-transparent">
      {/* Top Level & Progress Bar & Coin counter Row */}
      <div className="w-full flex items-center justify-between gap-3">
        {/* Level badge */}
        <div className="flex items-center gap-1.5">
          <div className="relative w-12 h-12 flex items-center justify-center filter drop-shadow-md">
            {/* Wooden Level Badge Shield */}
            <div className="absolute inset-0 bg-gradient-to-b from-amber-400 to-amber-600 rounded-xl rotate-45 border-4 border-[#250f03] shadow-md"></div>
            <div className="absolute inset-1 bg-gradient-to-b from-amber-500 to-amber-700 rounded-xl rotate-45"></div>
            <span className="relative text-white font-black text-xl text-stroke-brown select-none z-10">
              {currentLevel}
            </span>
          </div>
        </div>

        {/* Progress Bar (wood container, green fill) */}
        <div className="flex-1 max-w-xs bar-glass rounded-full h-8 px-1.5 flex items-center relative shadow-lg">
          <div
            style={{ width: `${levelProgress}%` }}
            className="h-5 bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_15px_#10b981] relative overflow-hidden"
          >
            {/* Sheen effect inside progress bar */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/35 to-transparent"></div>
          </div>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-white text-stroke-brown select-none uppercase tracking-widest">
            {levelProgress}%
          </span>
        </div>

        {/* Coins display & Goal display */}
        <div className="flex flex-col items-end gap-1.5 select-none">
          <div className="flex items-center bg-gradient-to-b from-[#3c1e10] to-[#1c0c05] border-3 border-[#ffb300] px-3.5 py-1 rounded-full shadow-lg">
            <span className="text-xs font-black text-yellow-400 flex items-center gap-1.5 drop-shadow-md text-stroke-brown">
              🪙 <span className="text-white font-black">{coins}</span>
            </span>
          </div>

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

      {/* Premium Stats & Interactions Badges Row */}
      <div className="w-full flex items-center justify-center gap-3 select-none">
        {/* Trophy Badge */}
        <div className="badge-pill-container flex items-center gap-1.5 hover:scale-[1.03] transition-transform">
          <span className="text-sm filter drop-shadow-sm">🏆</span>
          <span className="text-[10px] font-black text-amber-200 tracking-wider">SCORE:</span>
          <span className="text-xs font-black text-white">{score}</span>
        </div>

        {/* Gem Badge */}
        <div 
          onClick={() => alert("Gems Shop unlocks at Level 5!")}
          className="badge-pill-container flex items-center gap-1.5 cursor-pointer hover:scale-[1.03] transition-transform"
        >
          <span className="text-sm filter drop-shadow-sm">💎</span>
          <span className="text-xs font-black text-cyan-400">25</span>
        </div>

        {/* Calendar (Daily Reward) Badge */}
        <button
          onClick={() => {
            setShowDailyModal(true);
            setClaimSuccess(null);
          }}
          className="badge-circle-container text-base hover:scale-108 transition-all flex items-center justify-center relative"
          title="Daily Reward"
        >
          📅
          {/* Notification pulsing dot if reward is claimable today */}
          {lastClaimedDate !== new Date().toDateString() && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border border-[#1c0c05] rounded-full animate-ping"></span>
          )}
          {lastClaimedDate !== new Date().toDateString() && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border border-[#1c0c05] rounded-full"></span>
          )}
        </button>
      </div>

      {/* Threshold Bubble Chain */}
      <div className="flex justify-center items-center gap-2 mt-0.5">
        {bubbles.map((val) => {
          const isUnlocked = maxCoinVal >= val;
          return (
            <div
              key={val}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border-4 transition-all duration-300 relative select-none
                ${
                  isUnlocked
                    ? 'bg-gradient-to-b from-yellow-300 to-yellow-500 border-white text-yellow-950 shadow-[0_0_15px_#fbbf24] scale-110'
                    : 'bg-[#1a0c06] border-[#3a1d10] text-[#7a4e38]'
                }`}
            >
              {isUnlocked && (
                <div className="absolute inset-0.5 rounded-full border border-white/40 pointer-events-none"></div>
              )}
              {val}
            </div>
          );
        })}
      </div>

      {/* Player Avatar */}
      <div className="relative w-16 h-16 rounded-full border-4 border-amber-950 shadow-[0_6px_12px_rgba(0,0,0,0.6)] overflow-hidden bg-[#2a1307]">
        <img
          src={avatarImg}
          alt="Player Avatar"
          className="w-full h-full object-cover pointer-events-none"
        />
        {/* Glow ring around avatar */}
        <div className="absolute inset-0 rounded-full border-2 border-yellow-500/25 pointer-events-none"></div>
      </div>

      {/* Daily Reward Modal */}
      {showDailyModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs z-[100] flex items-center justify-center p-6 text-center">
          <div className="settings-wood-modal max-w-xs w-full p-6 text-white flex flex-col items-center gap-4 shadow-2xl relative">
            {/* Close button */}
            <button 
              onClick={() => { setShowDailyModal(false); setClaimSuccess(null); }}
              className="absolute top-3 right-3 text-amber-400 font-bold hover:text-white transition-colors cursor-pointer text-lg"
            >
              ❌
            </button>

            <span className="text-5xl filter drop-shadow-md">🎁</span>
            <h2 className="text-2xl font-black text-yellow-400 uppercase tracking-widest text-stroke-brown">
              DAILY REWARD
            </h2>
            <p className="text-xs text-amber-200/90 font-semibold uppercase tracking-wider">
              Claim your free daily gift to help sort the coins!
            </p>

            <div className="w-full bg-[#1b0903] border-3 border-[#3a1c0d] rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-inner my-2">
              <span className="text-3xl font-black text-yellow-400">🪙 50</span>
              <span className="text-[10px] text-amber-500 font-black tracking-widest">FREE GOLD COINS</span>
            </div>

            {claimSuccess === true && (
              <span className="text-xs text-emerald-400 font-black uppercase tracking-wider animate-bounce">
                🎉 Claimed Successfully!
              </span>
            )}
            {claimSuccess === false && (
              <span className="text-xs text-orange-400 font-black uppercase tracking-wider">
                ⏰ Already Claimed Today! Come back tomorrow!
              </span>
            )}

            <button
              onClick={handleClaimReward}
              disabled={lastClaimedDate === new Date().toDateString()}
              className={`w-full py-3.5 text-xs font-black uppercase rounded-2xl tracking-widest ${
                lastClaimedDate === new Date().toDateString()
                  ? 'bg-zinc-800 text-zinc-500 border-2 border-zinc-950 cursor-not-allowed opacity-50'
                  : 'btn-green-3d text-white cursor-pointer'
              }`}
            >
              {lastClaimedDate === new Date().toDateString() ? 'CLAIMED' : 'CLAIM GIFT'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
