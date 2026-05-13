"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Check initial state
    setIsOffline(!navigator.onLine);

    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          role="status"
          aria-live="polite"
          className="fixed top-0 left-0 right-0 z-[9998] flex items-center justify-center gap-2 bg-primary/90 backdrop-blur-sm text-white text-sm py-2.5 px-4 font-inter"
        >
          <WifiOff className="w-4 h-4 flex-shrink-0" />
          <span>You&apos;re offline. Some content may not load.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
