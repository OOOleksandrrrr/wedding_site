(() => {
  'use strict';
  const serviceId = document.body.dataset.servicePage;
  const service = window.PEARL_PRICING?.[serviceId];
  if (!service) return;
  const format = value => new Intl.NumberFormat('ru-RU', {style: 'currency', currency: 'RUB', maximumFractionDigits: 0}).format(value);
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  // Rebuild from the editable catalog so prices, labels and groups have one source.
  document.querySelector('.option-grid').innerHTML = service.groups.map((group, index) => {
    const id = escape(group.id);
    const options = group.variants.map(variant => `<option value="${escape(variant.id)}">${escape(variant.label)} — ${format(variant.price)}</option>`).join('');
    return `<article class="option-card" data-option="${id}"><div class="option-top"><span class="option-number">${String(index + 1).padStart(2, '0')}</span><label class="option-toggle" for="include-${id}"><input type="checkbox" id="include-${id}" data-include="${id}" aria-describedby="note-${id}"><span>Добавить</span></label></div><h3>${escape(group.title)}</h3><p id="note-${id}">${escape(group.note)}</p><label class="variant-label" for="variant-${id}">Выберите вариант</label><select id="variant-${id}" data-variant="${id}" disabled>${options}</select><div class="option-bottom"><span data-option-state>Не включено</span><strong data-option-price>${format(group.variants[0].price)}</strong></div></article>`;
  }).join('');
  const selected = new Map();
  const list = document.getElementById('estimate-items');
  const note = document.getElementById('selection-form-note');
  const basePrice = Number(service.basePrice) || 0;
  const reset = document.getElementById('reset-estimate');
  function update() {
    const items = service.groups.filter(group => selected.has(group.id)).map(group => {
      const variant = group.variants.find(value => value.id === selected.get(group.id));
      return {title: group.title, label: variant.label, price: variant.price};
    });
    const total = basePrice + items.reduce((sum, item) => sum + item.price, 0);
    list.replaceChildren();
    if (basePrice) items.unshift({title: 'Базовая организация', label: 'Обязательная часть', price: basePrice});
    for (const item of items) {
      const row = document.createElement('li');
      const description = document.createElement('span');
      const name = document.createElement('strong');
      const detail = document.createElement('small');
      const price = document.createElement('span');
      name.textContent = item.title;
      detail.textContent = item.label;
      description.append(name, detail);
      price.textContent = format(item.price);
      row.append(description, price);
      list.append(row);
    }
    document.getElementById('estimate-total').textContent = format(total);
    document.getElementById('estimate-empty').hidden = items.length > 0;
    document.getElementById('estimate-count').textContent = `Выбрано позиций: ${selected.size}`;
    reset.disabled = selected.size === 0;
    note.textContent = items.length ? `В сообщение будут добавлены выбранные услуги (${selected.size}) и предварительная сумма ${format(total)}.` : 'Вы можете обратиться без расчёта или сначала выбрать услуги выше.';
    window.PEARL_ESTIMATE = {
      serviceId,
      total,
      formattedTotal: format(total),
      exclusions: `Не включено в расчёт: ${service.exclusions}`,
      lines: items.map(item => `${item.title}: ${item.label} — ${format(item.price)}`),
    };
    document.getElementById('discuss-estimate').textContent = items.length ? 'Обсудить выбранное ↗' : 'Обсудить идею без расчёта ↗';
  }
  for (const group of service.groups) {
    const checkbox = document.querySelector(`[data-include="${group.id}"]`);
    const select = document.querySelector(`[data-variant="${group.id}"]`);
    const card = document.querySelector(`[data-option="${group.id}"]`);
    function updateCard() {
      const variant = group.variants.find(value => value.id === select.value);
      select.disabled = !checkbox.checked;
      card.classList.toggle('is-selected', checkbox.checked);
      card.querySelector('[data-option-state]').textContent = checkbox.checked ? 'В вашем расчёте' : 'Не включено';
      card.querySelector('[data-option-price]').textContent = format(variant.price);
      if (checkbox.checked) selected.set(group.id, select.value);
      else selected.delete(group.id);
    }
    checkbox.addEventListener('change', () => { updateCard(); update(); });
    select.addEventListener('change', () => { updateCard(); update(); });
    // Explicitly reset browser-restored controls to the same empty initial state.
    checkbox.checked = false;
    select.selectedIndex = 0;
    updateCard();
  }
  reset.addEventListener('click', () => {
    for (const group of service.groups) {
      const select = document.querySelector(`[data-variant="${group.id}"]`);
      select.selectedIndex = 0;
      const checkbox = document.querySelector(`[data-include="${group.id}"]`);
      checkbox.checked = false;
      checkbox.dispatchEvent(new Event('change'));
    }
    selected.clear();
    update();
  });
  update();
})();
