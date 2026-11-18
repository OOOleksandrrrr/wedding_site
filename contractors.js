(() => {
  'use strict';
  const directory = document.getElementById('contractor-list');
  if (!directory) return;
  const entries = window.PEARL_CONTRACTORS || [];
  const make = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value) node.textContent = value;
    return node;
  };
  function link(label, href, external = false) {
    const node = make('a', '', label);
    node.href = href;
    if (external) { node.target = '_blank'; node.rel = 'noopener noreferrer'; }
    return node;
  }
  const cards = entries.map(entry => {
    const card = make('article', 'contractor-card');
    const top = make('div', 'contractor-top');
    const monogram = make('span', 'contractor-monogram', entry.monogram);
    monogram.setAttribute('aria-hidden', 'true');
    top.append(monogram, make('span', 'contractor-status', entry.example ? 'Пример специалиста' : 'Партнёр агентства'));
    card.append(top, make('p', 'eyebrow', entry.category), make('h2', '', entry.name), make('p', 'contractor-city', entry.city), make('p', 'contractor-description', entry.description));
    const contacts = make('ul', 'contractor-contacts');
    for (const contact of [
      entry.phone && {label: entry.phone, href: `tel:${entry.phone.replace(/[^\d+]/g, '')}`},
      entry.email && {label: entry.email, href: `mailto:${encodeURIComponent(entry.email).replace(/%40/gi, '@')}`},
      entry.telegram && {label: `Telegram · @${entry.telegram}`, href: `https://t.me/${encodeURIComponent(entry.telegram)}`, external: true},
      entry.website && /^https:\/\//.test(entry.website) && {label: 'Сайт и портфолио ↗', href: entry.website, external: true},
    ].filter(Boolean)) {
      const item = make('li');
      item.append(link(contact.label, contact.href, contact.external));
      contacts.append(item);
    }
    card.append(contacts);
    const source = make('p', 'contractor-source');
    if (/^https:\/\//.test(entry.source || '')) source.append(link('Источник контактов ↗', entry.source, true));
    card.append(source);
    return card;
  });
  directory.replaceChildren(...cards);
  document.getElementById('contractors-empty').hidden = cards.length > 0;
  document.getElementById('contractors-demo-note').hidden = !entries.some(entry => entry.example);
})();
