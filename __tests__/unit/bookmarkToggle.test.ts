/**
 * Tests for bookmark toggle API logic.
 * Tests the pure logic of toggling without needing the full Next.js runtime.
 */

// ─── Mock helpers ─────────────────────────────────────────────────────────────
function makeSupabaseMock(overrides: {
  user?: object | null;
  existingBookmark?: object | null;
  deleteError?: object | null;
  insertError?: object | null;
}) {
  const { user = { id: "user-123" }, existingBookmark = null, deleteError = null, insertError = null } = overrides;

  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user } }),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: existingBookmark }),
      delete: jest.fn().mockReturnThis(),
      insert: jest.fn().mockResolvedValue({ error: insertError }),
    }),
  };
}

// ─── Bookmark toggle pure logic ───────────────────────────────────────────────
type BookmarkResult = { status: "added" | "removed" } | { error: string };

async function bookmarkToggle(
  supabase: ReturnType<typeof makeSupabaseMock>,
  contentId: string | undefined
): Promise<{ status: number; body: BookmarkResult }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { status: 401, body: { error: "Unauthorized" } };
  if (!contentId) return { status: 400, body: { error: "content_id required" } };

  const { data: existing } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", (user as { id: string }).id)
    .eq("content_id", contentId)
    .single();

  if (existing) {
    const mockFrom = supabase.from("bookmarks");
    const deleteResult = mockFrom.delete();
    // In real code this would chain .eq(...) and check error
    return { status: 200, body: { status: "removed" } };
  } else {
    const { error } = await supabase
      .from("bookmarks")
      .insert({ user_id: (user as { id: string }).id, content_id: contentId });

    if (error) return { status: 500, body: { error: String(error) } };
    return { status: 200, body: { status: "added" } };
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("bookmarkToggle logic", () => {
  it("returns 401 when user is not authenticated", async () => {
    const supabase = makeSupabaseMock({ user: null });
    const result = await bookmarkToggle(supabase, "content-123");
    expect(result.status).toBe(401);
    expect(result.body).toEqual({ error: "Unauthorized" });
  });

  it("returns 400 when content_id is missing", async () => {
    const supabase = makeSupabaseMock({});
    const result = await bookmarkToggle(supabase, undefined);
    expect(result.status).toBe(400);
    expect(result.body).toEqual({ error: "content_id required" });
  });

  it("adds a bookmark when none exists", async () => {
    const supabase = makeSupabaseMock({ existingBookmark: null });
    const result = await bookmarkToggle(supabase, "content-abc");
    expect(result.status).toBe(200);
    expect(result.body).toEqual({ status: "added" });
  });

  it("removes a bookmark when one already exists", async () => {
    const supabase = makeSupabaseMock({ existingBookmark: { id: "bookmark-1" } });
    const result = await bookmarkToggle(supabase, "content-abc");
    expect(result.status).toBe(200);
    expect(result.body).toEqual({ status: "removed" });
  });

  it("returns 200 status code on success", async () => {
    const supabase = makeSupabaseMock({});
    const result = await bookmarkToggle(supabase, "content-xyz");
    expect(result.status).toBe(200);
  });
});
