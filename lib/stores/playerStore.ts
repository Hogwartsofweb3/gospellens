import { create } from "zustand";

export interface PlayerTrack {
  id: string;
  title: string;
  ministryName: string;
  artworkUrl?: string | null;
  sourceUrl: string;
  durationSeconds?: number | null;
}

interface PlayerState {
  currentTrack: PlayerTrack | null;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  queue: PlayerTrack[];
  isExpanded: boolean;

  play: (track: PlayerTrack) => void;
  pause: () => void;
  resume: () => void;
  togglePlay: () => void;
  setCurrentTime: (time: number) => void;
  setVolume: (volume: number) => void;
  skipForward: () => void;
  skipBack: () => void;
  next: () => void;
  prev: () => void;
  setQueue: (tracks: PlayerTrack[]) => void;
  addToQueue: (track: PlayerTrack) => void;
  toggleExpanded: () => void;
  close: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  volume: 0.8,
  queue: [],
  isExpanded: false,

  play: (track) => set({ currentTrack: track, isPlaying: true, currentTime: 0 }),
  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setCurrentTime: (time) => set({ currentTime: time }),
  setVolume: (volume) => set({ volume }),
  skipForward: () =>
    set((s) => ({ currentTime: Math.min(s.currentTime + 15, s.currentTrack?.durationSeconds || s.currentTime + 15) })),
  skipBack: () => set((s) => ({ currentTime: Math.max(0, s.currentTime - 15) })),
  next: () => {
    const { queue, currentTrack } = get();
    if (!currentTrack || queue.length === 0) return;
    const idx = queue.findIndex((t) => t.id === currentTrack.id);
    const next = queue[idx + 1];
    if (next) set({ currentTrack: next, isPlaying: true, currentTime: 0 });
  },
  prev: () => {
    const { queue, currentTrack } = get();
    if (!currentTrack || queue.length === 0) return;
    const idx = queue.findIndex((t) => t.id === currentTrack.id);
    const prev = queue[idx - 1];
    if (prev) set({ currentTrack: prev, isPlaying: true, currentTime: 0 });
  },
  setQueue: (tracks) => set({ queue: tracks }),
  addToQueue: (track) => set((s) => ({ queue: [...s.queue, track] })),
  toggleExpanded: () => set((s) => ({ isExpanded: !s.isExpanded })),
  close: () => set({ currentTrack: null, isPlaying: false, currentTime: 0, isExpanded: false }),
}));
