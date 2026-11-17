(() => {
  'use strict';
  const config = window.PEARL_CONFIG || {};
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
  const emailContact = document.querySelector('[data-contact="email"]');
  const email = String(config.email || '').trim();
  emailContact.hidden = !email;
  emailContact.href = `mailto:${encodeURIComponent(email).replace(/%40/gi, '@')}`;
  emailContact.querySelector('span').textContent = `${email} ↗`;
  const contactLinks = document.getElementById('contact-links');
  [
    {label: 'Telegram', value: String(config.telegram || '').replace(/^@/, ''), href: value => `https://t.me/${encodeURIComponent(value)}`},
    {label: 'WhatsApp', value: String(config.whatsapp || '').replace(/\D/g, ''), href: value => `https://wa.me/${value}`},
    {label: 'Телефон', value: String(config.phone || '').trim(), href: value => `tel:${value.replace(/[^\d+]/g, '')}`},
  ].forEach(contact => {
    if (!contact.value) return;
    const link = document.createElement('a');
    link.href = contact.href(contact.value);
    link.textContent = `${contact.label}: ${contact.value} ↗`;
    if (contact.label !== 'Телефон') { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
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
  document.querySelectorAll('[data-event]').forEach(link => link.addEventListener('click', () => {
    document.getElementById('event').value = link.dataset.event;
  }));
  if (document.getElementById('photo-dialog')) {
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
  }
  const form = document.getElementById('inquiry-form');
  const nameInput = document.getElementById('name');
  const replyInput = document.getElementById('reply');
  [nameInput, replyInput].forEach(input => input.addEventListener('input', () => {
    input.setCustomValidity(input.value.trim() ? '' : 'Пожалуйста, заполните это поле.');
  }));
  const dateInput = document.getElementById('date');
  const today = new Date();
  dateInput.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const draft = document.getElementById('message-draft');
  const messageDialog = document.getElementById('message-dialog');
  function refreshMessageLinks() {
    const links = window.PEARL_MESSAGES.links(config, draft.value, document.getElementById('event').value);
    for (const channel of ['email', 'whatsapp']) document.getElementById(`${channel}-link`).href = links[channel];
    document.getElementById('telegram-link').href = links.telegramWeb;
    document.getElementById('telegram-app-link').href = links.telegramApp;
    return links;
  }
  function handoffStatus(channel) {
    if (channel === 'telegram') return 'Откроется Telegram Web без установки приложения. Если потребуется, войдите в аккаунт. Выберите получателя, проверьте текст и подтвердите отправку. Если после входа текст не появился, нажмите «Telegram в браузере» ещё раз.';
    const recipientMissing = (channel === 'telegram' && !String(config.telegram || '').trim()) || (channel === 'whatsapp' && !String(config.whatsapp || '').trim());
    return `Черновик подготовлен. ${recipientMissing ? 'Адресат не настроен — выберите получателя в приложении. ' : ''}Проверьте текст и подтвердите отправку в приложении. Сайт не получает подтверждение отправки.`;
  }
  draft.addEventListener('input', () => {
    refreshMessageLinks();
    document.getElementById('copy-status').textContent = '';
  });
  document.querySelectorAll('[data-message-channel]').forEach(link => link.addEventListener('click', () => {
    refreshMessageLinks();
    document.getElementById('handoff-status').textContent = handoffStatus(link.dataset.messageChannel);
  }));
  form.addEventListener('submit', event => {
    event.preventDefault();
    [nameInput, replyInput].forEach(input => input.setCustomValidity(input.value.trim() ? '' : 'Пожалуйста, заполните это поле.'));
    if (!form.reportValidity()) return;
    draft.value = window.PEARL_MESSAGES.build(new FormData(form), window.PEARL_ESTIMATE);
    const links = refreshMessageLinks();
    const channel = event.submitter?.value || 'preview';
    document.getElementById('copy-status').textContent = '';
    document.getElementById('handoff-status').textContent = channel === 'preview' ? 'Сообщение ещё не отправлено. Выберите способ связи.' : handoffStatus(channel);
    document.getElementById('form-status').textContent = channel === 'preview' ? 'Текст подготовлен. Выберите способ связи в открывшемся окне.' : handoffStatus(channel);
    openDialog(messageDialog);
    if (['email', 'telegram', 'whatsapp'].includes(channel)) {
      // Synchronous navigation keeps the user gesture for external app handlers.
      const mobile = navigator.userAgentData?.mobile ?? /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
      const target = channel === 'telegram' && mobile ? 'telegram-app-link' : `${channel}-link`;
      document.getElementById(target).click();
    }
  });
  document.getElementById('copy-message').addEventListener('click', async () => {
    const draft = document.getElementById('message-draft');
    const status = document.getElementById('copy-status');
    try {
      await navigator.clipboard.writeText(draft.value);
      status.textContent = 'Скопировано. Вставьте текст в выбранном приложении и подтвердите отправку.';
    } catch {
      draft.focus(); draft.select();
      status.textContent = 'Скопируйте выделенный текст вручную и вставьте его в выбранном приложении.';
    }
  });
})();
