import { getCollection, type CollectionEntry } from 'astro:content';

export type Story = CollectionEntry<'stories'>;

const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'i',
  к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
  х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

export function slugify(text: string): string {
  return [...text.toLowerCase()]
    .map((ch) => TRANSLIT[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function getStories(): Promise<Story[]> {
  const stories = await getCollection('stories', ({ data }) => !data.draft);
  return stories.sort(
    (a, b) =>
      b.data.pubDate.valueOf() - a.data.pubDate.valueOf() ||
      a.data.title.localeCompare(b.data.title, 'ru'),
  );
}

export function readingMinutes(body: string | undefined): number {
  const words = (body ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long', timeZone: 'UTC' }).format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(date);
}

export interface TextStats {
  paragraphs: number;
  sentences: number;
  words: number;
  chars: number;
  charsWithSpaces: number;
}

// Counts the story text only: Markdown dividers (---, ***) are skipped, line breaks are not characters.
export function textStats(body: string | undefined): TextStats {
  const paragraphs = (body ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter((p) => p && !/^([-*_]\s*){3,}$/.test(p));
  const text = paragraphs.join(' ');
  return {
    paragraphs: paragraphs.length,
    sentences: text.match(/[.!?…]+["»”]*(?=\s|$)/g)?.length ?? 0,
    words: text.split(' ').filter((w) => /[\p{L}\p{N}]/u.test(w)).length,
    chars: text.replace(/\s/g, '').length,
    charsWithSpaces: text.length,
  };
}

export interface Term {
  name: string;
  slug: string;
  stories: Story[];
}

function groupBy(stories: Story[], pick: (s: Story) => string[]): Term[] {
  const map = new Map<string, Term>();
  for (const story of stories) {
    for (const name of pick(story)) {
      const slug = slugify(name);
      const term = map.get(slug) ?? { name, slug, stories: [] };
      term.stories.push(story);
      map.set(slug, term);
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'ru'));
}

export const getGenres = (stories: Story[]) => groupBy(stories, (s) => [s.data.genre]);
export const getTags = (stories: Story[]) => groupBy(stories, (s) => s.data.tags);
