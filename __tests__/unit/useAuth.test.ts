/**
 * Unit tests for the useAuth hook.
 * Mocks @/lib/supabase/client to avoid real network calls.
 */
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAuth } from "@/hooks/useAuth";

// ─── Mock Supabase client ─────────────────────────────────────────────────────
const mockUnsubscribe = jest.fn();
const mockGetSession = jest.fn();
const mockOnAuthStateChange = jest.fn();
const mockSignOut = jest.fn();

jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signOut: mockSignOut,
    },
  }),
}));

const mockUser = {
  id: "user-123",
  email: "test@gospellens.app",
};

const mockSession = {
  user: mockUser,
  access_token: "mock-token",
};

// ─── Test helpers ─────────────────────────────────────────────────────────────
function setupMocks(session: typeof mockSession | null = mockSession) {
  mockGetSession.mockResolvedValue({ data: { session } });
  mockOnAuthStateChange.mockImplementation((_event: unknown, callback: (e: string, s: typeof mockSession | null) => void) => {
    // Immediately call with current session
    callback("SIGNED_IN", session);
    return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("useAuth hook", () => {
  it("initialises with loading: true and no user", () => {
    setupMocks(null);
    const { result } = renderHook(() => useAuth());
    // On first render before effect fires
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it("sets user after session loads", async () => {
    setupMocks(mockSession);
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("isAuthenticated is false when no session", async () => {
    setupMocks(null);
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("signOut calls supabase.auth.signOut()", async () => {
    setupMocks(mockSession);
    mockSignOut.mockResolvedValue({});
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.signOut();
    });
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("session is accessible on the hook result", async () => {
    setupMocks(mockSession);
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.session).toEqual(mockSession);
  });

  it("unsubscribes auth listener on unmount", async () => {
    setupMocks(mockSession);
    const { unmount } = renderHook(() => useAuth());
    await waitFor(() => !renderHook(() => useAuth()).result.current.loading);
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
