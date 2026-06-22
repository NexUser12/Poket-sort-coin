import React, { useEffect, useState } from 'react';

export const Coin = ({ value, isLifted, isMerging, showNumber }) => {
  const [shouldBounce, setShouldBounce] = useState(true);

  useEffect(() => {
    // Reset bounce state after animation finishes so it doesn't trigger again on other state changes
    const timer = setTimeout(() => setShouldBounce(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`coin-3d 
        ${isLifted ? 'coin-lifted' : ''} 
        ${isMerging ? 'merge-pop' : ''} 
        ${shouldBounce ? 'coin-placement-bounce' : ''}`}
    >
      {/* Specular sheen flash overlay when merging */}
      {isMerging && <div className="merge-flash-specular"></div>}

      {/* Cylindrical barrel (visible side thickness with ridges) */}
      <div className={`coin-3d-barrel coin-barrel-${value}`}></div>
      {/* Bottom ellipse edge (depth drop-shadow) */}
      <div className={`coin-3d-edge coin-edge-${value}`}></div>
      {/* Top face (elliptical disc seen from above) */}
      <div className={`coin-3d-face coin-face-${value}`}>
        <div className="coin-inner-face">
          {showNumber && <span className="coin-number">{value}</span>}
        </div>
      </div>
    </div>
  );
};

export default Coin;
