import { useEffect, useRef } from "react";
import { HUD } from "../lib/hud";
import { useStamina } from "../lib/stores/useStamina";
import { usePlayer } from "../lib/stores/usePlayer";

// A fixed 480x270 canvas overlay that auto integer-scales to the window
export default function CanvasHUD(){
  const cvsRef = useRef<HTMLCanvasElement|null>(null);
  const lastRef = useRef<number>(performance.now());
  const { health, maxHealth } = usePlayer();
  const stamina = useStamina();

  useEffect(() => {
    const cvs = cvsRef.current!;
    const ctx = cvs.getContext("2d")!;
    HUD.init(ctx);

    // Pixelated scaling style
    (cvs.style as any).imageRendering = "pixelated";

    const baseW = 480, baseH = 270;
    function resize(){
      const scale = Math.max(1, Math.floor(Math.min(
        window.innerWidth / baseW,
        window.innerHeight / baseH
      )));
      cvs.style.width = `${baseW * scale}px`;
      cvs.style.height = `${baseH * scale}px`;
    }
    window.addEventListener("resize", resize);
    resize();

    let raf = 0;
    function frame(now:number){
      const dt = (now - lastRef.current) / 1000; lastRef.current = now;

      // Sync HUD state from stores
      HUD.setHP(health, maxHealth);
      HUD.setExternalStamina(true);
      HUD.setEmbersMax(stamina.maxPips);
      HUD.setEmbers(stamina.pips);
      HUD.setBusy(stamina.busy);

      // Drive stamina regen in the store
      stamina.tick(dt);

      HUD.update(dt);
      // Clear the canvas fully transparent
      ctx.clearRect(0,0,baseW,baseH);
      HUD.draw();

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [health, maxHealth]);

  return (
    <canvas
      ref={cvsRef}
      width={480}
      height={270}
      style={{
        position: "fixed",
        inset: 0,
        margin: "auto",
        pointerEvents: "none",
        zIndex: 1000,
        display: "block",
        background: "transparent"
      }}
    />
  );
}
