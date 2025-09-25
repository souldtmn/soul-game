// client/src/components/TelegraphSuccessToast.tsx
import { useEffect, useState } from "react";
import { useTelegraph } from "../lib/stores/useTelegraph";

export default function TelegraphSuccessToast() {
  const { showSuccessToast, successMessage, successColor } = useTelegraph();

  const [localShow, setLocalShow] = useState(false);
  const [phase, setPhase] = useState<"enter" | "stay" | "exit">("enter");

  useEffect(() => {
    if (showSuccessToast && successMessage) {
      setLocalShow(true);
      setPhase("enter");

      const stayTimer = setTimeout(() => setPhase("stay"), 100);
      const exitTimer = setTimeout(() => setPhase("exit"), 400);
      const hideTimer = setTimeout(() => setLocalShow(false), 600);

      return () => {
        clearTimeout(stayTimer);
        clearTimeout(exitTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [showSuccessToast, successMessage]);

  if (!localShow || !successMessage) return null;

  const styleMap = {
    enter: { transform: "translateY(20px) scale(0.8)", opacity: 0 },
    stay: { transform: "translateY(-10px) scale(1.0)", opacity: 1 },
    exit: { transform: "translateY(-30px) scale(0.9)", opacity: 0 },
  } as const;

  const { transform, opacity } = styleMap[phase];

  return (
    <div
      style={{
        pointerEvents: "none",
        position: "fixed",
        top: "25%",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 950,
      }}
    >
      <div
        style={{
          transform,
          opacity,
          transition: "all 0.2s ease-out",
          color: successColor,
          fontSize: "18px",
          fontWeight: "bold",
          textAlign: "center",
          textShadow: "2px 2px 4px rgba(0,0,0,0.9)",
          filter: `drop-shadow(0 0 8px ${successColor})`,
          fontFamily: "monospace",
        }}
      >
        {successMessage}
      </div>
    </div>
  );
}
