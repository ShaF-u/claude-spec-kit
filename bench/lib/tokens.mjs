// Rough estimate, not a real tokenizer: ASCII ~4 chars/token, everything
// else (Japanese etc.) ~1 char/token. Used identically for every variant
// this harness compares, so ratios are meaningful; absolute numbers are
// a guide only.
export function estimateTokens(text) {
  if (!text) return 0;
  let ascii = 0;
  let other = 0;
  for (const ch of text) {
    if (ch.charCodeAt(0) < 128) ascii++;
    else other++;
  }
  return Math.ceil(ascii / 4) + other;
}
