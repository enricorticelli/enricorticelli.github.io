(() => {
  const versions = ["95", "98", "xp", "7"];
  function create({ root, os, menu, start, onOpen, onCrash, onRestart }) {
    let bag = [],
      current,
      popups = [];
    const names = {
      95: "Windows 95",
      98: "Windows 98",
      xp: "Windows XP",
      7: "Windows 7",
    };
    const node = (tag, className, text) => {
      const el = document.createElement(tag);
      if (className) el.className = className;
      if (text !== undefined) el.textContent = text;
      return el;
    };
    const item = (label, icon, action, children) => ({
      label,
      icon,
      action,
      children,
    });
    const social = [
      item("GitHub", "internet", "open:gh"),
      item("LinkedIn", "internet", "open:li"),
      item("Instagram", "picture", "open:ig"),
    ];
    const games = [item("Campo minato", "mine", "open:mines")];
    const accessories = [
      item("Giochi", "folder", null, games),
      item("Blocco note", "document", "open:readme"),
    ];
    const programs = [
      item("Accessori", "folder", null, accessories),
      item("Internet Explorer", "internet", null, social),
      item("Esplora risorse", "folder", "open:readme"),
      item("Prompt di MS-DOS", "run", "crash:MS-DOS"),
    ];
    const settings = [
      item("Pannello di controllo", "settings", "crash:Pannello di controllo"),
      item("Stampanti", "settings", "crash:Spooler di stampa"),
      item(
        "Barra delle applicazioni e menu Avvio",
        "settings",
        "crash:Explorer",
      ),
    ];
    const find = [
      item("File o cartelle…", "search", "crash:Ricerca file"),
      item("Computer…", "search", "crash:Risorse di rete"),
      item("Su Internet", "internet", "crash:Internet Explorer"),
    ];
    const documents = [item("Enrico.txt", "document", "open:readme")];
    function clearPopups(depth = 0) {
      popups
        .filter((popup) => popup.depth >= depth)
        .forEach((popup) => {
          popup.parent.setAttribute("aria-expanded", "false");
          popup.panel.remove();
        });
      popups = popups.filter((popup) => popup.depth < depth);
    }
    function action(value) {
      clearPopups();
      menu.hidden = true;
      start.setAttribute("aria-expanded", "false");
      if (value.startsWith("open:")) onOpen(value.slice(5));
      else if (value.startsWith("crash:")) onCrash(value.slice(6));
      else if (value === "restart") onRestart();
    }
    function icon(type) {
      const span = node("span", "menu-icon icon-" + type);
      span.setAttribute("aria-hidden", "true");
      return span;
    }
    function openSubmenu(parent, children, depth) {
      if (popups.some((popup) => popup.parent === parent)) return;
      clearPopups(depth);
      const panel = node("div", "submenu-popup menu-list");
      panel.setAttribute("role", "menu");
      panel.setAttribute("aria-label", parent.dataset.label);
      addItems(panel, children, depth + 1);
      os.append(panel);
      const bounds = os.getBoundingClientRect(),
        button = parent.getBoundingClientRect();
      const width = panel.offsetWidth,
        height = panel.offsetHeight;
      let left = button.right - bounds.left - 2;
      if (left + width > os.clientWidth)
        left = Math.max(0, button.left - bounds.left - width + 4);
      panel.style.left = left + "px";
      panel.style.top =
        Math.max(
          0,
          Math.min(
            os.clientHeight - taskbarHeight() - height,
            button.top - bounds.top,
          ),
        ) + "px";
      panel.style.zIndex = String(100002 + depth);
      parent.setAttribute("aria-expanded", "true");
      popups.push({ parent, panel, depth });
    }
    function taskbarHeight() {
      return root.querySelector(".taskbar").offsetHeight;
    }
    function addItems(panel, entries, depth = 0) {
      entries.forEach((entry) => {
        if (!entry) {
          panel.append(node("hr", "menu-separator"));
          return;
        }
        const button = node("button", "start-item");
        button.type = "button";
        button.dataset.label = entry.label;
        button.setAttribute("role", "menuitem");
        button.append(
          icon(entry.icon),
          node("span", "menu-label", entry.label),
        );
        if (entry.children) {
          button.setAttribute("aria-haspopup", "menu");
          button.setAttribute("aria-expanded", "false");
          button.append(node("span", "menu-arrow", "▶"));
          button.addEventListener("pointerenter", () =>
            openSubmenu(button, entry.children, depth),
          );
          button.addEventListener("click", () =>
            openSubmenu(button, entry.children, depth),
          );
        } else {
          button.addEventListener("pointerenter", () => clearPopups(depth));
          button.addEventListener("click", () => action(entry.action));
        }
        button.addEventListener("keydown", (event) => {
          const buttons = [
            ...panel.querySelectorAll(':scope > [role="menuitem"]'),
          ];
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            const delta = event.key === "ArrowDown" ? 1 : -1;
            buttons[
              (buttons.indexOf(button) + delta + buttons.length) %
                buttons.length
            ].focus();
          } else if (event.key === "ArrowRight" && entry.children) {
            event.preventDefault();
            openSubmenu(button, entry.children, depth);
            popups.at(-1).panel.querySelector("button").focus();
          } else if (
            (event.key === "ArrowLeft" || event.key === "Escape") &&
            depth > 0
          ) {
            event.preventDefault();
            event.stopPropagation();
            const popup = popups.find((p) => p.panel === panel);
            if (popup) {
              clearPopups(popup.depth);
              popup.parent.focus();
            }
          }
        });
        panel.append(button);
      });
    }
    function buildMenu() {
      clearPopups();
      menu.replaceChildren();
      menu.className =
        "start-menu " +
        (current === "95" || current === "98" ? "classic-menu" : "modern-menu");
      menu.setAttribute("aria-label", "Menu Start di " + names[current]);
      if (current === "95" || current === "98") {
        const rail = node("div", "start-rail");
        rail.setAttribute("aria-hidden", "true");
        const wordmark = node("span", "rail-wordmark");
        wordmark.append(
          node("strong", null, "Windows"),
          document.createTextNode(current),
        );
        rail.append(wordmark);
        const list = node("div", "menu-list");
        list.setAttribute("role", "menu");
        const entries = [];
        if (current === "98")
          entries.push(
            item("Windows Update", "update", "crash:Windows Update"),
            null,
          );
        entries.push(item("Programmi", "programs", null, programs));
        if (current === "98")
          entries.push(item("Preferiti", "favorites", null, social));
        entries.push(
          item("Documenti", "document", null, documents),
          item("Impostazioni", "settings", null, settings),
          item("Trova", "search", null, find),
          item("Guida in linea", "help", "open:help"),
          item("Esegui…", "run", "open:run"),
          null,
        );
        if (current === "98")
          entries.push(item("Disconnetti Enrico…", "user", "restart"));
        entries.push(item("Chiudi sessione…", "power", "open:shutdown"));
        addItems(list, entries);
        menu.append(rail, list);
      } else {
        const header = node("div", "start-user");
        const avatar = node("img");
        avatar.src = "assets/profile.jpg";
        avatar.alt = "";
        header.append(avatar, node("span", null, "Enrico"));
        const columns = node("div", "menu-columns"),
          left = node("div", "menu-left menu-list"),
          right = node("div", "menu-right menu-list");
        left.setAttribute("role", "menu");
        right.setAttribute("role", "menu");
        addItems(left, [
          item("Internet Explorer", "internet", "open:gh"),
          item("Posta elettronica", "mail", "crash:Outlook Express"),
          null,
          item("Campo minato", "mine", "open:mines"),
          item("Blocco note", "document", "open:readme"),
          item("Windows Media Player", "media", "crash:Windows Media Player"),
          null,
          item("Tutti i programmi", "programs", null, programs),
        ]);
        const rightItems = [item("Documenti", "folder", "open:readme")];
        if (current === "xp")
          rightItems.push(
            item("Documenti recenti", "document", null, documents),
          );
        rightItems.push(
          item("Immagini", "picture", "open:ig"),
          item("Musica", "media", "crash:Windows Media Player"),
        );
        if (current === "7")
          rightItems.push(item("Giochi", "mine", "open:mines"));
        rightItems.push(
          item(
            current === "xp" ? "Risorse del computer" : "Computer",
            "computer",
            "crash:Explorer",
          ),
          null,
          item(
            "Pannello di controllo",
            "settings",
            "crash:Pannello di controllo",
          ),
          item(
            current === "xp" ? "Stampanti e fax" : "Dispositivi e stampanti",
            "settings",
            "crash:Spooler di stampa",
          ),
          null,
          item(
            current === "xp"
              ? "Guida in linea e supporto tecnico"
              : "Guida e supporto tecnico",
            "help",
            "open:help",
          ),
        );
        if (current === "xp")
          rightItems.push(
            item("Cerca", "search", "crash:Ricerca file"),
            item("Esegui…", "run", "open:run"),
          );
        else
          rightItems.push(
            item(
              "Programmi predefiniti",
              "programs",
              "crash:Programmi predefiniti",
            ),
          );
        addItems(right, rightItems);
        columns.append(left, right);
        const footer = node("div", "start-footer");
        if (current === "xp")
          addItems(footer, [
            item("Disconnetti", "user", "restart"),
            item("Spegni computer", "power", "open:shutdown"),
          ]);
        else {
          const form = node("form", "start-search"),
            input = node("input");
          input.placeholder = "Cerca programmi e file";
          input.setAttribute("aria-label", "Cerca programmi e file");
          form.append(input);
          form.addEventListener("submit", (event) => {
            event.preventDefault();
            const value = input.value.toLowerCase();
            const key = value.includes("min")
              ? "mines"
              : value.includes("git")
                ? "gh"
                : value.includes("link")
                  ? "li"
                  : value.includes("inst")
                    ? "ig"
                    : value.includes("enrico")
                      ? "readme"
                      : null;
            if (key) action("open:" + key);
            else action("crash:Ricerca Windows");
          });
          footer.append(form);
          addItems(footer, [
            item("Arresta il sistema", "power", "open:shutdown"),
          ]);
        }
        menu.append(header, columns, footer);
      }
    }
    function chooseVersion() {
      if (!bag.length) {
        bag = [...versions];
        for (let i = bag.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [bag[i], bag[j]] = [bag[j], bag[i]];
        }
        if (bag.at(-1) === current)
          [bag[0], bag[bag.length - 1]] = [bag.at(-1), bag[0]];
      }
      current = bag.pop();
      root.dataset.version = current;
      root.querySelector(".bios-brand").textContent =
        "Microsoft " + names[current];
      root.querySelector(".bios-footer").firstChild.textContent =
        "Caricamento di " + names[current];
      root.querySelector(".monitor-model").textContent =
        current === "95" || current === "98"
          ? "EC Multiscan · CRT"
          : current === "xp"
            ? "EC Digital · LCD"
            : "EC Widescreen · LCD";
      const flag = node("span", "windows-flag");
      flag.setAttribute("aria-hidden", "true");
      for (let i = 0; i < 4; i++) flag.append(node("i"));
      start.replaceChildren(
        flag,
        node(
          "span",
          "start-text",
          current === "95" ? "Avvio" : current === "xp" ? "start" : "Start",
        ),
      );
      start.setAttribute("aria-label", "Start");
      buildMenu();
      return current;
    }
    return {
      chooseVersion,
      closeSubmenus: clearPopups,
      onMenuOpen: () => {
        if (menu.hidden) clearPopups();
      },
      name: () => names[current],
    };
  }
  globalThis.EnricoSystem = { create };
})();
