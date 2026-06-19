import React from 'react';
import { useGameStore } from '../../store/useGameStore';

export const Tile = ({ tile }) => {
  const selectTile = useGameStore((state) => state.selectTile);

  const getBorderColor = (catId) => {
    const borders = {
      fruits: 'border-amber-500/50 hover:border-amber-400',
      animals: 'border-emerald-500/50 hover:border-emerald-400',
      vehicles: 'border-cyan-500/50 hover:border-cyan-400',
      sports: 'border-rose-500/50 hover:border-rose-400',
      electronics: 'border-purple-500/50 hover:border-purple-400',
      weather: 'border-teal-500/50 hover:border-teal-400',
      food: 'border-yellow-500/50 hover:border-yellow-400',
      music: 'border-pink-500/50 hover:border-pink-400',
    };
    return borders[catId] || 'border-slate-600/50 hover:border-slate-500';
  };

  return (
    <div
      onClick={() => selectTile(tile.id)}
      className={`tile-3d aspect-square w-full rounded-2xl flex flex-col items-center justify-center p-2 cursor-pointer select-none relative
        ${getBorderColor(tile.categoryId)}`}
    >
      <span className="text-3xl filter drop-shadow-md select-none transform hover:scale-110 transition-transform">
        {tile.icon}
      </span>
      <span className="text-[8px] font-extrabold tracking-wide uppercase text-slate-400 mt-1 select-none pointer-events-none">
        {tile.name}
      </span>

      {/* Glossy overlay sheen */}
      <div className="absolute inset-1.5 rounded-xl border border-white/5 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none"></div>
    </div>
  );
};
export default Tile;
