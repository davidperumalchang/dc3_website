/* =========================================================
   Destiny C3 — main.js
   - Initializes Jarallax for image + video parallax
   - Handles navbar scroll state
   - Sets footer year
   - Renders the locations explorer (locations.html)
   - Renders the connect groups explorer (connect-groups.html)
   ========================================================= */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    initJarallax();
    initNavbarScroll();
    initHoverDropdowns();
    initFooterYear();
    initSmoothScrollOffset();
    initLocationsTeaserHover();
    initLocationsExplorer();
    initConnectGroupsExplorer();
    initOurTeamExplorer();
    initPastorPhotoLightbox();
    initCopyButtons();
    initMinistryModal();
    initBackToTop();
  });

  /* =========================================================
     BACK TO TOP
     - Injects a floating button (bottom-right) on every page.
     - Reveals after the user scrolls down; smooth-scrolls to top.
     ========================================================= */
  function initBackToTop() {
    if (document.querySelector(".dc3-back-to-top")) return;

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "dc3-back-to-top";
    btn.setAttribute("aria-label", "Back to top");
    btn.setAttribute("title", "Back to top");
    btn.innerHTML = '<i class="bi bi-arrow-up" aria-hidden="true"></i>';
    document.body.appendChild(btn);

    var onScroll = function () {
      if (window.scrollY > 400) {
        btn.classList.add("is-visible");
      } else {
        btn.classList.remove("is-visible");
      }
    };

    btn.addEventListener("click", function () {
      var prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      try {
        window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
      } catch (err) {
        window.scrollTo(0, 0);
      }
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* =========================================================
     PASTOR PHOTO LIGHTBOX (our-team.html)
     - Opens the photo of a pastor card in a Bootstrap modal
       when clicked/keyboard-activated. Cards are rendered
       dynamically so we use event delegation on the page.
     ========================================================= */
  function initPastorPhotoLightbox() {
    var modalEl = document.getElementById("pastorPhotoModal");
    if (!modalEl) return;
    if (!window.bootstrap || !window.bootstrap.Modal) return;

    var imgEl = modalEl.querySelector("[data-pastor-modal-img]");
    var titleEl = modalEl.querySelector("[data-pastor-modal-title]");
    var subtitleEl = modalEl.querySelector("[data-pastor-modal-subtitle]");
    if (!imgEl) return;

    var modal = new window.bootstrap.Modal(modalEl);

    function openFor(trigger) {
      var src = trigger.getAttribute("data-photo-src");
      if (!src) return;
      var title = trigger.getAttribute("data-photo-title") || "";
      var subtitle = trigger.getAttribute("data-photo-subtitle") || "";
      imgEl.src = src;
      imgEl.alt = title ? title + (subtitle ? ", " + subtitle : "") : "";
      if (titleEl) titleEl.textContent = title;
      if (subtitleEl) subtitleEl.textContent = subtitle;
      modal.show();
    }

    document.addEventListener("click", function (e) {
      var trigger = e.target.closest("[data-pastor-photo-trigger]");
      if (!trigger) return;
      e.preventDefault();
      openFor(trigger);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      var trigger = e.target.closest("[data-pastor-photo-trigger]");
      if (!trigger) return;
      e.preventDefault();
      openFor(trigger);
    });

    modalEl.addEventListener("hidden.bs.modal", function () {
      imgEl.src = "";
      if (titleEl) titleEl.textContent = "";
      if (subtitleEl) subtitleEl.textContent = "";
    });
  }

  /* =========================================================
     MINISTRY DETAIL MODAL (about.html)
     - Reads window.DC3_MINISTRIES
     - Click/Enter/Space on a .dc3-ministry-card[data-ministry]
       opens a shared Bootstrap modal populated with that ministry's
       icon, name, tagline, body paragraphs, plus a "Get Connected" CTA.
     ========================================================= */
  function initMinistryModal() {
    var cards = document.querySelectorAll(
      ".dc3-ministry-card[data-ministry]"
    );
    if (!cards.length) return;

    var modalEl = document.getElementById("ministryModal");
    if (!modalEl) return;

    var data = window.DC3_MINISTRIES;
    if (!data) return;

    var bsAvailable = window.bootstrap && window.bootstrap.Modal;
    var modal = bsAvailable ? new window.bootstrap.Modal(modalEl) : null;

    var iconSlotEl = modalEl.querySelector("[data-ministry-icon-slot]");
    var nameEl = modalEl.querySelector("[data-ministry-name]");
    var taglineEl = modalEl.querySelector("[data-ministry-tagline]");
    var bodyEl = modalEl.querySelector("[data-ministry-body]");

    function openMinistry(key) {
      var m = data[key];
      if (!m) return;

      if (iconSlotEl) {
        if (m.iconSvg) {
          iconSlotEl.innerHTML = m.iconSvg;
        } else if (m.icon) {
          iconSlotEl.innerHTML =
            '<i class="bi ' + m.icon + '" aria-hidden="true"></i>';
        } else {
          iconSlotEl.innerHTML =
            '<i class="bi bi-circle" aria-hidden="true"></i>';
        }
      }
      if (nameEl) nameEl.textContent = m.name || "";
      if (taglineEl) taglineEl.textContent = m.tagline || "";

      if (bodyEl) {
        bodyEl.innerHTML = "";
        (m.body || []).forEach(function (para) {
          var p = document.createElement("p");
          p.textContent = para;
          bodyEl.appendChild(p);
        });
      }

      if (modal) modal.show();
    }

    cards.forEach(function (card) {
      var key = card.getAttribute("data-ministry");
      if (!key || !data[key]) return;

      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute(
        "aria-label",
        "View " + data[key].name + " details"
      );

      card.addEventListener("click", function () {
        openMinistry(key);
      });

      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openMinistry(key);
        }
      });
    });
  }

  function initCopyButtons() {
    var buttons = document.querySelectorAll("[data-copy-text]");
    if (!buttons.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var text = btn.getAttribute("data-copy-text") || "";
        if (!text) return;

        copyToClipboard(text).then(function (ok) {
          if (!ok) return;
          showCopiedFeedback(btn);
        });
      });
    });
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text)
        .then(function () { return true; })
        .catch(function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }

  function legacyCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  function showCopiedFeedback(btn) {
    var icon = btn.querySelector(".bi");
    var label = btn.querySelector(".dc3-give-card__copy-label");
    var originalIconClass = icon ? icon.className : "";
    var originalLabel = label ? label.textContent : "";

    btn.classList.add("is-copied");
    if (icon) icon.className = "bi bi-check-lg";
    if (label) label.textContent = "Copied";

    if (btn._copyTimer) clearTimeout(btn._copyTimer);
    btn._copyTimer = setTimeout(function () {
      btn.classList.remove("is-copied");
      if (icon && originalIconClass) icon.className = originalIconClass;
      if (label) label.textContent = originalLabel;
    }, 1600);
  }

  function initLocationsTeaserHover() {
    var teaser = document.querySelector("[data-locations-teaser]");
    if (!teaser) return;

    var chips = teaser.querySelectorAll(".dc3-locations-teaser__chip[data-region]");
    if (!chips.length) return;

    function setRegion(region) {
      if (region) {
        teaser.setAttribute("data-hovered-region", region);
      } else {
        teaser.removeAttribute("data-hovered-region");
      }
    }

    chips.forEach(function (chip) {
      var region = chip.getAttribute("data-region");
      chip.addEventListener("mouseenter", function () { setRegion(region); });
      chip.addEventListener("mouseleave", function () { setRegion(null); });
      chip.addEventListener("focus", function () { setRegion(region); });
      chip.addEventListener("blur", function () { setRegion(null); });
    });
  }

  function initJarallax() {
    if (typeof window.jarallax !== "function") {
      return;
    }

    if (typeof window.jarallaxVideo === "function") {
      window.jarallaxVideo();
    }

    var els = document.querySelectorAll(".jarallax");

    if (!els.length) return;

    window.jarallax(els, {
      speed: 0.5,
      imgSize: "cover",
      imgPosition: "50% 50%",
      disableParallax: function () {
        return /iPad|iPhone|iPod|Android/.test(navigator.userAgent) ||
          window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      },
      disableVideo: function () {
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      }
    });
  }

  function initHoverDropdowns() {
    var dropdowns = document.querySelectorAll(".dropdown-hover");
    dropdowns.forEach(setupHoverDropdown);
  }

  function setupHoverDropdown(parent) {
    var toggle = parent.querySelector(".dropdown-toggle");
    var menu = parent.querySelector(".dropdown-menu");
    if (!toggle || !menu) return;

    var desktopMq = window.matchMedia("(min-width: 992px)");
    var bsDropdown = null;
    var hideTimer = null;

    function isDesktop() {
      return desktopMq.matches;
    }

    function showMenu() {
      menu.classList.add("show");
      toggle.setAttribute("aria-expanded", "true");
    }

    function hideMenu() {
      menu.classList.remove("show");
      toggle.setAttribute("aria-expanded", "false");
    }

    function enableMobileDropdown() {
      if (bsDropdown || !window.bootstrap || !window.bootstrap.Dropdown) return;
      toggle.setAttribute("data-bs-toggle", "dropdown");
      bsDropdown = new window.bootstrap.Dropdown(toggle, { autoClose: true });
    }

    function disableMobileDropdown() {
      hideMenu();
      if (bsDropdown) {
        bsDropdown.dispose();
        bsDropdown = null;
      }
      toggle.removeAttribute("data-bs-toggle");
    }

    function syncMode() {
      if (isDesktop()) {
        disableMobileDropdown();
      } else {
        enableMobileDropdown();
      }
    }

    parent.addEventListener("mouseenter", function () {
      if (!isDesktop()) return;
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
      showMenu();
    });

    parent.addEventListener("mouseleave", function () {
      if (!isDesktop()) return;
      hideTimer = setTimeout(hideMenu, 100);
    });

    toggle.addEventListener("click", function (e) {
      if (isDesktop()) {
        e.preventDefault();
      }
    });

    if (typeof desktopMq.addEventListener === "function") {
      desktopMq.addEventListener("change", syncMode);
    } else if (typeof desktopMq.addListener === "function") {
      desktopMq.addListener(syncMode);
    }

    syncMode();
  }

  function initNavbarScroll() {
    var nav = document.getElementById("mainNav");
    if (!nav) return;

    var onScroll = function () {
      if (window.scrollY > 40) {
        nav.classList.add("is-scrolled");
      } else {
        nav.classList.remove("is-scrolled");
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function initFooterYear() {
    var el = document.getElementById("year");
    if (el) {
      el.textContent = new Date().getFullYear();
    }
  }

  /* =========================================================
     LOCATIONS EXPLORER
     - Reads window.DC3_LOCATIONS (see js/locations-data.js)
     - Renders country selector + church cards
     - Click a country to update the map highlight + church grid
     - Supports deep-linking via URL hash, e.g. locations.html#india
     ========================================================= */
  function initLocationsExplorer() {
    var grid = document.querySelector(".dc3-locations__grid");
    if (!grid) return;

    var data = window.DC3_LOCATIONS;
    if (!data || !data.regions) return;

    var listEl = grid.querySelector("[data-country-list]");
    var cardsEl = grid.querySelector("[data-church-grid]");
    var emptyEl = grid.querySelector("[data-church-empty]");
    var titleEl = grid.querySelector("[data-region-title]");
    var eyebrowEl = grid.querySelector("[data-region-eyebrow]");
    var countEl = grid.querySelector("[data-region-count]");
    var flagEl = grid.querySelector("[data-region-flag]");
    var noteEl = grid.querySelector("[data-region-note]");

    if (!listEl || !cardsEl) return;

    var allowedRegions = data.order && data.order.length
      ? data.order.slice()
      : Object.keys(data.regions);

    var defaultRegion = allowedRegions[0] || "";
    var hashRegion = parseHashRegion();
    var initialRegion = (hashRegion && allowedRegions.indexOf(hashRegion) !== -1)
      ? hashRegion
      : defaultRegion;

    renderCountryList();
    setRegion(initialRegion);

    window.addEventListener("hashchange", function () {
      var next = parseHashRegion();
      if (next && allowedRegions.indexOf(next) !== -1) {
        setRegion(next);
      }
    });

    function parseHashRegion() {
      var raw = (window.location.hash || "").replace(/^#/, "").toLowerCase();
      return raw && allowedRegions.indexOf(raw) !== -1 ? raw : "";
    }

    function renderCountryList() {
      listEl.innerHTML = "";

      allowedRegions.forEach(function (key) {
        var region = data.regions[key];
        if (!region) return;

        var count = (region.churches && region.churches.length) || 0;
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "dc3-country-pill";
        btn.setAttribute("data-region", key);
        btn.setAttribute("role", "tab");
        btn.setAttribute("aria-selected", "false");
        btn.setAttribute(
          "aria-label",
          region.label + " — " + count + " " + (count === 1 ? "church" : "churches")
        );

        if (region.flag) {
          var flag = document.createElement("img");
          flag.className = "dc3-country-pill__flag";
          flag.src = region.flag;
          flag.alt = "";
          flag.setAttribute("aria-hidden", "true");
          flag.setAttribute("loading", "lazy");
          flag.setAttribute("decoding", "async");
          flag.width = 18;
          flag.height = 18;
          btn.appendChild(flag);
        }

        var name = document.createElement("span");
        name.className = "dc3-country-pill__name";
        name.textContent = region.label;
        btn.appendChild(name);

        var badge = document.createElement("span");
        badge.className = "dc3-country-pill__count";
        badge.textContent = count;
        badge.setAttribute("aria-hidden", "true");
        btn.appendChild(badge);

        attachRegionHandlers(btn, key);
        listEl.appendChild(btn);
      });
    }

    function attachRegionHandlers(el, key) {
      el.addEventListener("click", function () {
        setRegion(key, { updateHash: true });
      });

      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setRegion(key, { updateHash: true });
        }
      });
    }

    function setRegion(key, opts) {
      opts = opts || {};
      var safe = allowedRegions.indexOf(key) !== -1 ? key : defaultRegion;
      var region = data.regions[safe];
      if (!region) return;

      grid.setAttribute("data-active-region", safe);

      var items = listEl.querySelectorAll(".dc3-country-pill");
      items.forEach(function (btn) {
        var isActive = btn.getAttribute("data-region") === safe;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      if (titleEl) titleEl.textContent = region.label;
      if (eyebrowEl) eyebrowEl.textContent = "Churches in";
      if (countEl) {
        var n = (region.churches && region.churches.length) || 0;
        countEl.textContent = n + " " + (n === 1 ? "church" : "churches");
      }
      if (flagEl) {
        if (region.flag) {
          flagEl.setAttribute("src", region.flag);
          flagEl.classList.remove("d-none");
        } else {
          flagEl.classList.add("d-none");
        }
      }
      if (noteEl) {
        if (region.note) {
          noteEl.textContent = region.note;
          noteEl.hidden = false;
        } else {
          noteEl.textContent = "";
          noteEl.hidden = true;
        }
      }

      renderChurches(region.churches || []);

      if (opts.updateHash && window.history && window.history.replaceState) {
        try {
          window.history.replaceState(null, "", "#" + safe);
        } catch (err) { /* no-op */ }
      }

      if (opts.updateHash) {
        scrollToRegionStart();
      }
    }

    function scrollToRegionStart() {
      var summary = grid.querySelector("[data-region-summary]");
      if (!summary) return;

      var nav = document.getElementById("mainNav");
      var pills = document.querySelector(".dc3-country-pills-wrap");
      var navH = nav ? nav.offsetHeight : 64;
      var pillsH = pills ? pills.offsetHeight : 0;
      var gap = 16;

      var top = summary.getBoundingClientRect().top + window.pageYOffset
        - navH - pillsH - gap;
      if (top < 0) top = 0;

      var prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      try {
        window.scrollTo({
          top: top,
          behavior: prefersReduced ? "auto" : "smooth"
        });
      } catch (err) {
        window.scrollTo(0, top);
      }
    }

    function renderChurches(churches) {
      cardsEl.innerHTML = "";

      if (!churches.length) {
        cardsEl.classList.add("d-none");
        if (emptyEl) emptyEl.classList.remove("d-none");
        return;
      }

      cardsEl.classList.remove("d-none");
      if (emptyEl) emptyEl.classList.add("d-none");

      churches.forEach(function (church) {
        cardsEl.appendChild(buildChurchCard(church));
      });
    }

    function buildChurchCard(church) {
      var card = document.createElement("article");
      card.className = "dc3-church-card";

      var head = document.createElement("header");
      head.className = "dc3-church-card__head";

      var title = document.createElement("h3");
      title.className = "dc3-church-card__name";
      title.textContent = church.name;
      head.appendChild(title);

      if (church.languages && church.languages.length) {
        var tags = document.createElement("div");
        tags.className = "dc3-church-card__tags";
        church.languages.forEach(function (lang) {
          var t = document.createElement("span");
          t.className = "dc3-church-card__tag";
          t.textContent = lang;
          tags.appendChild(t);
        });
        head.appendChild(tags);
      }

      card.appendChild(head);

      var body = document.createElement("div");
      body.className = "dc3-church-card__body";

      if (church.address) {
        body.appendChild(
          buildRow("bi-geo-alt-fill", "Address", church.address, church.city)
        );
      }

      if (church.pastors && church.pastors.length) {
        body.appendChild(buildPastorsRow(church));
      }

      var serviceText = (church.serviceTimes && church.serviceTimes.length)
        ? church.serviceTimes.join(" · ")
        : "Contact us for current service times";
      body.appendChild(
        buildRow("bi-clock-fill", "Service Times", serviceText)
      );

      card.appendChild(body);

      var socials = church.socials;
      var hasSocials = socials && (socials.facebook || socials.instagram);
      var hasDirections = !!church.address;

      if (hasSocials || hasDirections) {
        var foot = document.createElement("div");
        foot.className = "dc3-church-card__foot";

        if (hasSocials) {
          foot.appendChild(buildChurchSocials(socials));
        }

        if (hasDirections) {
          var directions = document.createElement("a");
          directions.className = "dc3-church-card__cta";
          directions.href =
            "https://www.google.com/maps/search/?api=1&query=" +
            encodeURIComponent(church.address);
          directions.target = "_blank";
          directions.rel = "noopener noreferrer";
          directions.innerHTML =
            'Get Directions <i class="bi bi-arrow-up-right ms-1"></i>';
          foot.appendChild(directions);
        }

        card.appendChild(foot);
      }

      return card;
    }

    function buildChurchSocials(socials) {
      var wrap = document.createElement("div");
      wrap.className = "dc3-church-card__socials";

      if (socials.facebook) {
        wrap.appendChild(buildSocialLink("facebook", socials.facebook));
      }
      if (socials.instagram) {
        wrap.appendChild(buildSocialLink("instagram", socials.instagram));
      }

      return wrap;
    }

    function buildSocialLink(platform, url) {
      var link = document.createElement("a");
      link.className = "dc3-church-card__social";
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute(
        "aria-label",
        platform.charAt(0).toUpperCase() + platform.slice(1)
      );
      link.innerHTML =
        '<i class="bi bi-' + platform + '" aria-hidden="true"></i>';
      return link;
    }

    function buildRow(iconClass, label, value, sub) {
      var row = document.createElement("div");
      row.className = "dc3-church-card__row";

      var icon = document.createElement("span");
      icon.className = "dc3-church-card__icon";
      icon.innerHTML = '<i class="bi ' + iconClass + '" aria-hidden="true"></i>';
      row.appendChild(icon);

      var content = document.createElement("div");
      content.className = "dc3-church-card__content";

      var labelEl = document.createElement("span");
      labelEl.className = "dc3-church-card__label";
      labelEl.textContent = label;
      content.appendChild(labelEl);

      var valEl = document.createElement("span");
      valEl.className = "dc3-church-card__value";
      valEl.textContent = value;
      content.appendChild(valEl);

      if (sub) {
        var subEl = document.createElement("span");
        subEl.className = "dc3-church-card__sub";
        subEl.textContent = sub;
        content.appendChild(subEl);
      }

      row.appendChild(content);
      return row;
    }

    /* Pastors row: replaces the static people icon with a single clickable
       photo icon (the church/team photo). Falls back to the default
       people-icon when no photo is available. */
    function buildPastorsRow(church) {
      var row = document.createElement("div");
      row.className = "dc3-church-card__row";

      row.appendChild(buildPastorIcon(church));

      var content = document.createElement("div");
      content.className = "dc3-church-card__content";

      var labelEl = document.createElement("span");
      labelEl.className = "dc3-church-card__label";
      labelEl.textContent = church.pastors.length === 1 ? "Pastor" : "Pastors";
      content.appendChild(labelEl);

      var valEl = document.createElement("span");
      valEl.className = "dc3-church-card__value";
      valEl.textContent = church.pastors.join(", ");
      content.appendChild(valEl);

      row.appendChild(content);
      return row;
    }

    function buildPastorIcon(church) {
      var photo = church.photo || "";
      if (!photo) {
        var fallback = document.createElement("span");
        fallback.className = "dc3-church-card__icon";
        fallback.innerHTML =
          '<i class="bi bi-people-fill" aria-hidden="true"></i>';
        return fallback;
      }

      var title = formatPastorNames(church.pastors);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "dc3-pastor-icon is-clickable";
      btn.setAttribute("data-pastor-photo-trigger", "");
      btn.setAttribute("data-photo-src", photo);
      btn.setAttribute("data-photo-title", title);
      btn.setAttribute("data-photo-subtitle", church.name);
      btn.setAttribute("aria-label", "View photo of " + title);
      btn.setAttribute("title", "View photo of " + title);

      var img = document.createElement("img");
      img.src = photo;
      img.alt = "";
      img.setAttribute("aria-hidden", "true");
      img.setAttribute("loading", "lazy");
      img.setAttribute("decoding", "async");
      btn.appendChild(img);

      return btn;
    }

    function formatPastorNames(pastors) {
      if (!pastors || !pastors.length) return "Pastoral Team";
      if (pastors.length === 1) return "Pastor " + pastors[0];
      var firstNames = pastors.map(function (n) {
        return String(n).split(" ")[0];
      });
      if (firstNames.length === 2) {
        return "Pastors " + firstNames[0] + " & " + firstNames[1];
      }
      var last = firstNames[firstNames.length - 1];
      return "Pastors " + firstNames.slice(0, -1).join(", ") + " & " + last;
    }
  }

  /* =========================================================
     OUR TEAM EXPLORER
     - Reads window.DC3_LOCATIONS (shared with locations.html)
     - Renders country pills + pastor cards (one per church)
     - Click a pill to swap region; deep-links via hash
     ========================================================= */
  function initOurTeamExplorer() {
    var grid = document.querySelector(".dc3-our-team__grid");
    if (!grid) return;

    var data = window.DC3_LOCATIONS;
    if (!data || !data.regions) return;

    var listEl = grid.querySelector("[data-our-team-country-list]");
    var cardsEl = grid.querySelector("[data-our-team-grid]");
    var emptyEl = grid.querySelector("[data-our-team-empty]");
    var titleEl = grid.querySelector("[data-our-team-region-title]");
    var eyebrowEl = grid.querySelector("[data-our-team-region-eyebrow]");
    var countEl = grid.querySelector("[data-our-team-region-count]");
    var flagEl = grid.querySelector("[data-our-team-region-flag]");

    if (!listEl || !cardsEl) return;

    var allowedRegions = data.order && data.order.length
      ? data.order.slice()
      : Object.keys(data.regions);

    var defaultRegion = allowedRegions[0] || "";
    var hashRegion = parseHashRegion();
    var initialRegion = (hashRegion && allowedRegions.indexOf(hashRegion) !== -1)
      ? hashRegion
      : defaultRegion;

    renderCountryList();
    setRegion(initialRegion);

    window.addEventListener("hashchange", function () {
      var next = parseHashRegion();
      if (next && allowedRegions.indexOf(next) !== -1) {
        setRegion(next);
      }
    });

    function parseHashRegion() {
      var raw = (window.location.hash || "").replace(/^#/, "").toLowerCase();
      return raw && allowedRegions.indexOf(raw) !== -1 ? raw : "";
    }

    function regionTeamCount(region) {
      var churches = (region && region.churches) || [];
      return mergeChurchesByPastors(churches).length;
    }

    function renderCountryList() {
      listEl.innerHTML = "";

      allowedRegions.forEach(function (key) {
        var region = data.regions[key];
        if (!region) return;

        var count = regionTeamCount(region);
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "dc3-country-pill";
        btn.setAttribute("data-region", key);
        btn.setAttribute("role", "tab");
        btn.setAttribute("aria-selected", "false");
        btn.setAttribute(
          "aria-label",
          region.label + " — " + count + " " + (count === 1 ? "team" : "teams")
        );

        if (region.flag) {
          var flag = document.createElement("img");
          flag.className = "dc3-country-pill__flag";
          flag.src = region.flag;
          flag.alt = "";
          flag.setAttribute("aria-hidden", "true");
          flag.setAttribute("loading", "lazy");
          flag.setAttribute("decoding", "async");
          flag.width = 18;
          flag.height = 18;
          btn.appendChild(flag);
        }

        var name = document.createElement("span");
        name.className = "dc3-country-pill__name";
        name.textContent = region.label;
        btn.appendChild(name);

        var badge = document.createElement("span");
        badge.className = "dc3-country-pill__count";
        badge.textContent = count;
        badge.setAttribute("aria-hidden", "true");
        btn.appendChild(badge);

        attachRegionHandlers(btn, key);
        listEl.appendChild(btn);
      });
    }

    function attachRegionHandlers(el, key) {
      el.addEventListener("click", function () {
        setRegion(key, { updateHash: true });
      });

      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setRegion(key, { updateHash: true });
        }
      });
    }

    function setRegion(key, opts) {
      opts = opts || {};
      var safe = allowedRegions.indexOf(key) !== -1 ? key : defaultRegion;
      var region = data.regions[safe];
      if (!region) return;

      grid.setAttribute("data-active-region", safe);

      var items = listEl.querySelectorAll(".dc3-country-pill");
      items.forEach(function (btn) {
        var isActive = btn.getAttribute("data-region") === safe;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      if (titleEl) titleEl.textContent = region.label;
      if (eyebrowEl) eyebrowEl.textContent = "Pastors in";
      if (countEl) {
        var n = regionTeamCount(region);
        countEl.textContent = n + " " + (n === 1 ? "team" : "teams");
      }
      if (flagEl) {
        if (region.flag) {
          flagEl.setAttribute("src", region.flag);
          flagEl.classList.remove("d-none");
        } else {
          flagEl.classList.add("d-none");
        }
      }

      renderTeam(region.churches || []);

      if (opts.updateHash && window.history && window.history.replaceState) {
        try {
          window.history.replaceState(null, "", "#" + safe);
        } catch (err) { /* no-op */ }
      }

      if (opts.updateHash) {
        scrollToRegionStart();
      }
    }

    function renderTeam(churches) {
      cardsEl.innerHTML = "";

      if (!churches.length) {
        cardsEl.classList.add("d-none");
        if (emptyEl) emptyEl.classList.remove("d-none");
        return;
      }

      cardsEl.classList.remove("d-none");
      if (emptyEl) emptyEl.classList.add("d-none");

      var merged = mergeChurchesByPastors(churches);
      merged.forEach(function (church) {
        cardsEl.appendChild(buildPastorCard(church));
      });
    }

    /* Our Team-only: collapse churches that share the same pastors
       into a single card (e.g. Pastors Dale & Gawri serve in both
       Subang Tamil and Shah Alam Tamil). Joined name strips the
       repeated "Destiny C3" prefix for readability. */
    function mergeChurchesByPastors(churches) {
      var byKey = {};
      var order = [];
      churches.forEach(function (c) {
        var key = (c.pastors || [])
          .map(function (n) { return String(n).trim().toLowerCase(); })
          .slice()
          .sort()
          .join("|");
        if (!byKey[key]) {
          byKey[key] = {
            names: [c.name],
            pastors: c.pastors,
            cities: c.city ? [c.city] : [],
            photo: c.photo
          };
          order.push(key);
        } else {
          var group = byKey[key];
          group.names.push(c.name);
          if (c.city && group.cities.indexOf(c.city) === -1) {
            group.cities.push(c.city);
          }
          if (!group.photo && c.photo) group.photo = c.photo;
        }
      });

      return order.map(function (k) {
        var g = byKey[k];
        var joinedName = g.names.length === 1
          ? g.names[0]
          : g.names
              .map(function (n, i) {
                return i === 0 ? n : n.replace(/^Destiny C3\s+/i, "");
              })
              .join(" · ");
        return {
          name: joinedName,
          pastors: g.pastors,
          city: g.cities.join(" · "),
          photo: g.photo
        };
      });
    }

    function buildPastorCard(church) {
      var card = document.createElement("article");
      card.className = "dc3-our-team-card";

      var photo = document.createElement("div");
      photo.className = "dc3-our-team-card__photo";
      if (church.photo) {
        var img = document.createElement("img");
        img.src = church.photo;
        img.alt = formatPastorNames(church.pastors) + ", " + church.name;
        img.setAttribute("loading", "lazy");
        img.setAttribute("decoding", "async");
        photo.appendChild(img);
        photo.classList.add("is-clickable");
        photo.setAttribute("role", "button");
        photo.setAttribute("tabindex", "0");
        photo.setAttribute(
          "aria-label",
          "View larger photo of " + formatPastorNames(church.pastors)
        );
        photo.setAttribute("data-pastor-photo-trigger", "");
        photo.setAttribute("data-photo-src", church.photo);
        photo.setAttribute(
          "data-photo-title",
          formatPastorNames(church.pastors)
        );
        photo.setAttribute("data-photo-subtitle", church.name);
      } else {
        photo.classList.add("dc3-our-team-card__photo--placeholder");
        photo.innerHTML = '<i class="bi bi-person-fill" aria-hidden="true"></i>';
      }
      card.appendChild(photo);

      var content = document.createElement("div");
      content.className = "dc3-our-team-card__content";

      var church_p = document.createElement("p");
      church_p.className = "dc3-our-team-card__church";
      church_p.textContent = church.name;
      content.appendChild(church_p);

      var names = document.createElement("h4");
      names.className = "dc3-our-team-card__names";
      names.textContent = formatPastorNames(church.pastors);
      content.appendChild(names);

      if (church.city) {
        var city = document.createElement("p");
        city.className = "dc3-our-team-card__city";
        city.textContent = church.city;
        content.appendChild(city);
      }

      card.appendChild(content);
      return card;
    }

    function formatPastorNames(pastors) {
      if (!pastors || !pastors.length) return "Pastoral Team";
      if (pastors.length === 1) {
        return "Pastor " + pastors[0];
      }
      var firstNames = pastors.map(function (n) {
        return n.split(" ")[0];
      });
      if (firstNames.length === 2) {
        return "Pastors " + firstNames[0] + " & " + firstNames[1];
      }
      var last = firstNames[firstNames.length - 1];
      return "Pastors " + firstNames.slice(0, -1).join(", ") + " & " + last;
    }

    function scrollToRegionStart() {
      var summary = grid.querySelector("[data-our-team-region-summary]");
      if (!summary) return;

      var nav = document.getElementById("mainNav");
      var pills = grid.querySelector(".dc3-country-pills-wrap");
      var navH = nav ? nav.offsetHeight : 64;
      var pillsH = pills ? pills.offsetHeight : 0;
      var gap = 16;

      var top = summary.getBoundingClientRect().top + window.pageYOffset
        - navH - pillsH - gap;
      if (top < 0) top = 0;

      var prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      try {
        window.scrollTo({
          top: top,
          behavior: prefersReduced ? "auto" : "smooth"
        });
      } catch (err) {
        window.scrollTo(0, top);
      }
    }
  }

  function initConnectGroupsExplorer() {
    var grid = document.querySelector(".dc3-connect__grid");
    if (!grid) return;

    var data = window.DC3_CONNECT_GROUPS;
    if (!data || !data.regions) return;

    var listEl = grid.querySelector("[data-connect-country-list]");
    var cardsEl = grid.querySelector("[data-connect-grid]");
    var emptyEl = grid.querySelector("[data-connect-empty]");
    var titleEl = grid.querySelector("[data-connect-region-title]");
    var eyebrowEl = grid.querySelector("[data-connect-region-eyebrow]");
    var countEl = grid.querySelector("[data-connect-region-count]");
    var flagEl = grid.querySelector("[data-connect-region-flag]");

    if (!cardsEl) return;

    var allowedRegions = data.order && data.order.length
      ? data.order.slice()
      : Object.keys(data.regions);

    var defaultRegion = allowedRegions[0] || "";
    var hashRegion = parseHashRegion();
    var initialRegion = (hashRegion && allowedRegions.indexOf(hashRegion) !== -1)
      ? hashRegion
      : defaultRegion;

    if (listEl) renderCountryList();
    setRegion(initialRegion);

    window.addEventListener("hashchange", function () {
      var next = parseHashRegion();
      if (next && allowedRegions.indexOf(next) !== -1) {
        setRegion(next);
      }
    });

    function parseHashRegion() {
      var raw = (window.location.hash || "").replace(/^#/, "").toLowerCase();
      return raw && allowedRegions.indexOf(raw) !== -1 ? raw : "";
    }

    function renderCountryList() {
      listEl.innerHTML = "";

      allowedRegions.forEach(function (key) {
        var region = data.regions[key];
        if (!region) return;

        var count = (region.groups && region.groups.length) || 0;
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "dc3-country-pill";
        btn.setAttribute("data-region", key);
        btn.setAttribute("role", "tab");
        btn.setAttribute("aria-selected", "false");
        btn.setAttribute(
          "aria-label",
          region.label + " — " + count + " " + (count === 1 ? "group" : "groups")
        );

        if (region.flag) {
          var flag = document.createElement("img");
          flag.className = "dc3-country-pill__flag";
          flag.src = region.flag;
          flag.alt = "";
          flag.setAttribute("aria-hidden", "true");
          flag.setAttribute("loading", "lazy");
          flag.setAttribute("decoding", "async");
          flag.width = 18;
          flag.height = 18;
          btn.appendChild(flag);
        }

        var name = document.createElement("span");
        name.className = "dc3-country-pill__name";
        name.textContent = region.label;
        btn.appendChild(name);

        var badge = document.createElement("span");
        badge.className = "dc3-country-pill__count";
        badge.textContent = count;
        badge.setAttribute("aria-hidden", "true");
        btn.appendChild(badge);

        attachRegionHandlers(btn, key);
        listEl.appendChild(btn);
      });
    }

    function attachRegionHandlers(el, key) {
      el.addEventListener("click", function () {
        setRegion(key, { updateHash: true });
      });

      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setRegion(key, { updateHash: true });
        }
      });
    }

    function setRegion(key, opts) {
      opts = opts || {};
      var safe = allowedRegions.indexOf(key) !== -1 ? key : defaultRegion;
      var region = data.regions[safe];
      if (!region) return;

      grid.setAttribute("data-active-region", safe);

      if (listEl) {
        var items = listEl.querySelectorAll(".dc3-country-pill");
        items.forEach(function (btn) {
          var isActive = btn.getAttribute("data-region") === safe;
          btn.classList.toggle("is-active", isActive);
          btn.setAttribute("aria-selected", isActive ? "true" : "false");
        });
      }

      if (titleEl) titleEl.textContent = region.label;
      if (eyebrowEl) eyebrowEl.textContent = "Connect groups in";
      if (countEl) {
        var n = (region.groups && region.groups.length) || 0;
        countEl.textContent = n + " " + (n === 1 ? "group" : "groups");
      }
      if (flagEl) {
        if (region.flag) {
          flagEl.setAttribute("src", region.flag);
          flagEl.classList.remove("d-none");
        } else {
          flagEl.classList.add("d-none");
        }
      }

      renderGroups(region.groups || []);

      if (opts.updateHash && window.history && window.history.replaceState) {
        try {
          window.history.replaceState(null, "", "#" + safe);
        } catch (err) { /* no-op */ }
      }

      if (opts.updateHash) {
        scrollToRegionStart();
      }
    }

    function scrollToRegionStart() {
      var summary = grid.querySelector("[data-connect-region-summary]");
      if (!summary) return;

      var nav = document.getElementById("mainNav");
      var pills = grid.querySelector(".dc3-country-pills-wrap");
      var navH = nav ? nav.offsetHeight : 64;
      var pillsH = pills ? pills.offsetHeight : 0;
      var gap = 16;

      var top = summary.getBoundingClientRect().top + window.pageYOffset
        - navH - pillsH - gap;
      if (top < 0) top = 0;

      var prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      try {
        window.scrollTo({
          top: top,
          behavior: prefersReduced ? "auto" : "smooth"
        });
      } catch (err) {
        window.scrollTo(0, top);
      }
    }

    function renderGroups(groups) {
      cardsEl.innerHTML = "";

      if (!groups.length) {
        cardsEl.classList.add("d-none");
        if (emptyEl) emptyEl.classList.remove("d-none");
        return;
      }

      cardsEl.classList.remove("d-none");
      if (emptyEl) emptyEl.classList.add("d-none");

      groups.forEach(function (group) {
        cardsEl.appendChild(buildConnectGroupCard(group));
      });
    }

    function buildConnectGroupCard(group) {
      var card = document.createElement("article");
      card.className = "dc3-church-card";

      var head = document.createElement("header");
      head.className = "dc3-church-card__head";

      var title = document.createElement("h3");
      title.className = "dc3-church-card__name";
      title.textContent = group.location;
      head.appendChild(title);

      if (group.dynamics) {
        var tags = document.createElement("div");
        tags.className = "dc3-church-card__tags";
        var t = document.createElement("span");
        t.className = "dc3-church-card__tag";
        t.textContent = group.dynamics;
        tags.appendChild(t);
        head.appendChild(tags);
      }

      card.appendChild(head);

      var body = document.createElement("div");
      body.className = "dc3-church-card__body";

      if (group.leaders && group.leaders.length) {
        body.appendChild(
          buildConnectRow(
            "bi-person-fill",
            group.leaders.length === 1 ? "Leader" : "Leaders",
            group.leaders.join(" & ")
          )
        );
      }

      if (group.meetFrequency) {
        body.appendChild(
          buildConnectRow("bi-calendar-event-fill", "Meet", group.meetFrequency)
        );
      }

      card.appendChild(body);
      return card;
    }

    function buildConnectRow(iconClass, label, value) {
      var row = document.createElement("div");
      row.className = "dc3-church-card__row";

      var icon = document.createElement("span");
      icon.className = "dc3-church-card__icon";
      icon.innerHTML = '<i class="bi ' + iconClass + '" aria-hidden="true"></i>';
      row.appendChild(icon);

      var content = document.createElement("div");
      content.className = "dc3-church-card__content";

      var labelEl = document.createElement("span");
      labelEl.className = "dc3-church-card__label";
      labelEl.textContent = label;
      content.appendChild(labelEl);

      var valEl = document.createElement("span");
      valEl.className = "dc3-church-card__value";
      valEl.textContent = value;
      content.appendChild(valEl);

      row.appendChild(content);
      return row;
    }
  }

  function initSmoothScrollOffset() {
    var links = document.querySelectorAll('a[href^="#"]');
    links.forEach(function (link) {
      link.addEventListener("click", function (e) {
        var href = link.getAttribute("href");
        if (!href || href === "#" || href.length < 2) return;

        var target;
        try {
          target = document.querySelector(href);
        } catch (err) {
          return;
        }
        if (!target) return;

        e.preventDefault();

        var nav = document.getElementById("mainNav");
        var offset = nav ? nav.offsetHeight : 0;
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset + 1;

        window.scrollTo({
          top: top,
          behavior: "smooth"
        });

        var collapseEl = document.getElementById("dc3Nav");
        if (collapseEl && collapseEl.classList.contains("show")) {
          var bsCollapse = window.bootstrap &&
            window.bootstrap.Collapse.getInstance(collapseEl);
          if (bsCollapse) bsCollapse.hide();
        }
      });
    });
  }
})();
