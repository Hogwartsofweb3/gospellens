"use client";

import Image from "next/image";
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, ChevronUp, X, Rewind, FastForward
} from "lucide-react";
import { usePlayerStore } from "@/lib/stores/playerStore";

export function MiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    volume,
    togglePlay,
    skipBack,
    skipForward,
    next,
    prev,
    setCurrentTime,
    setVolume,
    toggleExpanded,
    close,
  } = usePlayerStore();

  if (!currentTrack) return null;

  const duration = currentTrack.durationSeconds || 0;
  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center px-4 md:px-8 gap-4 md:gap-6"
      style={{
        height: 72,
        backgroundColor: "#1A1A1A",
        borderTop: "1px solid #E040A0",
      }}
    >
      {/* Track Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative flex-shrink-0 w-12 h-12 rounded bg-elevated overflow-hidden">
          {currentTrack.artworkUrl ? (
            <Image src={currentTrack.artworkUrl} alt={currentTrack.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-primary/20 flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-primary" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-white text-sm font-medium line-clamp-1">{currentTrack.title}</p>
          <p className="text-text-secondary text-xs line-clamp-1">{currentTrack.ministryName}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 md:gap-4">
        <button onClick={prev} className="text-white/60 hover:text-white transition-colors hidden md:block">
          <SkipBack className="w-5 h-5" />
        </button>
        <button onClick={skipBack} className="text-white/70 hover:text-white transition-colors">
          <Rewind className="w-4 h-4" />
        </button>
        <button
          onClick={togglePlay}
          className="w-9 h-9 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors shadow-glow-pink"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-white" />
          ) : (
            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
          )}
        </button>
        <button onClick={skipForward} className="text-white/70 hover:text-white transition-colors">
          <FastForward className="w-4 h-4" />
        </button>
        <button onClick={next} className="text-white/60 hover:text-white transition-colors hidden md:block">
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Seek + Volume + Expand */}
      <div className="flex items-center gap-3 flex-1 justify-end">
        {/* Seek bar */}
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={(e) => setCurrentTime(Number(e.target.value))}
          className="hidden md:block w-32 lg:w-48 h-1 rounded-full accent-primary cursor-pointer"
        />

        {/* Volume */}
        <div className="hidden md:flex items-center gap-1.5">
          <Volume2 className="w-4 h-4 text-white/60" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-16 h-1 rounded-full accent-primary cursor-pointer"
          />
        </div>

        {/* Expand */}
        <button
          onClick={toggleExpanded}
          className="text-white/60 hover:text-white transition-colors"
          title="Expand player"
        >
          <ChevronUp className="w-4 h-4" />
        </button>

        {/* Close */}
        <button
          onClick={close}
          className="text-white/40 hover:text-white transition-colors"
          title="Close player"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
