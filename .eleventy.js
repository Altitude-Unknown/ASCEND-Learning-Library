import { readFileSync } from 'node:fs';
const topics = JSON.parse(readFileSync(new URL('./content/_data/topics.json', import.meta.url)));
export default function(eleventy) {
  eleventy.setNunjucksEnvironmentOptions({ autoescape: true });
  eleventy.addPassthroughCopy({public: '/'});
  eleventy.addWatchTarget('public/');
  eleventy.addFilter('topic', id => topics.find(t => t.id === id));
  eleventy.addFilter('byTopic', (items, id) => items.filter(i => i.data.topic === id));
  eleventy.addFilter('byKind', (items, kind) => items.filter(i => i.data.kind === kind));
  eleventy.addFilter('downloadable', items => items.filter(i => i.data.format && i.data.kind !== 'Video'));
  eleventy.addFilter('related', (items, ids = []) => ids.map(id => items.find(i => i.data.id === id)).filter(Boolean));
  eleventy.addFilter('first', (items, count = 3) => items.slice(0, count));
  eleventy.addFilter('json', value => JSON.stringify(value));
  eleventy.addFilter('year', () => new Date().getFullYear());
  eleventy.addCollection('resources', api => api.getFilteredByTag('resource').sort((a,b) => a.data.title.localeCompare(b.data.title)));
  eleventy.addCollection('modules', api => api.getFilteredByTag('module').sort((a,b) => a.data.order - b.data.order));
  eleventy.addTransform('secure-markup', function(content) {
    if (this.page.outputPath?.endsWith('.html') && /(?:href|src)=["']javascript:/i.test(content)) throw new Error('Unsafe URL in ' + this.page.outputPath);
    return content;
  });
  return { dir: {input: 'content', output: '_site', includes: '_includes', data: '_data'},
    markdownTemplateEngine: 'njk', htmlTemplateEngine: 'njk', templateFormats: ['md','njk','html'] };
}
