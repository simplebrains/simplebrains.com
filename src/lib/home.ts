/**
 * Parse the CMS homepage markdown into the ChatGPT-layout sections.
 *
 * Expected shape (authored in `/content/simplebrains/website/pages/home.md`):
 *
 *   # Headline
 *   Hero paragraphs…
 *
 *   ## What I'm exploring
 *   **Theme.** One-line description.
 *
 *   ## Built by …
 *   Bio paragraphs…
 */

export type HomeTheme = {
  title: string;
  body: string;
  /** Visual metaphor for the theme card. */
  icon: "cultivate" | "collaborate" | "foundation" | "humane" | "default";
};

export type HomePage = {
  headline: string;
  hero: string[];
  exploreHeading: string;
  themes: HomeTheme[];
  makerHeading: string;
  maker: string[];
};

const THEME_ICONS: Record<string, HomeTheme["icon"]> = {
  knowledge: "cultivate",
  "knowledge cultivation": "cultivate",
  "ai & agents": "collaborate",
  "ai and agents": "collaborate",
  "agent collaboration": "collaborate",
  "developer tools": "foundation",
  "foundational systems": "foundation",
  "humane software": "humane",
};

function iconFor(title: string): HomeTheme["icon"] {
  const key = title.trim().toLowerCase();
  if (THEME_ICONS[key]) return THEME_ICONS[key]!;
  // Soft match so CMS title tweaks keep the intended mark.
  if (key.startsWith("knowledge") || key.includes("cultivat")) return "cultivate";
  if (key.includes("agent") || key.includes("collabor")) return "collaborate";
  if (
    key.includes("developer") ||
    key.includes("foundation") ||
    key.includes("system")
  ) {
    return "foundation";
  }
  if (key.includes("humane")) return "humane";
  return "default";
}

/** Strip a single trailing period used in `**Knowledge.**` leads. */
function cleanTitle(raw: string): string {
  return raw.replace(/\.\s*$/, "").trim();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Allow only http(s) destinations in authored inline links. */
function safeHref(href: string): string | null {
  const trimmed = href.trim();
  if (!/^https?:\/\//i.test(trimmed)) return null;
  return trimmed;
}

/**
 * Render a small inline-markdown subset to HTML: `[label](url)`, `**bold**`,
 * `*emphasis*`. Everything else is escaped. Used for CMS-authored homepage copy.
 */
export function inlineMarkdownToHtml(markdown: string): string {
  const escaped = escapeHtml(markdown);
  const withLinks = escaped.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_match, label: string, href: string) => {
      const safe = safeHref(href);
      if (!safe) return label;
      const isExternal = /^https?:\/\//i.test(safe);
      const attrs = isExternal
        ? ` href="${escapeHtml(safe)}" target="_blank" rel="noopener noreferrer"`
        : ` href="${escapeHtml(safe)}"`;
      return `<a${attrs}>${label}</a>`;
    },
  );
  return withLinks
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");
}

/** Plain-text form of inline markdown (for attributes / aria). */
export function inlineMarkdownToText(markdown: string): string {
  return markdown
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "$1")
    .trim();
}

/**
 * Editorial Ink pattern: one italic signal word in a serif headline.
 * If the author already used *emphasis*, leave it alone; otherwise emphasize
 * a preferred word ("better") or the last word.
 */
export function withSignalEmphasis(markdown: string): string {
  if (/(?<!\*)\*[^*]+\*(?!\*)/.test(markdown) || /\*\*[^*]+\*\*/.test(markdown)) {
    return markdown;
  }
  if (/\bbetter\b/i.test(markdown)) {
    return markdown.replace(/\bbetter\b/i, "*$&*");
  }
  return markdown.replace(/\b([A-Za-z][A-Za-z'-]*)([.!?]?)\s*$/, "*$1*$2");
}

/**
 * Split markdown into blocks on blank lines, preserving heading markers.
 */
function blocksOf(markdown: string): string[] {
  return markdown
    .replace(/\r\n/g, "\n")
    .trim()
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);
}

export function parseHomeMarkdown(markdown: string): HomePage {
  const blocks = blocksOf(markdown);

  let headline = "";
  const hero: string[] = [];
  let exploreHeading = "What I'm exploring";
  const themes: HomeTheme[] = [];
  let makerHeading = "Built by Brendan Baldwin";
  const maker: string[] = [];

  type Zone = "hero" | "explore" | "maker";
  let zone: Zone = "hero";

  for (const block of blocks) {
    const h1 = block.match(/^#\s+(.+)$/s);
    if (h1 && zone === "hero" && !headline) {
      headline = h1[1]!.replace(/\n/g, " ").trim();
      continue;
    }

    const h2 = block.match(/^##\s+(.+)$/s);
    if (h2) {
      const title = h2[1]!.replace(/\n/g, " ").trim();
      if (/exploring/i.test(title)) {
        zone = "explore";
        exploreHeading = title;
      } else {
        zone = "maker";
        makerHeading = title;
      }
      continue;
    }

    if (zone === "explore") {
      const theme = block.match(/^\*\*(.+?)\*\*\s*([\s\S]*)$/);
      if (theme) {
        const title = cleanTitle(theme[1]!);
        themes.push({
          title,
          body: theme[2]!.trim(),
          icon: iconFor(title),
        });
        continue;
      }
    }

    const paragraph = block.replace(/^#+\s+/, "").trim();
    if (!paragraph) continue;
    if (zone === "hero") hero.push(paragraph);
    else if (zone === "maker") maker.push(paragraph);
  }

  if (!headline) {
    throw new Error("home.md is missing a top-level # headline");
  }

  return { headline, hero, exploreHeading, themes, makerHeading, maker };
}
