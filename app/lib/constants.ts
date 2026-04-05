// Shared constants used across multiple components

export const REACTIONS = [
  { type: "praying_hands", emoji: "\u{1F64F}", label: "Praying Hands" },
  { type: "heart", emoji: "\u2764\uFE0F", label: "Heart" },
  { type: "fire", emoji: "\u{1F525}", label: "Fire" },
  { type: "amen", emoji: "\u{1F64C}", label: "Amen" },
  { type: "cross", emoji: "\u271D\uFE0F", label: "Cross" },
] as const;

export const LANGUAGES = [
  { code: "en", label: "English", name: "English", flag: "\u{1F1FA}\u{1F1F8}", short: "EN" },
  { code: "es", label: "Espa\u00f1ol", name: "Espa\u00f1ol", flag: "\u{1F1EA}\u{1F1F8}", short: "ES" },
  { code: "fr", label: "Fran\u00e7ais", name: "Fran\u00e7ais", flag: "\u{1F1EB}\u{1F1F7}", short: "FR" },
  { code: "hi", label: "\u0939\u093f\u0928\u094d\u0926\u0940", name: "Hindi (\u0939\u093f\u0928\u094d\u0926\u0940)", flag: "\u{1F1EE}\u{1F1F3}", short: "HI" },
  { code: "pt", label: "Portugu\u00eas", name: "Portugu\u00eas", flag: "\u{1F1E7}\u{1F1F7}", short: "PT" },
  { code: "ar", label: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629", name: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629 (Arabic)", flag: "\u{1F1F8}\u{1F1E6}", short: "AR" },
  { code: "sw", label: "Kiswahili", name: "Kiswahili", flag: "\u{1F1F0}\u{1F1EA}", short: "SW" },
] as const;

export const VERSE_BACKGROUNDS = [
  "mountain-bg.png",
  "forest-bg.png",
  "ocean-bg.png",
  "aurora-bg.png",
  "desert-bg.png",
] as const;
