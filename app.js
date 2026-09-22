"use strict";

const ICONS = {
  "back-filled": '<svg viewBox="0 0 20 20"><path d="m11.8 5.8-4.2 4.2 4.2 4.2" fill="none"></path></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="m7 7 10 10M17 7 7 17"></path></svg>',
  "close-small": '<svg viewBox="0 0 24 24"><path d="m8 8 8 8m0-8-8 8"></path></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>',
  folder: '<svg viewBox="0 0 24 24"><path d="M3.5 7.5v10.2c0 1 .8 1.8 1.8 1.8h13.4c1 0 1.8-.8 1.8-1.8V9.3c0-1-.8-1.8-1.8-1.8h-6.3L10.5 5H5.3c-1 0-1.8.8-1.8 1.8v.7Z"></path></svg>',
  "folder-plus": '<svg viewBox="0 0 24 24"><path d="M3.5 8v9.7c0 1 .8 1.8 1.8 1.8h13.4c1 0 1.8-.8 1.8-1.8V9.3c0-1-.8-1.8-1.8-1.8h-6.3L10.5 5H5.3c-1 0-1.8.8-1.8 1.8"></path><path d="M12 10.5v5M9.5 13h5"></path></svg>',
  image: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"></rect><circle cx="8.5" cy="9" r="1.5"></circle><path d="m5.5 18 5-5 3.2 3.2 2.2-2.2 2.6 4"></path></svg>',
  download: '<svg viewBox="0 0 24 24"><path d="M12 3v12m-4-4 4 4 4-4M5 20h14"></path></svg>',
  upload: '<svg viewBox="0 0 24 24"><path d="M12 16V4m-4 4 4-4 4 4M5 20h14"></path></svg>',
  rotate: '<svg viewBox="0 0 24 24"><path d="M4 8V4m0 0h4M4.8 5.3a8 8 0 1 1-1 8.7"></path></svg>',
  sparkles: '<svg viewBox="0 0 24 24"><path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3ZM6 14l.8 2.2L9 17l-2.2.8L6 20l-.8-2.2L3 17l2.2-.8L6 14Z"></path></svg>',
  wand: '<svg viewBox="0 0 24 24"><path d="m4 20 11-11M14 4l.7 2.3L17 7l-2.3.7L14 10l-.7-2.3L11 7l2.3-.7L14 4Z"></path></svg>',
  external: '<svg viewBox="0 0 24 24"><path d="M14 5h5v5M19 5l-8 8"></path><path d="M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"></path></svg>',
  window: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="14" rx="2"></rect><path d="M3.5 9h17M7 7h.01M10 7h.01"></path></svg>',
  edit: '<svg viewBox="0 0 24 24"><path d="m4 20 4.2-1 10.5-10.5a2 2 0 0 0-2.8-2.8L5.4 16.2 4 20Z"></path><path d="m14.5 7.1 2.8 2.8"></path></svg>',
  link: '<svg viewBox="0 0 24 24"><path d="m10 13 4-4"></path><path d="M7.5 15.5 5 18a3.5 3.5 0 0 1-5-5l3-3a3.5 3.5 0 0 1 5 0M16.5 8.5 19 6a3.5 3.5 0 0 1 5 5l-3 3a3.5 3.5 0 0 1-5 0"></path></svg>',
  copy: '<svg viewBox="0 0 24 24"><rect x="8" y="8" width="11" height="11" rx="2"></rect><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"></path></svg>',
  sort: '<svg viewBox="0 0 24 24"><path d="M7 4v16M4 7l3-3 3 3M14 7h6M14 12h5M14 17h3"></path></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"></path></svg>',
  home: '<svg viewBox="0 0 24 24"><path d="m4 11 8-7 8 7v9h-6v-6h-4v6H4v-9Z"></path></svg>'
};

const DEFAULT_STATE = {
  version: 4,
  background: { data: null, dim: 8, blur: 0 },
  items: SAFARI_IMPORTED_ITEMS
};
const CUSTOM_ICON_CROP_REVISION = 1;

const els = {};
const iconRequests = new Map();
let state = clone(DEFAULT_STATE);
let iconCache = {};
let activeGroupId = null;
let formMode = null;
let editingId = null;
let editingParentId = null;
let contextTarget = null;
let addressTarget = null;
let iconTarget = null;
let iconModeDraft = "safari";
let iconUploadDraft = null;
let confirmResolver = null;
let toastTimer = null;
let iconCacheTimer = null;
let dragInfo = null;
let dragPreview = null;
let viewTimer = null;

document.addEventListener("DOMContentLoaded", init);

async function init() {
  cacheElements();
  injectIcons(document);
  bindEvents();
  const [savedState, savedIcons, importedRevision, iconCacheRevision, customIconCropRevision] = await Promise.all([
    storageGet("startPageState"),
    storageGet("safariIconCache"),
    storageGet("safariImportedRevision"),
    storageGet("iconCacheRevision"),
    storageGet("customIconCropRevision")
  ]);
  if (savedState?.items && Array.isArray(savedState.items)) state = savedState;
  if (savedIcons && typeof savedIcons === "object") iconCache = savedIcons;
  migrateAndCleanState();
  if (Number(importedRevision || 0) < SAFARI_IMPORT_REVISION) {
    await storageSet("safariImportedRevision", SAFARI_IMPORT_REVISION);
  }
  if (Number(iconCacheRevision || 0) < 2) {
    iconCache = {};
    await Promise.all([storageSet("safariIconCache", iconCache), storageSet("iconCacheRevision", 2)]);
  }
  if (Number(customIconCropRevision || 0) < CUSTOM_ICON_CROP_REVISION) {
    const changed = await normalizeStoredCustomIcons();
    await Promise.all([
      changed ? persist() : Promise.resolve(),
      storageSet("customIconCropRevision", CUSTOM_ICON_CROP_REVISION)
    ]);
  }
  applyAppearance();
  renderView(false);
}

function cacheElements() {
  ["wallpaper", "collection-view", "section-title", "collection-back", "collection-grid", "empty-state", "edit-toggle", "editor-panel", "editor-close", "add-bookmark-label", "background-upload", "background-reset", "background-preview", "import-data", "form-layer", "item-form", "form-title", "form-close", "form-cancel", "bookmark-fields", "group-fields", "item-title", "item-url", "item-parent", "group-name", "icon-layer", "icon-form-close", "icon-form-cancel", "icon-form-save", "icon-safari-preview", "icon-google-preview", "icon-custom-preview", "icon-upload", "address-popover", "address-input", "confirm-overlay", "confirm-title", "confirm-message", "confirm-cancel", "confirm-ok", "context-menu", "toast"].forEach(id => {
    els[toCamel(id)] = document.getElementById(id);
  });
}

function bindEvents() {
  els.collectionBack.addEventListener("click", closeGroup);
  els.collectionGrid.addEventListener("click", handleGridClick);
  els.collectionGrid.addEventListener("contextmenu", handleContextMenu);
  els.editToggle.addEventListener("click", toggleEditor);
  els.editorClose.addEventListener("click", () => setEditor(false));
  els.backgroundUpload.addEventListener("change", handleBackgroundUpload);
  els.backgroundReset.addEventListener("click", resetBackground);
  els.importData.addEventListener("change", importData);
  els.formLayer.addEventListener("mousedown", event => { if (event.target === els.formLayer) closeForm(); });
  els.formClose.addEventListener("click", closeForm);
  els.formCancel.addEventListener("click", closeForm);
  els.itemForm.addEventListener("submit", saveForm);
  els.iconFormClose.addEventListener("click", closeIconEditor);
  els.iconFormCancel.addEventListener("click", closeIconEditor);
  els.iconFormSave.addEventListener("click", saveIconEditor);
  els.iconUpload.addEventListener("change", handleIconUpload);
  els.iconLayer.addEventListener("mousedown", event => { if (event.target === els.iconLayer) closeIconEditor(); });
  els.iconLayer.querySelectorAll("input[name='icon-source']").forEach(input => input.addEventListener("change", event => {
    iconModeDraft = event.target.value;
    updateIconEditorState();
  }));
  els.addressPopover.addEventListener("submit", saveAddress);
  els.confirmCancel.addEventListener("click", () => resolveConfirm(false));
  els.confirmOk.addEventListener("click", () => resolveConfirm(true));
  els.confirmOverlay.addEventListener("mousedown", event => { if (event.target === els.confirmOverlay) resolveConfirm(false); });
  document.addEventListener("click", handleActionClick);
  document.addEventListener("mousedown", handleDocumentPointer);
  document.addEventListener("contextmenu", event => { if (!event.target.closest(".favorite")) hideContextMenu(); });
  document.addEventListener("keydown", handleKeydown);
  window.addEventListener("resize", () => { hideContextMenu(); closeAddressPopover(); });
  bindDragEvents();
}

function renderView(animate = true, backwards = false) {
  clearTimeout(viewTimer);
  const draw = () => {
    const group = activeGroupId ? findGroup(activeGroupId) : null;
    if (activeGroupId && !group) activeGroupId = null;
    const currentGroup = activeGroupId ? findGroup(activeGroupId) : null;
    const items = currentGroup ? currentGroup.children : state.items;
    els.sectionTitle.textContent = currentGroup ? currentGroup.title : "个人收藏";
    els.collectionBack.hidden = !currentGroup;
    els.addBookmarkLabel.textContent = currentGroup ? `添加到“${currentGroup.title}”` : "添加书签";
    els.collectionGrid.innerHTML = items.map(item => item.type === "group" ? groupMarkup(item) : bookmarkMarkup(item, currentGroup?.id || null)).join("");
    els.collectionGrid.hidden = items.length === 0;
    els.emptyState.hidden = items.length > 0;
    injectIcons(els.collectionGrid);
    hydrateIcons(els.collectionGrid);
    els.collectionGrid.querySelectorAll(".favorite").forEach(card => { card.draggable = true; });
    if (animate) {
      els.collectionView.classList.remove("view-out");
      els.collectionView.classList.add("view-in");
      setTimeout(() => els.collectionView.classList.remove("view-in"), 210);
    }
  };
  if (!animate) return draw();
  els.collectionView.style.transformOrigin = backwards ? "left center" : "right center";
  els.collectionView.classList.add("view-out");
  viewTimer = setTimeout(draw, 90);
}

function bookmarkMarkup(item, parentId) {
  const [a, b] = colorsFor(item.url);
  return `<article class="favorite" role="listitem" data-id="${escapeAttr(item.id)}" data-parent="${escapeAttr(parentId || "")}" data-type="bookmark">
    <button class="favorite-button" type="button" aria-label="打开 ${escapeAttr(item.title)}">
      <span class="tile site-tile" style="--tone-a:${a};--tone-b:${b}">
        <img class="site-image" alt="" data-site-url="${escapeAttr(item.url)}" data-item-id="${escapeAttr(item.id)}" data-parent-id="${escapeAttr(parentId || "")}">
        <span class="monogram">${escapeHtml(firstGlyph(item.title))}</span>
      </span>
      <span class="favorite-name" title="${escapeAttr(item.title)}">${escapeHtml(item.title)}</span>
    </button>
  </article>`;
}

function groupMarkup(group) {
  const previews = group.children.slice(0, 9).map(item => {
    const [a, b] = colorsFor(item.url);
    return `<span class="mini-icon" style="--tone-a:${a};--tone-b:${b}"><img alt="" data-site-url="${escapeAttr(item.url)}" data-item-id="${escapeAttr(item.id)}" data-parent-id="${escapeAttr(group.id)}"><span class="mini-letter">${escapeHtml(firstGlyph(item.title))}</span></span>`;
  }).join("");
  const empty = group.children.length ? "" : `<span class="folder-empty" data-icon="folder"></span>`;
  return `<article class="favorite" role="listitem" data-id="${escapeAttr(group.id)}" data-parent="" data-type="group">
    <button class="favorite-button" type="button" aria-label="打开分组 ${escapeAttr(group.title)}">
      <span class="tile folder-tile"><span class="folder-preview">${previews}${empty}</span></span>
      <span class="favorite-name" title="${escapeAttr(group.title)}">${escapeHtml(group.title)}</span>
    </button>
  </article>`;
}

function hydrateIcons(root) {
  root.querySelectorAll("img[data-site-url]").forEach(img => {
    const item = findItem(img.dataset.itemId, img.dataset.parentId || null)?.item;
    loadSafariStyleIcon(img, img.dataset.siteUrl, item);
  });
}

function loadSafariStyleIcon(img, pageUrl, item = null) {
  const origin = safeOrigin(pageUrl);
  if (!origin) return;
  if (item?.iconMode === "custom" && isImageData(item.customIcon)) {
    applyLoadedImage(img, item.customIcon, "custom", 512, 512);
    return;
  }
  if (item?.iconMode === "google") return loadGoogleIcon(img, pageUrl);
  loadOfficialSafariIcon(img, pageUrl);
}

function loadOfficialSafariIcon(img, pageUrl) {
  const origin = safeOrigin(pageUrl);
  if (!origin) return;
  const quick = [];
  const cacheKey = `safari:${origin}`;
  const cached = iconCache[cacheKey];
  if (cached?.src && isWebUrl(cached.src)) quick.push({ src: cached.src, kind: cached.kind || "touch" });
  quick.push(
    { src: `${origin}/apple-touch-icon-180x180.png`, kind: "touch" },
    { src: `${origin}/apple-touch-icon.png`, kind: "touch" },
    { src: `${origin}/apple-touch-icon-precomposed.png`, kind: "touch" },
    { src: `${origin}/favicon-192x192.png`, kind: "favicon" },
    { src: `${origin}/favicon.png`, kind: "favicon" },
    { src: `${origin}/favicon.ico`, kind: "favicon" }
  );
  tryImageCandidates(img, uniqueCandidates(quick), 0, cacheKey);
  discoverSafariIcon(pageUrl).then(result => {
    if (!result?.src || !img.isConnected || img.src === result.src) return;
    const probe = new Image();
    probe.onload = () => applyLoadedImage(img, result.src, result.kind, probe.naturalWidth, probe.naturalHeight);
    probe.onerror = () => markIconFallback(img);
    probe.src = result.src;
  }).catch(() => markIconFallback(img));
}

function loadGoogleIcon(img, pageUrl) {
  const origin = safeOrigin(pageUrl);
  if (!origin) return;
  const cacheKey = `google:${origin}`;
  const googleUrl = `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(pageUrl)}&sz=256`;
  const cached = iconCache[cacheKey];
  const candidates = uniqueCandidates([
    cached?.src ? { src: cached.src, kind: "google" } : null,
    { src: googleUrl, kind: "google" }
  ].filter(Boolean));
  tryImageCandidates(img, candidates, 0, cacheKey);
}

function tryImageCandidates(img, candidates, index, cacheKey) {
  if (!img.isConnected) return;
  if (index >= candidates.length) return markIconFallback(img);
  const candidate = candidates[index];
  img.onload = () => {
    applyLoadedImage(img, candidate.src, candidate.kind, img.naturalWidth, img.naturalHeight);
    if (!iconCache[cacheKey]?.src) {
      iconCache[cacheKey] = { ...candidate, at: Date.now(), provisional: candidate.kind !== "google" };
      scheduleIconCacheSave();
    }
  };
  img.onerror = () => tryImageCandidates(img, candidates, index + 1, cacheKey);
  img.src = candidate.src;
}

function applyLoadedImage(img, src, kind, naturalWidth, naturalHeight) {
  if (!img.isConnected) return;
  img.onload = null;
  img.onerror = null;
  if (img.src !== src) img.src = src;
  const width = Number(naturalWidth || 0);
  const height = Number(naturalHeight || 0);
  const ratio = width && height ? width / height : 1;
  // Safari scales square favicons up to fill the tile, even when the source is
  // only 16/32/64 px. Only genuinely wide or tall artwork is contained.
  const contained = kind !== "custom" && (ratio < .78 || ratio > 1.28);
  img.classList.toggle("contained", contained);
  img.classList.add("ready");
  const frame = img.closest(".site-tile, .mini-icon");
  if (frame) {
    frame.classList.toggle("icon-ready", true);
    frame.classList.toggle("icon-contained", contained);
    frame.classList.toggle("icon-custom", kind === "custom");
    frame.classList.toggle("icon-google", kind === "google");
    frame.classList.remove("icon-fallback");
  }
}

function markIconFallback(img) {
  if (!img?.isConnected || img.classList.contains("ready")) return;
  img.removeAttribute("src");
  const frame = img.closest(".site-tile, .mini-icon");
  if (frame) {
    frame.classList.remove("icon-ready", "icon-contained", "icon-custom", "icon-google");
    frame.classList.add("icon-fallback");
  }
}

async function discoverSafariIcon(pageUrl) {
  const origin = safeOrigin(pageUrl);
  if (!origin) return null;
  const cacheKey = `safari:${origin}`;
  const cached = iconCache[cacheKey];
  if (cached && !cached.provisional && Date.now() - Number(cached.at || 0) < 30 * 864e5) return cached.src ? cached : null;
  if (iconRequests.has(cacheKey)) return iconRequests.get(cacheKey);
  const request = discoverPageIcon(pageUrl).then(result => {
    iconCache[cacheKey] = result ? { ...result, at: Date.now() } : { src: null, kind: "none", at: Date.now() };
    scheduleIconCacheSave();
    return result;
  }).catch(() => {
    iconCache[cacheKey] = { src: null, kind: "none", at: Date.now() };
    scheduleIconCacheSave();
    return null;
  }).finally(() => iconRequests.delete(cacheKey));
  iconRequests.set(cacheKey, request);
  return request;
}

async function discoverPageIcon(pageUrl) {
  const response = await fetchWithTimeout(pageUrl, 7000);
  if (!response.ok) return null;
  const baseUrl = response.url || pageUrl;
  const html = (await response.text()).slice(0, 700000);
  const doc = new DOMParser().parseFromString(html, "text/html");
  const links = Array.from(doc.querySelectorAll("link[rel][href]"));
  const relOf = link => String(link.getAttribute("rel") || "").trim();
  const touchLinks = links.filter(link => /(?:^|\s)apple-touch-icon(?:-precomposed)?(?:\s|$)/i.test(relOf(link)));
  const touch = pickBestLink(touchLinks, baseUrl, 180);
  if (touch) return { src: touch, kind: "touch" };

  const manifestLink = links.find(link => /(?:^|\s)manifest(?:\s|$)/i.test(relOf(link)));
  if (manifestLink) {
    const manifestUrl = safeResolvedUrl(manifestLink.getAttribute("href"), baseUrl);
    if (manifestUrl) {
      try {
        const manifestResponse = await fetchWithTimeout(manifestUrl, 5000);
        if (manifestResponse.ok) {
          const manifest = JSON.parse((await manifestResponse.text()).slice(0, 250000));
          const icons = Array.isArray(manifest.icons) ? manifest.icons.filter(icon => !icon.purpose || String(icon.purpose).split(/\s+/).includes("any")) : [];
          const best = pickBestManifestIcon(icons, manifestUrl);
          if (best) return { src: best, kind: "touch" };
        }
      } catch { /* Continue to standard page icons. */ }
    }
  }

  const standardLinks = links.filter(link => /(?:^|\s)(?:shortcut\s+)?icon(?:\s|$)/i.test(relOf(link)) && !/mask-icon/i.test(relOf(link)));
  const standard = pickBestLink(standardLinks, baseUrl, 128);
  if (standard) return { src: standard, kind: "favicon" };

  const tileMeta = doc.querySelector('meta[name="msapplication-TileImage" i][content]');
  const tileImage = tileMeta ? safeResolvedUrl(tileMeta.getAttribute("content"), baseUrl) : null;
  return tileImage ? { src: tileImage, kind: "touch" } : null;
}

function pickBestLink(links, baseUrl, ideal) {
  return links.map(link => ({
    src: safeResolvedUrl(link.getAttribute("href"), baseUrl),
    size: parseLargestSize(link.getAttribute("sizes"))
  })).filter(item => item.src).sort((a, b) => iconScore(b.size, ideal) - iconScore(a.size, ideal))[0]?.src || null;
}

function pickBestManifestIcon(icons, manifestUrl) {
  return icons.map(icon => ({
    src: safeResolvedUrl(icon.src, manifestUrl),
    size: parseLargestSize(icon.sizes)
  })).filter(item => item.src).sort((a, b) => iconScore(b.size, 180) - iconScore(a.size, 180))[0]?.src || null;
}

function iconScore(size, ideal) {
  if (!size) return 1;
  if (size === Infinity) return 250;
  return size >= ideal ? 1000 - Math.abs(size - ideal) : 500 + size;
}

function parseLargestSize(value) {
  if (!value) return 0;
  if (String(value).toLowerCase().includes("any")) return Infinity;
  return Math.max(0, ...String(value).split(/\s+/).map(part => Number(part.split("x")[0]) || 0));
}

function fetchWithTimeout(url, timeout) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  return fetch(url, { credentials: "omit", redirect: "follow", signal: controller.signal }).finally(() => clearTimeout(timer));
}

function uniqueCandidates(candidates) {
  const seen = new Set();
  return candidates.filter(item => item.src && !seen.has(item.src) && seen.add(item.src));
}

function scheduleIconCacheSave() {
  clearTimeout(iconCacheTimer);
  iconCacheTimer = setTimeout(() => storageSet("safariIconCache", iconCache).catch(() => {}), 400);
}

function handleGridClick(event) {
  if (event.target.closest(".name-editor")) return;
  const favorite = event.target.closest(".favorite");
  if (!favorite) return;
  if (favorite.dataset.type === "group") openGroup(favorite.dataset.id);
  else {
    const found = findItem(favorite.dataset.id, favorite.dataset.parent || null);
    if (found) navigate(found.item.url);
  }
}

function openGroup(id) {
  if (!findGroup(id)) return;
  activeGroupId = id;
  closeAddressPopover();
  hideContextMenu();
  setEditor(false);
  renderView(true, false);
  setTimeout(() => els.collectionBack.focus(), 130);
}

function closeGroup() {
  if (!activeGroupId) return;
  activeGroupId = null;
  closeAddressPopover();
  hideContextMenu();
  renderView(true, true);
}

function toggleEditor() { setEditor(!els.editorPanel.classList.contains("open")); }
function setEditor(open) {
  els.editorPanel.classList.toggle("open", open);
  els.editorPanel.setAttribute("aria-hidden", String(!open));
  els.editToggle.textContent = open ? "完成" : "编辑";
  if (open) { hideContextMenu(); closeAddressPopover(); }
}

function handleContextMenu(event) {
  const favorite = event.target.closest(".favorite");
  if (!favorite) return;
  event.preventDefault();
  setEditor(false);
  closeAddressPopover();
  contextTarget = { id: favorite.dataset.id, parentId: favorite.dataset.parent || null, type: favorite.dataset.type };
  renderContextMenu();
  positionContextMenu(event.clientX, event.clientY);
}

function renderContextMenu() {
  if (!contextTarget) return;
  const bookmarkMenu = `
    ${menuButton("external", "在新标签页中打开", "open-new")}
    ${menuButton("window", "在新窗口中打开", "open-window")}
    <div class="menu-separator"></div>
    ${menuButton("edit", "重新命名", "rename")}
    ${menuButton("image", "编辑图标…", "edit-icon")}
    ${menuButton("link", "编辑地址…", "edit-address")}
    ${menuButton("copy", "拷贝链接", "copy")}
    <div class="menu-separator"></div>
    ${menuButton("trash", "删除", "delete", "", true)}`;
  const groupMenu = `
    ${menuButton("folder", "打开文件夹", "open-group")}
    ${menuButton("external", "在新标签页中打开全部", "open-all")}
    ${menuButton("window", "在新窗口中打开全部", "open-all-window")}
    <div class="menu-separator"></div>
    ${menuButton("edit", "重新命名", "rename")}
    ${menuButton("copy", "拷贝所有链接", "copy")}
    <div class="menu-separator"></div>
    ${menuButton("sort", "按名称排序", "sort-name")}
    ${menuButton("sort", "按地址排序", "sort-address")}
    <div class="menu-separator"></div>
    ${menuButton("trash", "删除", "delete", "", true)}`;
  els.contextMenu.innerHTML = contextTarget.type === "group" ? groupMenu : bookmarkMenu;
  injectIcons(els.contextMenu);
  els.contextMenu.hidden = false;
  els.contextMenu.querySelectorAll("[data-menu-action]").forEach(button => button.addEventListener("click", runContextAction));
}

function menuButton(icon, label, action, value = "", danger = false) {
  return `<button class="menu-item${danger ? " danger" : ""}" type="button" role="menuitem" data-menu-action="${escapeAttr(action)}" data-value="${escapeAttr(value)}"><span data-icon="${icon}"></span><span>${escapeHtml(label)}</span></button>`;
}

async function runContextAction(event) {
  const action = event.currentTarget.dataset.menuAction;
  const target = contextTarget;
  const card = findRenderedCard(target?.id, target?.parentId);
  hideContextMenu();
  if (!target) return;
  const found = findItem(target.id, target.parentId);
  if (!found) return;
  if (action === "open-new") return openInNewTab(found.item.url);
  if (action === "open-window") return openInNewWindow([found.item.url]);
  if (action === "open-group") return openGroup(target.id);
  if (action === "open-all") return openMany(found.item.children.map(item => item.url));
  if (action === "open-all-window") return openInNewWindow(found.item.children.map(item => item.url));
  if (action === "rename") return beginInlineRename(target.id, target.parentId, card);
  if (action === "edit-icon") return openIconEditor(target.id, target.parentId, card);
  if (action === "edit-address") return openAddressPopover(target.id, target.parentId, card);
  if (action === "copy") return copyTarget(found.item);
  if (action === "sort-name") return sortGroup(found.item, "title");
  if (action === "sort-address") return sortGroup(found.item, "url");
  if (action === "delete") return deleteTarget(target.id, target.parentId, target.type);
}

function positionContextMenu(x, y) {
  const menu = els.contextMenu;
  menu.style.left = `${Math.max(6, Math.min(x, window.innerWidth - menu.offsetWidth - 7))}px`;
  menu.style.top = `${Math.max(6, Math.min(y, window.innerHeight - menu.offsetHeight - 7))}px`;
}
function hideContextMenu() { els.contextMenu.hidden = true; contextTarget = null; }

function beginInlineRename(id, parentId, card = null) {
  card ||= findRenderedCard(id, parentId);
  const found = findItem(id, parentId);
  const label = card?.querySelector(".favorite-name");
  if (!found || !label) return;
  const input = document.createElement("input");
  input.className = "name-editor";
  input.value = found.item.title;
  input.maxLength = found.item.type === "group" ? 24 : 32;
  label.replaceWith(input);
  let done = false;
  const finish = async save => {
    if (done) return;
    done = true;
    const next = input.value.trim();
    if (save && next) {
      found.item.title = next;
      await persist();
      showToast("名称已更新");
    }
    renderView(false);
  };
  input.addEventListener("click", event => event.stopPropagation());
  input.addEventListener("keydown", event => {
    if (event.key === "Enter") { event.preventDefault(); finish(true); }
    if (event.key === "Escape") { event.preventDefault(); finish(false); }
  });
  input.addEventListener("blur", () => finish(true));
  input.focus();
  input.select();
}

function openAddressPopover(id, parentId, card = null) {
  card ||= findRenderedCard(id, parentId);
  const found = findItem(id, parentId);
  if (!card || !found || found.item.type !== "bookmark") return;
  addressTarget = { id, parentId };
  els.addressInput.value = found.item.url;
  els.addressPopover.hidden = false;
  const rect = card.getBoundingClientRect();
  const width = 314;
  const left = Math.max(8, Math.min(rect.left + rect.width / 2 - width / 2, window.innerWidth - width - 8));
  let top = rect.bottom + 5;
  if (top + 45 > window.innerHeight) top = rect.top - 44;
  els.addressPopover.style.left = `${left}px`;
  els.addressPopover.style.top = `${top}px`;
  requestAnimationFrame(() => { els.addressInput.focus(); els.addressInput.select(); });
}

function closeAddressPopover() { els.addressPopover.hidden = true; addressTarget = null; }

function openIconEditor(id, parentId) {
  const found = findItem(id, parentId);
  if (!found || found.item.type !== "bookmark") return;
  iconTarget = { id, parentId };
  closeAddressPopover();
  setEditor(false);
  iconModeDraft = found.item.iconMode === "custom" && isImageData(found.item.customIcon)
    ? "custom"
    : found.item.iconMode === "google" ? "google" : "safari";
  iconUploadDraft = isImageData(found.item.customIcon) ? found.item.customIcon : null;
  const selected = els.iconLayer.querySelector(`input[name="icon-source"][value="${iconModeDraft}"]`);
  els.iconLayer.querySelectorAll("input[name='icon-source']").forEach(input => { input.checked = input === selected; });
  els.iconSafariPreview.dataset.siteUrl = found.item.url;
  els.iconSafariPreview.src = "";
  els.iconSafariPreview.classList.remove("ready", "contained");
  loadSafariStyleIcon(els.iconSafariPreview, found.item.url, { ...found.item, iconMode: "safari" });
  els.iconGooglePreview.dataset.siteUrl = found.item.url;
  els.iconGooglePreview.src = "";
  els.iconGooglePreview.classList.remove("ready", "contained");
  loadSafariStyleIcon(els.iconGooglePreview, found.item.url, { ...found.item, iconMode: "google" });
  updateIconEditorState();
  els.iconLayer.hidden = false;
  requestAnimationFrame(() => (iconModeDraft === "custom" ? els.iconFormSave.focus() : els.iconFormCancel.focus()));
}

function updateIconEditorState() {
  els.iconCustomPreview.classList.toggle("has-image", Boolean(iconUploadDraft));
  if (iconUploadDraft) {
    els.iconCustomPreview.innerHTML = `<img class="icon-preview-image" alt="" src="${escapeAttr(iconUploadDraft)}"><span class="custom-preview-overlay" data-icon="image"></span>`;
    injectIcons(els.iconCustomPreview);
  } else {
    els.iconCustomPreview.innerHTML = `<span data-icon="image"></span>`;
    injectIcons(els.iconCustomPreview);
  }
  els.iconFormSave.disabled = iconModeDraft === "custom" && !iconUploadDraft;
}

async function handleIconUpload(event) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;
  const supportedType = /^(?:image\/(?:svg\+xml|png|jpeg|webp|avif))$/i.test(file.type) || /\.(?:svg|png|jpe?g|webp|avif)$/i.test(file.name);
  if (!supportedType) return showToast("请选择 SVG、PNG、JPEG、WebP 或 AVIF 图片");
  try {
    iconUploadDraft = await compressIcon(file);
    iconModeDraft = "custom";
    const customRadio = els.iconLayer.querySelector("input[name='icon-source'][value='custom']");
    if (customRadio) customRadio.checked = true;
    updateIconEditorState();
  } catch (error) {
    console.error(error);
    showToast("图片处理失败，请换一张图片");
  }
}

async function saveIconEditor() {
  if (!iconTarget) return;
  const found = findItem(iconTarget.id, iconTarget.parentId);
  if (!found || found.item.type !== "bookmark") return closeIconEditor();
  if (iconModeDraft === "custom" && !iconUploadDraft) return showToast("请先选择一张图片");
  found.item.iconMode = iconModeDraft;
  found.item.customIcon = iconModeDraft === "custom" ? iconUploadDraft : null;
  closeIconEditor();
  await persist();
  renderView(false);
  showToast(iconModeDraft === "custom" ? "已使用自定义图标" : iconModeDraft === "google" ? "已使用 Google 官方图标" : "已恢复 Safari 默认图标");
}

function closeIconEditor() {
  els.iconLayer.hidden = true;
  iconTarget = null;
  iconModeDraft = "safari";
  iconUploadDraft = null;
}

async function saveAddress(event) {
  event.preventDefault();
  if (!addressTarget) return;
  const found = findItem(addressTarget.id, addressTarget.parentId);
  const url = normalizeUrl(els.addressInput.value.trim());
  if (!found || !isValidWebUrl(url)) return showToast("请输入有效的网址");
  found.item.url = url;
  closeAddressPopover();
  await persist();
  renderView(false);
  showToast("地址已更新");
}

function findRenderedCard(id, parentId) {
  return Array.from(els.collectionGrid.querySelectorAll(".favorite")).find(card => card.dataset.id === id && (card.dataset.parent || null) === (parentId || null)) || null;
}

function openBookmarkForm(id = null, parentId = activeGroupId) {
  formMode = "bookmark";
  editingId = id;
  editingParentId = parentId;
  els.formTitle.textContent = id ? "编辑书签" : "添加书签";
  els.bookmarkFields.hidden = false;
  els.groupFields.hidden = true;
  els.itemParent.innerHTML = `<option value="">个人收藏</option>${state.items.filter(item => item.type === "group").map(group => `<option value="${escapeAttr(group.id)}">${escapeHtml(group.title)}</option>`).join("")}`;
  if (id) {
    const found = findItem(id, parentId);
    if (!found) return;
    els.itemTitle.value = found.item.title;
    els.itemUrl.value = found.item.url;
    els.itemParent.value = parentId || "";
  } else {
    els.itemTitle.value = "";
    els.itemUrl.value = "";
    els.itemParent.value = parentId || "";
  }
  showForm(els.itemTitle);
}

function openGroupForm(id = null) {
  formMode = "group";
  editingId = id;
  editingParentId = null;
  els.formTitle.textContent = id ? "重命名分组" : "新建分组";
  els.bookmarkFields.hidden = true;
  els.groupFields.hidden = false;
  els.groupName.value = id ? (findGroup(id)?.title || "") : "";
  showForm(els.groupName);
}

function showForm(focusEl) {
  setEditor(false);
  els.formLayer.hidden = false;
  setTimeout(() => focusEl.focus(), 30);
}
function closeForm() {
  els.formLayer.hidden = true;
  formMode = null;
  editingId = null;
  editingParentId = null;
  els.itemForm.reset();
}

async function saveForm(event) {
  event.preventDefault();
  if (formMode === "group") {
    const title = els.groupName.value.trim();
    if (!title) return els.groupName.focus();
    const wasEditing = Boolean(editingId);
    if (editingId) {
      const group = findGroup(editingId);
      if (group) group.title = title;
    } else state.items.push({ id: uid("group"), type: "group", title, children: [] });
    closeForm();
    await persist();
    renderView(false);
    showToast(wasEditing ? "分组已更新" : "分组已创建");
    return;
  }
  const title = els.itemTitle.value.trim();
  const url = normalizeUrl(els.itemUrl.value.trim());
  const newParentId = els.itemParent.value || null;
  if (!title) return els.itemTitle.focus();
  if (!isValidWebUrl(url)) { showToast("请输入有效的网址"); return els.itemUrl.focus(); }
  const wasEditing = Boolean(editingId);
  if (editingId) {
    const found = findItem(editingId, editingParentId);
    if (!found) return;
    const updated = { ...found.item, title, url };
    found.container.splice(found.index, 1);
    getContainer(newParentId).push(updated);
  } else getContainer(newParentId).push({ id: uid("bookmark"), type: "bookmark", title, url, iconMode: "safari", customIcon: null });
  closeForm();
  await persist();
  if (activeGroupId && newParentId !== activeGroupId) activeGroupId = null;
  renderView(false);
  showToast(wasEditing ? "书签已更新" : "书签已添加");
}

async function sortGroup(group, key) {
  if (group.type !== "group") return;
  group.children.sort((a, b) => String(a[key]).localeCompare(String(b[key]), "zh-CN"));
  await persist();
  if (activeGroupId === group.id) renderView(false);
  showToast(key === "title" ? "已按名称排序" : "已按地址排序");
}

async function deleteTarget(id, parentId, type) {
  const found = findItem(id, parentId);
  if (!found) return;
  const isGroup = type === "group";
  const message = isGroup && found.item.children.length ? `“${found.item.title}”中的 ${found.item.children.length} 个书签会移回个人收藏。` : `将删除“${found.item.title}”。`;
  const ok = await askConfirm(isGroup ? "删除这个分组？" : "删除这个书签？", message);
  if (!ok) return;
  found.container.splice(found.index, 1);
  if (isGroup && found.item.children.length) state.items.push(...found.item.children);
  if (activeGroupId === id) activeGroupId = null;
  await persist();
  renderView(false);
  showToast(isGroup ? "分组已删除" : "书签已删除");
}

function copyTarget(item) {
  const text = item.type === "group" ? item.children.map(child => `${child.title}\t${child.url}`).join("\n") : item.url;
  navigator.clipboard.writeText(text).then(() => showToast(item.type === "group" ? "链接已拷贝" : "链接已拷贝")).catch(() => showToast("无法访问剪贴板"));
}

function navigate(url) { window.location.assign(url); }
function openInNewTab(url) {
  if (globalThis.chrome?.tabs?.create) chrome.tabs.create({ url });
  else window.open(url, "_blank", "noopener");
}
function openMany(urls) {
  if (!urls.length) return showToast("分组为空");
  if (globalThis.chrome?.tabs?.create) urls.forEach(url => chrome.tabs.create({ url, active: false }));
  else urls.forEach(url => window.open(url, "_blank", "noopener"));
}
function openInNewWindow(urls) {
  if (!urls.length) return showToast("分组为空");
  if (globalThis.chrome?.windows?.create) chrome.windows.create({ url: urls });
  else window.open(urls[0], "_blank", "noopener");
}

function handleActionClick(event) {
  const trigger = event.target.closest("[data-action]");
  if (!trigger) return;
  const action = trigger.dataset.action;
  if (action === "add-bookmark") openBookmarkForm(null, activeGroupId);
  if (action === "add-group") openGroupForm();
  if (action === "refresh-icons") refreshIcons();
  if (action === "export") exportData();
  if (action === "reset") resetAll();
}

function handleDocumentPointer(event) {
  if (!els.contextMenu.hidden && !els.contextMenu.contains(event.target)) hideContextMenu();
  if (!els.addressPopover.hidden && !els.addressPopover.contains(event.target) && !event.target.closest(".context-menu")) closeAddressPopover();
  if (els.editorPanel.classList.contains("open") && !els.editorPanel.contains(event.target) && !els.editToggle.contains(event.target) && !event.target.closest(".popover-layer")) setEditor(false);
}

function handleKeydown(event) {
  if (event.key !== "Escape") return;
  if (!els.contextMenu.hidden) return hideContextMenu();
  if (!els.iconLayer.hidden) return closeIconEditor();
  if (!els.addressPopover.hidden) return closeAddressPopover();
  if (!els.confirmOverlay.hidden) return resolveConfirm(false);
  if (!els.formLayer.hidden) return closeForm();
  if (els.editorPanel.classList.contains("open")) return setEditor(false);
}

function bindDragEvents() {
  const grid = els.collectionGrid;
  grid.addEventListener("dragstart", event => {
    const card = event.target.closest(".favorite");
    if (!card || event.target.closest("input")) return event.preventDefault();
    dragInfo = { id: card.dataset.id, parentId: activeGroupId };
    dragPreview?.remove();
    dragPreview = createDragPreview(card);
    document.body.appendChild(dragPreview);
    event.dataTransfer.setDragImage(dragPreview, 50, 42);
    card.classList.add("dragging");
    document.body.classList.add("drag-active");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", card.dataset.id);
  });
  grid.addEventListener("dragover", event => {
    if (!dragInfo) return;
    const card = event.target.closest(".favorite");
    grid.querySelectorAll(".drop-target").forEach(el => el.classList.remove("drop-target"));
    if (!card) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    card.classList.add("drop-target");
  });
  grid.addEventListener("drop", async event => {
    event.preventDefault();
    const target = event.target.closest(".favorite");
    if (!target || !dragInfo || dragInfo.parentId !== activeGroupId) return;
    reorderWithin(activeGroupId, dragInfo.id, target.dataset.id);
    clearDragAppearance(grid);
    await persist();
    renderView(false);
  });
  grid.addEventListener("dragend", () => {
    clearDragAppearance(grid);
  });
}

function createDragPreview(card) {
  const canvas = document.createElement("canvas");
  const tileSize = 72;
  const width = 100;
  const height = 112;
  const scale = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
  canvas.className = "drag-preview";
  canvas.width = width * scale;
  canvas.height = height * scale;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const context = canvas.getContext("2d");
  context.scale(scale, scale);

  const tileX = 14;
  const tileY = 4;
  context.save();
  context.shadowColor = "rgba(0,0,0,.34)";
  context.shadowBlur = 15;
  context.shadowOffsetY = 8;
  roundedCanvasPath(context, tileX, tileY, tileSize, tileSize, 16);
  const gradient = context.createLinearGradient(tileX, tileY, tileX + tileSize, tileY + tileSize);
  gradient.addColorStop(0, "#979aa2");
  gradient.addColorStop(1, "#686d77");
  context.fillStyle = gradient;
  context.fill();
  context.restore();

  context.save();
  roundedCanvasPath(context, tileX, tileY, tileSize, tileSize, 16);
  context.clip();
  const folder = card.querySelector(".folder-tile");
  if (folder) drawFolderPreview(context, card, tileX, tileY, tileSize);
  else drawSitePreview(context, card, tileX, tileY, tileSize);
  context.restore();

  const label = card.querySelector(".favorite-name")?.textContent?.trim() || "";
  context.save();
  context.font = '500 12.5px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "rgba(255,255,255,.98)";
  context.shadowColor = "rgba(0,0,0,.9)";
  context.shadowBlur = 4;
  context.shadowOffsetY = 1;
  context.fillText(shortenCanvasText(context, label, 94), width / 2, 98);
  context.restore();
  return canvas;
}

function drawSitePreview(context, card, x, y, size) {
  const image = card.querySelector(".site-image.ready");
  if (image?.complete && image.naturalWidth) {
    try {
      if (image.classList.contains("contained")) {
        const imageSize = 48;
        context.drawImage(image, x + (size - imageSize) / 2, y + (size - imageSize) / 2, imageSize, imageSize);
      } else drawImageCover(context, image, x, y, size, size);
      return;
    } catch { /* Fall through to the first-letter icon. */ }
  }
  const glyph = card.querySelector(".monogram")?.textContent?.trim() || "•";
  context.fillStyle = "rgba(255,255,255,.97)";
  context.font = '400 40px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(glyph, x + size / 2, y + size / 2 + 1);
}

function drawFolderPreview(context, card, x, y, size) {
  const padding = 8;
  const gap = 3;
  const cell = (size - padding * 2 - gap * 2) / 3;
  const icons = Array.from(card.querySelectorAll(".mini-icon")).slice(0, 9);
  icons.forEach((icon, index) => {
    const column = index % 3;
    const row = Math.floor(index / 3);
    const cellX = x + padding + column * (cell + gap);
    const cellY = y + padding + row * (cell + gap);
    context.save();
    roundedCanvasPath(context, cellX, cellY, cell, cell, 4);
    context.clip();
    context.fillStyle = "#7b808a";
    context.fillRect(cellX, cellY, cell, cell);
    const image = icon.querySelector("img.ready");
    if (image?.complete && image.naturalWidth) {
      try {
        if (image.classList.contains("contained")) {
          const containedSize = cell * .72;
          context.drawImage(image, cellX + (cell - containedSize) / 2, cellY + (cell - containedSize) / 2, containedSize, containedSize);
        } else drawImageCover(context, image, cellX, cellY, cell, cell);
      } catch { drawMiniLetter(context, icon, cellX, cellY, cell); }
    } else drawMiniLetter(context, icon, cellX, cellY, cell);
    context.restore();
  });
}

function drawMiniLetter(context, icon, x, y, size) {
  context.fillStyle = "rgba(255,255,255,.97)";
  context.font = '600 8px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(icon.querySelector(".mini-letter")?.textContent?.trim() || "•", x + size / 2, y + size / 2);
}

function drawImageCover(context, image, x, y, width, height) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (image.naturalWidth - sourceWidth) / 2;
  const sourceY = (image.naturalHeight - sourceHeight) / 2;
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}

function roundedCanvasPath(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function shortenCanvasText(context, value, maxWidth) {
  if (context.measureText(value).width <= maxWidth) return value;
  const glyphs = Array.from(value);
  while (glyphs.length && context.measureText(`${glyphs.join("")}…`).width > maxWidth) glyphs.pop();
  return `${glyphs.join("")}…`;
}

function clearDragAppearance(grid = els.collectionGrid) {
  grid.querySelectorAll(".dragging,.drop-target").forEach(el => el.classList.remove("dragging", "drop-target"));
  dragPreview?.remove();
  dragPreview = null;
  dragInfo = null;
  document.body.classList.remove("drag-active");
}

function reorderWithin(parentId, sourceId, targetId) {
  if (sourceId === targetId) return;
  const container = getContainer(parentId);
  const sourceIndex = container.findIndex(item => item.id === sourceId);
  const targetIndex = container.findIndex(item => item.id === targetId);
  if (sourceIndex < 0 || targetIndex < 0) return;
  const [item] = container.splice(sourceIndex, 1);
  container.splice(targetIndex, 0, item);
}

async function handleBackgroundUpload(event) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file || !file.type.startsWith("image/")) return;
  try {
    showToast("正在处理背景…");
    state.background.data = await compressImage(file);
    state.background.dim = 6;
    await persist();
    applyAppearance();
    showToast("背景已更新");
  } catch (error) {
    console.error(error);
    showToast("图片处理失败，请换一张图片");
  }
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, 2560 / img.width, 1600 / img.height);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const context = canvas.getContext("2d", { alpha: false });
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
          if (!blob) return reject(new Error("Image encoding failed"));
          const out = new FileReader();
          out.onerror = reject;
          out.onload = () => resolve(out.result);
          out.readAsDataURL(blob);
        }, "image/webp", .88);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function compressIcon(file) {
  if (file.type === "image/svg+xml" || /\.svg$/i.test(file.name)) return prepareSvgIcon(file);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const size = 512;
        const width = img.naturalWidth || img.width || 1;
        const height = img.naturalHeight || img.height || 1;
        const scale = Math.min(1, size / width, size / height);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(width * scale));
        canvas.height = Math.max(1, Math.round(height * scale));
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        const filledCanvas = scaleCanvasToFit(trimTransparentCanvas(canvas), size);
        const outputType = file.type === "image/png" || /\.png$/i.test(file.name) ? "image/png" : "image/webp";
        filledCanvas.toBlob(blob => {
          if (!blob) return reject(new Error("Icon encoding failed"));
          const out = new FileReader();
          out.onerror = reject;
          out.onload = () => resolve(out.result);
          out.readAsDataURL(blob);
        }, outputType, .92);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function prepareSvgIcon(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = async () => {
      try {
        resolve(await prepareSvgText(String(reader.result || "")));
      } catch (error) { reject(error); }
    };
    reader.readAsText(file);
  });
}

async function prepareSvgText(text) {
  const documentNode = new DOMParser().parseFromString(text, "image/svg+xml");
  const root = documentNode.documentElement;
  if (root?.localName !== "svg" || documentNode.querySelector("parsererror")) throw new Error("Invalid SVG");
  root.querySelectorAll("script, foreignObject, iframe, object, embed").forEach(node => node.remove());
  [root, ...root.querySelectorAll("*")].forEach(node => Array.from(node.attributes).forEach(attribute => {
    const name = attribute.name.toLowerCase();
    const value = attribute.value.trim();
    if (name.startsWith("on") || ((name === "href" || name.endsWith(":href")) && /^(?:javascript:|https?:|\/\/)/i.test(value))) node.removeAttribute(attribute.name);
  }));
  const measured = document.importNode(root, true);
  measured.style.position = "fixed";
  measured.style.left = "-10000px";
  measured.style.top = "-10000px";
  measured.style.visibility = "hidden";
  measured.style.pointerEvents = "none";
  document.body.appendChild(measured);
  try {
    const bounds = measured.getBBox();
    if (bounds.width > 0 && bounds.height > 0) {
      const padding = Math.max(bounds.width, bounds.height) * .0025;
      const x = bounds.x - padding;
      const y = bounds.y - padding;
      const width = bounds.width + padding * 2;
      const height = bounds.height + padding * 2;
      root.setAttribute("viewBox", `${x} ${y} ${width} ${height}`);
      root.setAttribute("width", String(width));
      root.setAttribute("height", String(height));
    }
  } finally { measured.remove(); }
  return blobToDataUrl(new Blob([new XMLSerializer().serializeToString(root)], { type: "image/svg+xml" }));
}

function trimTransparentCanvas(canvas) {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const { width, height } = canvas;
  const pixels = context.getImageData(0, 0, width, height).data;
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (pixels[(y * width + x) * 4 + 3] <= 4) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }
  if (right < left || bottom < top || (left === 0 && top === 0 && right === width - 1 && bottom === height - 1)) return canvas;
  const cropped = document.createElement("canvas");
  cropped.width = right - left + 1;
  cropped.height = bottom - top + 1;
  cropped.getContext("2d").drawImage(canvas, left, top, cropped.width, cropped.height, 0, 0, cropped.width, cropped.height);
  return cropped;
}

function scaleCanvasToFit(canvas, size) {
  const scale = size / Math.max(canvas.width, canvas.height);
  if (!Number.isFinite(scale) || Math.abs(scale - 1) < .01) return canvas;
  const output = document.createElement("canvas");
  output.width = Math.max(1, Math.round(canvas.width * scale));
  output.height = Math.max(1, Math.round(canvas.height * scale));
  const context = output.getContext("2d");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(canvas, 0, 0, output.width, output.height);
  return output;
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

function normalizeRasterIconData(dataUrl, outputType) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = reject;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, img.naturalWidth || 1);
      canvas.height = Math.max(1, img.naturalHeight || 1);
      canvas.getContext("2d").drawImage(img, 0, 0);
      const output = scaleCanvasToFit(trimTransparentCanvas(canvas), 512);
      output.toBlob(blob => blob ? blobToDataUrl(blob).then(resolve, reject) : reject(new Error("Icon encoding failed")), outputType, .92);
    };
    img.src = dataUrl;
  });
}

async function normalizeStoredCustomIcons() {
  let changed = false;
  const visit = async items => {
    for (const item of items) {
      if (item.type === "group") { await visit(item.children || []); continue; }
      if (item.type !== "bookmark" || item.iconMode !== "custom" || !isImageData(item.customIcon)) continue;
      try {
        const original = item.customIcon;
        if (/^data:image\/svg\+xml;base64,/i.test(original)) {
          const bytes = Uint8Array.from(atob(original.split(",", 2)[1]), character => character.charCodeAt(0));
          item.customIcon = await prepareSvgText(new TextDecoder().decode(bytes));
        } else {
          const mime = original.match(/^data:(image\/[a-z0-9+.-]+);base64,/i)?.[1] || "image/png";
          item.customIcon = await normalizeRasterIconData(original, mime === "image/png" ? "image/png" : "image/webp");
        }
        changed ||= item.customIcon !== original;
      } catch (error) { console.warn("Unable to crop a custom icon", error); }
    }
  };
  await visit(state.items || []);
  return changed;
}

async function resetBackground() {
  state.background = clone(DEFAULT_STATE.background);
  await persist();
  applyAppearance();
  showToast("已恢复默认背景");
}

function applyAppearance() {
  const background = state.background || DEFAULT_STATE.background;
  document.documentElement.style.setProperty("--dim", String((background.dim ?? 8) / 100));
  document.documentElement.style.setProperty("--wallpaper-blur", `${background.blur ?? 0}px`);
  const imageValue = background.data ? `url("${background.data}")` : "";
  els.wallpaper.style.backgroundImage = imageValue;
  els.backgroundPreview.style.backgroundImage = background.data ? imageValue : "";
}

async function refreshIcons() {
  iconCache = {};
  iconRequests.clear();
  await storageSet("safariIconCache", iconCache);
  renderView(false);
  showToast("已清除网站图标缓存并重新获取，自定义图标已保留");
}

function exportData() {
  const html = buildBookmarkHtml(state.items);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  const now = new Date();
  const localDate = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
  link.download = `暮光书签_${localDate}.html`;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("已导出 Safari / Chrome 通用书签 HTML");
}

async function importData(event) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;
  try {
    if (!/\.html?$/i.test(file.name)) throw new Error("请选择 HTML 文件");
    const items = parseBookmarkHtml(await file.text());
    if (!items.length) throw new Error("没有找到可导入的书签");
    const result = mergeImportedItems(state.items, items);
    state = { ...state, version: 4, items: result.items };
    migrateAndCleanState();
    activeGroupId = null;
    await persist();
    renderView(false);
    showToast(result.added ? `已新增 ${result.added} 个书签，跳过 ${result.skipped} 个重复项` : `没有新增书签，已跳过 ${result.skipped} 个重复项`);
  } catch (error) {
    console.error(error);
    showToast(`无法导入：${error.message || "文件格式不正确"}`);
  }
}

function buildBookmarkHtml(items) {
  const lines = [
    "<!DOCTYPE NETSCAPE-Bookmark-file-1>",
    "<!-- Safari and Chrome compatible bookmark file generated by 暮光起始页. -->",
    '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">',
    "<TITLE>书签</TITLE>",
    "<H1>书签</H1>",
    "<DL><p>",
    `    <DT><H3 PERSONAL_TOOLBAR_FOLDER="true">个人收藏</H3>`,
    "    <DL><p>"
  ];
  appendBookmarkHtml(lines, items, 2);
  lines.push("    </DL><p>", "</DL><p>", "");
  return lines.join("\n");
}

function appendBookmarkHtml(lines, items, depth) {
  const indent = "    ".repeat(depth);
  items.forEach(item => {
    if (item.type === "group") {
      lines.push(`${indent}<DT><H3>${escapeHtml(item.title)}</H3>`, `${indent}<DL><p>`);
      appendBookmarkHtml(lines, item.children || [], depth + 1);
      lines.push(`${indent}</DL><p>`);
    } else if (item.type === "bookmark" && isValidWebUrl(item.url)) {
      lines.push(`${indent}<DT><A HREF="${escapeAttr(item.url)}">${escapeHtml(item.title)}</A>`);
    }
  });
}

function parseBookmarkHtml(html) {
  if (!/NETSCAPE-Bookmark-file-1/i.test(html) && !/<A\s[^>]*HREF=/i.test(html)) throw new Error("不是 Safari 或 Chrome 书签 HTML");
  const documentNode = new DOMParser().parseFromString(html, "text/html");
  const rootList = documentNode.querySelector("dl");
  if (!rootList) throw new Error("书签 HTML 缺少书签列表");
  const parsed = parseBookmarkList(rootList);
  const toolbarIndex = parsed.findIndex(item => item.type === "group" && (item.personalToolbar || /^(个人收藏|收藏|书签栏|收藏夹栏|favorites|favorites bar|bookmarks bar)$/i.test(item.title)));
  let selected = parsed;
  if (toolbarIndex >= 0) {
    const toolbar = parsed[toolbarIndex];
    selected = [...toolbar.children, ...parsed.filter((_, index) => index !== toolbarIndex && !(_.type === "group" && !countBookmarks([_])))];
  }
  return normalizeImportedItems(selected);
}

function parseBookmarkList(list) {
  const items = [];
  for (const node of list.children) {
    if (node.tagName !== "DT") continue;
    const heading = directChild(node, "H3");
    const anchor = directChild(node, "A");
    if (heading) {
      const childList = directChild(node, "DL") || nextList(node);
      items.push({
        id: uid("group"),
        type: "group",
        title: heading.textContent.trim() || "未命名分组",
        personalToolbar: heading.getAttribute("PERSONAL_TOOLBAR_FOLDER") === "true",
        children: childList ? parseBookmarkList(childList) : []
      });
    } else if (anchor) {
      const url = anchor.getAttribute("href") || "";
      if (isValidWebUrl(url)) items.push({ id: uid("bookmark"), type: "bookmark", title: anchor.textContent.trim() || new URL(url).hostname, url, iconMode: "safari", customIcon: null });
    }
  }
  return items;
}

function directChild(node, tagName) {
  return Array.from(node.children).find(child => child.tagName === tagName) || null;
}

function nextList(node) {
  let sibling = node.nextElementSibling;
  while (sibling && sibling.tagName === "P") sibling = sibling.nextElementSibling;
  return sibling?.tagName === "DL" ? sibling : null;
}

function normalizeImportedItems(items) {
  return items.flatMap(item => {
    if (item.type === "bookmark") return [{ ...item, iconMode: "safari", customIcon: null }];
    const children = flattenImportedBookmarks(item.children || []);
    return [{ id: item.id || uid("group"), type: "group", title: item.title || "未命名分组", children }];
  });
}

function flattenImportedBookmarks(items) {
  return items.flatMap(item => item.type === "bookmark" ? [{ ...item, iconMode: "safari", customIcon: null }] : flattenImportedBookmarks(item.children || []));
}

function countBookmarks(items) {
  return items.reduce((total, item) => total + (item.type === "group" ? countBookmarks(item.children || []) : item.type === "bookmark" ? 1 : 0), 0);
}

function mergeImportedItems(existingItems, importedItems) {
  const merged = clone(existingItems || []);
  const knownUrls = new Set();
  const collectUrls = items => items.forEach(item => {
    if (item.type === "group") collectUrls(item.children || []);
    else if (item.type === "bookmark") knownUrls.add(canonicalBookmarkUrl(item.url));
  });
  collectUrls(merged);
  const groups = new Map(merged.filter(item => item.type === "group").map(group => [group.title.trim().toLocaleLowerCase(), group]));
  let added = 0;
  let skipped = 0;
  const takeBookmark = bookmark => {
    const key = canonicalBookmarkUrl(bookmark.url);
    if (!key || knownUrls.has(key)) { skipped += 1; return null; }
    knownUrls.add(key);
    added += 1;
    return { ...bookmark, id: uid("bookmark"), iconMode: "safari", customIcon: null };
  };
  importedItems.forEach(item => {
    if (item.type === "bookmark") {
      const bookmark = takeBookmark(item);
      if (bookmark) merged.push(bookmark);
      return;
    }
    if (item.type !== "group") return;
    const key = item.title.trim().toLocaleLowerCase();
    let target = groups.get(key);
    const children = (item.children || []).map(takeBookmark).filter(Boolean);
    if (target) target.children.push(...children);
    else if (children.length) {
      target = { id: uid("group"), type: "group", title: item.title, children };
      merged.push(target);
      groups.set(key, target);
    }
  });
  return { items: merged, added, skipped };
}

function canonicalBookmarkUrl(value) {
  try {
    const url = new URL(value);
    url.hostname = url.hostname.toLowerCase();
    if (url.pathname === "/" && !url.search && !url.hash) return `${url.protocol}//${url.host}/`;
    return url.href;
  } catch { return ""; }
}

async function resetAll() {
  const ok = await askConfirm("清空全部书签并恢复初始设置？", "所有书签和分组都会被永久清空，自定义背景将恢复默认。建议先导出备份。");
  if (!ok) return;
  state = { ...clone(DEFAULT_STATE), items: [] };
  iconCache = {};
  iconRequests.clear();
  activeGroupId = null;
  await Promise.all([persist(), storageSet("safariIconCache", iconCache)]);
  applyAppearance();
  renderView(false);
  showToast("已清空全部书签并恢复初始设置");
}

function askConfirm(title, message) {
  els.confirmTitle.textContent = title;
  els.confirmMessage.textContent = message;
  els.confirmOverlay.hidden = false;
  setTimeout(() => els.confirmCancel.focus(), 25);
  return new Promise(resolve => { confirmResolver = resolve; });
}
function resolveConfirm(value) {
  els.confirmOverlay.hidden = true;
  if (confirmResolver) confirmResolver(value);
  confirmResolver = null;
}

function findGroup(id) { return state.items.find(item => item.type === "group" && item.id === id); }
function getContainer(parentId) { return parentId ? (findGroup(parentId)?.children || state.items) : state.items; }
function findItem(id, parentId) {
  const container = getContainer(parentId);
  const index = container.findIndex(item => item.id === id);
  return index < 0 ? null : { item: container[index], container, index };
}

function migrateAndCleanState() {
  const previousVersion = Number(state.version || 1);
  const seen = new Set();
  const safeId = (candidate, prefix) => {
    const value = String(candidate || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80);
    const id = value && !seen.has(value) ? value : uid(prefix);
    seen.add(id);
    return id;
  };
  const cleanBookmark = item => {
    const url = normalizeUrl(String(item?.url || "").trim());
    if (!isValidWebUrl(url)) return null;
    const fallbackTitle = new URL(url).hostname.replace(/^www\./, "");
    const customIcon = isImageData(item.customIcon) ? String(item.customIcon) : null;
    const iconMode = item.iconMode === "custom" && customIcon ? "custom" : item.iconMode === "google" ? "google" : "safari";
    return { id: safeId(item.id, "bookmark"), type: "bookmark", title: String(item.title || fallbackTitle).trim().slice(0, 200) || fallbackTitle, url, iconMode, customIcon };
  };
  state.background = { ...DEFAULT_STATE.background, ...(state.background || {}) };
  if (previousVersion < 2 && !state.background.data && Number(state.background.dim) === 22) state.background.dim = 8;
  if (state.background.data && !String(state.background.data).startsWith("data:image/")) state.background.data = null;
  state.background.dim = Math.max(0, Math.min(55, Number(state.background.dim) || 0));
  state.background.blur = Math.max(0, Math.min(12, Number(state.background.blur) || 0));
  state.items = (state.items || []).flatMap(item => {
    if (!item) return [];
    if (item.type === "group") {
      const id = safeId(item.id, "group");
      const children = (Array.isArray(item.children) ? item.children : []).map(cleanBookmark).filter(Boolean);
      return [{ id, type: "group", title: String(item.title || "未命名分组").trim().slice(0, 80) || "未命名分组", children }];
    }
    const bookmark = cleanBookmark(item);
    return bookmark ? [bookmark] : [];
  });
  state.version = 4;
}

async function persist() {
  try { await storageSet("startPageState", state); }
  catch (error) { console.error(error); showToast("保存失败，请检查插件存储权限"); }
}

function storageGet(key) {
  if (globalThis.chrome?.storage?.local) return new Promise(resolve => chrome.storage.local.get(key, result => resolve(result?.[key])));
  try { return Promise.resolve(JSON.parse(localStorage.getItem(key) || "null")); } catch { return Promise.resolve(null); }
}
function storageSet(key, value) {
  if (globalThis.chrome?.storage?.local) return new Promise((resolve, reject) => chrome.storage.local.set({ [key]: value }, () => chrome.runtime.lastError ? reject(chrome.runtime.lastError) : resolve()));
  localStorage.setItem(key, JSON.stringify(value));
  return Promise.resolve();
}

function injectIcons(root) {
  root.querySelectorAll("[data-icon]").forEach(element => { if (!element.querySelector("svg")) element.innerHTML = ICONS[element.dataset.icon] || ""; });
}
function showToast(message) {
  clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("show");
  toastTimer = setTimeout(() => els.toast.classList.remove("show"), 2000);
}
function normalizeUrl(value) { return /^[a-z][a-z\d+.-]*:\/\//i.test(value) ? value : `https://${value}`; }
function isValidWebUrl(value) { try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; } }
function isWebUrl(value) { try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; } }
function isImageData(value) { return typeof value === "string" && /^data:image\/(?:svg\+xml|png|jpe?g|webp|avif);base64,/i.test(value); }
function safeOrigin(value) { try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) ? url.origin : null; } catch { return null; } }
function safeResolvedUrl(value, base) { try { const url = new URL(value, base); return ["http:", "https:"].includes(url.protocol) ? url.href : null; } catch { return null; } }
function firstGlyph(value) { return Array.from(String(value).trim())[0]?.toUpperCase() || "•"; }
function uid(prefix) { return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`; }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function toCamel(value) { return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()); }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" })[char]); }
function escapeAttr(value) { return escapeHtml(value); }
function colorsFor(value) {
  let hash = 0;
  for (const char of String(value)) hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
  const hue = Math.abs(hash) % 360;
  return [`hsl(${hue} 46% 61%)`, `hsl(${(hue + 22) % 360} 42% 43%)`];
}
