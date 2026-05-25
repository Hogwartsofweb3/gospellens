"use client";

import { useEffect, useState, useRef } from "react";

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const raysRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animFrameId: number;

    const DURATION_ANIM = 2700; // 2.7s opening animation (to match 3s total)
    const DURATION_FADEOUT = 300; // 300ms overlay fadeout
    const TOTAL_DURATION = DURATION_ANIM + DURATION_FADEOUT; // 3000ms = exactly 3 seconds

    // Easing functions
    const easeOutCubic = (x: number): number => {
      return 1 - Math.pow(1 - x, 3);
    };

    const easeInOutQuad = (x: number): number => {
      return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    };

    const animate = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;

      if (elapsed < DURATION_ANIM) {
        // --- 0ms to 2700ms opening animation ---
        if (elapsed <= 1000) {
          // Phase 1: 0ms - 1000ms (scale up, three-way slide in, fade in, rays expand)
          const p = elapsed / 1000;
          const ep = easeOutCubic(p);

          // Logo container scale, opacity, brightness
          const scale = 0.40 + (1.08 - 0.40) * ep;
          const opacity = p;
          const brightness = p;

          if (containerRef.current) {
            containerRef.current.style.transform = `scale(${scale})`;
            containerRef.current.style.opacity = String(opacity);
            containerRef.current.style.filter = `brightness(${brightness})`;
          }

          // 1. Lens slides in from left: translateX(-50% -> 0%)
          const lensTx = -50 * (1 - ep);
          if (lensRef.current) {
            lensRef.current.style.transform = `translateX(${lensTx}%)`;
          }

          // 2. Gospel Lens text drops from top: translateY(-50% -> 0%)
          const textTy = -50 * (1 - ep);
          if (textRef.current) {
            textRef.current.style.transform = `translateY(${textTy}%)`;
          }

          // 3. Tagline slides in from right: translateX(50% -> 0%)
          const taglineTx = 50 * (1 - ep);
          if (taglineRef.current) {
            taglineRef.current.style.transform = `translateX(${taglineTx}%)`;
          }

          // Rays expand and fade in to 25% opacity
          const rayScale = 0.20 + (1.00 - 0.20) * ep;
          const rayOpacity = 0.25 * p;
          if (raysRef.current) {
            raysRef.current.style.transform = `translate(-50%, -50%) scale(${rayScale})`;
            raysRef.current.style.opacity = String(rayOpacity);
          }

          // Glow opacity
          if (glowRef.current) {
            glowRef.current.style.opacity = String(p);
          }
        } else {
          // Phase 2: 1000ms - 2700ms (settles down from 108% to 100%, rays fade out)
          const p = (elapsed - 1000) / 1700;
          const ep = easeInOutQuad(p);

          // Logo container settles to 100% scale
          const scale = 1.08 - (1.08 - 1.00) * ep;

          if (containerRef.current) {
            containerRef.current.style.transform = `scale(${scale})`;
            containerRef.current.style.opacity = "1";
            containerRef.current.style.filter = "brightness(1)";
          }

          // All components remain perfectly merged at center
          if (lensRef.current) lensRef.current.style.transform = "translateX(0%)";
          if (textRef.current) textRef.current.style.transform = "translateY(0%)";
          if (taglineRef.current) taglineRef.current.style.transform = "translateX(0%)";

          // Rays fade out
          const rayOpacity = 0.25 * (1 - ep);
          if (raysRef.current) {
            raysRef.current.style.transform = "translate(-50%, -50%) scale(1)";
            raysRef.current.style.opacity = String(rayOpacity);
          }

          // Glow stays at full strength
          if (glowRef.current) {
            glowRef.current.style.opacity = "1";
          }
        }

        animFrameId = requestAnimationFrame(animate);
      } else if (elapsed < TOTAL_DURATION) {
        // --- 2700ms to 3000ms fadeout ---
        const p = (elapsed - DURATION_ANIM) / DURATION_FADEOUT;

        // Overlay fades out
        const overlayOpacity = 1 - p;
        if (overlayRef.current) {
          overlayRef.current.style.opacity = String(overlayOpacity);
        }

        animFrameId = requestAnimationFrame(animate);
      } else {
        // --- Animation complete ---
        setVisible(false);
      }
    };

    animFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animFrameId);
  }, []);

  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "#000000",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        pointerEvents: "auto",
      }}
    >
      {/* Radial purple glow behind the logo */}
      <div
        ref={glowRef}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "480px",
          height: "480px",
          maxWidth: "90vw",
          maxHeight: "90vw",
          background: "radial-gradient(circle, rgba(167, 139, 250, 0.22) 0%, rgba(167, 139, 250, 0) 70%)",
          transform: "translate(-50%, -50%)",
          zIndex: 9997,
          pointerEvents: "none",
          opacity: 0,
          willChange: "opacity",
        }}
      />

      {/* SVG Light Rays */}
      <svg
        ref={raysRef}
        viewBox="-300 -300 600 600"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "600px",
          height: "600px",
          maxWidth: "120vw",
          maxHeight: "120vw",
          transform: "translate(-50%, -50%) scale(0.2)",
          zIndex: 9998,
          pointerEvents: "none",
          opacity: 0,
          willChange: "transform, opacity",
        }}
      >
        {/* Soft purple, pink, and blue lines radiating from center */}
        {/* 30 deg (purple) */}
        <line x1="0" y1="0" x2="260" y2="-150" stroke="#c4b5fd" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="0" y1="0" x2="-260" y2="150" stroke="#c4b5fd" strokeWidth="1.5" strokeLinecap="round" />
        
        {/* 90 deg (pink) */}
        <line x1="0" y1="0" x2="0" y2="-300" stroke="#f9a8d4" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="0" y1="0" x2="0" y2="300" stroke="#f9a8d4" strokeWidth="1.5" strokeLinecap="round" />

        {/* 150 deg (blue) */}
        <line x1="0" y1="0" x2="-260" y2="-150" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="0" y1="0" x2="260" y2="150" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
      </svg>

      {/* Animated Logo Container */}
      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: "280px",
          height: "280px",
          maxWidth: "70vw",
          maxHeight: "70vw",
          zIndex: 9999,
          opacity: 0,
          transform: "scale(0.4)",
          willChange: "transform, opacity, filter",
        }}
      >
        {/* Component A: Lens & Globe (slides left -> center) */}
        <div
          ref={lensRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            clipPath: "inset(0 60.5% 0 0)",
            willChange: "transform",
          }}
        >
          <img
            src="/Gospel_Lens.png"
            alt="Gospel Lens - Lens"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: "drop-shadow(0px 0px 1.2px #000000) drop-shadow(0px 0px 1.2px #000000)",
            }}
          />
        </div>

        {/* Component B: Gospel Lens Text (drops top -> center) */}
        <div
          ref={textRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            clipPath: "inset(0 0 29.5% 38.5%)",
            willChange: "transform",
          }}
        >
          <img
            src="/Gospel_Lens.png"
            alt="Gospel Lens - Text"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: "drop-shadow(0px 0px 1.2px #000000) drop-shadow(0px 0px 1.2px #000000)",
            }}
          />
        </div>

        {/* Component C: One Liner Tagline (slides right -> center) */}
        <div
          ref={taglineRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            clipPath: "inset(69.5% 0 0 38.5%)",
            willChange: "transform",
          }}
        >
          <img
            src="/Gospel_Lens.png"
            alt="Gospel Lens - Tagline"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: "drop-shadow(0px 0px 1.2px #000000) drop-shadow(0px 0px 1.2px #000000)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
