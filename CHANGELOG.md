# 🕹 SOUL Game — Changelog & Devlog

This file tracks the history and evolution of the SOUL Game project — from its earliest concepts to current development.  
Every hammer strike, every cleanup, every new feature forged into the code is recorded here. ⚔️🔥  

---

## Origins  
- **Concept Birth**: Inspired by *Undertale* and *Punch-Out!* mechanics, wrapped in the SOUL mythos.  
- **Core Idea**: Player’s actions shape phases (Smile, Cold, Mercy, Hunger, Silence).  
- **Combat Loop**: Real-time dodge / defend / attack with telegraph inputs.  
- **World Design**: 2.5D overworld, SNES / Undertale pixel-art vibe.  
- **Kingdom Lore**: Sand → Steel evolution, Yume, Watcher integrated.  

---

## Early Development  
- **Prototype HUDs**: Multiple overlapping HUDs (cluttered, later trimmed).  
- **First Combat Tests**: Added `useCombat` store for attack/defend state.  
- **TelegraphDefendRing**: Visual ring added for defense timing feedback.  
- **Boss Intro Overlay**: First attempt at cinematic transitions.  

---

## Refactor Era (Agent 3 → Cleanup)  
- **Problem**: Code was bloated, HUD cluttered, overlapping imports, unstable.  
- **Solution**: Started systematic cleanup with test harnesses.  
- **App.tsx Slimdown**:  
  - TEST toggles for overlays & scenes.  
  - ErrorBoundary for safe dev iteration.  
- **Blue Cube Test Scene**: Minimal canvas for debugging core rendering.  

---

## Debug & Dev Tools  
- **DebugHitCircle**: New modular tool for hitbox/hurtbox testing.  
- **ParryRing (ex-TelegraphDefendRing)**: Archived for future perfect-guard mechanic.  
- **CombatArenaBackdrop**: Simple flat arena for combat clarity.  

---

## Today’s Milestone  
- **Unified Combat Store**: Fixed `endDefend` vs `stopDefend` confusion.  
- **Game.tsx Cleanup**: Clear overworld vs combat split, minimal clutter.  
- **Code Style**: Leaner, modular, future-proof.  
- **Testing Infrastructure**: Ready toggles for rapid iteration.  

---

## Next Planned Steps  
- Add toggle flag for DebugHitCircle directly in Game.tsx.  
- Refactor HUD into “base HUD + context overlays.”  
- Escape key → exit combat for testing.  
- Revisit BossIntro & cinematic transitions.  
- Long-term: Implement ParryRing as a timing-based guard mechanic.  

---

## Vision Ahead  
The SOUL game evolves into a **clean, modular combat system** with:  
- Tight telegraph input mechanics.  
- Pixel-perfect hitbox/hurtbox testing.  
- Overworld → combat transitions.  
- Lore-driven mechanics tied to player’s phases & choices.  

---

⚔️ *The forge continues… every commit, a strike of the hammer.*  
