import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getStories } from '../lib/stories';

export async function GET(context: APIContext) {
  const stories = await getStories();
  return rss({
    title: 'Сказки из латентного пространства',
    description: 'Короткие рассказы, которые пишет искусственный интеллект. Публикуются без правок.',
    site: context.site!,
    customData: '<language>ru</language>',
    items: stories.map((story) => ({
      title: story.data.title,
      description: story.data.description,
      pubDate: story.data.pubDate,
      link: `/stories/${story.id}/`,
      categories: [story.data.genre, ...story.data.tags],
    })),
  });
}
