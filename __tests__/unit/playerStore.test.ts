import { usePlayerStore, PlayerTrack } from "@/lib/stores/playerStore";

// Reset store between tests
beforeEach(() => {
  usePlayerStore.setState({
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    volume: 0.8,
    queue: [],
    isExpanded: false,
  });
});

const mockTrack: PlayerTrack = {
  id: "track-1",
  title: "Test Sermon",
  ministryName: "Test Ministry",
  sourceUrl: "https://example.com/audio.mp3",
  durationSeconds: 3600,
};

const mockTrack2: PlayerTrack = {
  id: "track-2",
  title: "Second Sermon",
  ministryName: "Another Ministry",
  sourceUrl: "https://example.com/audio2.mp3",
  durationSeconds: 1800,
};

describe("playerStore", () => {
  describe("play()", () => {
    it("sets currentTrack and starts playing from 0", () => {
      usePlayerStore.getState().play(mockTrack);
      const state = usePlayerStore.getState();
      expect(state.currentTrack).toEqual(mockTrack);
      expect(state.isPlaying).toBe(true);
      expect(state.currentTime).toBe(0);
    });
  });

  describe("pause()", () => {
    it("sets isPlaying to false", () => {
      usePlayerStore.getState().play(mockTrack);
      usePlayerStore.getState().pause();
      expect(usePlayerStore.getState().isPlaying).toBe(false);
    });
  });

  describe("resume()", () => {
    it("sets isPlaying to true without resetting time", () => {
      usePlayerStore.setState({ currentTrack: mockTrack, isPlaying: false, currentTime: 120 });
      usePlayerStore.getState().resume();
      const state = usePlayerStore.getState();
      expect(state.isPlaying).toBe(true);
      expect(state.currentTime).toBe(120);
    });
  });

  describe("togglePlay()", () => {
    it("flips isPlaying from false to true", () => {
      usePlayerStore.setState({ isPlaying: false });
      usePlayerStore.getState().togglePlay();
      expect(usePlayerStore.getState().isPlaying).toBe(true);
    });

    it("flips isPlaying from true to false", () => {
      usePlayerStore.setState({ isPlaying: true });
      usePlayerStore.getState().togglePlay();
      expect(usePlayerStore.getState().isPlaying).toBe(false);
    });
  });

  describe("skipForward()", () => {
    it("adds 15 seconds to currentTime", () => {
      usePlayerStore.setState({ currentTrack: mockTrack, currentTime: 100 });
      usePlayerStore.getState().skipForward();
      expect(usePlayerStore.getState().currentTime).toBe(115);
    });

    it("caps at track duration", () => {
      usePlayerStore.setState({ currentTrack: mockTrack, currentTime: 3595 });
      usePlayerStore.getState().skipForward();
      expect(usePlayerStore.getState().currentTime).toBe(3600);
    });
  });

  describe("skipBack()", () => {
    it("subtracts 15 seconds from currentTime", () => {
      usePlayerStore.setState({ currentTime: 100 });
      usePlayerStore.getState().skipBack();
      expect(usePlayerStore.getState().currentTime).toBe(85);
    });

    it("floors at 0", () => {
      usePlayerStore.setState({ currentTime: 5 });
      usePlayerStore.getState().skipBack();
      expect(usePlayerStore.getState().currentTime).toBe(0);
    });
  });

  describe("next()", () => {
    it("advances to next track in queue", () => {
      usePlayerStore.setState({
        currentTrack: mockTrack,
        queue: [mockTrack, mockTrack2],
        isPlaying: true,
      });
      usePlayerStore.getState().next();
      const state = usePlayerStore.getState();
      expect(state.currentTrack?.id).toBe("track-2");
      expect(state.isPlaying).toBe(true);
      expect(state.currentTime).toBe(0);
    });

    it("does nothing if at end of queue", () => {
      usePlayerStore.setState({
        currentTrack: mockTrack2,
        queue: [mockTrack, mockTrack2],
      });
      usePlayerStore.getState().next();
      expect(usePlayerStore.getState().currentTrack?.id).toBe("track-2");
    });
  });

  describe("prev()", () => {
    it("goes to previous track in queue", () => {
      usePlayerStore.setState({
        currentTrack: mockTrack2,
        queue: [mockTrack, mockTrack2],
        isPlaying: true,
      });
      usePlayerStore.getState().prev();
      expect(usePlayerStore.getState().currentTrack?.id).toBe("track-1");
    });
  });

  describe("close()", () => {
    it("resets all playback state", () => {
      usePlayerStore.getState().play(mockTrack);
      usePlayerStore.setState({ currentTime: 500, isExpanded: true });
      usePlayerStore.getState().close();
      const state = usePlayerStore.getState();
      expect(state.currentTrack).toBeNull();
      expect(state.isPlaying).toBe(false);
      expect(state.currentTime).toBe(0);
      expect(state.isExpanded).toBe(false);
    });
  });

  describe("setVolume()", () => {
    it("sets volume", () => {
      usePlayerStore.getState().setVolume(0.5);
      expect(usePlayerStore.getState().volume).toBe(0.5);
    });
  });

  describe("queue management", () => {
    it("setQueue replaces entire queue", () => {
      usePlayerStore.getState().setQueue([mockTrack, mockTrack2]);
      expect(usePlayerStore.getState().queue).toHaveLength(2);
    });

    it("addToQueue appends a track", () => {
      usePlayerStore.getState().setQueue([mockTrack]);
      usePlayerStore.getState().addToQueue(mockTrack2);
      expect(usePlayerStore.getState().queue).toHaveLength(2);
      expect(usePlayerStore.getState().queue[1].id).toBe("track-2");
    });
  });
});
