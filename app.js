(() => {
  const BOOT_DURATION_MS = 3000;
  const root = document.getElementById("enrico-desktop98");
  const os = root.querySelector(".os");
  const workspace = root.querySelector(".workspace");
  const layer = root.querySelector(".window-layer");
  const tasks = root.querySelector(".running-apps");
  const template = root.querySelector(".window-template");
  const start = root.querySelector(".start-button");
  const menu = root.querySelector(".start-menu");
  const startup = root.querySelector(".startup");
  const bsod = root.querySelector(".blue-screen");
  const taskbar = root.querySelector(".taskbar");
  const status = root.querySelector(".desktop-status");
  const bootMeter = root.querySelector(".boot-meter");
  const bootStep = root.querySelector(".boot-step");

  const apps = {
    readme: {
      title: "enrico.txt",
      label: "Enrico",
      status: "Backend Developer",
    },
    gh: {
      title: "github.url",
      label: "GitHub",
      url: "https://github.com/enricorticelli",
      address: "github.com/enricorticelli",
      status: "Codice e curiosità",
    },
    li: {
      title: "linkedin.url",
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/enrico-corticelli/",
      address: "linkedin.com/in/enrico-corticelli",
      status: "Parliamo di lavoro",
    },
    ig: {
      title: "instagram.url",
      label: "Instagram",
      url: "https://www.instagram.com/enricorticelli/",
      address: "instagram.com/enricorticelli",
      status: "Anche fuori dal codice",
    },
  };
  let windows = [];
  let nextId = 1;
  let bootInterval;
  let bootTimeout;
  let resizeFrame;
  const elements = new Map();

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }
  function externalLink(key, label) {
    const link = node("a", "external-link", label);
    link.href = apps[key].url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    return link;
  }
  function activeWindow() {
    return [...windows].reverse().find((window) => !window.minimized);
  }
  function announce(text) {
    status.textContent = text;
  }
  function closeMenu() {
    menu.hidden = true;
    start.setAttribute("aria-expanded", "false");
  }
  function fillBody(body, key) {
    if (key === "readme") {
      body.append(node("span", "small-label", "HELLO, WORLD."));
      const heading = node("h2", null, "Enrico");
      heading.append(
        document.createElement("br"),
        document.createTextNode("Corticelli"),
      );
      body.append(
        heading,
        node("p", null, "Backend Developer"),
        externalLink("li", "Parliamone su LinkedIn ↗"),
      );
    } else if (key === "gh") {
      body.append(
        node("span", "small-label", "GITHUB / ENRICORTICELLI"),
        node("h2", null, "Enrico.json"),
      );
      body.append(
        node(
          "pre",
          "code-file",
          JSON.stringify(
            { name: "Enrico Corticelli", role: "Backend Developer" },
            null,
            2,
          ),
        ),
      );
      body.append(externalLink("gh", "Apri il mio GitHub ↗"));
    } else if (key === "li") {
      body.append(
        node("div", "profile-banner", "in"),
        node("span", "small-label", "LINKEDIN"),
      );
      const heading = node("h2", "profile-name", "Enrico");
      heading.append(
        document.createElement("br"),
        document.createTextNode("Corticelli"),
      );
      body.append(
        heading,
        node("p", null, "Backend Developer"),
        externalLink("li", "Visita il profilo e scrivimi ↗"),
      );
    } else if (key === "ig") {
      body.append(
        node("span", "small-label", "INSTAGRAM / ENRICORTICELLI"),
        node("h2", null, "Fuori ufficio."),
        node("div", "instagram-art", "ec."),
        externalLink("ig", "Apri il mio Instagram ↗"),
      );
    }
  }
  function updateWindows() {
    const active = activeWindow();
    windows.forEach((window, index) => {
      const entry = elements.get(window.id);
      entry.window.style.zIndex = String(index + 5);
      entry.window.hidden = window.minimized;
      entry.window.classList.toggle("is-active", active?.id === window.id);
      entry.task.classList.toggle("is-active", active?.id === window.id);
      entry.task.setAttribute("aria-pressed", String(active?.id === window.id));
      entry.window.style.left = `${window.x}px`;
      entry.window.style.top = `${window.y}px`;
    });
  }
  function clampWindow(window) {
    const entry = elements.get(window.id);
    if (layer.clientWidth === 0) return;
    const width = Math.min(
      330,
      Math.max(180, layer.clientWidth - (layer.clientWidth < 500 ? 71 : 122)),
    );
    entry.window.style.width = `${width}px`;
    // Minimized windows keep their measured height to stay inside the desktop.
    const height = entry.window.offsetHeight || entry.height;
    if (entry.window.offsetHeight) entry.height = entry.window.offsetHeight;
    window.x = Math.max(0, Math.min(layer.clientWidth - width, window.x));
    window.y = Math.max(
      0,
      Math.min(Math.max(0, layer.clientHeight - height), window.y),
    );
  }
  function focusWindow(window) {
    window.minimized = false;
    windows = windows.filter((entry) => entry !== window);
    windows.push(window);
    clampWindow(window);
    updateWindows();
  }
  function focusAfterHide(fallback) {
    const active = activeWindow();
    if (active)
      elements.get(active.id).window.querySelector(".window-handle").focus();
    else fallback.focus();
  }
  function mountWindow(window) {
    const win = template.content.firstElementChild.cloneNode(true);
    const app = apps[window.app];
    const task = node("button", null, app.label);
    task.type = "button";
    task.setAttribute(
      "aria-label",
      `Mostra o riduci ${app.title}, finestra ${window.id}`,
    );
    task.title = `${app.title} · finestra ${window.id}`;
    win.dataset.windowId = String(window.id);
    win.setAttribute("aria-label", `${app.label} — finestra ${window.id}`);
    win.querySelector(".window-title").textContent = app.title;
    win.querySelector(".window-title").title = app.title;
    win.querySelector(".window-statusbar > span").textContent = app.status;
    const handle = win.querySelector(".window-handle");
    handle.setAttribute(
      "aria-label",
      `Sposta ${app.title}; usa le frecce della tastiera`,
    );
    const close = win.querySelector(".window-close");
    const minimize = win.querySelector(".window-minimize");
    close.setAttribute(
      "aria-label",
      `Chiudi ${app.title}, finestra ${window.id}`,
    );
    minimize.setAttribute(
      "aria-label",
      `Riduci ${app.title}, finestra ${window.id}`,
    );
    if (app.url) {
      win.querySelector(".addressbar").hidden = false;
      win.querySelector(".window-address").textContent = app.address;
      win.querySelector(".window-address").title = app.address;
    }
    fillBody(win.querySelector(".window-body"), window.app);
    layer.append(win);
    tasks.append(task);
    elements.set(window.id, { window: win, task, height: 290 });
    win.addEventListener("pointerdown", () => focusWindow(window));
    win.addEventListener("focusin", () => focusWindow(window));
    close.addEventListener("click", (event) => {
      event.stopPropagation();
      windows = windows.filter((entry) => entry !== window);
      win.remove();
      task.remove();
      elements.delete(window.id);
      updateWindows();
      focusAfterHide(root.querySelector(`[data-open="${window.app}"]`));
      announce(`${app.label} chiuso.`);
    });
    minimize.addEventListener("click", (event) => {
      event.stopPropagation();
      window.minimized = true;
      updateWindows();
      focusAfterHide(task);
      announce(`${app.label} ridotto nella barra delle applicazioni.`);
    });
    task.addEventListener("click", () => {
      if (activeWindow()?.id === window.id && !window.minimized) {
        window.minimized = true;
        updateWindows();
      } else focusWindow(window);
    });
    let drag;
    handle.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      focusWindow(window);
      drag = {
        x: event.clientX,
        y: event.clientY,
        left: window.x,
        top: window.y,
      };
      handle.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    handle.addEventListener("pointermove", (event) => {
      if (!drag) return;
      window.x = drag.left + event.clientX - drag.x;
      window.y = drag.top + event.clientY - drag.y;
      clampWindow(window);
      updateWindows();
    });
    handle.addEventListener("pointerup", () => {
      drag = null;
    });
    handle.addEventListener("pointercancel", () => {
      drag = null;
    });
    handle.addEventListener("keydown", (event) => {
      const move = {
        ArrowLeft: [-12, 0],
        ArrowRight: [12, 0],
        ArrowUp: [0, -12],
        ArrowDown: [0, 12],
      }[event.key];
      if (!move) return;
      event.preventDefault();
      window.x += move[0];
      window.y += move[1];
      clampWindow(window);
      updateWindows();
    });
    clampWindow(window);
  }
  function openWindow(key) {
    const index = windows.length % 7;
    const narrow = layer.clientWidth < 500;
    const window = {
      id: nextId++,
      app: key,
      x: narrow ? 65 + index * 8 : 120 + index * 33,
      y: 32 + index * 34,
      minimized: false,
    };
    windows.push(window);
    mountWindow(window);
    updateWindows();
    closeMenu();
    announce(`${apps[key].label} aperto in una nuova finestra.`);
  }
  function setBootProgress(value) {
    bootMeter.setAttribute("aria-valuenow", String(value));
    bootMeter.querySelector("span").style.width = `${value}%`;
  }
  function beginBoot() {
    clearInterval(bootInterval);
    clearTimeout(bootTimeout);
    closeMenu();
    status.textContent = "";
    bsod.hidden = true;
    startup.hidden = false;
    os.classList.add("booting");
    workspace.inert = true;
    taskbar.inert = true;
    const started = performance.now();
    setBootProgress(0);
    bootStep.textContent = "Avvio del sistema…";
    bootInterval = setInterval(() => {
      const elapsed = performance.now() - started;
      setBootProgress(
        Math.min(99, Math.floor((elapsed / BOOT_DURATION_MS) * 100)),
      );
      bootStep.textContent =
        elapsed < 1000
          ? "Avvio del sistema…"
          : elapsed < 2000
            ? "Caricamento delle applicazioni…"
            : "Preparazione del desktop…";
    }, 250);
    bootTimeout = setTimeout(() => {
      clearInterval(bootInterval);
      startup.hidden = true;
      os.classList.remove("booting");
      workspace.inert = false;
      taskbar.inert = false;
      setBootProgress(100);
      announce("Desktop pronto. Enrico Corticelli, Backend Developer.");
    }, BOOT_DURATION_MS);
  }
  root.querySelectorAll("[data-open]").forEach((button) => {
    button.addEventListener("click", () => openWindow(button.dataset.open));
  });
  start.addEventListener("click", () => {
    menu.hidden = !menu.hidden;
    start.setAttribute("aria-expanded", String(!menu.hidden));
  });
  workspace.addEventListener("pointerdown", (event) => {
    if (!event.target.closest(".os-window")) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !menu.hidden) {
      closeMenu();
      start.focus();
    }
  });
  root
    .querySelector('[data-menu="readme"]')
    .addEventListener("click", () => openWindow("readme"));
  root
    .querySelector('[data-menu="restart"]')
    .addEventListener("click", beginBoot);
  root.querySelector('[data-menu="crash"]').addEventListener("click", () => {
    closeMenu();
    bsod.hidden = false;
    workspace.inert = true;
    taskbar.inert = true;
    root.querySelector(".reboot").focus();
  });
  root.querySelector(".reboot").addEventListener("click", beginBoot);
  const observer = new ResizeObserver(() => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      windows.forEach(clampWindow);
      updateWindows();
    });
  });
  observer.observe(layer);
  openWindow("readme");
  beginBoot();
})();
