(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const defaults = {
    finish: 'walnut',
    style: 'classic',
    pieceColour: 'ivory',
    size: 36,
    engraving: '',
    rotated: false
  };
  const presets = {
    classic: { ...defaults },
    modern: { ...defaults, finish: 'oak', style: 'modern', pieceColour: 'sage' },
    geometric: { ...defaults, finish: 'midnight', style: 'geometric' }
  };
  const names = {
    walnut: 'Walnut',
    oak: 'Light oak',
    midnight: 'Midnight',
    classic: 'Classic',
    modern: 'Modern',
    geometric: 'Geometric',
    ivory: 'Ivory',
    sage: 'Sage',
    terracotta: 'Terracotta'
  };
  const storageKey = 'atelier-chess-designs-v1';
  let state = { ...defaults },
    saved = [],
    renderTimer,
    toastTimer;
  const drawer = $('#design-drawer');
  const money = value => 'A$' + value.toLocaleString('en-AU');
  const scrollBehaviour = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'instant'
      : 'smooth';
  const productKey = design => {
    const { rotated, ...product } = clean(design);
    return JSON.stringify(product);
  };
  const price = s =>
    189 +
    (s.style === 'classic' ? 0 : 30) +
    (s.finish === 'midnight' ? 30 : 0) +
    (s.size === 42 ? 40 : 0) +
    (s.engraving.trim() ? 15 : 0);
  const clean = raw => ({
    finish: ['walnut', 'oak', 'midnight'].includes(raw?.finish) ? raw.finish : 'walnut',
    style: ['classic', 'modern', 'geometric'].includes(raw?.style)
      ? raw.style
      : 'classic',
    pieceColour: ['ivory', 'sage', 'terracotta'].includes(raw?.pieceColour)
      ? raw.pieceColour
      : 'ivory',
    size: raw?.size === 42 ? 42 : 36,
    engraving: typeof raw?.engraving === 'string' ? raw.engraving.slice(0, 24) : '',
    rotated: raw?.rotated === true
  });
  try {
    const data = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (Array.isArray(data))
      saved = data
        .slice(0, 30)
        .filter(x => x && typeof x.id === 'string')
        .map(x => ({ ...clean(x), id: x.id }));
  } catch (_) {
    /* The customiser still works when browser storage is unavailable. */
  }

  function toast(message) {
    clearTimeout(toastTimer);
    $('#toast').textContent = message;
    $('#toast').classList.add('show');
    toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3200);
  }
  function persist() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(saved));
      return true;
    } catch (_) {
      return false;
    }
  }
  function updateControls() {
    const selections = [
      ['finish', 'finish'],
      ['style', 'style'],
      ['colour', 'pieceColour'],
      ['size', 'size']
    ];
    selections.forEach(([attribute, key]) => {
      $$(`[data-${attribute}]`).forEach(button => {
        const selected = String(state[key]) === button.dataset[attribute];
        button.classList.toggle('selected', selected);
        button.setAttribute('aria-pressed', String(selected));
      });
    });
    $('#engraving').value = state.engraving;
    $('#char-count').textContent = `${state.engraving.length} / 24`;
    $('#finish-label').textContent = names[state.finish];
    $('#colour-label').textContent = names[state.pieceColour];
    $('#preview-name').textContent =
      `${names[state.finish]} & ${names[state.pieceColour].toLowerCase()}`;
    $('#preview-size').textContent =
      `${state.size} × ${state.size} cm · ${names[state.style]} pieces`;
    $('#design-price').textContent = money(price(state));
    $('#rotate-board').setAttribute('aria-pressed', String(state.rotated));
  }
  function updatePreview(animate = true) {
    updateControls();
    clearTimeout(renderTimer);
    const board = $('#live-board');
    if (animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      board.classList.add('updating');
      renderTimer = setTimeout(() => {
        window.ChessBoard.render(board, state);
        board.classList.remove('updating');
      }, 140);
    } else {
      window.ChessBoard.render(board, state);
      board.classList.remove('updating');
    }
  }
  function activateTab(tab, focus = false) {
    const tabs = ['board', 'pieces', 'personalise'];
    tabs.forEach(name => {
      const active = name === tab;
      const button = $(`#tab-${name}`);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
      $(`#panel-${name}`).hidden = !active;
      if (active && focus) button.focus();
    });
    $('.config-title>span').textContent = `0${tabs.indexOf(tab) + 1} / 03`;
  }
  function setDesign(design, scroll = true) {
    state = clean(design);
    activateTab('board');
    updatePreview();
    if (scroll)
      $('#customise').scrollIntoView({ behavior: scrollBehaviour(), block: 'start' });
  }
  $$('[data-tab]').forEach(button => {
    button.addEventListener('click', () => activateTab(button.dataset.tab));
    button.addEventListener('keydown', event => {
      const tabs = $$('[data-tab]');
      let index = tabs.indexOf(button);
      if (event.key === 'ArrowRight') index = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft')
        index = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') index = 0;
      else if (event.key === 'End') index = tabs.length - 1;
      else return;
      event.preventDefault();
      activateTab(tabs[index].dataset.tab, true);
    });
  });
  $$('[data-next]').forEach(button =>
    button.addEventListener('click', () => activateTab(button.dataset.next, true))
  );
  [
    ['finish', 'finish'],
    ['style', 'style'],
    ['colour', 'pieceColour'],
    ['size', 'size']
  ].forEach(([attribute, key]) => {
    $$(`[data-${attribute}]`).forEach(button =>
      button.addEventListener('click', () => {
        state[key] =
          key === 'size'
            ? Number(button.dataset[attribute])
            : button.dataset[attribute];
        updatePreview();
      })
    );
  });
  $('#engraving').addEventListener('input', event => {
    state.engraving = event.target.value;
    updatePreview();
  });
  $('#rotate-board').addEventListener('click', () => {
    state.rotated = !state.rotated;
    updatePreview();
  });
  $('#reset-design').addEventListener('click', () => {
    setDesign(defaults, false);
    toast('A fresh start. Make your next move.');
  });
  $$('[data-preset]').forEach(button =>
    button.addEventListener('click', () => setDesign(presets[button.dataset.preset]))
  );
  $$('[data-board]').forEach(element =>
    window.ChessBoard.render(element, presets[element.dataset.board])
  );

  function closeDrawer() {
    drawer.close();
    document.body.classList.remove('drawer-open');
  }
  function openDrawer() {
    renderSaved();
    if (!drawer.open) drawer.showModal();
    document.body.classList.add('drawer-open');
  }
  function summary(design) {
    return [
      'ATELIER CHESS — YOUR DESIGN',
      '',
      `Board: ${names[design.finish]}`,
      `Size: ${design.size} × ${design.size} cm`,
      `Pieces: ${names[design.style]}`,
      `Light pieces: ${names[design.pieceColour]}`,
      `Engraving: ${design.engraving.trim() || 'None'}`,
      `Indicative price: ${money(price(design))}`,
      '',
      'Concept storefront. This summary is not an order or a purchase.',
      `Created at ${window.location.origin}`
    ].join('\n');
  }
  function downloadDesign(design) {
    const url = URL.createObjectURL(
      new Blob([summary(design)], { type: 'text/plain;charset=utf-8' })
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'atelier-chess-design.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Your design summary is ready.');
  }
  function renderSaved() {
    $('#bag-count').textContent = String(saved.length);
    $('#open-bag').setAttribute('aria-label', `Open saved designs (${saved.length})`);
    $('#drawer-count').textContent = `(${saved.length})`;
    const list = $('#saved-list');
    list.replaceChildren();
    if (!saved.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-designs';
      empty.innerHTML =
        '<span class="empty-piece" aria-hidden="true">♞</span><h3>Your next great idea<br>starts here.</h3><p>Choose your colours, find your form<br>and save a set that feels like you.</p>';
      list.appendChild(empty);
      return;
    }
    saved.forEach(design => {
      const article = document.createElement('article');
      article.className = 'saved-design';
      article.innerHTML =
        '<div class="saved-preview"></div><div class="saved-details"><h3></h3><p class="saved-description"></p><p class="saved-engraving"></p><strong class="saved-price"></strong><div class="saved-actions"><button class="edit-design">Edit</button><button class="download-design">Download summary</button><button class="remove">Remove</button></div></div>';
      $('h3', article).textContent =
        `${names[design.finish]} & ${names[design.pieceColour].toLowerCase()}`;
      $('.saved-description', article).textContent =
        `${names[design.style]} pieces · ${design.size} × ${design.size} cm`;
      $('.saved-engraving', article).textContent = design.engraving.trim()
        ? `“${design.engraving.trim()}”`
        : 'No engraving';
      $('.saved-price', article).textContent = money(price(design));
      window.ChessBoard.render($('.saved-preview', article), design);
      $('.edit-design', article).addEventListener('click', () => {
        closeDrawer();
        setDesign(design);
        toast('Your saved design is ready to edit.');
      });
      $('.download-design', article).addEventListener('click', () =>
        downloadDesign(design)
      );
      $('.remove', article).addEventListener('click', () => {
        saved = saved.filter(item => item.id !== design.id);
        persist();
        renderSaved();
        $('#close-bag').focus();
        toast('Design removed.');
      });
      list.appendChild(article);
    });
  }
  $('#save-design').addEventListener('click', () => {
    const next = clean(state);
    const duplicate = saved.some(x => productKey(x) === productKey(next));
    if (!duplicate) {
      saved.unshift({
        ...next,
        id:
          typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : `design-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
      });
      saved = saved.slice(0, 30);
      const stored = persist();
      toast(
        stored
          ? 'Your design, kept. Find it here any time.'
          : 'Saved for this visit. Download a summary to keep it.'
      );
    } else toast('This design is already in your saved collection.');
    openDrawer();
  });
  $('#open-bag').addEventListener('click', openDrawer);
  $('#close-bag').addEventListener('click', closeDrawer);
  $('#keep-designing').addEventListener('click', () => {
    closeDrawer();
    $('#customise').scrollIntoView({ behavior: scrollBehaviour() });
  });
  drawer.addEventListener('close', () => document.body.classList.remove('drawer-open'));
  drawer.addEventListener('click', event => {
    if (event.target === drawer) {
      const rect = drawer.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        closeDrawer();
    }
  });
  const menuButton = $('#menu-toggle'),
    mobileNav = $('#mobile-nav');
  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!expanded));
    menuButton.setAttribute('aria-label', expanded ? 'Open menu' : 'Close menu');
    mobileNav.hidden = expanded;
  });
  $$('a', mobileNav).forEach(link =>
    link.addEventListener('click', () => {
      mobileNav.hidden = true;
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open menu');
    })
  );
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !mobileNav.hidden) {
      mobileNav.hidden = true;
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open menu');
      menuButton.focus();
    }
  });
  if (
    'IntersectionObserver' in window &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    document.body.classList.add('motion-ready');
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px 25px 0px' }
    );
    $$('.reveal').forEach(element => observer.observe(element));
  }
  $('#year').textContent = String(new Date().getFullYear());
  updatePreview(false);
  renderSaved();
})();
