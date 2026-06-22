import React from 'react';

export const Coin = ({ value, isLifted, isMerging, showNumber }) => {
  return (
    <div className={`coin-3d ${isLifted ? 'coin-lifted' : ''} ${isMerging ? 'merge-pop' : ''}`}>
      {/* 3D Side Edge */}
      <div className={`coin-3d-edge coin-edge-${value}`}></div>
      {/* 3D Front Face */}
      <div className={`coin-3d-face coin-face-${value}`}>
        <div className="coin-inner-face">
          {showNumber && <span className="coin-number">{value}</span>}
        </div>
      </div>
    </div>
  );
};

export default Coin;
