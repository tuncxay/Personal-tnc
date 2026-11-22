"use strict";
const STORAGE_KEY = "ptnc_custom_state_v2";
let BASE_DATA = null, DATA = null, lang = localStorage.getItem("ptnc_lang") || "tr", activeTag = "ALL";
let UI_PREFS = { palette: "light", font: "editorial", layout: "list", btn: "pill", mediaUrl: "" };
const root = document.documentElement, $ = (id) => document.getElementById(id);

function applyPrefs() {
  root.setAttribute("data-palette", UI_PREFS.palette);
  root.setAttribute("data-font", UI_PREFS.font);
  root.setAttribute("data-btn", UI_PREFS.btn);
  document.querySelectorAll("#paletteChoices button").forEach(b => b.classList.toggle("active", b.dataset.palette === UI_PREFS.palette));
  document.querySelectorAll("#fontChoices button").forEach(b => b.classList.toggle("active", b.dataset.font === UI_PREFS.font));
  document.querySelectorAll("#layoutChoices button").forEach(b => b.classList.toggle("active", b.dataset.layout === UI_PREFS.layout));
  document.querySelectorAll("#btnChoices button").forEach(b => b.classList.toggle("active", b.dataset.btn === UI_PREFS.btn));
  $("heroMediaWrap").hidden = !UI_PREFS.mediaUrl;
  if (UI_PREFS.mediaUrl) $("heroMediaImg").src = UI_PREFS.mediaUrl;
}

function render() {
  if (!DATA) return;
  applyPrefs();
  const L = DATA.locales[lang] || DATA.locales.tr;
  root.lang = lang; document.title = L.pageTitle; $("brandName").textContent = DATA.brand || "tuncxay";
  document.querySelectorAll("[data-i18n]").forEach(el => { if (L.ui[el.dataset.i18n]) el.textContent = L.ui[el.dataset.i18n]; });
  document.querySelectorAll(".lang-switch button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  $("heroKicker").textContent = L.hero.kicker; $("heroTitle").textContent = L.hero.headline;
  $("heroBio").textContent = L.hero.bio; $("heroMeta").innerHTML = L.hero.meta.map(m => `<span>${m}</span>`).join("");

  const allTags = ["ALL", ...new Set(DATA.projects.flatMap(p => p.tags))];
  $("projectFilters").innerHTML = allTags.map(t => `<button type="button" class="filter-btn" data-tag="${t}" aria-pressed="${t === activeTag}">${t === "ALL" ? L.ui.filter_all : t}</button>`).join("");

  const listEl = $("projectList");
  listEl.classList.toggle("grid-mode", UI_PREFS.layout === "grid");
  const filtered = activeTag === "ALL" ? DATA.projects : DATA.projects.filter(p => p.tags.includes(activeTag));
  listEl.innerHTML = filtered.map(p => {
    const feats = (p.features && p.features[lang]) || [];
    return `<article class="project-item"><div>
      <h3 class="project-title">${p.title[lang] || p.title.tr}</h3>
      <p class="project-desc">${p.desc[lang] || p.desc.tr}</p>
      ${feats.length ? `<details class="feature-details" open><summary>${L.ui.features_label}</summary><ul>${feats.map(f => `<li>${f}</li>`).join("")}</ul></details>` : ""}
      <div class="tag-list">${p.tags.map(t => `<span class="tag">${t}</span>`).join("")}</div>
    </div><div class="project-links">
      ${p.repo ? `<a href="${p.repo}" target="_blank" rel="noopener">${L.ui.link_code}</a>` : ""}
      ${p.live ? `<a href="${p.live}" target="_blank" rel="noopener">${L.ui.link_live}</a>` : ""}
    </div></article>`;
  }).join("");

  $("skillsGrid").innerHTML = L.skills.map(g => `<div class="skill-group"><h3>${g.category}</h3><div class="tag-list">${g.items.map(i => `<span class="tag">${i}</span>`).join("")}</div></div>`).join("");
  $("contactNote").textContent = L.contact.note;
  $("businessInfo").innerHTML = `<div><strong>${L.footer.location}</strong></div><div>${DATA.email || ""}</div>`;
  $("socialLinks").innerHTML = DATA.socials.filter(s => s.url).map(s => `<a class="social-link" href="${s.url}" target="_blank" rel="noopener">${s.label}</a>`).join("");
  $("footerCopy").textContent = L.footer.copy; $("footerLoc").textContent = L.footer.location;

  $("edBrand").value = DATA.brand || ""; $("edTitle").value = L.hero.headline || "";
  $("edBio").value = L.hero.bio || ""; $("edLocation").value = L.footer.location || "";
  $("edEmail").value = DATA.email || ""; $("edMediaUrl").value = UI_PREFS.mediaUrl || "";
  $("edGithub").value = (DATA.socials.find(s => s.label === "GitHub") || {}).url || "";
  $("edLinkedin").value = (DATA.socials.find(s => s.label === "LinkedIn") || {}).url || "";
  $("edWebsite").value = (DATA.socials.find(s => s.label === "Web") || {}).url || "";
}

const saveState = () => localStorage.setItem(STORAGE_KEY, JSON.stringify({ prefs: UI_PREFS, data: DATA }));
document.querySelector(".lang-switch").addEventListener("click", e => { const b = e.target.closest("button[data-lang]"); if (b) { lang = b.dataset.lang; activeTag = "ALL"; localStorage.setItem("ptnc_lang", lang); render(); } });
$("projectFilters").addEventListener("click", e => { const b = e.target.closest("button[data-tag]"); if (b) { activeTag = b.dataset.tag; render(); } });
$("openStudio").addEventListener("click", () => $("studioDrawer").setAttribute("aria-hidden", "false"));
$("closeStudio").addEventListener("click", () => $("studioDrawer").setAttribute("aria-hidden", "true"));
$("paletteChoices").addEventListener("click", e => { if (e.target.dataset.palette) { UI_PREFS.palette = e.target.dataset.palette; saveState(); applyPrefs(); } });
$("fontChoices").addEventListener("click", e => { if (e.target.dataset.font) { UI_PREFS.font = e.target.dataset.font; saveState(); applyPrefs(); } });
$("layoutChoices").addEventListener("click", e => { if (e.target.dataset.layout) { UI_PREFS.layout = e.target.dataset.layout; saveState(); render(); } });
$("btnChoices").addEventListener("click", e => { if (e.target.dataset.btn) { UI_PREFS.btn = e.target.dataset.btn; saveState(); applyPrefs(); } });
$("edMediaFile").addEventListener("change", e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { UI_PREFS.mediaUrl = r.result; saveState(); applyPrefs(); }; r.readAsDataURL(f); });

$("saveStudio").addEventListener("click", () => {
  const L = DATA.locales[lang];
  DATA.brand = $("edBrand").value.trim() || DATA.brand;
  L.hero.headline = $("edTitle").value.trim() || L.hero.headline;
  L.hero.bio = $("edBio").value.trim() || L.hero.bio;
  L.footer.location = $("edLocation").value.trim() || L.footer.location;
  DATA.email = $("edEmail").value.trim();
  if ($("edMediaUrl").value.trim()) UI_PREFS.mediaUrl = $("edMediaUrl").value.trim();
  DATA.socials = [
    { label: "GitHub", url: $("edGithub").value.trim() },
    { label: "LinkedIn", url: $("edLinkedin").value.trim() },
    { label: "Web", url: $("edWebsite").value.trim() },
    { label: "E-posta", url: DATA.email ? `mailto:${DATA.email}` : "" }
  ];
  saveState(); render();
});

$("exportJson").addEventListener("click", () => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(DATA, null, 2)], { type: "application/json" }));
  a.download = "content.json"; a.click();
});
$("resetStudio").addEventListener("click", () => { localStorage.removeItem(STORAGE_KEY); DATA = JSON.parse(JSON.stringify(BASE_DATA)); UI_PREFS = { palette: "light", font: "editorial", layout: "list", btn: "pill", mediaUrl: "" }; render(); });
$("contactForm").addEventListener("submit", e => { e.preventDefault(); window.location.href = `mailto:${DATA.email || "contact@example.com"}?subject=${encodeURIComponent($("cfName").value)}&body=${encodeURIComponent($("cfMsg").value + "\n\n" + $("cfEmail").value)}`; });

fetch("data/content.json").then(r => r.json()).then(j => {
  BASE_DATA = j;
  const s = localStorage.getItem(STORAGE_KEY);
  if (s) { const p = JSON.parse(s); Object.assign(UI_PREFS, p.prefs || {}); DATA = p.data || JSON.parse(JSON.stringify(BASE_DATA)); }
  else DATA = JSON.parse(JSON.stringify(BASE_DATA));
  render();
});
