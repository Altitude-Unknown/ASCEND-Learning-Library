// Progressive enhancement only: pages and resource links work without JS.
const menu = document.querySelector('.topic-menu');
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu?.open) {
    menu.open = false;
    menu.querySelector('summary').focus();
  }
});
document.addEventListener('click', event => {
  if (menu?.open && !menu.contains(event.target)) menu.open = false;
});
for (const browser of document.querySelectorAll('[data-browser]')) {
  const form = browser.querySelector('[data-filters]');
  const cards = [...browser.querySelectorAll('[data-resource]')];
  const fields = ['q', 'topic', 'kind', 'audience', 'subject', 'platform', 'activity'];
  const parameters = new URLSearchParams(location.search);
  for (const key of fields) form.elements[key].value = parameters.get(key) || '';
  const apply = () => {
    const values = Object.fromEntries(fields.map(key => [key, form.elements[key].value.trim()]));
    const terms = values.q.toLocaleLowerCase().split(/\s+/).filter(Boolean);
    let visible = 0;
    for (const card of cards) {
      const show = terms.every(term => card.dataset.search.toLocaleLowerCase().includes(term)) &&
        (!values.topic || card.dataset.topic === values.topic) &&
        (!values.kind || card.dataset.kind === values.kind) &&
        (!values.audience || card.dataset.audience.includes(values.audience)) &&
        ['subject','platform','activity'].every(key => !values[key] || JSON.parse(card.dataset[key] || '[]').includes(values[key]));
      card.hidden = !show;
      if (show) visible++;
    }
    browser.querySelector('[data-count]').textContent = `${visible} of ${cards.length} resources`;
    browser.querySelector('[data-empty]').hidden = visible !== 0;
    const query = new URLSearchParams(Object.entries(values).filter(([,value]) => value));
    history.replaceState(null, '', location.pathname + (query.size ? '?' + query : ''));
  };
  form.addEventListener('submit', event => { event.preventDefault(); apply(); });
  form.addEventListener('input', apply);
  form.addEventListener('change', apply);
  form.addEventListener('reset', () => setTimeout(apply, 0));
  apply();
}
function initializeSearch() {
  const target = document.querySelector('#site-search');
  if (!target) return;
  if (!window.PagefindUI) {
    document.querySelector('#search-help').textContent = 'Search is unavailable in this preview. Use the Resource library link in the navigation, or rebuild the site to generate the search index.';
    return;
  }
  const ui = new window.PagefindUI({ element: '#site-search', showSubResults: true,
    showImages: false, resetStyles: false, autofocus: false,
    translations: { placeholder: 'Search airspace, sensors, CAD…' } });
  document.querySelector('#search-help').hidden = true;
  const query = new URLSearchParams(location.search).get('q');
  if (query) ui.triggerSearch(query);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeSearch);
else initializeSearch();
for (const player of document.querySelectorAll('[data-video-id]')) {
  player.querySelector('[data-load-video]')?.addEventListener('click', () => {
    const id = player.dataset.videoId;
    if (!/^[\w-]{11}$/.test(id)) return;
    const frame = document.createElement('iframe');
    frame.src = `https://www.youtube-nocookie.com/embed/${id}`;
    frame.title = player.dataset.videoTitle;
    frame.allow = 'encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    player.replaceChildren(frame);
    frame.focus();
  });
}
