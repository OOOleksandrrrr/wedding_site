(() => {
  'use strict';
  const config = window.PEARL_CONFIG || {};
  const telegram = String(config.telegram || 'lizabacd').replace(/^@/, '');
  const telegramUrl = `https://t.me/${encodeURIComponent(telegram)}`;
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.getElementById('navigation');
  function closeMenu() {
    menuButton.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('open');
  }
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('open', open);
  });
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  document.getElementById('year').textContent = new Date().getFullYear();
  const telegramContact = document.querySelector('[data-contact="telegram"]');
  telegramContact.href = telegramUrl;
  telegramContact.querySelector('span').textContent = `@${telegram} ↗`;
  document.getElementById('telegram-link').href = telegramUrl;
  document.querySelectorAll('[data-telegram-direct]').forEach(link => { link.href = telegramUrl; });
  const contactLinks = document.getElementById('contact-links');
  const optionalContacts = [
    {label: 'Телефон', value: config.phone, href: value => `tel:${value.replace(/[^\d+]/g, '')}`},
    {label: 'Почта', value: config.email, href: value => `mailto:${encodeURIComponent(value)}`},
    {label: 'WhatsApp', value: config.whatsapp, href: value => `https://wa.me/${value.replace(/\D/g, '')}`},
  ];
  optionalContacts.forEach(contact => {
    const value = String(contact.value || '').trim();
    if (!value) return;
    const link = document.createElement('a');
    link.href = contact.href(value);
    if (contact.label === 'WhatsApp') { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
    const detail = document.createElement('span');
    detail.textContent = `${value} ↗`;
    link.append(`${contact.label} `, detail);
    contactLinks.append(link);
  });
  function openDialog(dialog) {
    dialog.showModal();
    document.body.classList.add('modal-open');
  }
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
    dialog.addEventListener('click', event => {
      const rect = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
    });
  });
  const services = {
    proposal: {
      title: 'Предложение руки и сердца',
      description: 'Продуманный сюрприз с вашей личной историей в центре. Вместе выберем настроение: камерно и нежно или ярко и неожиданно.',
      items: ['Обсуждение идеи, даты и бюджета', 'Подбор локации и разработка сценария', 'Визуальная концепция, декор и флористика', 'Подбор фотографа и видеографа при необходимости', 'Координация подготовки и самого сюрприза'],
      event: 'Предложение руки и сердца',
    },
    wedding: {
      title: 'Свадьба о вас двоих',
      description: 'Помогаем соединить ваши пожелания в цельное событие: от первого обсуждения до координации свадебного дня.',
      items: ['Знакомство, определение формата и бюджета', 'Разработка концепции и визуального решения', 'Подбор площадки и команды подрядчиков', 'План подготовки, смета и тайминг дня', 'Координация согласованного сценария'],
      event: 'Свадьба',
    },
    ceremony: {
      title: 'Венчание с бережным подходом',
      description: 'Помогаем организовать семейное событие спокойно и последовательно. Требования к самому таинству определяет выбранный храм.',
      items: ['Обсуждение пожеланий и организационных задач', 'Планирование времени с учётом согласований с храмом', 'Флористика и оформление, допустимые в выбранном месте', 'Подбор фотографа по согласованию', 'Логистика гостей и координация дня'],
      event: 'Венчание',
    },
  };
  const serviceDialog = document.getElementById('service-dialog');
  document.querySelectorAll('[data-service]').forEach(button => {
    button.addEventListener('click', () => {
      const service = services[button.dataset.service];
      document.getElementById('service-title').textContent = service.title;
      serviceDialog.setAttribute('aria-labelledby', 'service-title');
      document.getElementById('service-description').textContent = service.description;
      const list = document.getElementById('service-list');
      list.replaceChildren(...service.items.map(item => { const li = document.createElement('li'); li.textContent = item; return li; }));
      document.getElementById('service-contact').dataset.event = service.event;
      openDialog(serviceDialog);
    });
  });
  document.querySelectorAll('[data-event], #service-contact').forEach(link => link.addEventListener('click', () => {
    document.getElementById('event').value = link.dataset.event;
    if (serviceDialog.open) serviceDialog.close();
  }));
  const galleryItems = document.querySelectorAll('.gallery-item');
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(filter => {
      const active = filter === button;
      filter.classList.toggle('active', active);
      filter.setAttribute('aria-pressed', String(active));
    });
    galleryItems.forEach(item => { item.hidden = button.dataset.filter !== 'all' && item.dataset.category !== button.dataset.filter; });
  }));
  const photoDialog = document.getElementById('photo-dialog');
  let currentPhoto = null;
  function visiblePhotos() { return [...galleryItems].filter(item => !item.hidden); }
  function showPhoto(item) {
    currentPhoto = item;
    const source = item.querySelector('img');
    const photo = document.getElementById('large-photo');
    // The modal uses the largest image; thumbnails stay responsive.
    photo.src = source.src.replace(/-(480|960|1440)\.jpg$/, '-1440.jpg');
    photo.alt = source.alt;
    document.getElementById('photo-caption').textContent = source.alt;
    const visible = visiblePhotos();
    document.getElementById('photo-counter').textContent = `${visible.indexOf(item) + 1} / ${visible.length}`;
    ['photo-prev', 'photo-next'].forEach(id => { document.getElementById(id).disabled = visible.length < 2; });
  }
  function movePhoto(direction) {
    const visible = visiblePhotos();
    if (!visible.length) return;
    showPhoto(visible[(visible.indexOf(currentPhoto) + direction + visible.length) % visible.length]);
  }
  galleryItems.forEach(item => item.addEventListener('click', () => {
    showPhoto(item);
    openDialog(photoDialog);
  }));
  document.getElementById('photo-prev').addEventListener('click', () => movePhoto(-1));
  document.getElementById('photo-next').addEventListener('click', () => movePhoto(1));
  photoDialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      movePhoto(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  const form = document.getElementById('inquiry-form');
  const nameInput = document.getElementById('name');
  const replyInput = document.getElementById('reply');
  [nameInput, replyInput].forEach(input => input.addEventListener('input', () => {
    input.setCustomValidity(input.value.trim() ? '' : 'Пожалуйста, заполните это поле.');
  }));
  const dateInput = document.getElementById('date');
  const today = new Date();
  dateInput.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  form.addEventListener('submit', event => {
    event.preventDefault();
    [nameInput, replyInput].forEach(input => input.setCustomValidity(input.value.trim() ? '' : 'Пожалуйста, заполните это поле.'));
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const date = data.get('date');
    const formattedDate = date ? new Intl.DateTimeFormat('ru-RU', {day:'numeric', month:'long', year:'numeric'}).format(new Date(`${date}T12:00:00`)) : 'Пока не определена';
    document.getElementById('message-draft').value = [
      'Здравствуйте, Pearl & Vow! Хочу обсудить событие.',
      '', `Имя: ${data.get('name').trim()}`, `Контакт для связи: ${data.get('reply').trim()}`,
      `Событие: ${data.get('event')}`, `Желаемая дата: ${formattedDate}`,
      `Число гостей: ${data.get('guests') || 'Пока не определено'}`,
      `Ориентир по бюджету: ${data.get('budget').trim() || 'Хотелось бы обсудить'}`,
      '', `Идея и пожелания: ${data.get('message').trim() || 'Хотелось бы обсудить вместе.'}`,
    ].join('\n');
    document.getElementById('copy-status').textContent = '';
    document.getElementById('form-status').textContent = 'Текст подготовлен. Отправьте его в Telegram, чтобы агентство получило обращение.';
    openDialog(document.getElementById('message-dialog'));
  });
  document.getElementById('copy-message').addEventListener('click', async () => {
    const draft = document.getElementById('message-draft');
    const status = document.getElementById('copy-status');
    try {
      await navigator.clipboard.writeText(draft.value);
      status.textContent = 'Скопировано. Откройте Telegram, вставьте текст в чат и отправьте его.';
    } catch {
      draft.focus(); draft.select();
      status.textContent = 'Скопируйте выделенный текст вручную, затем откройте Telegram и отправьте его в чат.';
    }
  });
})();
