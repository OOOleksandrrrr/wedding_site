(() => {
  'use strict';
  const text = value => String(value ?? '').trim();
  function build(data, estimate) {
    const read = name => text(data.get(name));
    const date = read('date');
    const formattedDate = date ? new Intl.DateTimeFormat('ru-RU', {day:'numeric', month:'long', year:'numeric'}).format(new Date(`${date}T12:00:00`)) : 'Пока не определена';
    return [
      'Здравствуйте, Pearl & Vow! Хочу обсудить событие.', '',
      `Имя: ${read('name')}`, `Контакт для связи: ${read('reply')}`,
      `Событие: ${read('event')}`, `Желаемая дата: ${formattedDate}`,
      `Число гостей: ${read('guests') || 'Пока не определено'}`,
      `Ориентир по бюджету: ${read('budget') || 'Хотелось бы обсудить'}`,
      ...(estimate?.lines.length ? ['', 'Выбранные услуги (предварительный расчёт):', ...estimate.lines,
        `Итого за выбранные услуги: ${estimate.formattedTotal}`, estimate.exclusions,
        'Цены ориентировочные; состав и стоимость требуют согласования.'] : []),
      '', `Идея и пожелания: ${read('message') || 'Хотелось бы обсудить вместе.'}`,
    ].join('\n');
  }
  function links(config, body, eventName) {
    const email = text(config.email).replace(/[\r\n]/g, '');
    const telegram = text(config.telegram).replace(/^@/, '');
    const whatsapp = text(config.whatsapp).replace(/\D/g, '');
    const subject = `Pearl & Vow — ${text(eventName).replace(/[\r\n]/g, ' ') || 'Обсудить событие'}`;
    const telegramApp = telegram ? `tg://resolve?domain=${encodeURIComponent(telegram)}&text=${encodeURIComponent(body)}` : `tg://msg_url?url=&text=${encodeURIComponent(body)}`;
    return {
      telegramApp,
      telegramWeb: `https://web.telegram.org/k/#?tgaddr=${encodeURIComponent(telegramApp)}`,
      email: `mailto:${encodeURIComponent(email).replace(/%40/gi, '@')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.replace(/\r?\n/g, '\r\n'))}`,
      telegram: telegram ? `https://t.me/${encodeURIComponent(telegram)}?text=${encodeURIComponent(body)}` : `https://t.me/share/url?url=&text=${encodeURIComponent(body)}`,
      whatsapp: `https://wa.me/${whatsapp}?text=${encodeURIComponent(body)}`,
    };
  }
  window.PEARL_MESSAGES = Object.freeze({build, links});
})();
