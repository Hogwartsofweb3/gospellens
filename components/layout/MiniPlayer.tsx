"use client";

import { useEffect, useRef } from "react";
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
    duration,
    volume,
    playbackRate,
    togglePlay,
    skipBack,
    skipForward,
    next,
    prev,
    setCurrentTime,
    setDuration,
    setVolume,
    toggleExpanded,
    close,
  } = usePlayerStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize and clean up global HTML5 Audio engine
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.playbackRate = usePlayerStore.getState().playbackRate;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      // Sync progress time only if seeker is not currently active
      if (document.activeElement?.getAttribute("type") !== "range") {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleEnded = () => {
      usePlayerStore.getState().pause();
      usePlayerStore.getState().next();
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [setDuration, setCurrentTime]);

  // Sync track src changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentTrack?.sourceUrl) {
      const isYouTube = currentTrack.sourceUrl.includes("youtube.com") || currentTrack.sourceUrl.includes("youtu.be");
      if (!isYouTube) {
        if (audio.src !== currentTrack.sourceUrl) {
          audio.src = currentTrack.sourceUrl;
          audio.load();
        }
        if (isPlaying) {
          audio.play().catch((err) => console.log("Audio autoplay blocked:", err));
        } else {
          audio.pause();
        }
      } else {
        audio.pause();
        audio.src = "";
      }
    } else {
      audio.pause();
      audio.src = "";
    }
  }, [currentTrack?.sourceUrl]);

  // Sync play/pause state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    const isYouTube = currentTrack.sourceUrl.includes("youtube.com") || currentTrack.sourceUrl.includes("youtu.be");
    if (isYouTube) return;

    if (isPlaying) {
      audio.play().catch((err) => console.log("Audio play blocked:", err));
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  // Sync volume state
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  // Sync playback rate state
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Media Session API global integration
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    const isYouTube = currentTrack.sourceUrl.includes("youtube.com") || currentTrack.sourceUrl.includes("youtu.be");
    if (isYouTube) return;

    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.ministryName,
        artwork: currentTrack.artworkUrl
          ? [{ src: currentTrack.artworkUrl, sizes: "512x512", type: "image/jpeg" }]
          : [],
      });

      navigator.mediaSession.setActionHandler("play", () => {
        usePlayerStore.getState().resume();
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        usePlayerStore.getState().pause();
      });
      navigator.mediaSession.setActionHandler("seekbackward", () => {
        usePlayerStore.getState().skipBack();
      });
      navigator.mediaSession.setActionHandler("seekforward", () => {
        usePlayerStore.getState().skipForward();
      });
    }
  }, [currentTrack]);

  // Sync skip and seek events from detail pages
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (Math.abs(audio.currentTime - currentTime) > 1.5) {
      audio.currentTime = currentTime;
    }
  }, [currentTime]);

  if (!currentTrack) return null;

  const trackDuration = duration || currentTrack.durationSeconds || 0;
  const progressPct = trackDuration > 0 ? (currentTime / trackDuration) * 100 : 0;

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
          max={trackDuration || 100}
          value={currentTime}
          onChange={(e) => {
            const val = Number(e.target.value);
            setCurrentTime(val);
            if (audioRef.current) {
              audioRef.current.currentTime = val;
            }
          }}
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
