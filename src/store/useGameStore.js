import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Helper to shuffle an array
const shuffleArray = (arr) => {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// Coin merge chain: 1 -> 2 -> 3 -> 5 -> 8 -> 10 -> 13 -> 15
const MERGE_CHAIN = [1, 2, 3, 5, 8, 10, 13, 15];

export const useGameStore = create(
  persist(
    (set, get) => ({
      currentLevel: 1,
      coins: 200,
      score: 0,
      slots: [], // Array of 15 slots
      selectedSlot: null,
      levelProgress: 0, // 0 to 100
      isWon: false,
      isGameOver: false,
      undoStack: [],
      isAnimating: false,
      mergeEffects: [], // Array of slot indices that recently merged

      // Initialize level
      initLevel: (level) => {
        // Create 15 slots
        const newSlots = Array.from({ length: 15 }, (_, index) => {
          let status = 'locked';
          let unlockType = 'coins';
          let unlockCost = 200;
          let unlockTimer = 0;
          let timerStarted = false;

          // Row 3 (slots 10-14) are unlocked initially
          if (index >= 10) {
            status = 'unlocked';
            unlockType = 'none';
            unlockCost = 0;
          } 
          // Row 2 (slots 5-9)
          else if (index === 5) {
            // Slot 5 is FREE lock
            unlockType = 'free';
            unlockCost = 0;
          } else if (index === 9) {
            // Slot 9 is TIMER lock (60 Sec)
            unlockType = 'timer';
            unlockTimer = 60;
            unlockCost = 100; // Cost to bypass timer instantly
          } else {
            // Slots 6, 7, 8 are coin locks
            unlockType = 'coins';
            unlockCost = index === 6 ? 100 : index === 7 ? 150 : 200;
          }
          // Row 1 (slots 0-4) are high cost coin locks
          if (index < 5) {
            unlockType = 'coins';
            unlockCost = 300 + index * 100;
          }

          return {
            id: `slot-${index}`,
            index,
            status,
            unlockType,
            unlockCost,
            unlockTimer,
            timerStarted,
            coins: [],
          };
        });

        // Determine coin pool for sorting
        let coinPool = [];
        if (level === 1) {
          // Hand-authored setup for Level 1 to match the reference image
          // 10 copper '1's, 9 silver '2's, 9 gold '3's
          // We distribute them exactly to make a fun puzzle:
          newSlots[10].coins = [1, 1, 1, 1, 2, 2, 2, 2];
          newSlots[11].coins = [1, 1, 1, 1];
          newSlots[12].coins = [1, 1, 2, 2, 2, 2, 2];
          newSlots[13].coins = [3, 3, 3, 3, 3];
          newSlots[14].coins = [3, 3, 3, 3];
        } else {
          // Dynamic generation for Level 2+
          // Select active coin values from the chain
          let activeValues = [1, 2, 3];
          if (level === 2) activeValues = [1, 2, 3, 5];
          else if (level === 3) activeValues = [2, 3, 5, 8];
          else if (level === 4) activeValues = [3, 5, 8, 10];
          else {
            // For higher levels, shift active values based on level
            const offset = Math.min(level - 4, MERGE_CHAIN.length - 4);
            activeValues = MERGE_CHAIN.slice(offset, offset + 4);
          }

          // Generate coins: lowest active value gets 10 coins, others get 9 coins
          activeValues.forEach((val, idx) => {
            const count = idx === 0 ? 10 : 9;
            for (let i = 0; i < count; i++) {
              coinPool.push(val);
            }
          });

          // Shuffle pool
          coinPool = shuffleArray(coinPool);

          // Distribute into slots 10-14 (the 5 initially unlocked slots)
          let poolIndex = 0;
          const unlockedSlotIndices = [10, 11, 12, 13, 14];
          
          // Distribute coins in rounds to keep stack sizes relatively even (max 7-8 per stack)
          while (poolIndex < coinPool.length) {
            unlockedSlotIndices.forEach((slotIdx) => {
              if (poolIndex < coinPool.length && newSlots[slotIdx].coins.length < 8) {
                // Randomly choose if we stack a coin here in this round
                if (Math.random() > 0.1 || newSlots[slotIdx].coins.length < 3) {
                  newSlots[slotIdx].coins.push(coinPool[poolIndex]);
                  poolIndex++;
                }
              }
            });
          }
        }

        set({
          currentLevel: level,
          slots: newSlots,
          selectedSlot: null,
          levelProgress: 0,
          isWon: false,
          isGameOver: false,
          undoStack: [],
          isAnimating: false,
          mergeEffects: [],
        });
      },

      resetLevel: () => {
        get().initLevel(get().currentLevel);
      },

      nextLevel: () => {
        get().initLevel(get().currentLevel + 1);
      },

      // Unlocks a slot
      unlockSlot: (index) => {
        const { slots, coins } = get();
        const slot = slots[index];
        if (slot.status === 'unlocked') return;

        let updatedSlots = [...slots];
        let cost = slot.unlockCost;

        if (slot.unlockType === 'free') {
          updatedSlots[index] = { ...slot, status: 'unlocked', unlockType: 'none' };
          set({ slots: updatedSlots });
        } else if (slot.unlockType === 'coins' && coins >= cost) {
          updatedSlots[index] = { ...slot, status: 'unlocked', unlockType: 'none' };
          set({ slots: updatedSlots, coins: coins - cost });
        } else if (slot.unlockType === 'timer') {
          if (!slot.timerStarted) {
            // Start timer
            updatedSlots[index] = { ...slot, timerStarted: true };
            set({ slots: updatedSlots });
          } else {
            // Bypassing timer costs coins
            if (coins >= cost) {
              updatedSlots[index] = { ...slot, status: 'unlocked', unlockType: 'none', unlockTimer: 0, timerStarted: false };
              set({ slots: updatedSlots, coins: coins - cost });
            }
          }
        }
      },

      // Ticks active timers in the background (called once per second)
      tickTimers: () => {
        const { slots } = get();
        let changed = false;
        const updatedSlots = slots.map((slot) => {
          if (slot.status === 'locked' && slot.unlockType === 'timer' && slot.timerStarted) {
            changed = true;
            const newTimer = Math.max(0, slot.unlockTimer - 1);
            if (newTimer === 0) {
              return { ...slot, status: 'unlocked', unlockType: 'none', unlockTimer: 0, timerStarted: false };
            } else {
              return { ...slot, unlockTimer: newTimer };
            }
          }
          return slot;
        });

        if (changed) {
          set({ slots: updatedSlots });
        }
      },

      // Selecting and moving coins
      selectSlot: (index) => {
        const { slots, selectedSlot, isWon, isGameOver, isAnimating } = get();
        if (isWon || isGameOver || isAnimating) return;

        const slot = slots[index];

        // 1. If slot is locked, handle unlocking
        if (slot.status === 'locked') {
          get().unlockSlot(index);
          return;
        }

        // 2. If no slot selected, try to select this one (must have coins)
        if (selectedSlot === null) {
          if (slot.coins.length > 0) {
            set({ selectedSlot: index });
          }
          return;
        }

        // 3. If selected slot clicked again, deselect it
        if (selectedSlot === index) {
          set({ selectedSlot: null });
          return;
        }

        // 4. Try to move coins from selectedSlot to this slot index
        const sourceSlot = slots[selectedSlot];
        const targetSlot = slots[index];

        // Helper to get top sequence of identical coins
        const getTopSequence = (coins) => {
          if (coins.length === 0) return [];
          const topVal = coins[coins.length - 1];
          const seq = [];
          for (let i = coins.length - 1; i >= 0; i--) {
            if (coins[i] === topVal) {
              seq.push(coins[i]);
            } else {
              break;
            }
          }
          return seq;
        };

        const movingCoins = getTopSequence(sourceSlot.coins);
        if (movingCoins.length === 0) {
          set({ selectedSlot: null });
          return;
        }

        const coinVal = movingCoins[0];

        // Check transfer validity:
        // - Target slot must be empty OR top coin matches the moving coin value
        // - Target slot capacity (10 coins) must not be exceeded
        const targetTopVal = targetSlot.coins.length > 0 ? targetSlot.coins[targetSlot.coins.length - 1] : null;
        const canMove = targetSlot.coins.length === 0 || targetTopVal === coinVal;
        const fits = targetSlot.coins.length + movingCoins.length <= 10;

        if (canMove && fits) {
          // Capture current slots state for undo
          const previousSlots = slots.map((s) => ({ ...s, coins: [...s.coins] }));
          const newUndoStack = [...get().undoStack, previousSlots];

          // Perform transfer
          const newSourceCoins = sourceSlot.coins.slice(0, sourceSlot.coins.length - movingCoins.length);
          const newTargetCoins = [...targetSlot.coins, ...movingCoins];

          const updatedSlots = slots.map((s, idx) => {
            if (idx === selectedSlot) {
              return { ...s, coins: newSourceCoins };
            }
            if (idx === index) {
              return { ...s, coins: newTargetCoins };
            }
            return s;
          });

          set({
            slots: updatedSlots,
            selectedSlot: null,
            undoStack: newUndoStack,
          });

          // Check if target slot triggers a merge
          get().checkMerges(index);
        } else {
          // If we click another slot that has coins, select that one instead of moving (facilitates quick selection swap)
          if (targetSlot.coins.length > 0) {
            set({ selectedSlot: index });
          } else {
            set({ selectedSlot: null });
          }
        }
      },

      // Check if 10 coins of the same value are grouped in a slot
      checkMerges: (index) => {
        const { slots, score, coins, levelProgress, currentLevel } = get();
        const slot = slots[index];

        // Verify if we have 10 coins of the same value
        if (slot.coins.length === 10) {
          const coinVal = slot.coins[0];
          const allSame = slot.coins.every((v) => v === coinVal);

          if (allSame) {
            // Find next value in the chain
            const chainIdx = MERGE_CHAIN.indexOf(coinVal);
            const nextVal = chainIdx !== -1 && chainIdx < MERGE_CHAIN.length - 1 ? MERGE_CHAIN[chainIdx + 1] : null;

            set({ isAnimating: true });
            
            // Trigger merge animation delay
            setTimeout(() => {
              const currentSlots = get().slots;
              const updatedSlots = currentSlots.map((s, idx) => {
                if (idx === index) {
                  // Replace 10 coins with 1 coin of the next level (or clear if it's max tier)
                  return {
                    ...s,
                    coins: nextVal ? [nextVal] : [],
                  };
                }
                return s;
              });

              // Level completion adds +15% per merge
              const progressIncrement = 25; // 4 merges to complete level
              const newProgress = Math.min(100, levelProgress + progressIncrement);
              const reachedWin = newProgress >= 100;

              set({
                slots: updatedSlots,
                score: score + 100,
                coins: coins + 50,
                levelProgress: newProgress,
                isWon: reachedWin,
                isAnimating: false,
                mergeEffects: [...get().mergeEffects, index],
              });

              // Clear merge effects after animation
              setTimeout(() => {
                set((state) => ({
                  mergeEffects: state.mergeEffects.filter((idx) => idx !== index),
                }));
              }, 800);

              get().verifyGameOver();
            }, 400);
          }
        } else {
          get().verifyGameOver();
        }
      },

      // Verify if player is locked out of moves (all unlocked slots full, no matches can be made)
      verifyGameOver: () => {
        const { slots } = get();
        // A simple check: do we have empty slots or slots that have space to move the top sequence?
        const unlockedSlots = slots.filter((s) => s.status === 'unlocked');
        
        // If there's an empty slot, game is not over
        if (unlockedSlots.some((s) => s.coins.length === 0)) return;

        // If we can move any top sequence to another unlocked slot, game is not over
        const hasValidMove = unlockedSlots.some((srcSlot) => {
          if (srcSlot.coins.length === 0) return false;
          
          const topVal = srcSlot.coins[srcSlot.coins.length - 1];
          let seqCount = 0;
          for (let i = srcSlot.coins.length - 1; i >= 0; i--) {
            if (srcSlot.coins[i] === topVal) seqCount++;
            else break;
          }

          return unlockedSlots.some((destSlot) => {
            if (destSlot.index === srcSlot.index) return false;
            
            const destTopVal = destSlot.coins[destSlot.coins.length - 1];
            const destFreeSpace = 10 - destSlot.coins.length;
            
            return destTopVal === topVal && destFreeSpace >= seqCount;
          });
        });

        if (!hasValidMove) {
          set({ isGameOver: true });
        }
      },

      // Booster 1: Undo (Cost: 20 coins)
      useUndo: () => {
        const { coins, undoStack } = get();
        if (coins < 20 || undoStack.length === 0) return;

        const previousSlots = undoStack[undoStack.length - 1];
        const newUndoStack = undoStack.slice(0, -1);

        set({
          coins: coins - 20,
          slots: previousSlots,
          undoStack: newUndoStack,
          selectedSlot: null,
          isGameOver: false,
        });
      },

      // Booster 2: Shuffle (Cost: 30 coins)
      useShuffle: () => {
        const { coins, slots } = get();
        if (coins < 30) return;

        // Collect all coins from unlocked slots
        const allCoins = [];
        slots.forEach((s) => {
          if (s.status === 'unlocked') {
            allCoins.push(...s.coins);
          }
        });

        if (allCoins.length === 0) return;

        // Shuffle the collected coins
        let shuffledCoins = shuffleArray(allCoins);

        // Distribute them back into the unlocked slots in roughly even stacks
        const unlockedSlots = slots.filter((s) => s.status === 'unlocked');
        const updatedSlots = slots.map((s) => {
          if (s.status === 'unlocked') {
            return { ...s, coins: [] };
          }
          return s;
        });

        let coinIdx = 0;
        // Distribute in rounds
        while (coinIdx < shuffledCoins.length) {
          unlockedSlots.forEach((us) => {
            const s = updatedSlots[us.index];
            if (coinIdx < shuffledCoins.length && s.coins.length < 8) {
              s.coins.push(shuffledCoins[coinIdx]);
              coinIdx++;
            }
          });
        }

        set({
          coins: coins - 30,
          slots: updatedSlots,
          selectedSlot: null,
          undoStack: [], // Clear undo since shuffle is irreversible
          isGameOver: false,
        });
      },

      // Booster 3: Clear Stack (Cost: 40 coins)
      // Removes the top group of matching coins from the selected slot (or if none selected, does nothing)
      useClearSlot: () => {
        const { coins, selectedSlot, slots } = get();
        if (coins < 40 || selectedSlot === null) return;

        const slot = slots[selectedSlot];
        if (slot.coins.length === 0) return;

        const topVal = slot.coins[slot.coins.length - 1];
        const updatedCoins = slot.coins.filter((v) => v !== topVal);

        const updatedSlots = slots.map((s, idx) => {
          if (idx === selectedSlot) {
            return { ...s, coins: updatedCoins };
          }
          return s;
        });

        // Capture state for undo before applying
        const previousSlots = slots.map((s) => ({ ...s, coins: [...s.coins] }));
        const newUndoStack = [...get().undoStack, previousSlots];

        set({
          coins: coins - 40,
          slots: updatedSlots,
          selectedSlot: null,
          undoStack: newUndoStack,
          isGameOver: false,
        });
      }
    }),
    {
      name: 'pocket-sort-coin-save',
    }
  )
);
