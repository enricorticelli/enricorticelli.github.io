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
  canvas: document.getElementById("game-canvas"),
};

const utils = {
  clamp: (value, min, max) => Math.min(max, Math.max(min, value)),
  rand: (min, max) => Math.random() * (max - min) + min,
  rectHit: (a, b) =>
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y,
  circleRectHit(circle, rect) {
    const nearestX = this.clamp(circle.x, rect.x, rect.x + rect.w);
    const nearestY = this.clamp(circle.y, rect.y, rect.y + rect.h);
    const dx = circle.x - nearestX;
    const dy = circle.y - nearestY;
    return dx * dx + dy * dy < circle.r * circle.r;
  },
  formatDate(value) {
    return new Date(value).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  },
};

function bootstrapProfile() {
  if (ui.profileImage) {
    ui.profileImage.src = PROFILE_IMAGE_PATH;
  }
  if (ui.fullName) {
    ui.fullName.textContent = FULL_NAME;
  }
  if (ui.role) {
    ui.role.textContent = ROLE;
  }
  if (ui.shortDescription) {
    ui.shortDescription.textContent = SHORT_DESCRIPTION;
  }
  if (ui.githubLink) {
    ui.githubLink.href = `https://github.com/${GITHUB_USERNAME}`;
  }
  if (ui.linkedinLink) {
    ui.linkedinLink.href = LINKEDIN_URL;
  }
  if (ui.instagramLink) {
    ui.instagramLink.href = INSTAGRAM_URL;
  }
}

function renderHeroMetrics(profile) {
  if (!profile) return;
  if (ui.metricRepos) {
    ui.metricRepos.textContent = String(profile.public_repos ?? 0);
  }
  if (ui.metricFollowers) {
    ui.metricFollowers.textContent = String(profile.followers ?? 0);
  }
  if (ui.metricFollowing) {
    ui.metricFollowing.textContent = String(profile.following ?? 0);
  }
  if (ui.metricGists) {
    ui.metricGists.textContent = String(profile.public_gists ?? 0);
  }
}

function resetHeroMetrics() {
  if (ui.metricRepos) {
    ui.metricRepos.textContent = "--";
  }
  if (ui.metricFollowers) {
    ui.metricFollowers.textContent = "--";
  }
  if (ui.metricFollowing) {
    ui.metricFollowing.textContent = "--";
  }
  if (ui.metricGists) {
    ui.metricGists.textContent = "--";
  }
}

async function loadGitHubRecap() {
  if (!GITHUB_USERNAME || GITHUB_USERNAME.includes("INSERISCI")) {
    if (ui.githubStatus) {
      ui.githubStatus.textContent =
        "Inserisci il tuo username GitHub in app.js per mostrare il recap automatico.";
    }
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
    if (ui.githubStatus) {
      ui.githubStatus.textContent = "Dati GitHub aggiornati.";
    }
  } catch (error) {
    console.error(error);
    if (ui.githubStatus) {
      ui.githubStatus.textContent =
        "GitHub recap non disponibile al momento. Il resto del sito funziona normalmente.";
    }
    resetHeroMetrics();
    if (ui.githubStats) {
      ui.githubStats.hidden = true;
    }
    if (ui.reposList) {
      ui.reposList.innerHTML = "";
    }
    if (ui.activityList) {
      ui.activityList.innerHTML = "";
    }
  }
}

function renderGitHubStats(profile, repos) {
  if (!ui.githubStats) return;

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
  if (!ui.reposList) return;

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
  if (!ui.activityList) return;

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

function createInputManager(canvas) {
  const keys = new Set();
  const virtualKeys = new Set();
  const pointer = { active: false, x: 0, y: 0, tap: false };

  const mapAlias = {
    KeyW: "ArrowUp",
    KeyA: "ArrowLeft",
    KeyS: "ArrowDown",
    KeyD: "ArrowRight",
    Space: "Space",
  };

  const onKeyDown = (event) => {
    const key = mapAlias[event.code] || event.code;
    keys.add(key);
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(key)) {
      event.preventDefault();
    }
  };

  const onKeyUp = (event) => {
    const key = mapAlias[event.code] || event.code;
    keys.delete(key);
  };

  const setPointerFromEvent = (clientX, clientY, tap = false) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    pointer.active = true;
    pointer.x = (clientX - rect.left) * scaleX;
    pointer.y = (clientY - rect.top) * scaleY;
    if (tap) {
      pointer.tap = true;
    }
  };

  const onMouseMove = (event) => setPointerFromEvent(event.clientX, event.clientY);
  const onMouseDown = (event) => setPointerFromEvent(event.clientX, event.clientY, true);
  const onMouseLeave = () => {
    pointer.active = false;
  };

  const onTouchStart = (event) => {
    const touch = event.changedTouches[0];
    if (!touch) return;
    setPointerFromEvent(touch.clientX, touch.clientY, true);
    event.preventDefault();
  };

  const onTouchMove = (event) => {
    const touch = event.changedTouches[0];
    if (!touch) return;
    setPointerFromEvent(touch.clientX, touch.clientY);
    event.preventDefault();
  };

  const onTouchEnd = () => {
    pointer.active = false;
  };

  window.addEventListener("keydown", onKeyDown, { passive: false });
  window.addEventListener("keyup", onKeyUp);

  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("mousedown", onMouseDown);
  canvas.addEventListener("mouseleave", onMouseLeave);
  canvas.addEventListener("touchstart", onTouchStart, { passive: false });
  canvas.addEventListener("touchmove", onTouchMove, { passive: false });
  canvas.addEventListener("touchend", onTouchEnd);

  const touchButtons = [];
  const activeButtonKeys = new Map();

  return {
    isDown(key) {
      return keys.has(key) || virtualKeys.has(key);
    },
    axisX() {
      return Number(this.isDown("ArrowRight")) - Number(this.isDown("ArrowLeft"));
    },
    axisY() {
      return Number(this.isDown("ArrowDown")) - Number(this.isDown("ArrowUp"));
    },
    consumeTap() {
      const tapped = pointer.tap;
      pointer.tap = false;
      return tapped;
    },
    pointer,
    destroy() {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      touchButtons.forEach((button) => {
        const handlers = activeButtonKeys.get(button);
        if (!handlers) return;
        button.removeEventListener("touchstart", handlers.start);
        button.removeEventListener("touchend", handlers.end);
        button.removeEventListener("mousedown", handlers.start);
        button.removeEventListener("mouseup", handlers.end);
        button.removeEventListener("mouseleave", handlers.end);
      });
    },
  };
}

function createGameRunner(canvas) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const input = createInputManager(canvas);
  let gameRafId = 0;
  let countdownRafId = 0;
  let nextGameTimeoutId = 0;
  let lastTime = 0;

  function drawOverlay(text = "Game Over") {
    ctx.fillStyle = "rgba(3, 7, 17, 0.62)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#e8edf9";
    ctx.font = "700 22px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  }

  function drawScoreHud(scoreValue) {
    const value = Math.max(0, Math.floor(scoreValue || 0));
    const label = `Punti: ${value}`;

    ctx.save();
    ctx.font = "700 16px Sora, sans-serif";
    const textWidth = ctx.measureText(label).width;
    const boxWidth = textWidth + 22;
    const boxHeight = 30;
    const x = canvas.width - boxWidth - 10;
    const y = 10;

    ctx.fillStyle = "rgba(8, 20, 48, 0.7)";
    ctx.strokeStyle = "rgba(130, 190, 255, 0.45)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, boxWidth, boxHeight, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#e8edf9";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + 11, y + boxHeight / 2);
    ctx.restore();
  }

  function drawCountdown(seconds, elapsedMs) {
    ctx.fillStyle = "#050910";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(3, 7, 17, 0.56)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const wave = (Math.sin(elapsedMs / 210) + 1) / 2;
    const scale = 0.9 + wave * 0.18;
    const alpha = 0.55 + wave * 0.45;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(scale, scale);
    ctx.fillStyle = `rgba(232, 237, 249, ${alpha})`;
    ctx.font = "700 88px Sora, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(seconds), 0, 0);
    ctx.restore();
  }

  function stop() {
    if (gameRafId) {
      cancelAnimationFrame(gameRafId);
      gameRafId = 0;
    }
    if (countdownRafId) {
      cancelAnimationFrame(countdownRafId);
      countdownRafId = 0;
    }
    if (nextGameTimeoutId) {
      window.clearTimeout(nextGameTimeoutId);
      nextGameTimeoutId = 0;
    }
  }

  function start(gameFactory, onGameOver) {
    stop();

    const startCountdownAt = performance.now();
    const countdownSeconds = 3;

    const runGame = () => {
      const control = {
        score: 0,
        gameOver: false,
        message: "",
        setScore(value) {
          this.score = value;
        },
        end(message) {
          this.gameOver = true;
          this.message = message;
        },
      };

      const currentGame = gameFactory({ ctx, canvas, input, control, utils });
      let gameOverHandled = false;
      lastTime = performance.now();

      const frame = (time) => {
        const dt = Math.min((time - lastTime) / 1000, 0.033);
        lastTime = time;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        currentGame.update(dt);
        currentGame.draw();
        drawScoreHud(control.score);

        if (control.gameOver) {
          drawOverlay(control.message || "Game Over");
          if (!gameOverHandled) {
            gameOverHandled = true;
            nextGameTimeoutId = window.setTimeout(() => {
              nextGameTimeoutId = 0;
              if (typeof onGameOver === "function") {
                onGameOver();
              }
            }, 800);
          }
          return;
        }

        gameRafId = requestAnimationFrame(frame);
      };

      gameRafId = requestAnimationFrame(frame);
    };

    const countdownFrame = (now) => {
      const elapsed = (now - startCountdownAt) / 1000;
      const remaining = countdownSeconds - elapsed;

      if (remaining <= 0) {
        countdownRafId = 0;
        runGame();
        return;
      }

      const shownSecond = Math.ceil(remaining);
      drawCountdown(shownSecond, now - startCountdownAt);

      countdownRafId = requestAnimationFrame(countdownFrame);
    };

    countdownRafId = requestAnimationFrame(countdownFrame);
  }

  return {
    start,
    destroy() {
      stop();
      input.destroy();
    },
  };
}

function createAsteroidDodge({ ctx, canvas, input, control, utils }) {
  const ship = { x: canvas.width / 2 - 12, y: canvas.height - 48, w: 24, h: 24, speed: 220 };
  const asteroids = [];
  let spawnTimer = 0;
  let elapsed = 0;

  return {
    update(dt) {
      elapsed += dt;
      control.setScore(elapsed);

      const speedBoost = 1 + elapsed * 0.04;
      ship.x += input.axisX() * ship.speed * dt;
      ship.y += input.axisY() * ship.speed * dt;

      if (input.pointer.active) {
        ship.x += (input.pointer.x - ship.w / 2 - ship.x) * 0.14;
        ship.y += (input.pointer.y - ship.h / 2 - ship.y) * 0.14;
      }

      ship.x = utils.clamp(ship.x, 0, canvas.width - ship.w);
      ship.y = utils.clamp(ship.y, 0, canvas.height - ship.h);

      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        spawnTimer = Math.max(0.18, 0.75 - elapsed * 0.012);
        asteroids.push({
          x: utils.rand(12, canvas.width - 12),
          y: -18,
          r: utils.rand(8, 15),
          vy: utils.rand(80, 145) * speedBoost,
        });
      }

      for (let i = asteroids.length - 1; i >= 0; i -= 1) {
        const asteroid = asteroids[i];
        asteroid.y += asteroid.vy * dt;
        if (utils.circleRectHit(asteroid, ship)) {
          control.end("Colpito da un asteroide");
          break;
        }
        if (asteroid.y - asteroid.r > canvas.height + 8) {
          asteroids.splice(i, 1);
        }
      }
    },
    draw() {
      ctx.fillStyle = "#050910";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#4ed7ff";
      ctx.beginPath();
      ctx.moveTo(ship.x + ship.w / 2, ship.y);
      ctx.lineTo(ship.x, ship.y + ship.h);
      ctx.lineTo(ship.x + ship.w, ship.y + ship.h);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#ffc96b";
      asteroids.forEach((asteroid) => {
        ctx.beginPath();
        ctx.arc(asteroid.x, asteroid.y, asteroid.r, 0, Math.PI * 2);
        ctx.fill();
      });
    },
  };
}

function createNeonSnake({ ctx, canvas, input, control, utils }) {
  const cell = 16;
  const cols = Math.floor(canvas.width / cell);
  const rows = Math.floor(canvas.height / cell);
  const snake = [{ x: 8, y: 8 }];
  let direction = { x: 1, y: 0 };
  let nextDirection = { x: 1, y: 0 };
  let food = { x: 12, y: 8 };
  let tickTimer = 0;
  let tick = 0.14;

  for (let i = 1; i < 4; i += 1) {
    snake.push({ x: snake[0].x - i, y: snake[0].y });
  }

  const placeFood = () => {
    let valid = false;
    while (!valid) {
      const candidate = { x: Math.floor(utils.rand(0, cols)), y: Math.floor(utils.rand(0, rows)) };
      valid = !snake.some((part) => part.x === candidate.x && part.y === candidate.y);
      if (valid) {
        food = candidate;
      }
    }
  };

  return {
    update(dt) {
      if (input.isDown("ArrowUp") && direction.y !== 1) nextDirection = { x: 0, y: -1 };
      if (input.isDown("ArrowDown") && direction.y !== -1) nextDirection = { x: 0, y: 1 };
      if (input.isDown("ArrowLeft") && direction.x !== 1) nextDirection = { x: -1, y: 0 };
      if (input.isDown("ArrowRight") && direction.x !== -1) nextDirection = { x: 1, y: 0 };

      tickTimer += dt;
      if (tickTimer < tick) return;
      tickTimer = 0;

      direction = nextDirection;
      const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

      if (head.x < 0 || head.y < 0 || head.x >= cols || head.y >= rows) {
        control.end("Hai colpito il bordo");
        return;
      }

      if (snake.some((part) => part.x === head.x && part.y === head.y)) {
        control.end("Hai colpito te stesso");
        return;
      }

      snake.unshift(head);

      if (head.x === food.x && head.y === food.y) {
        control.setScore(control.score + 1);
        tick = Math.max(0.07, tick * 0.98);
        placeFood();
      } else {
        snake.pop();
      }
    },
    draw() {
      ctx.fillStyle = "#05080f";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "rgba(78, 215, 255, 0.08)";
      for (let x = 0; x < cols; x += 1) {
        for (let y = 0; y < rows; y += 1) {
          ctx.strokeRect(x * cell, y * cell, cell, cell);
        }
      }

      snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? "#86f8ff" : "#29c4ff";
        ctx.fillRect(part.x * cell + 2, part.y * cell + 2, cell - 4, cell - 4);
      });

      ctx.fillStyle = "#ff5f87";
      ctx.fillRect(food.x * cell + 3, food.y * cell + 3, cell - 6, cell - 6);
    },
  };
}

function createTinyRunner({ ctx, canvas, input, control, utils }) {
  const groundY = canvas.height - 44;
  const player = { x: 56, y: groundY - 22, w: 22, h: 22, vy: 0, grounded: true };
  const obstacles = [];
  let spawnTimer = 0;
  let elapsed = 0;
  const gravity = 900;

  const jump = () => {
    if (!player.grounded) return;
    player.vy = -340;
    player.grounded = false;
  };

  return {
    update(dt) {
      elapsed += dt;
      control.setScore(elapsed * 10);

      if (input.isDown("Space") || input.isDown("ArrowUp") || input.consumeTap()) {
        jump();
      }

      player.vy += gravity * dt;
      player.y += player.vy * dt;
      if (player.y + player.h >= groundY) {
        player.y = groundY - player.h;
        player.vy = 0;
        player.grounded = true;
      }

      const speed = 140 + elapsed * 15;
      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        spawnTimer = Math.max(0.5, 1.15 - elapsed * 0.05);
        const h = utils.rand(20, 40);
        obstacles.push({ x: canvas.width + 10, y: groundY - h, w: utils.rand(14, 24), h });
      }

      for (let i = obstacles.length - 1; i >= 0; i -= 1) {
        const obstacle = obstacles[i];
        obstacle.x -= speed * dt;
        if (utils.rectHit(player, obstacle)) {
          control.end("Impatto con ostacolo");
          break;
        }
        if (obstacle.x + obstacle.w < -4) {
          obstacles.splice(i, 1);
        }
      }
    },
    draw() {
      ctx.fillStyle = "#070d16";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "rgba(78,215,255,0.24)";
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(canvas.width, groundY);
      ctx.stroke();

      ctx.fillStyle = "#4ed7ff";
      ctx.fillRect(player.x, player.y, player.w, player.h);

      ctx.fillStyle = "#ff8f40";
      obstacles.forEach((obstacle) => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
      });
    },
  };
}

function createBugBlaster({ ctx, canvas, input, control, utils }) {
  const player = { x: canvas.width / 2 - 16, y: canvas.height - 28, w: 32, h: 16, speed: 260 };
  const bullets = [];
  const bugs = [];
  let shootCd = 0;
  let spawnTimer = 0;
  let elapsed = 0;

  return {
    update(dt) {
      elapsed += dt;
      player.x += input.axisX() * player.speed * dt;
      if (input.pointer.active) {
        player.x += (input.pointer.x - player.w / 2 - player.x) * 0.2;
      }
      player.x = utils.clamp(player.x, 0, canvas.width - player.w);

      shootCd -= dt;
      if ((input.isDown("Space") || input.consumeTap()) && shootCd <= 0) {
        shootCd = 0.18;
        bullets.push({ x: player.x + player.w / 2 - 2, y: player.y - 6, w: 4, h: 9, vy: 310 });
      }

      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        spawnTimer = Math.max(0.22, 0.7 - elapsed * 0.03);
        bugs.push({
          x: utils.rand(8, canvas.width - 24),
          y: -16,
          w: 18,
          h: 14,
          vy: utils.rand(55, 105) + elapsed * 4,
        });
      }

      for (let i = bullets.length - 1; i >= 0; i -= 1) {
        bullets[i].y -= bullets[i].vy * dt;
        if (bullets[i].y + bullets[i].h < 0) bullets.splice(i, 1);
      }

      for (let i = bugs.length - 1; i >= 0; i -= 1) {
        const bug = bugs[i];
        bug.y += bug.vy * dt;

        if (bug.y + bug.h >= canvas.height) {
          control.end("Un bug ha superato la difesa");
          break;
        }

        if (utils.rectHit(player, bug)) {
          control.end("Sei stato colpito da un bug");
          break;
        }

        for (let j = bullets.length - 1; j >= 0; j -= 1) {
          if (utils.rectHit(bullets[j], bug)) {
            bullets.splice(j, 1);
            bugs.splice(i, 1);
            control.setScore(control.score + 10);
            break;
          }
        }
      }
    },
    draw() {
      ctx.fillStyle = "#060b13";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#4ed7ff";
      ctx.fillRect(player.x, player.y, player.w, player.h);
      ctx.fillRect(player.x + player.w / 2 - 5, player.y - 6, 10, 6);

      ctx.fillStyle = "#b28bff";
      bullets.forEach((bullet) => ctx.fillRect(bullet.x, bullet.y, bullet.w, bullet.h));

      ctx.fillStyle = "#ff5f87";
      bugs.forEach((bug) => {
        ctx.fillRect(bug.x, bug.y, bug.w, bug.h);
        ctx.fillStyle = "#ffd1dd";
        ctx.fillRect(bug.x + 3, bug.y + 4, 2, 2);
        ctx.fillRect(bug.x + bug.w - 5, bug.y + 4, 2, 2);
        ctx.fillStyle = "#ff5f87";
      });
    },
  };
}

function initPlayground() {
  if (!ui.canvas) {
    return;
  }

  const gameFactories = [createAsteroidDodge, createNeonSnake, createTinyRunner, createBugBlaster];
  let lastFactory = null;

  const pickNextFactory = () => {
    const pool = gameFactories.filter((factory) => factory !== lastFactory);
    const nextFactory = pool[Math.floor(Math.random() * pool.length)] || gameFactories[0];
    lastFactory = nextFactory;
    return nextFactory;
  };

  const runner = createGameRunner(ui.canvas);
  if (!runner) {
    return;
  }

  const startNext = () => {
    runner.start(pickNextFactory(), startNext);
  };

  startNext();
}

bootstrapProfile();
loadGitHubRecap();
initPlayground();
