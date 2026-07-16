// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Mobile nav toggle
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// Dark mode toggle (persisted)
const themeToggle = document.getElementById("themeToggle");
const root = document.documentElement;
const stored = localStorage.getItem("theme");

function applyTheme(theme) {
  if (theme === "dark" || theme === "light") {
    root.setAttribute("data-theme", theme);
  } else {
    root.removeAttribute("data-theme");
  }
  themeToggle.textContent = (theme === "dark") ? "☀️" : "🌙";
}

applyTheme(stored);

themeToggle.addEventListener("click", () => {
  const current = root.getAttribute("data-theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const next = current === "dark" ? "light" : "dark";
  localStorage.setItem("theme", next);
  applyTheme(next);
});

// GitHub-powered projects grid
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderProjectCard(repo) {
  const name = escapeHtml(repo.name.replace(/[-_]/g, " "));
  const description = escapeHtml(repo.description || "No description provided.");
  const tags = [repo.language, ...(repo.topics || [])].filter(Boolean).slice(0, 4);
  const repoUrl = escapeHtml(repo.html_url);
  const demoLink = repo.homepage
    ? `<a href="${escapeHtml(repo.homepage)}" target="_blank" rel="noopener">Live Demo →</a>`
    : "";

  return `
    <article class="project-card">
      <div class="project-body">
        <h3>${name}</h3>
        <p>${description}</p>
        <ul class="project-tags">
          ${tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("")}
        </ul>
        <div class="project-links">
          ${demoLink}
          <a href="${repoUrl}" target="_blank" rel="noopener">Source Code →</a>
        </div>
      </div>
    </article>
  `;
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GitHub API error (${res.status}) for ${url}`);
  return res.json();
}

async function loadGithubProjects() {
  const grid = document.getElementById("projectsGrid");
  if (!grid) return;

  const username = grid.dataset.githubUser;
  const maxRepos = Number(grid.dataset.maxRepos) || 6;
  const pinnedNames = (grid.dataset.pinnedRepos || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  try {
    // Pinned repos (e.g. from another org) are fetched individually so one
    // missing/private repo doesn't take down the whole grid.
    const pinnedResults = await Promise.all(
      pinnedNames.map((fullName) =>
        fetchJson(`https://api.github.com/repos/${fullName}`).catch((err) => {
          console.error(`Failed to load pinned repo ${fullName}:`, err);
          return null;
        })
      )
    );
    const pinnedRepos = pinnedResults.filter(Boolean);
    const pinnedSet = new Set(pinnedRepos.map((r) => r.full_name.toLowerCase()));

    let topPersonal = [];
    if (username) {
      const personalRepos = await fetchJson(`https://api.github.com/users/${username}/repos?per_page=100`);
      const remainingSlots = Math.max(maxRepos - pinnedRepos.length, 0);
      topPersonal = personalRepos
        .filter((repo) => !repo.fork && !pinnedSet.has(repo.full_name.toLowerCase()))
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, remainingSlots);
    }

    const allRepos = [...pinnedRepos, ...topPersonal];

    if (allRepos.length === 0) {
      grid.innerHTML = `<p class="projects-status">No projects to show yet.</p>`;
      return;
    }

    grid.innerHTML = allRepos.map(renderProjectCard).join("");
  } catch (err) {
    console.error("Failed to load GitHub projects:", err);
    grid.innerHTML = `<p class="projects-status">Couldn't load projects from GitHub right now. See the full list on
      <a href="https://github.com/${escapeHtml(username)}" target="_blank" rel="noopener">GitHub</a>.</p>`;
  }
}

loadGithubProjects();
