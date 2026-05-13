import sanitizeHtmlLib from "sanitize-html";

// ─── UUID validation ──────────────────────────────────────────────────────────
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Returns true if the string is a valid v4 UUID.
 */
export function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}

/**
 * Returns a 400 error response if the ID is not a valid UUID.
 * Usage: const err = validateUUIDParam(id); if (err) return err;
 */
export function validateUUIDParam(id: unknown): Response | null {
  if (typeof id !== "string" || !isValidUUID(id)) {
    return new Response(
      JSON.stringify({ error: "Invalid ID format" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  return null;
}

// ─── Text sanitization ────────────────────────────────────────────────────────
/**
 * Strips all HTML, trims whitespace, and limits to 500 chars.
 * Use for names, titles, search queries — anything user-typed.
 */
export function sanitizeText(input: string, maxLength = 500): string {
  return sanitizeHtmlLib(input, { allowedTags: [], allowedAttributes: {} })
    .trim()
    .slice(0, maxLength);
}

// ─── HTML sanitization ────────────────────────────────────────────────────────
const ALLOWED_TAGS = [
  "p", "br", "b", "strong", "i", "em", "u", "s",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
  "blockquote", "pre", "code",
  "a", "img",
  "table", "thead", "tbody", "tr", "th", "td",
  "figure", "figcaption",
];

const ALLOWED_ATTRIBUTES: sanitizeHtmlLib.IOptions["allowedAttributes"] = {
  a: ["href", "title", "target", "rel"],
  img: ["src", "alt", "width", "height"],
  "*": ["class"],
};

/**
 * Sanitizes HTML content from RSS feeds.
 * Strips dangerous tags/attributes while preserving formatting.
 */
export function sanitizeArticleHtml(input: string): string {
  return sanitizeHtmlLib(input, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ["http", "https", "mailto"],
    // Force external links to open safely
    transformTags: {
      a: sanitizeHtmlLib.simpleTransform("a", {
        target: "_blank",
        rel: "noopener noreferrer",
      }),
    },
  });
}

// ─── Slug / URL-safe string ───────────────────────────────────────────────────
/**
 * Returns a URL-safe version of a string (for slugs, search params etc.)
 */
export function sanitizeSlug(input: string): string {
  return sanitizeText(input, 200)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
