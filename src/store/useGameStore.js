import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { handAuthoredLevels } from '../data/levels';

// Balanced Level 1 layout matching "Pocket Sort Coin Merge Puzzle" style:
// - 2 coin types (1 and 2) mixed together to teach sorting
// - Goal: collect 10 coins of type 4 via merging
// - Bottom row: 3 mixed stacks + 2 empty buffer slots
// - Row 2: 1 free-unlock slot with extra type 1 coins, rest locked
// - Gentle difficulty ramp that teaches tap-to-take, sorting, and merging

// Helper to shuffle an array
const shuffleArray = (arr) => {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

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

// Coin merge chain: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 8 -> 10 -> 13 -> 15
// (10 coins of type 4 merge into 2 coins of type 5)
const MERGE_CHAIN = [1, 2, 3, 4, 5, 6, 8, 10, 13, 15];

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
      mergeStates: {}, // key: slotIndex, value: { phase: 'collapse' | 'reveal', count: number }
      lastClaimedDate: null, // Date string (e.g. "Mon Jun 22 2026") or null

      // Level goal state
      goalType: 4,
      goalAmount: 3,
      goalCollected: 0,

      // Helper to calculate goal progress
      updateGoalProgress: (currentSlots) => {
        const { goalType, goalAmount } = get();
        const goalCollected = currentSlots.reduce(
          (acc, slot) => acc + slot.coins.filter((c) => c === goalType).length,
          0
        );
        const levelProgress = Math.min(100, Math.round((goalCollected / goalAmount) * 100));
        const isWon = goalCollected >= goalAmount;
        return { goalCollected, levelProgress, isWon };
      },

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
            unlockType = level === 1 ? 'unavailable' : 'timer';
            unlockTimer = 60;
            unlockCost = 100; // Cost to bypass timer instantly
          } else {
            // Slots 6, 7, 8 are coin locks
            unlockType = level === 1 ? 'unavailable' : 'coins';
            unlockCost = index === 6 ? 100 : index === 7 ? 150 : 200;
          }
          // Row 1 (slots 0-4) are high cost coin locks
          if (index < 5) {
            unlockType = level === 1 ? 'unavailable' : 'coins';
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

        // Determine level goals from data or dynamically
        let goalType = 4;
        let goalAmount = 3;
        const levelData = handAuthoredLevels[level];
        if (levelData && levelData.goal) {
          goalType = levelData.goal.type;
          goalAmount = levelData.goal.amount;
        } else {
          if (level === 1) {
            goalType = 4;
            goalAmount = 3;
          } else if (level === 2) {
            goalType = 4;
            goalAmount = 2;
          } else if (level === 3) {
            goalType = 5;
            goalAmount = 2;
          } else if (level === 4) {
            goalType = 6;
            goalAmount = 2;
          } else {
            // Scale goal type and amount for higher levels
            const goalIdx = Math.min(3 + Math.floor((level - 5) / 2), MERGE_CHAIN.length - 1);
            goalType = MERGE_CHAIN[goalIdx];
            goalAmount = 3 + Math.floor((level - 5) / 3);
          }
        }

        // Determine coin pool for sorting
        let coinPool = [];
        if (level === 1) {
          // ═══════════════════════════════════════════════════════════
          //  LEVEL 1 — Balanced tutorial (Pocket Sort style)
          //  Goal: collect 3× type 4 coins
          //  Mechanic: merge 10× type 1 → 2× type 2
          //            merge 10× type 2 → 2× type 3
          //            merge 10× type 3 → 2× type 4
          // ═══════════════════════════════════════════════════════════
          //
          //  Bottom row (slots 10-14): 3 mixed stacks + 2 empty buffers
          //   Slot 10: [1, 2, 2, 1]  — mixed: teaches sorting
          //   Slot 11: [1, 1, 2, 2]  — mixed: forces player to separate
          //   Slot 12: [2, 2, 2, 2]  — pure type 2: easy to stack
          //   Slot 13: (empty)       — buffer for sorting
          //   Slot 14: (empty)       — buffer for sorting
          //
          //  Row 2 (slot 5 = free unlock):
          //   Slot 5: [1, 1, 1, 1, 1, 1] — extra type 1s to complete the merge
          //
          //  Total type 1: 2+2+6 = 10 coins (merges to 2 type 2s)
          //  Total type 2: 2+2+4 = 8 coins (plus the 2 from merge = 10 type 2s)
          //  Total type 3: 0 coins initially (merges to 2 type 3s)
          //  Goal needs 3× type 4, so level is winnable and tutorialised
          // ═══════════════════════════════════════════════════════════
          newSlots[10].coins = [1, 2, 2, 1];
          newSlots[11].coins = [1, 1, 2, 2];
          newSlots[12].coins = [2, 2, 2, 2];
          newSlots[13].coins = [];           // empty buffer
          newSlots[14].coins = [];           // empty buffer
          newSlots[5].coins  = [1, 1, 1, 1, 1, 1];   // free-unlock slot with extra type 1s
        } else {
          // Dynamic generation for Level 2+
          // Select active coin values from the chain
          let activeValues = [1, 2];
          if (level === 2) activeValues = [1, 2, 3];
          else if (level === 3) activeValues = [2, 3, 4];
          else if (level === 4) activeValues = [3, 4, 5];
          else {
            // For higher levels, shift active values based on level
            const offset = Math.min(level - 5, MERGE_CHAIN.length - 4);
            activeValues = MERGE_CHAIN.slice(offset, offset + 3);
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

        const initialGoalCollected = newSlots.reduce(
          (acc, slot) => acc + slot.coins.filter((c) => c === goalType).length,
          0
        );
        const initialProgress = Math.min(100, Math.round((initialGoalCollected / goalAmount) * 100));
        const initialIsWon = initialGoalCollected >= goalAmount;

        set({
          currentLevel: level,
          slots: newSlots,
          selectedSlot: null,
          goalType,
          goalAmount,
          goalCollected: initialGoalCollected,
          levelProgress: initialProgress,
          isWon: initialIsWon,
          isGameOver: false,
          undoStack: [],
          isAnimating: false,
          mergeStates: {},
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

        const movingCoins = getTopSequence(sourceSlot.coins);
        if (movingCoins.length === 0) {
          set({ selectedSlot: null });
          return;
        }

        const coinVal = movingCoins[0];

        // Check transfer validity:
        // - Target slot must be empty OR top coin matches the moving coin value
        const targetTopVal = targetSlot.coins.length > 0 ? targetSlot.coins[targetSlot.coins.length - 1] : null;
        const canMove = targetSlot.coins.length === 0 || targetTopVal === coinVal;
        
        let fits = false;
        if (canMove) {
          const targetTopSeq = getTopSequence(targetSlot.coins);
          const targetTopSeqLength = targetTopSeq.length;
          const totalMergingValCount = targetTopSeqLength + movingCoins.length;

          if (targetTopSeqLength > 0 && totalMergingValCount >= 10) {
            // They will merge! Calculate final slot size:
            // (coins in slot) - (those being merged) + (2 new upgraded coins)
            const chainIdx = MERGE_CHAIN.indexOf(coinVal);
            const nextVal = chainIdx !== -1 && chainIdx < MERGE_CHAIN.length - 1 ? MERGE_CHAIN[chainIdx + 1] : null;
            const finalSize = targetSlot.coins.length - targetTopSeqLength + (nextVal ? 2 : 0);
            fits = finalSize <= 10;
          } else {
            // No merge. Simple capacity check:
            fits = targetSlot.coins.length + movingCoins.length <= 10;
          }
        }

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

       // Check if 10 or more coins of the same value are grouped at the top of a slot
       checkMerges: (index) => {
         const { slots, score, coins } = get();
         const slot = slots[index];
 
         const topSeq = getTopSequence(slot.coins);
         if (topSeq.length >= 10) {
           const coinVal = topSeq[0];
           // Find next value in the chain
           const chainIdx = MERGE_CHAIN.indexOf(coinVal);
           const nextVal = chainIdx !== -1 && chainIdx < MERGE_CHAIN.length - 1 ? MERGE_CHAIN[chainIdx + 1] : null;
 
           // Lock inputs and set mergeState to delay phase (shows full stack for 500ms)
           set((state) => ({
             isAnimating: true,
             mergeStates: {
               ...state.mergeStates,
               [index]: { phase: 'delay', count: topSeq.length }
             }
           }));
           
           // Delay: let the full stack be visible for 500ms
           setTimeout(() => {
             const stateBeforeCollapse = get();
             if (!stateBeforeCollapse.mergeStates[index] || stateBeforeCollapse.mergeStates[index].phase !== 'delay') return;

             // Transition to collapse phase
             set((state) => ({
               mergeStates: {
                 ...state.mergeStates,
                 [index]: { phase: 'collapse', count: topSeq.length }
               }
             }));

             // Phase 1: Collapse animation runs for 400ms
             setTimeout(() => {
               const stateBeforeReveal = get();
               if (!stateBeforeReveal.mergeStates[index] || stateBeforeReveal.mergeStates[index].phase !== 'collapse') return;

               const currentSlots = stateBeforeReveal.slots;
               const updatedSlots = currentSlots.map((s, idx) => {
                 if (idx === index) {
                   // Replace the merged coins with 2 coins of the next level (or clear if it's max tier)
                   const underlyingCoins = s.coins.slice(0, s.coins.length - topSeq.length);
                   const newCoins = nextVal ? [...underlyingCoins, nextVal, nextVal] : underlyingCoins;
                   return {
                     ...s,
                     coins: newCoins,
                   };
                 }
                 return s;
               });
 
               // Recalculate level progress based on goal type & amount
               const progress = get().updateGoalProgress(updatedSlots);
 
               // Set mergeState to reveal phase and update slots/score
               set((state) => ({
                 slots: updatedSlots,
                 score: state.score + 100,
                 coins: state.coins + 50,
                 goalCollected: progress.goalCollected,
                 levelProgress: progress.levelProgress,
                 isWon: progress.isWon,
                 mergeStates: {
                   ...state.mergeStates,
                   [index]: { phase: 'reveal', count: nextVal ? 2 : 0 }
                 }
               }));
 
               // Phase 2: Reveal animation runs for 700ms
               setTimeout(() => {
                 const stateBeforeCleanup = get();
                 if (!stateBeforeCleanup.mergeStates[index] || stateBeforeCleanup.mergeStates[index].phase !== 'reveal') return;
 
                 // Clean up mergeState for this slot and unlock input
                 set((state) => {
                   const newMergeStates = { ...state.mergeStates };
                   delete newMergeStates[index];
                   return {
                     mergeStates: newMergeStates,
                     isAnimating: false,
                   };
                 });
 
                 // Re-check for chain reactions in this slot
                 get().checkMerges(index);
               }, 700);
             }, 400);
           }, 500);
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

        const progress = get().updateGoalProgress(previousSlots);

        set({
          coins: coins - 20,
          slots: previousSlots,
          undoStack: newUndoStack,
          selectedSlot: null,
          isGameOver: false,
          goalCollected: progress.goalCollected,
          levelProgress: progress.levelProgress,
          isWon: progress.isWon,
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

        const progress = get().updateGoalProgress(updatedSlots);

        set({
          coins: coins - 30,
          slots: updatedSlots,
          selectedSlot: null,
          undoStack: [], // Clear undo since shuffle is irreversible
          isGameOver: false,
          goalCollected: progress.goalCollected,
          levelProgress: progress.levelProgress,
          isWon: progress.isWon,
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

        const progress = get().updateGoalProgress(updatedSlots);

        set({
          coins: coins - 40,
          slots: updatedSlots,
          selectedSlot: null,
          undoStack: newUndoStack,
          isGameOver: false,
          goalCollected: progress.goalCollected,
          levelProgress: progress.levelProgress,
          isWon: progress.isWon,
        });
      },

      // Helper to add coins (e.g., daily rewards)
      addCoins: (amount) => {
        set((state) => ({ coins: state.coins + amount }));
      },

      // Claims daily reward: adds 50 coins if not claimed today
      dealCoins: () => {
        const { slots, currentLevel, isWon, isGameOver, isAnimating } = get();
        if (isWon || isGameOver || isAnimating) return;

        // Check if there is space to deal
        const hasSpace = slots.some((s) => s.status === 'unlocked' && s.coins.length < 10);
        if (!hasSpace) return;

        // Determine active values based on level
        let activeValues = [1, 2];
        if (currentLevel === 1) activeValues = [1, 2];  // Level 1: deal type 1 and type 2 coins
        else if (currentLevel === 2) activeValues = [1, 2, 3];
        else if (currentLevel === 3) activeValues = [2, 3, 4];
        else if (currentLevel === 4) activeValues = [3, 4, 5];
        else {
          const offset = Math.min(currentLevel - 5, MERGE_CHAIN.length - 4);
          activeValues = MERGE_CHAIN.slice(offset, offset + 3);
        }

        // Capture previous slot states for undo
        const previousSlots = slots.map((s) => ({ ...s, coins: [...s.coins] }));
        const newUndoStack = [...get().undoStack, previousSlots];

        // Deal 2 random coins (or up to capacity) to each unlocked slot with space
        let dealtAny = false;
        const updatedSlots = slots.map((s) => {
          if (s.status === 'unlocked' && s.coins.length < 10) {
            const spaceLeft = 10 - s.coins.length;
            const dealCount = Math.min(2, spaceLeft);
            if (dealCount > 0) {
              dealtAny = true;
              const newCoins = [...s.coins];
              for (let i = 0; i < dealCount; i++) {
                const randVal = activeValues[Math.floor(Math.random() * activeValues.length)];
                newCoins.push(randVal);
              }
              return { ...s, coins: newCoins };
            }
          }
          return s;
        });

        if (dealtAny) {
          // Recalculate goal progress
          const progress = get().updateGoalProgress(updatedSlots);

          set({
            slots: updatedSlots,
            undoStack: newUndoStack,
            selectedSlot: null,
            goalCollected: progress.goalCollected,
            levelProgress: progress.levelProgress,
            isWon: progress.isWon,
          });

          // Check if any slot has 10 or more identical coins at the top to trigger a merge
          updatedSlots.forEach((s) => {
            if (s.status === 'unlocked') {
              const topSeq = getTopSequence(s.coins);
              if (topSeq.length >= 10) {
                get().checkMerges(s.index);
              }
            }
          });
        }
      },

      claimDailyReward: () => {
        const todayStr = new Date().toDateString();
        const { lastClaimedDate } = get();
        if (lastClaimedDate === todayStr) {
          return false;
        }
        set({ lastClaimedDate: todayStr });
        get().addCoins(50);
        return true;
      }
    }),
    {
      name: 'pocket-sort-coin-save-v5',
    }
  )
);
