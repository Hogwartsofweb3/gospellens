"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Globe } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 2.2 seconds total animation time
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 400); // Allow fade out animation to finish
    }, 2200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden"
        >
          {/* Radial Pink Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-primary/20 blur-[80px] animate-pulse-glow pointer-events-none" />

          {/* Logo Animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center justify-center z-10"
          >
            <div className="flex items-center gap-3">
              <Globe className="w-12 h-12 text-primary" strokeWidth={1.5} />
              <h1 className="text-4xl font-poppins font-bold text-white tracking-tight">
                Gospel Lens
              </h1>
            </div>

            {/* Tagline fades in 0.4s later */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              className="mt-4 text-text-secondary font-inter text-lg text-center"
            >
              In God&apos;s Light, We See Light
            </motion.p>
          </motion.div>

          {/* Loading Bar Sweeping Animation */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-[#1A1A1A]">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.2, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-primary to-secondary"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
