"use strict";

let DATA = null;
let lang = localStorage.getItem("ptnc_lang") || "tr";
let activeTag = "ALL";

const root = document.documentElement;
const savedTheme = localStorage.getItem("ptnc_theme");
if (savedTheme) root.setAttribute("data-theme", savedTheme);
else if (window.matchMedia("(prefers-color-scheme: dark)").matches) root.setAttribute("data-theme", "dark");

document.getElementById("themeToggle").addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  localStorage.setItem("ptnc_theme", next);
});

function render() {
  if (!DATA) return;
  const L = DATA.locales[lang] || DATA.locales.tr;
  document.documentElement.lang = lang;
  document.title = L.pageTitle;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (L.ui[key]) el.textContent = L.ui[key];
  });

  document.querySelectorAll(".lang-switch button").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.lang === lang));
  });

  document.getElementById("heroKicker").textContent = L.hero.kicker;
  document.getElementById("heroTitle").textContent = L.hero.headline;
  document.getElementById("heroBio").textContent = L.hero.bio;
  document.getElementById("heroMeta").innerHTML = L.hero.meta.map((m) => `<span>${m}</span>`).join("");

  const allTags = ["ALL", ...new Set(DATA.projects.flatMap((p) => p.tags))];
  const filtersEl = document.getElementById("projectFilters");
  filtersEl.innerHTML = allTags.map((t) => {
    const label = t === "ALL" ? L.ui.filter_all : t;
    return `<button type="button" class="filter-btn" data-tag="${t}" aria-pressed="${t === activeTag}">${label}</button>`;
  }).join("");

  const filtered = activeTag === "ALL" ? DATA.projects : DATA.projects.filter((p) => p.tags.includes(activeTag));
  document.getElementById("projectList").innerHTML = filtered.map((p) => `
    <article class="project-item">
      <div>
        <h3 class="project-title">${p.title[lang] || p.title.tr}</h3>
        <p class="project-desc">${p.desc[lang] || p.desc.tr}</p>
        <div class="tag-list">${p.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>
      </div>
      <div class="project-links">
        ${p.repo ? `<a href="${p.repo}" target="_blank" rel="noopener">${L.ui.link_code}</a>` : ""}
        ${p.live ? `<a href="${p.live}" target="_blank" rel="noopener">${L.ui.link_live}</a>` : ""}
      </div>
    </article>
  `).join("");

  document.getElementById("skillsGrid").innerHTML = L.skills.map((g) => `
    <div class="skill-group">
      <h3>${g.category}</h3>
      <div class="tag-list">${g.items.map((i) => `<span class="tag">${i}</span>`).join("")}</div>
    </div>
  `).join("");

  document.getElementById("contactNote").textContent = L.contact.note;
  document.getElementById("socialLinks").innerHTML = DATA.socials.map((s) => `
    <a class="social-link" href="${s.url}" target="_blank" rel="noopener">${s.label}</a>
  `).join("");

  document.getElementById("footerCopy").textContent = L.footer.copy;
  document.getElementById("footerLoc").textContent = L.footer.location;
}

document.querySelector(".lang-switch").addEventListener("click", (ev) => {
  const btn = ev.target.closest("button[data-lang]");
  if (!btn) return;
  lang = btn.dataset.lang;
  activeTag = "ALL";
  localStorage.setItem("ptnc_lang", lang);
  render();
});

document.getElementById("projectFilters").addEventListener("click", (ev) => {
  const btn = ev.target.closest("button[data-tag]");
  if (!btn) return;
  activeTag = btn.dataset.tag;
  render();
});

fetch("data/content.json")
  .then((r) => r.json())
  .then((json) => { DATA = json; render(); });
