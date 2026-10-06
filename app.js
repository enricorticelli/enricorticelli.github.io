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
  const errorLayer = root.querySelector(".error-layer");

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
  Object.assign(apps, {
    mines: {
      title: "Campo minato",
      label: "Campo minato",
      status: "Partita principiante",
    },
    help: {
      title: "Guida in linea",
      label: "Guida",
      status: "Guida di Windows",
    },
    run: { title: "Esegui", label: "Esegui", status: "Apri un programma" },
    shutdown: {
      title: "Chiudi sessione",
      label: "Chiudi sessione",
      status: "Arresto del sistema",
    },
  });
  const initialPositions = {
    readme: { desktop: [0.08, 0.06], mobile: [0.9, 0.03] },
    gh: { desktop: [0.87, 0.08], mobile: [0.05, 0.26] },
    li: { desktop: [0.18, 0.9], mobile: [0.95, 0.62] },
    ig: { desktop: [0.96, 0.94], mobile: [0.45, 0.98] },
  };
  let windows = [];
  let nextId = 1;
  let bootInterval;
  let bootTimeout;
  let resizeFrame;
  let crashInterval, crashTimeout, autoRestartTimeout;
  let phase = "booting";
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
    system.closeSubmenus();
  }
  function fillBody(body, key) {
    if (key === "readme") {
      const photo = node("img", "identity-photo");
      photo.src = "assets/profile.jpg";
      photo.alt = "Enrico Corticelli";
      body.append(photo);
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
    } else if (key === "mines") {
      return EnricoMinesweeper.mount(body);
    } else if (key === "help") {
      body.append(
        node("h2", null, "Guida in linea"),
        node(
          "p",
          null,
          "Le icone riportano davanti le finestre. Puoi trascinare i titoli e ridurre le pagine nella barra.",
        ),
        node(
          "p",
          null,
          "Campo minato si trova in Programmi → Accessori → Giochi. Alcune funzioni del sistema sono un po’ instabili…",
        ),
      );
    } else if (key === "run") {
      body.append(node("p", null, "Digitare il nome del programma da aprire."));
      const form = node("form", "run-form");
      const label = node("label", null, "Apri:");
      const input = node("input");
      input.name = "program";
      input.autocomplete = "off";
      input.setAttribute("aria-label", "Nome del programma");
      label.append(input);
      const button = node("button", "dialog-button", "OK");
      button.type = "submit";
      form.append(label, button);
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const command = input.value
          .trim()
          .toLowerCase()
          .replace(/\.exe$/, "");
        const key = {
          winmine: "mines",
          minesweeper: "mines",
          notepad: "readme",
          enrico: "readme",
          github: "gh",
          linkedin: "li",
          instagram: "ig",
        }[command];
        if (key) openWindow(key);
        else triggerCrash(command || "Esegui");
      });
      body.append(form);
    } else if (key === "shutdown") {
      body.append(node("p", null, "Come si desidera procedere?"));
      const form = node("form", "shutdown-form");
      [
        "Arresta il sistema",
        "Riavvia il sistema",
        "Riavvia in modalità MS-DOS",
      ].forEach((text, index) => {
        const label = node("label");
        const input = node("input");
        input.type = "radio";
        input.name = "power";
        input.value = String(index);
        input.checked = index === 1;
        label.append(input, document.createTextNode(text));
        form.append(label);
      });
      const actions = node("div", "dialog-actions");
      const ok = node("button", "dialog-button", "OK");
      ok.type = "submit";
      const cancel = node("button", "dialog-button", "Annulla");
      cancel.type = "button";
      cancel.addEventListener("click", () =>
        body.closest(".os-window").querySelector(".window-close").click(),
      );
      actions.append(ok, cancel);
      form.append(actions);
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (new FormData(form).get("power") === "2") triggerCrash("MS-DOS");
        else beginBoot();
      });
      body.append(form);
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
  function resetDesktop() {
    elements.forEach((entry) => entry.dispose?.());
    layer.replaceChildren();
    tasks.replaceChildren();
    elements.clear();
    windows = [];
    nextId = 1;
    ["readme", "gh", "li", "ig"].forEach(openWindow);
    focusWindow(windows.find((window) => window.app === "readme"));
  }
  function triggerCrash(cause) {
    if (phase !== "desktop") return;
    closeMenu();
    phase = "crashing";
    os.dataset.phase = phase;
    workspace.inert = true;
    taskbar.inert = true;
    const reducedMotion = matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const count = reducedMotion ? 6 : 18 + Math.floor(Math.random() * 15);
    const interval = reducedMotion ? 260 : 70;
    let created = 0;
    function addError() {
      const popup = node("section", "crash-error os-window");
      popup.setAttribute("aria-label", "Errore di " + cause);
      const title = node("div", "titlebar", cause);
      const body = node("div", "error-content");
      body.append(
        node("span", "error-symbol", "×"),
        node(
          "p",
          null,
          "Questo programma ha eseguito un’operazione non valida e sarà terminato.",
        ),
      );
      const button = node("button", "error-ok", "Chiudi");
      button.type = "button";
      button.addEventListener("click", () => popup.remove());
      popup.append(title, body, button);
      errorLayer.append(popup);
      popup.style.width = Math.min(300, os.clientWidth - 8) + "px";
      const maxX = Math.max(0, os.clientWidth - popup.offsetWidth);
      const maxY = Math.max(0, workspace.clientHeight - popup.offsetHeight);
      popup.style.left = ((created * 37 + 23) % (maxX + 1)) + "px";
      popup.style.top = ((created * 29 + 17) % (maxY + 1)) + "px";
      popup.style.zIndex = String(created + 1);
      created++;
      if (created >= count) clearInterval(crashInterval);
    }
    addError();
    crashInterval = setInterval(addError, interval);
    crashTimeout = setTimeout(
      () => {
        phase = "bsod";
        os.dataset.phase = phase;
        bsod.hidden = false;
        errorLayer.inert = true;
        root.querySelector(".crash-reason").textContent = cause;
        root.querySelector(".crash-countdown").textContent =
          "Riavvio automatico del sistema…";
        announce("Errore irreversibile. Riavvio automatico.");
        autoRestartTimeout = setTimeout(() => {
          errorLayer.inert = false;
          beginBoot();
        }, 2200);
      },
      count * interval + 350,
    );
  }
  function clampWindow(window) {
    const entry = elements.get(window.id);
    if (layer.clientWidth === 0) return;
    os.style.setProperty("--workspace-height", `${layer.clientHeight}px`);
    const width = Math.min(
      root.dataset.version === "7" ? 300 : 280,
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
  function placeWindow(window) {
    clampWindow(window);
    const entry = elements.get(window.id);
    const narrow = layer.clientWidth < 500;
    const [x, y] = (initialPositions[window.app] || {
      desktop: [0.5, 0.5],
      mobile: [0.5, 0.5],
    })[narrow ? "mobile" : "desktop"];
    const maxX = Math.max(0, layer.clientWidth - entry.window.offsetWidth);
    const maxY = Math.max(0, layer.clientHeight - entry.height);
    window.x = narrow ? maxX * x : Math.max(Math.min(92, maxX), maxX * x);
    window.y = maxY * y;
    clampWindow(window);
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
    win.dataset.app = window.app;
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
    const dispose = fillBody(win.querySelector(".window-body"), window.app);
    layer.append(win);
    tasks.append(task);
    elements.set(window.id, { window: win, task, height: 290, dispose });
    win.addEventListener("pointerdown", () => focusWindow(window));
    win.addEventListener("focusin", () => focusWindow(window));
    close.addEventListener("click", (event) => {
      event.stopPropagation();
      windows = windows.filter((entry) => entry !== window);
      elements.get(window.id).dispose?.();
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
      window.autoPlaced = false;
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
      window.autoPlaced = false;
      window.x += move[0];
      window.y += move[1];
      clampWindow(window);
      updateWindows();
    });
    clampWindow(window);
  }
  function openWindow(key) {
    const existing = windows.find((window) => window.app === key);
    if (existing) {
      focusWindow(existing);
      closeMenu();
      announce(`${apps[key].label} portato in primo piano.`);
      return;
    }
    const window = {
      id: nextId++,
      app: key,
      x: 0,
      y: 0,
      autoPlaced: true,
      minimized: false,
    };
    windows.push(window);
    mountWindow(window);
    placeWindow(window);
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
    clearInterval(crashInterval);
    clearTimeout(crashTimeout);
    clearTimeout(autoRestartTimeout);
    phase = "booting";
    os.dataset.phase = phase;
    errorLayer.replaceChildren();
    errorLayer.inert = false;
    system.chooseVersion();
    resetDesktop();
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
      phase = "desktop";
      os.dataset.phase = phase;
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
    system.onMenuOpen();
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
  root.querySelector(".reboot").addEventListener("click", beginBoot);
  const observer = new ResizeObserver(() => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      windows.forEach((window) => {
        if (window.autoPlaced) placeWindow(window);
        else clampWindow(window);
      });
      updateWindows();
    });
  });
  observer.observe(layer);
  const system = EnricoSystem.create({
    root,
    os,
    menu,
    start,
    onOpen: openWindow,
    onCrash: triggerCrash,
    onRestart: beginBoot,
  });
  beginBoot();
})();
