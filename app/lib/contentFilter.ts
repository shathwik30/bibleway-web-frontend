/**
 * Client-side content filter for family-friendly app.
 * This is a supplementary layer — backend should also filter.
 */

const BAD_WORDS = [
  "fuck","shit","bitch","ass","asshole","bastard","damn","dick","pussy",
  "cock","cunt","whore","slut","nigger","nigga","fag","faggot",
  "motherfucker","bullshit","horseshit","retard","retarded",
  "porn","porno","pornography","hentai","xxx","nude","nudes",
  "penis","vagina","dildo","blowjob","handjob","orgasm",
  "wtf","stfu","lmao","lmfao","milf",
  "kill yourself","kys","die","suicide",
  // Common bypass attempts
  "f u c k","s h i t","b i t c h","a s s",
  "fu ck","sh it","bi tch",
  "f*ck","sh*t","b*tch","a**","d*ck","c*nt",
  "fuk","fck","sht","btch","cnt",
];

// Build regex pattern (word boundaries, case insensitive)
const pattern = new RegExp(
  "\\b(" + BAD_WORDS.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")\\b",
  "i"
);

// Also match l33tspeak common substitutions
const leetMap: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "@": "a", "$": "s" };

function deobfuscate(text: string): string {
  return text.replace(/[0134$@5]/g, (ch) => leetMap[ch] || ch);
}

/**
 * Check if text contains profanity.
 */
export function containsProfanity(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  if (pattern.test(lower)) return true;
  // Check l33tspeak version
  const clean = deobfuscate(lower);
  if (clean !== lower && pattern.test(clean)) return true;
  return false;
}

/**
 * Censor profanity in text (replace with asterisks).
 */
// Separate pattern with `g` flag for replacement (stateless per call since replace resets it)
const replacePattern = new RegExp(pattern.source, "gi");

export function censorText(text: string): string {
  if (!text) return text;
  return text.replace(replacePattern, (match) => "*".repeat(match.length));
}

/**
 * Get a user-friendly warning message.
 */
export function getProfanityWarning(): string {
  return "Please keep messages family-friendly. This content may be flagged.";
}
