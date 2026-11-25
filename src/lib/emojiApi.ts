export interface EmojiEntry {
  emoji: string;
  name: string;
  category: string;
}

interface EmojiHubItem {
  name: string;
  category: string;
  unicode?: string[];
}

const CACHE_KEY = 'yuumotion_emoji_cache_v1';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const FALLBACK_EMOJIS: EmojiEntry[] = [
  { emoji: '🚀', name: 'rocket', category: 'travel and places' },
  { emoji: '🎨', name: 'artist palette', category: 'activities' },
  { emoji: '⚡', name: 'high voltage', category: 'travel and places' },
  { emoji: '🦊', name: 'fox', category: 'animals and nature' },
  { emoji: '✨', name: 'sparkles', category: 'activities' },
  { emoji: '💻', name: 'laptop', category: 'objects' },
  { emoji: '🧠', name: 'brain', category: 'people and body' },
  { emoji: '🔥', name: 'fire', category: 'travel and places' },
  { emoji: '🎯', name: 'bullseye', category: 'activities' },
  { emoji: '📋', name: 'clipboard', category: 'objects' },
  { emoji: '🌿', name: 'herb', category: 'animals and nature' },
  { emoji: '🌊', name: 'water wave', category: 'travel and places' },
  { emoji: '🎧', name: 'headphone', category: 'objects' },
  { emoji: '🛠️', name: 'hammer and wrench', category: 'objects' },
  { emoji: '📦', name: 'package', category: 'objects' },
  { emoji: '🛡️', name: 'shield', category: 'objects' },
  { emoji: '🌟', name: 'glowing star', category: 'travel and places' },
  { emoji: '🧩', name: 'puzzle piece', category: 'activities' },
  { emoji: '📐', name: 'triangular ruler', category: 'objects' },
  { emoji: '🔭', name: 'telescope', category: 'objects' },
  { emoji: '🦉', name: 'owl', category: 'animals and nature' },
  { emoji: '🐳', name: 'spouting whale', category: 'animals and nature' },
  { emoji: '🏔️', name: 'snow capped mountain', category: 'travel and places' },
  { emoji: '☕', name: 'hot beverage', category: 'food and drink' },
  { emoji: '😄', name: 'grinning face with smiling eyes', category: 'smileys and people' },
  { emoji: '😎', name: 'smiling face with sunglasses', category: 'smileys and people' },
  { emoji: '🤩', name: 'star struck', category: 'smileys and people' },
  { emoji: '🥳', name: 'partying face', category: 'smileys and people' },
  { emoji: '🤖', name: 'robot', category: 'smileys and people' },
  { emoji: '👾', name: 'alien monster', category: 'smileys and people' },
  { emoji: '🐱', name: 'cat face', category: 'animals and nature' },
  { emoji: '🐶', name: 'dog face', category: 'animals and nature' },
  { emoji: '🐼', name: 'panda', category: 'animals and nature' },
  { emoji: '🦋', name: 'butterfly', category: 'animals and nature' },
  { emoji: '🌸', name: 'cherry blossom', category: 'animals and nature' },
  { emoji: '🍀', name: 'four leaf clover', category: 'animals and nature' },
  { emoji: '🌈', name: 'rainbow', category: 'travel and places' },
  { emoji: '☀️', name: 'sun', category: 'travel and places' },
  { emoji: '🌙', name: 'crescent moon', category: 'travel and places' },
  { emoji: '💡', name: 'light bulb', category: 'objects' },
  { emoji: '📌', name: 'pushpin', category: 'objects' },
  { emoji: '🔑', name: 'key', category: 'objects' },
  { emoji: '💎', name: 'gem stone', category: 'objects' },
  { emoji: '🎵', name: 'musical note', category: 'objects' },
  { emoji: '🎮', name: 'video game', category: 'activities' },
  { emoji: '🏆', name: 'trophy', category: 'activities' },
  { emoji: '🧭', name: 'compass', category: 'travel and places' },
  { emoji: '🪐', name: 'ringed planet', category: 'travel and places' }
];

let memoryCache: EmojiEntry[] | null = null;

function unicodeListToEmoji(unicode?: string[]): string {
  if (!unicode || unicode.length === 0) return '';
  try {
    const codePoints = unicode
      .map((u) => parseInt(u.replace(/^U\+/i, ''), 16))
      .filter((n) => !Number.isNaN(n) && n > 0);
    if (codePoints.length === 0) return '';
    return String.fromCodePoint(...codePoints);
  } catch {
    return '';
  }
}

export async function fetchEmojiList(): Promise<{ emojis: EmojiEntry[]; fromApi: boolean }> {
  if (memoryCache && memoryCache.length > 0) {
    return { emojis: memoryCache, fromApi: true };
  }

  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { timestamp: number; emojis: EmojiEntry[] };
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS && Array.isArray(parsed.emojis) && parsed.emojis.length > 0) {
        memoryCache = parsed.emojis;
        return { emojis: parsed.emojis, fromApi: true };
      }
    }
  } catch {
    // Ignore storage parse error
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 4500);

  try {
    const res = await fetch('https://emojihub.yurace.pro/api/all', { signal: controller.signal });
    window.clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as EmojiHubItem[];

    const seen = new Set<string>();
    const list: EmojiEntry[] = [];
    for (const item of data) {
      const char = unicodeListToEmoji(item.unicode);
      if (!char || seen.has(char)) continue;
      seen.add(char);
      list.push({
        emoji: char,
        name: (item.name || '').toLowerCase(),
        category: (item.category || 'other').toLowerCase()
      });
    }

    if (list.length === 0) {
      return { emojis: FALLBACK_EMOJIS, fromApi: false };
    }

    memoryCache = list;
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), emojis: list }));
    } catch {
      // Ignore quota exceeded
    }
    return { emojis: list, fromApi: true };
  } catch {
    window.clearTimeout(timeoutId);
    return { emojis: FALLBACK_EMOJIS, fromApi: false };
  }
}
