import React, { useEffect, useMemo, useRef, useState } from "react";
import EmberBackground from "./EmberBackground";
import { useStartScreenAudio } from "../lib/audio/useStartScreenAudio";

export type StartScreenProps = {
  onStart?: () => void;
  onOptions?: () => void;
  color?: string; // terminal text color
  bg?: string;    // background color
};

const TYPE_INTERVAL_MS = 70;
const PAUSE_BEFORE_GLITCH_MS = 200;
const GLITCH_DURATION_MS = 600;

export default function StartScreen({
  onStart,
  onOptions,
  color = "#FFB14E", // amber
  bg = "#0A0A0A",
}: StartScreenProps) {
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<
    "typing_insert" | "typing_coin" | "pause" | "glitching" | "soul_set"
  >("typing_insert");
  const [selIndex, setSelIndex] = useState(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [blinkOn, setBlinkOn] = useState(true);

  const baseLeft = "insert ";
  const wordCoin = "coin";
  const wordSoul = "SOUL";

  // 🔊 Audio (kept minimal & safe)
  const audio = useStartScreenAudio();
  const audioRef = useRef(audio);
  useEffect(() => { audioRef.current = audio; }, [audio]);

  // Arm audio at first gesture (so ticks are audible pre-glitch)
  useEffect(() => {
    const arm = () => audioRef.current.arm();
    window.addEventListener("pointerdown", arm, { once: true });
    window.addEventListener("keydown", arm, { once: true });
    return () => {
      window.removeEventListener("pointerdown", arm);
      window.removeEventListener("keydown", arm);
    };
  }, []);

  // Cursor blink
  useEffect(() => {
    const i = setInterval(() => setBlinkOn((b) => !b), 500);
    return () => clearInterval(i);
  }, []);

  /** ---------------- Typing effects (minimal deps) ---------------- */
  useEffect(() => {
    let t: number | undefined;

    if (phase === "typing_insert") {
      if (typed.length < baseLeft.length) {
        t = window.setTimeout(() => {
          setTyped(baseLeft.slice(0, typed.length + 1));
          audioRef.current.type(); // click
        }, TYPE_INTERVAL_MS);
      } else {
        setPhase("typing_coin");
      }
    }

    if (phase === "typing_coin") {
      const target = baseLeft + wordCoin;
      if (typed.length < target.length) {
        t = window.setTimeout(() => {
          setTyped(target.slice(0, typed.length + 1));
          audioRef.current.type(); // click
        }, TYPE_INTERVAL_MS);
      } else {
        setPhase("pause");
      }
    }

    if (phase === "pause") {
      t = window.setTimeout(() => setPhase("glitching"), PAUSE_BEFORE_GLITCH_MS);
    }

    return () => { if (t) clearTimeout(t); };
  }, [phase, typed]); // keep deps minimal

  /** ---------------- Glitch transition (StrictMode-safe, schedule once) ---------------- */
  const glitchScheduled = useRef(false);
  useEffect(() => {
    if (phase !== "glitching" || glitchScheduled.current) return;

    glitchScheduled.current = true;
    setTyped(baseLeft + wordCoin); // show COIN during the glitch

    // Arm (belt & suspenders), then fire glitch + start hum
    try { audioRef.current.arm(); } catch {}
    try { audioRef.current.glitch(); } catch {}
    try { audioRef.current.startAmbience(); } catch {}

    window.setTimeout(() => {
      setTyped(baseLeft + wordSoul); // swap to SOUL
      setPhase("soul_set");
    }, GLITCH_DURATION_MS);

    // No cleanup that clears timeout (avoid StrictMode cancel)
  }, [phase]);

  // Menu keys
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      if (["arrowdown", "s"].includes(k)) setSelIndex((i) => (i + 1) % MENU_ITEMS.length);
      else if (["arrowup", "w"].includes(k)) setSelIndex((i) => (i - 1 + MENU_ITEMS.length) % MENU_ITEMS.length);
      else if (["enter", " "].includes(k)) activate(selIndex, onStart, onOptions);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selIndex, onStart, onOptions]);

  const isGlitching = phase === "glitching";
  const showCursor = phase !== "glitching" && phase !== "pause" && blinkOn;

  const termLine = useMemo(() => {
    const hasCoin = typed.endsWith(wordCoin);
    const hasSoul = typed.endsWith(wordSoul);
    const left = typed.slice(
      0,
      Math.max(0, typed.length - (hasCoin ? wordCoin.length : hasSoul ? wordSoul.length : 0))
    );
    const right = typed.slice(left.length);
    return { left, right };
  }, [typed]);

  return (
    <div
      onPointerDown={audioRef.current.arm}
      style={{
        position: "fixed",
        inset: 0,
        background: bg,
        color: color,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      }}
    >
      <style>{CSS}</style>

      {/* Background embers */}
      <EmberBackground />

      {/* Foreground layout */}
      <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateRows: "1fr 1fr" }}>
        {/* Terminal line */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="crt">
            <span className="term-left">{termLine.left}</span>
            <span className={isGlitching ? "glitch" : "term-right"} data-text={termLine.right}>
              {termLine.right}
            </span>
            <span className="cursor" style={{ opacity: showCursor ? 1 : 0 }}>
              ▌
            </span>
          </div>
        </div>

        {/* Menu */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
          <ul className="menu">
            {MENU_ITEMS.map((label, idx) => {
              const active = (hoverIndex ?? selIndex) === idx;
              return (
                <li
                  key={label}
                  className={active ? "menu-item active" : "menu-item"}
                  onMouseEnter={() => setHoverIndex(idx)}
                  onMouseLeave={() => setHoverIndex(null)}
                  onClick={() => activate(idx, onStart, onOptions)}
                >
                  <span className="chev">{active ? ">" : "\u00A0"}</span>
                  <span>{label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

const MENU_ITEMS = ["START", "OPTIONS"] as const;

function activate(index: number, onStart?: () => void, onOptions?: () => void) {
  const choice = MENU_ITEMS[index];
  if (choice === "START") onStart?.();
  if (choice === "OPTIONS") onOptions?.();
}

const CSS = `
  .crt { font-size: clamp(20px, 4vw, 42px); letter-spacing: 0.02em;
         text-shadow: 0 0 4px rgba(255,177,78,0.5), 0 0 12px rgba(255,177,78,0.25); user-select: none; }
  .cursor { margin-left: 2px; }
  .glitch { position: relative; display: inline-block; animation: flicker 80ms infinite steps(2,end); }
  .glitch::before, .glitch::after { content: attr(data-text); position: absolute; left: 0; top: 0; pointer-events: none; }
  .glitch::before { color: #ff0066; transform: translate(2px,0); clip-path: polygon(0 0,100% 0,100% 45%,0 55%); }
  .glitch::after  { color: #00e5ff; transform: translate(-2px,0); clip-path: polygon(0 60%,100% 50%,100% 100%,0 100%); }
  @keyframes flicker { 0%{opacity:1} 50%{opacity:.8} 100%{opacity:1} }

  .menu { list-style: none; padding: 0; margin: 40px 0 0 0; display: grid; gap: 14px; font-size: clamp(16px,2.5vw,28px); color: #EDEDED; }
  .menu-item { display: grid; grid-template-columns: 20px auto; align-items: center; gap: 10px; cursor: pointer;
               opacity: .7; transition: opacity 120ms ease, transform 120ms ease; }
  .menu-item.active { opacity: 1; transform: translateX(4px); }
  .menu-item:hover { opacity: 1; }
  .menu .chev { width: 20px; display: inline-block; color: #FF6B6B; text-shadow: 0 0 6px rgba(255,107,107,0.6); }
`;
