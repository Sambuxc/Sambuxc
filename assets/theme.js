// theme: system default + localStorage override
const THEME_KEY = "sb-theme";

function getSystemTheme() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";
}

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const icon = document.querySelector("#themeToggle .icon");
    if (icon) icon.textContent = theme === "light" ? "☀" : "☾";
}

const saved = localStorage.getItem(THEME_KEY);
const initial = saved || getSystemTheme();
applyTheme(initial);

document.getElementById("themeToggle")?.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || getSystemTheme();
    const next = current === "light" ? "dark" : "light";
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
});

// Optional: if user never chose a theme, follow system changes live
window.matchMedia?.("(prefers-color-scheme: light)")?.addEventListener?.("change", () => {
    const savedNow = localStorage.getItem(THEME_KEY);
    if (!savedNow) applyTheme(getSystemTheme());
});

// small niceties: year + gentle reveal on scroll
// document.getElementById("year").textContent = new Date().getFullYear();

const els = Array.from(document.querySelectorAll(".reveal"));
const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
        if (e.isIntersecting) e.target.classList.add("on");
    }
}, {threshold: 0.12});

els.forEach(el => io.observe(el));