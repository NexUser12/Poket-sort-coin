# Art Style Guide: Coin Merge Puzzle (Juicy Wood & Metal)

## 1. Visual Concept & Vision
The style is **Juicy Stylized PBR (Casual Metallic)**. It directly adapts the layout and structure seen in image_9e6e47.png—featuring a warm wooden sorting board, dark wooden slots, and thick, chunky metallic coins. However, we enhance the look by using deeper wood tones and much more vibrant, saturated coin colors with high-contrast glossy reflections.

### Core Style Pillars:
- **Tactile Metallic Feel**: Coins must look like heavy, thick, polished metal with clear 3D depth and strong specular highlights.
- **Warm & Saturated Contrast**: The vibrant, bright colors of the coins and unlocked slots must strongly pop against a deep, rich wooden board.
- **Polished Casual UI**: Bubbly, 3D-shaded interface elements with distinct outlines.

---

## 2. Color Palette

### A. The Environment (The Board & Background)
Following the reference image, the board relies on rich, warm, and deep organic tones to act as a solid anchor for the bright gameplay elements.
- **Main Wooden Tray**: Warm medium-dark chestnut brown. It features smooth, subtle stylized wood grain lines to add texture without being noisy.
- **Empty Slots / Card Holders**: Deep chocolate brown, providing a dark silhouette area so that placed coins look instantly recognizable.
- **Background (Behind the tray)**: A very dark, muted burgundy/maroon or deep dark brown. It must remain dark and untextured so the game board stays the center of attention.

### B. Game Elements (Coins & Locked Slots)
Unlike the slightly muted metallic shades in the reference, our colors will be pushed to maximum vibrancy while retaining their metallic shader.
- **Tier 1 Coin (Bronze/Copper)**: Rich, vibrant metallic coral/copper.
- **Tier 2 Coin (Silver)**: Bright, high-contrast polished silver/platinum with crisp white highlights.
- **Tier 3 Coin (Gold)**: Intense, saturated golden yellow.
- **Tier 4 Coin (Blue)**: Vivid electric metallic blue (much more saturated than the soft blue in image_9e6e47.png).
- **Unlocked/Active Slots**: Saturated neon green and vibrant orange with high visibility, just like the "FREE" and "60 Sec" slots in the reference.

---

## 3. 3D Asset Styling & Shading

### A. The Coins
- **Geometry**: Thick, chunky cylinders with heavy, rounded edges (large bevels). The numbers on the face of the coin must be boldly extruded/embossed out of the center.
- **Material (Shading)**: Stylized Metallic PBR. Set Metallic close to 1.0 and Roughness around 0.15–0.25. This creates sharp, clean, bright reflection lines across the rounded edges when the coins move.
- **Details**: Add clear vertical ridges along the rim of the coins to emphasize the thick, satisfying texture of real coin currency.

### B. The Wooden Tray
- **Geometry**: A unified, injection-molded look with smooth, rounded outer corners. The slots are perfectly carved into the wood with soft, baked Ambient Occlusion (AO) shadows inside each pocket.
- **Material (Shading)**: Semi-matte plastic/wood varnish look. Low metallic, medium roughness. This prevents the tray from stealing the shiny reflections from the coins.

---

## 4. User Interface (UI/UX)
Directly matching the top-bar and bottom-button aesthetics of the reference image:
- **Shapes**: Thick, rounded frames with a prominent 3D bevel. Every icon (Trophy, Calendar, Gem) sits inside a pill-shaped or circular container with a thick white or dark-brown stroke outline.
- **Color-Coded Status**: Important interactive buttons use a glossy, bright grass-green gradient (like the "Deal" button at the bottom).
- **Typography**: Thick, heavy, rounded font weights (similar to Lilita One). Numbers and labels must use a dark drop shadow or a thick outline to remain perfectly readable over the dark wood background.

---

## 5. VFX & Juice (Visual Feedback)
- **Merge Effect**: When stacks combine, a bright white specular flash runs across the coins, followed by a small, crisp burst of golden star particles.
- **Coin Placement**: When a coin lands in a wooden slot, it should trigger a tiny "Squash and Stretch" bounce to give a heavy, tactile feel.
- **Locked-to-Unlocked**: When paying to unlock a slot (e.g., the green or orange slots), a bright radial sweep effect wipes across the slot to transition it from locked to playable.
