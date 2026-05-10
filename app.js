const FULL_NAME = "Enrico Corticelli";
const ROLE = "Backend e DevOps Engineer";
const SHORT_DESCRIPTION =
  "Progetto applicazioni scalabili, microservizi e integrazioni affidabili. Trasformo requisiti complessi in soluzioni performanti, manutenibili e pronte per la crescita.";
const LINKEDIN_URL = "https://www.linkedin.com/in/enrico-corticelli/";
const GITHUB_USERNAME = "enricorticelli";
const INSTAGRAM_URL = "https://www.instagram.com/enricorticelli/";
const PROFILE_IMAGE_PATH = "assets/profile.jpg";

const REPOS_TO_SHOW = 6;

const ui = {
  profileImage: document.getElementById("profile-image"),
  fullName: document.getElementById("full-name"),
  role: document.getElementById("role"),
  shortDescription: document.getElementById("short-description"),
  githubLink: document.getElementById("github-link"),
  linkedinLink: document.getElementById("linkedin-link"),
  instagramLink: document.getElementById("instagram-link"),
  githubStatus: document.getElementById("github-status"),
  githubStats: document.getElementById("github-stats"),
  reposList: document.getElementById("repos-list"),
  activityList: document.getElementById("activity-list"),
  metricRepos: document.getElementById("metric-repos"),
  metricFollowers: document.getElementById("metric-followers"),
  metricFollowing: document.getElementById("metric-following"),
  metricGists: document.getElementById("metric-gists"),
  wheelCanvas: document.getElementById("wheel-canvas"),
  wheelCountdown: document.getElementById("wheel-countdown"),
  wheelLive: document.getElementById("wheel-live"),
};

const utils = {
  rand: (min, max) => Math.random() * (max - min) + min,
  formatDate(value) {
    return new Date(value).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  },
  easeOutCubic(t) {
    return 1 - (1 - t) ** 3;
  },
};

function bootstrapProfile() {
  ui.profileImage.src = PROFILE_IMAGE_PATH;
  ui.fullName.textContent = FULL_NAME;
  ui.role.textContent = ROLE;
  ui.shortDescription.textContent = SHORT_DESCRIPTION;
  ui.githubLink.href = `https://github.com/${GITHUB_USERNAME}`;
  ui.linkedinLink.href = LINKEDIN_URL;
  ui.instagramLink.href = INSTAGRAM_URL;
}

function renderHeroMetrics(profile) {
  if (!profile) return;
  ui.metricRepos.textContent = String(profile.public_repos ?? 0);
  ui.metricFollowers.textContent = String(profile.followers ?? 0);
  ui.metricFollowing.textContent = String(profile.following ?? 0);
  ui.metricGists.textContent = String(profile.public_gists ?? 0);
}

function resetHeroMetrics() {
  ui.metricRepos.textContent = "--";
  ui.metricFollowers.textContent = "--";
  ui.metricFollowing.textContent = "--";
  ui.metricGists.textContent = "--";
}

async function loadGitHubRecap() {
  if (!GITHUB_USERNAME || GITHUB_USERNAME.includes("INSERISCI")) {
    ui.githubStatus.textContent =
      "Inserisci il tuo username GitHub in app.js per mostrare il recap automatico.";
    resetHeroMetrics();
    return;
  }

  const base = "https://api.github.com";

  try {
    const [profileRes, reposRes, eventsRes] = await Promise.all([
      fetch(`${base}/users/${GITHUB_USERNAME}`),
      fetch(`${base}/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=${REPOS_TO_SHOW}`),
      fetch(`${base}/users/${GITHUB_USERNAME}/events/public?per_page=8`),
    ]);

    if (!profileRes.ok || !reposRes.ok || !eventsRes.ok) {
      throw new Error("GitHub API error");
    }

    const [profile, repos, events] = await Promise.all([
      profileRes.json(),
      reposRes.json(),
      eventsRes.json(),
    ]);

    renderHeroMetrics(profile);
    renderGitHubStats(profile, repos);
    renderRepos(repos);
    renderEvents(events);
    ui.githubStatus.textContent = "Dati GitHub aggiornati.";
  } catch (error) {
    console.error(error);
    ui.githubStatus.textContent =
      "GitHub recap non disponibile al momento. Il resto del sito funziona normalmente.";
    resetHeroMetrics();
    ui.githubStats.hidden = true;
    ui.reposList.innerHTML = "";
    ui.activityList.innerHTML = "";
  }
}

function renderGitHubStats(profile, repos) {
  const stars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
  const forks = repos.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);
  const languageCounts = repos.reduce((acc, repo) => {
    const language = repo.language || "n/d";
    acc[language] = (acc[language] || 0) + 1;
    return acc;
  }, {});

  const topLanguages = Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([language]) => language)
    .join(", ");

  const stats = [
    { label: "Repo pubblici", value: profile.public_repos ?? 0 },
    { label: `Stelle (${repos.length} repo)`, value: stars },
    { label: `Fork (${repos.length} repo)`, value: forks },
    { label: "Linguaggi principali", value: topLanguages || "n/d" },
  ];

  ui.githubStats.innerHTML = stats
    .map(
      (item) =>
        `<article class="stat"><div class="stat-label">${item.label}</div><div class="stat-value">${item.value}</div></article>`,
    )
    .join("");
  ui.githubStats.hidden = false;
}

function renderRepos(repos) {
  if (!repos.length) {
    ui.reposList.innerHTML = '<p class="muted">Nessun repository pubblico trovato.</p>';
    return;
  }

  ui.reposList.innerHTML = repos
    .map(
      (repo) => `
      <article class="repo">
        <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${repo.name}</a>
        <p class="muted">${repo.description || "Nessuna descrizione disponibile."}</p>
        <div class="repo-meta">
          <span>Lingua: ${repo.language || "n/d"}</span>
          <span>★ ${repo.stargazers_count || 0}</span>
          <span>⑂ ${repo.forks_count || 0}</span>
        </div>
      </article>
    `,
    )
    .join("");
}

function renderEvents(events) {
  if (!events.length) {
    ui.activityList.innerHTML = "<li>Nessuna attività pubblica recente.</li>";
    return;
  }

  ui.activityList.innerHTML = events
    .slice(0, 7)
    .map((event) => {
      const repoName = event.repo?.name || "repo";
      return `<li><strong>${event.type}</strong> su <em>${repoName}</em> · ${utils.formatDate(event.created_at)}</li>`;
    })
    .join("");
}

function initWheelGame() {
  if (!ui.wheelCanvas || !ui.wheelCountdown) return;

  const canvas = ui.wheelCanvas;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const segments = [
    "#2a78ff",
    "#33b9ff",
    "#2ce6ff",
    "#28f0cf",
    "#31d9a9",
    "#2ab5ff",
    "#5ea3ff",
    "#3ce3ff",
  ];

  let rafId = 0;
  let angle = 0;
  let spinning = false;
  let countdownId = 0;

  const draw = () => {
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.44;
    const arcSize = (Math.PI * 2) / segments.length;

    ctx.clearRect(0, 0, w, h);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    segments.forEach((color, index) => {
      const start = index * arcSize;
      const end = start + arcSize;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, radius, start, end);
      ctx.strokeStyle = "rgba(240,248,255,0.28)";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = "#d8f1ff";
    ctx.fill();
    ctx.restore();

    ctx.beginPath();
    ctx.arc(cx, cy, radius + 6, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(137, 205, 255, 0.54)";
    ctx.lineWidth = 4;
    ctx.stroke();
  };

  const spin = () => {
    if (spinning) return;

    spinning = true;
    if (ui.wheelLive) {
      ui.wheelLive.textContent = "Giro avviato";
    }

    const startAngle = angle;
    const fullTurns = utils.rand(6, 9);
    const targetAngle = startAngle + fullTurns * Math.PI * 2 + utils.rand(0, Math.PI * 2);
    const duration = utils.rand(2600, 4200);
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = utils.easeOutCubic(progress);
      angle = startAngle + (targetAngle - startAngle) * eased;
      draw();

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
        return;
      }

      spinning = false;
      if (ui.wheelLive) {
        ui.wheelLive.textContent = "Giro completato";
      }
    };

    if (rafId) {
      cancelAnimationFrame(rafId);
    }

    rafId = requestAnimationFrame(animate);
  };

  const startWithCountdown = () => {
    let seconds = 3;
    ui.wheelCountdown.hidden = false;
    ui.wheelCountdown.textContent = String(seconds);
    if (ui.wheelLive) {
      ui.wheelLive.textContent = "Avvio tra 3 secondi";
    }

    countdownId = window.setInterval(() => {
      seconds -= 1;
      if (seconds > 0) {
        ui.wheelCountdown.textContent = String(seconds);
        if (ui.wheelLive) {
          ui.wheelLive.textContent = `Avvio tra ${seconds} secondi`;
        }
        return;
      }

      window.clearInterval(countdownId);
      countdownId = 0;
      ui.wheelCountdown.hidden = true;
      spin();
    }, 1000);
  };

  draw();
  startWithCountdown();
}

bootstrapProfile();
loadGitHubRecap();
initWheelGame();
