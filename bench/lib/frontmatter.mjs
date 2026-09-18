// Splits a Markdown file into its YAML frontmatter (as a flat key->string
// map of top-level scalar keys only) and the body after it.
export function splitFrontmatter(text) {
  const normalized = text.replace(/\r\n/g, '\n');
  const m = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { frontmatter: {}, body: normalized };
  const frontmatter = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) frontmatter[kv[1]] = kv[2].trim();
  }
  return { frontmatter, body: m[2] };
}
