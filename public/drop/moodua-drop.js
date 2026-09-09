function initMoodDrop(root = document) {
const { PRODUCTS, SIZES, createItem, updateItem, duplicateItem, removeItem, summarizeCollection } = window.MoodDropData;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobileView = window.matchMedia('(max-width: 640px)').matches;
const assetPath = (path) => root === document ? path : new URL(path, root.host.getAttribute('asset-base') || document.baseURI).href;
const materialIcon = (name) => `<img class="material-icon" src="${assetPath(`assets/drop/icons/${name}.svg`)}" alt="">`;

const catalogTrack = root.querySelector('#catalog-track');
let catalogPaused = false;
let catalogVisible = false;
let catalogNormalizeTimer;
const originalCatalogCards = [...catalogTrack.children];
const catalogProductIds = ['tee', 'polo', 'pocketTee', 'hoodie', 'embossedHoodie'];
originalCatalogCards.forEach((card, index) => {
  card.dataset.product = catalogProductIds[index];
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'catalog-select';
  button.textContent = 'Обрати';
  card.querySelector('.product-card-media').append(button);
});
const catalogCardsBefore = originalCatalogCards.map((card) => {
  const before = card.cloneNode(true);
  before.setAttribute('aria-hidden', 'true');
  before.querySelector('.catalog-select').tabIndex = -1;
  return before;
});
const catalogCardsAfter = originalCatalogCards.map((card) => {
  const after = card.cloneNode(true);
  after.setAttribute('aria-hidden', 'true');
  after.querySelector('.catalog-select').tabIndex = -1;
  return after;
});
catalogTrack.prepend(...catalogCardsBefore);
catalogTrack.append(...catalogCardsAfter);

catalogTrack.querySelectorAll('.product-card').forEach((card) => {
  const img = card.querySelector('.product-card-media img');
  const prevBtn = card.querySelector('.card-nav.prev');
  const nextBtn = card.querySelector('.card-nav.next');
  if (!img || !prevBtn || !nextBtn) return;
  let gallery;
  try { gallery = JSON.parse(card.dataset.gallery || '[]'); } catch (e) { gallery = []; }
  if (!gallery.length) gallery = [img.getAttribute('src')];
  if (gallery.length <= 1) { card.classList.add('single'); return; }
  gallery.forEach((src) => { const preload = new Image(); preload.src = assetPath(src); });
  let index = 0;
  function show(next) {
    index = (next + gallery.length) % gallery.length;
    img.src = assetPath(gallery[index]);
  }
  prevBtn.addEventListener('click', (event) => { event.stopPropagation(); show(index - 1); });
  nextBtn.addEventListener('click', (event) => { event.stopPropagation(); show(index + 1); });
  show(0);
});

let catalogCycleWidth = 0;
let catalogAutoScrollLeft = null;
function measureCatalogLoop() {
  catalogCycleWidth = originalCatalogCards.reduce((width, card) => width + card.offsetWidth + 16, 0);
  const untouched = catalogAutoScrollLeft === null || Math.abs(catalogTrack.scrollLeft - catalogAutoScrollLeft) < 1;
  if (untouched && catalogCycleWidth) {
    const scrollPaddingLeft = parseFloat(getComputedStyle(catalogTrack).scrollPaddingLeft) || 0;
    const target = originalCatalogCards[0].getBoundingClientRect().left - catalogTrack.getBoundingClientRect().left + catalogTrack.scrollLeft - scrollPaddingLeft;
    catalogTrack.scrollLeft = target;
    catalogAutoScrollLeft = catalogTrack.scrollLeft;
  }
}
function normalizeCatalogLoop() {
  if (!catalogCycleWidth) return;
  if (catalogTrack.scrollLeft < catalogCycleWidth * .35) catalogTrack.scrollLeft += catalogCycleWidth;
  if (catalogTrack.scrollLeft > catalogCycleWidth * 1.65) catalogTrack.scrollLeft -= catalogCycleWidth;
}
window.requestAnimationFrame(measureCatalogLoop);
window.setTimeout(measureCatalogLoop, 150);
window.setTimeout(measureCatalogLoop, 600);
window.addEventListener('resize', measureCatalogLoop);
function queueCatalogNormalize() {
  window.clearTimeout(catalogNormalizeTimer);
  catalogNormalizeTimer = window.setTimeout(normalizeCatalogLoop, 180);
}
catalogTrack.addEventListener('scroll', queueCatalogNormalize, { passive: true });
function cardStep() { return (catalogTrack.querySelector('.product-card')?.offsetWidth || 390) + 16; }
let catalogManualResume;
function pauseCatalogManually() {
  catalogPaused = true;
  window.clearTimeout(catalogManualResume);
  catalogManualResume = window.setTimeout(() => { catalogPaused = false; }, 1600);
}
function scrollCatalog(direction = 1) {
  pauseCatalogManually();
  catalogTrack.scrollBy({ left: cardStep() * direction, behavior: reducedMotion ? 'auto' : 'smooth' });
}
root.querySelector('#catalog-next').addEventListener('click', () => scrollCatalog(1));
root.querySelector('#catalog-prev').addEventListener('click', () => scrollCatalog(-1));
['pointerenter','focusin'].forEach((type) => catalogTrack.addEventListener(type, () => { catalogPaused = true; }));
['pointerleave','focusout'].forEach((type) => catalogTrack.addEventListener(type, () => { catalogPaused = false; }));
catalogTrack.addEventListener('touchstart', () => { catalogPaused = true; window.clearTimeout(catalogManualResume); }, { passive: true });
catalogTrack.addEventListener('touchend', () => { catalogManualResume = window.setTimeout(() => { catalogPaused = false; }, 1500); }, { passive: true });
const catalogObserver = new IntersectionObserver(([entry]) => { catalogVisible = entry.isIntersecting; }, { threshold: .2 });
catalogObserver.observe(catalogTrack);

const CATALOG_AUTO_SPEED = 34;
let catalogAutoTs = null;
let catalogPos = null;
let catalogWasRunning = false;
function catalogAutoTick(ts) {
  if (catalogAutoTs === null) catalogAutoTs = ts;
  const dt = Math.min((ts - catalogAutoTs) / 1000, 0.1);
  catalogAutoTs = ts;
  const running = !catalogPaused && catalogVisible && catalogCycleWidth;
  if (running) {
    if (!catalogWasRunning || catalogPos === null) catalogPos = catalogTrack.scrollLeft;
    catalogPos += CATALOG_AUTO_SPEED * dt;
    if (catalogPos >= catalogCycleWidth * 2) catalogPos -= catalogCycleWidth;
    catalogTrack.scrollLeft = catalogPos;
  } else {
    catalogPos = null;
  }
  catalogWasRunning = running;
  window.requestAnimationFrame(catalogAutoTick);
}
if (!reducedMotion && !isMobileView) window.requestAnimationFrame(catalogAutoTick);

const picker = root.querySelector('#product-picker');
const selectionCount = root.querySelector('#selection-count');
const startButton = root.querySelector('#start-config');
const pickerPanel = root.querySelector('#builder-picker');
const editorPanel = root.querySelector('#builder-editor');
let items = [];
let activeId = null;

function hasItem(productId) { return items.some((item) => item.productId === productId); }

function syncSelectionUI() {
  picker.querySelectorAll('.picker-card').forEach((card) => {
    const picked = hasItem(card.dataset.product);
    card.classList.toggle('selected', picked);
    card.querySelector('.picker-card-remove').textContent = picked ? 'Прибрати' : 'Обрати';
  });
  catalogTrack.querySelectorAll('.product-card').forEach((card) => {
    const isInCollection = hasItem(card.dataset.product);
    const button = card.querySelector('.catalog-select');
    button.classList.toggle('selected', isInCollection);
    button.innerHTML = isInCollection ? `${materialIcon('check')}Обрано` : 'Обрати';
    button.setAttribute('aria-pressed', String(isInCollection));
  });
  const count = items.length;
  selectionCount.textContent = count ? `Обрано: ${count}` : 'Нічого не обрано';
  startButton.disabled = count === 0;
  root.querySelector('#step-editor').disabled = count === 0;
  root.querySelector('#step-results').disabled = count === 0;
  renderChips();
}

function addProductToCollection(productId) {
  items.push(createItem(productId));
  if (!activeId) activeId = items[items.length - 1].id;
  syncSelectionUI();
  renderCollection();
}

Object.entries(PRODUCTS).forEach(([id, product]) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'picker-card'; button.dataset.product = id;
  button.innerHTML = `<span class="picker-card-media"><img src="${assetPath(product.photo || product.image)}" alt=""><span class="picker-card-overlay"><span class="picker-card-remove">Обрати</span></span></span><strong>${product.name}</strong>`;
  button.addEventListener('click', () => {
    const existing = items.find((item) => item.productId === id);
    if (existing) removeItemById(existing.id);
    else addProductToCollection(id);
  });
  picker.append(button);
});

const chipsContainers = [root.querySelector('#picker-chips'), root.querySelector('#editor-chips')];

function renderChips() {
  chipsContainers.forEach((box, boxIndex) => {
    box.innerHTML = '';
    const isEditor = boxIndex === 1;
    items.forEach((item) => {
      const product = PRODUCTS[item.productId];
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `chip${isEditor && item.id === activeId ? ' active' : ''}`;
      chip.innerHTML = `<span>${product.name}</span>`;
      const remove = document.createElement('span');
      remove.className = 'chip-remove';
      remove.setAttribute('role', 'button');
      remove.setAttribute('aria-label', `Прибрати ${product.name}`);
      remove.innerHTML = materialIcon('close');
      remove.addEventListener('click', (event) => { event.stopPropagation(); removeItemById(item.id); });
      chip.append(remove);
      chip.addEventListener('click', () => { activeId = item.id; renderEditor(); renderChips(); });
      box.append(chip);
    });
    if (items.length) {
      const clear = document.createElement('button');
      clear.type = 'button';
      clear.className = 'chip chip-clear';
      clear.textContent = 'Видалити всі';
      clear.addEventListener('click', clearCollection);
      box.append(clear);
    }
  });
}

function clearCollection() {
  items = [];
  activeId = null;
  syncSelectionUI();
  pickerPanel.hidden = false;
  editorPanel.hidden = true;
  setStep(0);
  renderCollection();
}

catalogTrack.querySelectorAll('.catalog-select').forEach((button) => button.addEventListener('click', (event) => {
  event.stopPropagation();
  const productId = button.closest('.product-card').dataset.product;
  const existing = items.find((item) => item.productId === productId);
  if (existing) {
    removeItemById(existing.id);
    return;
  }
  addProductToCollection(productId);
  activeId = items.find((item) => item.productId === productId).id;
  showEditor();
  root.querySelector('#builder').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
}));

const editorChipsEl = root.querySelector('#editor-chips');
const editorGridEl = root.querySelector('.editor-grid');
const editorStepTitle = root.querySelector('#editor-step-title');

const stepTabs = [root.querySelector('#step-picker'), root.querySelector('#step-editor'), root.querySelector('#step-results')];
function setStep(index) {
  stepTabs.forEach((tab, i) => {
    tab.classList.toggle('active', i === index);
    tab.setAttribute('aria-selected', String(i === index));
  });
  stepTabs[1].disabled = items.length === 0;
  stepTabs[2].disabled = items.length === 0;
}

function showEditor() {
  pickerPanel.hidden = true; editorPanel.hidden = false;
  editorChipsEl.hidden = false; editorGridEl.hidden = false;
  editorStepTitle.textContent = 'Налаштування виробу';
  setStep(1);
  renderEditor(); renderCollection();
}

function showResults() {
  pickerPanel.hidden = true; editorPanel.hidden = false;
  editorChipsEl.hidden = true; editorGridEl.hidden = true;
  editorStepTitle.textContent = 'Ваша колекція';
  setStep(2);
  renderCollection();
}

function goToPicker() {
  syncSelectionUI();
  pickerPanel.hidden = false; editorPanel.hidden = true;
  setStep(0);
}

startButton.addEventListener('click', () => {
  if (!activeId || !items.some((item) => item.id === activeId)) activeId = items[0].id;
  showEditor();
});

root.querySelector('#step-picker').addEventListener('click', goToPicker);
root.querySelector('#step-editor').addEventListener('click', () => { if (items.length) showEditor(); });
root.querySelector('#step-results').addEventListener('click', () => { if (items.length) showResults(); });

function optionButton(label, active, onClick, extraClass = '') {
  const button = document.createElement('button'); button.type = 'button'; button.className = `option ${extraClass}${active ? ' active' : ''}`; button.textContent = label; button.setAttribute('aria-pressed', active);
  button.addEventListener('click', onClick); return button;
}

function colorSwatch(hex, name, active, onClick) {
  const button = optionButton('', active, onClick);
  button.style.setProperty('--color', hex); button.setAttribute('aria-label', name); button.title = name;
  return button;
}

function updateActive(patch) { items = updateItem(items, activeId, patch); renderEditor(); renderCollection(); }

function barrelResolveImage(cfg, item) {
  const print = cfg.prints[item.printIndex];
  const printImage = print.variants && print.variants[item.body];
  if (printImage) return printImage;
  const material = cfg.materials[item.materialIndex];
  const materialImage = item.materialIndex === 0 ? cfg.baseVariants[item.body] : (material.variants && material.variants[item.body]);
  if (item.materialIndex !== 0) return materialImage;
  const detailImage = cfg.detailVariants[`${item.body}:${item.accent}`];
  return detailImage || materialImage || cfg.baseVariants[0];
}

function updateBarrel(patch) {
  const current = items.find((entry) => entry.id === activeId);
  const product = PRODUCTS[current.productId];
  const cfg = product.configurator;
  const merged = { ...current, ...patch };
  merged.color = product.palette[merged.body].name;
  merged.material = cfg.materials[merged.materialIndex].name;
  merged.branding = cfg.prints[merged.printIndex].name;
  items = updateItem(items, activeId, merged);
  renderEditor(); renderCollection();
}

function selectBarrelBody(index) { updateBarrel({ body: index, accent: index }); }
function selectBarrelAccent(index) { updateBarrel({ accent: index }); }
function selectBarrelMaterial(product, index) {
  const body = product.configurator.materials[index].colors[0];
  updateBarrel({ materialIndex: index, printIndex: 0, body, accent: body });
}
function selectBarrelPrint(product, index) {
  const printColors = product.configurator.prints[index].colors;
  if (printColors) {
    const body = printColors[0];
    updateBarrel({ printIndex: index, materialIndex: 0, body, accent: body });
  } else {
    updateBarrel({ printIndex: index });
  }
}

function renderBarrelControls(item, product) {
  const cfg = product.configurator;
  const accentFieldset = root.querySelector('#accent-fieldset');
  accentFieldset.hidden = false;
  root.querySelector('#accent-legend').textContent = cfg.detailLabel;

  const bodyIndices = cfg.prints[item.printIndex].colors || cfg.materials[item.materialIndex].colors;
  const colorBox = root.querySelector('#color-options'); colorBox.innerHTML = '';
  bodyIndices.forEach((index) => colorBox.append(colorSwatch(product.palette[index].hex, product.palette[index].name, index === item.body, () => selectBarrelBody(index))));
  const colorName = document.createElement('strong'); colorName.className = 'color-name'; colorName.textContent = product.palette[item.body].name; colorBox.append(colorName);

  const canChangeAccent = item.materialIndex === 0 && item.printIndex === 0;
  const accentIndices = canChangeAccent ? (cfg.detailOptions[item.body] || [item.body]) : [item.body];
  const accentBox = root.querySelector('#accent-options'); accentBox.innerHTML = '';
  accentIndices.forEach((index) => accentBox.append(colorSwatch(product.palette[index].hex, product.palette[index].name, index === item.accent, () => selectBarrelAccent(index))));
  const accentName = document.createElement('strong'); accentName.className = 'color-name'; accentName.textContent = product.palette[item.accent].name; accentBox.append(accentName);

  const materialBox = root.querySelector('#material-options'); materialBox.innerHTML = '';
  cfg.materials.forEach((entry, index) => materialBox.append(optionButton(entry.short, index === item.materialIndex, () => selectBarrelMaterial(product, index))));

  const brandingBox = root.querySelector('#branding-options'); brandingBox.innerHTML = '';
  cfg.prints.forEach((entry, index) => brandingBox.append(optionButton(entry.short, index === item.printIndex, () => selectBarrelPrint(product, index))));

  const image = barrelResolveImage(cfg, item);
  const editorImage = root.querySelector('#editor-image');
  editorImage.src = assetPath(image);
  editorImage.classList.remove('is-photo');
  root.querySelector('#editor-preview').style.setProperty('--preview-color', '#ffffff');
}

function removeItemById(id) {
  items = removeItem(items, id);
  syncSelectionUI();
  if (!items.length) {
    activeId = null; pickerPanel.hidden = false; editorPanel.hidden = true;
    setStep(0);
    renderCollection();
    return;
  }
  if (activeId === id) activeId = items[0].id;
  renderEditor(); renderCollection();
}

function renderSizes(item) {
  const box = root.querySelector('#size-options');
  box.innerHTML = '';
  SIZES.forEach((size) => {
    const active = item.sizes.includes(size);
    box.append(optionButton(size, active, () => {
      const next = active ? item.sizes.filter((entry) => entry !== size) : [...item.sizes, size];
      if (!next.length) return;
      updateActive({ sizes: SIZES.filter((entry) => next.includes(entry)) });
    }, 'size'));
  });
}

function renderEditor() {
  const item = items.find((entry) => entry.id === activeId); if (!item) return;
  const product = PRODUCTS[item.productId];
  renderChips();
  root.querySelector('#editor-image').alt = `Попередній вигляд: ${product.name}`;
  root.querySelector('#preview-code').textContent = product.code;
  renderSizes(item);

  if (product.configurator) {
    renderBarrelControls(item, product);
  } else {
    root.querySelector('#accent-fieldset').hidden = true;
    const editorImage = root.querySelector('#editor-image');
    editorImage.src = assetPath(product.photo || product.image);
    editorImage.classList.toggle('is-photo', Boolean(product.photo));
    const color = product.colors.find((entry) => entry.name === item.color) || product.colors[0];
    root.querySelector('#editor-preview').style.setProperty('--preview-color', product.photo ? '#f0f2f5' : color.hex);
    const colorBox = root.querySelector('#color-options'); colorBox.innerHTML = '';
    product.colors.forEach((entry) => colorBox.append(colorSwatch(entry.hex, entry.name, entry.name === item.color, () => updateActive({ color: entry.name }))));
    const colorName = document.createElement('strong'); colorName.className = 'color-name'; colorName.textContent = item.color; colorBox.append(colorName);
    const materialBox = root.querySelector('#material-options'); materialBox.innerHTML = '';
    product.materials.forEach((entry) => materialBox.append(optionButton(entry, entry === item.material, () => updateActive({ material: entry }))));
    const brandingBox = root.querySelector('#branding-options'); brandingBox.innerHTML = '';
    product.branding.forEach((entry) => brandingBox.append(optionButton(entry, entry === item.branding, () => updateActive({ branding: entry }))));
  }
  root.querySelector('#quantity').value = item.quantity;
}

const quantityInput = root.querySelector('#quantity');
function setQuantity(value) { updateActive({ quantity: Math.max(20, Number(value) || 20) }); }
quantityInput.addEventListener('change', (event) => setQuantity(event.target.value));
root.querySelector('#quantity-minus').addEventListener('click', () => setQuantity(Number(quantityInput.value) - 10));
root.querySelector('#quantity-plus').addEventListener('click', () => setQuantity(Number(quantityInput.value) + 10));
root.querySelector('#next-item').addEventListener('click', () => {
  const index = items.findIndex((item) => item.id === activeId);
  if (index < items.length - 1) { activeId = items[index + 1].id; renderEditor(); }
  else { showResults(); }
});

function renderCollection() {
  const list = root.querySelector('#collection-list'); list.innerHTML = '';
  const totalUnits = items.reduce((sum, item) => sum + Number(item.quantity), 0);
  root.querySelector('#collection-total').textContent = `${items.length} позицій · ${totalUnits} шт.`;
  items.forEach((item) => {
    const product = PRODUCTS[item.productId]; const row = document.createElement('article'); row.className = 'collection-item';
    row.innerHTML = `<img src="${assetPath(product.photo || product.image)}" alt=""><div><h4>${product.name}</h4><p>${item.color} · ${item.branding} · ${(item.sizes || []).join('/')} · ${item.quantity} шт.</p></div><div class="item-actions"><button data-action="edit">${materialIcon('edit')}Редагувати</button><button data-action="duplicate">${materialIcon('content-copy')}Дублювати</button><button data-action="remove">${materialIcon('delete')}Видалити</button></div>`;
    row.querySelector('[data-action="edit"]').addEventListener('click', () => { activeId = item.id; renderEditor(); root.querySelector('.editor-grid').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' }); });
    row.querySelector('[data-action="duplicate"]').addEventListener('click', () => { items = duplicateItem(items, item.id); activeId = items.at(-1).id; renderEditor(); renderCollection(); });
    row.querySelector('[data-action="remove"]').addEventListener('click', () => removeItemById(item.id));
    list.append(row);
  });
}

const summaryDialog = root.querySelector('#summary-dialog');
function openSummary() {
  root.querySelector('#summary-text').textContent = summarizeCollection(items);
  summaryDialog.showModal();
}
root.querySelector('#open-summary').addEventListener('click', openSummary);
root.querySelector('#dialog-close').addEventListener('click', () => summaryDialog.close());
summaryDialog.addEventListener('click', (event) => { if (event.target === summaryDialog) summaryDialog.close(); });

const statementEl = root.querySelector('#statement-text');
if (statementEl) {
  const words = statementEl.textContent.split(' ');
  statementEl.textContent = '';
  const wordEls = words.map((word, i) => {
    const span = document.createElement('span');
    span.className = 'statement-word';
    span.textContent = word;
    statementEl.append(span);
    if (i < words.length - 1) statementEl.append(' ');
    return span;
  });
  if (reducedMotion) {
    wordEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    let statementTicking = false;
    const updateStatement = () => {
      statementTicking = false;
      const line = window.innerHeight * 0.72;
      wordEls.forEach((el) => el.classList.toggle('is-visible', el.getBoundingClientRect().top < line));
    };
    const queueStatement = () => {
      if (statementTicking) return;
      statementTicking = true;
      window.requestAnimationFrame(updateStatement);
    };
    window.addEventListener('scroll', queueStatement, { passive: true });
    window.addEventListener('resize', queueStatement);
    window.requestAnimationFrame(() => window.requestAnimationFrame(updateStatement));
  }
}

const newsletterForm = root.querySelector('#newsletter-form');
newsletterForm.addEventListener('submit', (event) => {
  event.preventDefault();
  root.querySelector('#newsletter-note').hidden = false;
  newsletterForm.reset();
});

const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('in'); revealObserver.unobserve(entry.target); } }), { threshold: .12 });
root.querySelectorAll('.section-heading,.catalog-heading,.builder-heading').forEach((element) => { element.classList.add('reveal'); revealObserver.observe(element); });

root.querySelectorAll('a[href^="#"]').forEach((link) => link.addEventListener('click', (event) => {
  const target = root.querySelector(link.getAttribute('href'));
  if (target && root !== document) { event.preventDefault(); target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' }); }
}));

root.querySelectorAll('.faq-item').forEach((details) => {
  const summary = details.querySelector('summary');
  const body = details.querySelector('.faq-body');
  let animation = null;
  summary.addEventListener('click', (event) => {
    event.preventDefault();
    if (reducedMotion) { details.open = !details.open; return; }
    animation?.cancel();
    const isOpen = details.open;
    if (isOpen) {
      animation = body.animate([{ height: `${body.offsetHeight}px` }, { height: '0px' }], { duration: 240, easing: 'cubic-bezier(.16,1,.3,1)' });
      animation.onfinish = () => { details.open = false; };
    } else {
      details.open = true;
      const targetHeight = body.offsetHeight;
      animation = body.animate([{ height: '0px' }, { height: `${targetHeight}px` }], { duration: 260, easing: 'cubic-bezier(.16,1,.3,1)' });
    }
  });
});

return () => { window.clearInterval(storyTimer); window.clearInterval(catalogTimer); window.clearTimeout(catalogNormalizeTimer); window.removeEventListener('resize', measureCatalogLoop); catalogObserver.disconnect(); revealObserver.disconnect(); };

}
window.initMoodDrop = initMoodDrop;
if (document.querySelector("main#top")) initMoodDrop(document);
