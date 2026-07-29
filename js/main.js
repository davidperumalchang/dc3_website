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
    initCopyButtons();
    initMinistryModal();
    initContactForm();
    initBackToTop();
  });

  /* =========================================================
     CONTACT FORM (contact.html)
     - Submits #contactForm to Formspree via fetch (no page reload)
     - Runs native HTML5 validation first
     - Shows a custom Bootstrap success modal on success
     - Reveals an inline error alert on failure
     ========================================================= */
  function initContactForm() {
    var form = document.getElementById("contactForm");
    if (!form) return;

    var submitBtn = form.querySelector('button[type="submit"]');
    var errorEl = document.getElementById("contactFormError");
    var modalEl = document.getElementById("contactSuccessModal");
    var bsAvailable = window.bootstrap && window.bootstrap.Modal;
    var modal = bsAvailable && modalEl
      ? new window.bootstrap.Modal(modalEl)
      : null;

    function hideError() {
      if (errorEl) errorEl.classList.add("d-none");
    }

    function showError() {
      if (errorEl) errorEl.classList.remove("d-none");
    }

    function setLoading(isLoading) {
      if (!submitBtn) return;
      if (isLoading) {
        submitBtn.dataset.originalHtml = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.setAttribute("aria-busy", "true");
        submitBtn.innerHTML =
          'Sending\u2026 <i class="bi bi-arrow-repeat ms-1 dc3-spin" aria-hidden="true"></i>';
      } else {
        submitBtn.disabled = false;
        submitBtn.removeAttribute("aria-busy");
        if (submitBtn.dataset.originalHtml) {
          submitBtn.innerHTML = submitBtn.dataset.originalHtml;
          delete submitBtn.dataset.originalHtml;
        }
      }
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      hideError();

      var isValid = true;
      try {
        isValid = form.checkValidity();
      } catch (err) {
        isValid = true; /* don't block submit on a bad pattern attribute */
      }
      if (!isValid) {
        form.classList.add("was-validated");
        return;
      }

      if (typeof window.fetch !== "function") {
        form.submit();
        return;
      }

      setLoading(true);

      fetch(form.action, {
        method: (form.method || "POST").toUpperCase(),
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (response) {
          if (!response.ok) throw new Error("Request failed");
          form.reset();
          form.classList.remove("was-validated");
          if (modal) {
            modal.show();
          } else {
            showError();
          }
        })
        .catch(function () {
          showError();
        })
        .then(function () {
          setLoading(false);
        });
    });
  }

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
     PASTORAL TEAM — shared helpers (locations.html + our-team.html)
     - Groups a region's church entries into one "location" per
       name + city (a location may host several pastoral teams, e.g.
       different language congregations meeting at one address).
     - Builds + controls the shared "View Pastoral Team" modal.
     ========================================================= */
  function groupChurchesByLocation(churches) {
    var byKey = {};
    var order = [];

    (churches || []).forEach(function (c) {
      var key =
        String(c.name || "").trim().toLowerCase() +
        "||" +
        String(c.city || "").trim().toLowerCase();

      if (!byKey[key]) {
        byKey[key] = {
          name: c.name || "",
          city: c.city || "",
          address: c.address || "",
          socials: c.socials || null,
          languages: [],
          teams: []
        };
        order.push(key);
      }

      var group = byKey[key];
      (c.languages || []).forEach(function (lang) {
        if (group.languages.indexOf(lang) === -1) {
          group.languages.push(lang);
        }
      });
      if (!group.address && c.address) group.address = c.address;
      if (!group.socials && c.socials) group.socials = c.socials;
      group.teams.push({
        pastors: c.pastors || [],
        languages: c.languages || [],
        photo: c.photo || "",
        serviceTimes: c.serviceTimes || []
      });
    });

    return order.map(function (k) { return byKey[k]; });
  }

  /* Joins pastor full names for the modal list, preserving titles
     (e.g. "Dr Donald De Rozario & Joan Rozario"). */
  function joinPastors(pastors) {
    if (!pastors || !pastors.length) return "Pastoral Team";
    if (pastors.length === 1) return pastors[0];
    if (pastors.length === 2) return pastors[0] + " & " + pastors[1];
    var last = pastors[pastors.length - 1];
    return pastors.slice(0, -1).join(", ") + " & " + last;
  }

  function buildTeamItem(team) {
    var item = document.createElement("div");
    item.className = "dc3-team-pop__item";

    var photoWrap = document.createElement("div");
    photoWrap.className = "dc3-team-pop__photo";
    if (team.photo) {
      var img = document.createElement("img");
      img.src = team.photo;
      img.alt = joinPastors(team.pastors);
      img.setAttribute("loading", "lazy");
      img.setAttribute("decoding", "async");
      photoWrap.appendChild(img);
    } else {
      photoWrap.classList.add("is-placeholder");
      photoWrap.innerHTML = '<i class="bi bi-person-fill" aria-hidden="true"></i>';
    }
    item.appendChild(photoWrap);

    var info = document.createElement("div");
    info.className = "dc3-team-pop__info";

    var names = document.createElement("h4");
    names.className = "dc3-team-pop__names";
      names.textContent = joinPastors(team.pastors);
    info.appendChild(names);

    if (team.languages && team.languages.length) {
      var tags = document.createElement("div");
      tags.className = "dc3-team-pop__tags";
      team.languages.forEach(function (lang) {
        var t = document.createElement("span");
        t.className = "dc3-team-pop__tag";
        t.textContent = lang;
        tags.appendChild(t);
      });
      info.appendChild(tags);
    }

    item.appendChild(info);
    return item;
  }

  /* Controller for the shared #pastoralTeamModal. Safe no-op when the
     modal isn't on the page or Bootstrap is unavailable. */
  function createTeamModalController() {
    var modalEl = document.getElementById("pastoralTeamModal");
    if (!modalEl) return { open: function () {} };

    var titleEl = modalEl.querySelector("[data-team-modal-title]");
    var subtitleEl = modalEl.querySelector("[data-team-modal-subtitle]");
    var bodyEl = modalEl.querySelector("[data-team-modal-body]");
    var modal =
      window.bootstrap && window.bootstrap.Modal
        ? new window.bootstrap.Modal(modalEl)
        : null;

    function open(location) {
      if (titleEl) titleEl.textContent = location.name || "Pastoral Team";
      if (subtitleEl) {
        var subtitleTextEl = subtitleEl.querySelector("span") || subtitleEl;
        if (location.city) {
          subtitleTextEl.textContent = location.city;
          subtitleEl.hidden = false;
        } else {
          subtitleTextEl.textContent = "";
          subtitleEl.hidden = true;
        }
      }
      if (bodyEl) {
        bodyEl.innerHTML = "";
        (location.teams || []).forEach(function (team) {
          bodyEl.appendChild(buildTeamItem(team));
        });
      }
      if (modal) modal.show();
    }

    return { open: open };
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

    var teamModal = createTeamModalController();

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

    // Returns the count shown in pills/summary. A region may override the
    // actual number of church cards via `displayCount` (client request).
    function locationsRegionChurchCount(region) {
      if (region && typeof region.displayCount === "number") {
        return region.displayCount;
      }
      return groupChurchesByLocation((region && region.churches) || []).length;
    }

    function renderCountryList() {
      listEl.innerHTML = "";

      allowedRegions.forEach(function (key) {
        var region = data.regions[key];
        if (!region) return;

        var count = locationsRegionChurchCount(region);
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
        var n = locationsRegionChurchCount(region);
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

      var locations = groupChurchesByLocation(churches);
      locations.forEach(function (location) {
        cardsEl.appendChild(buildChurchCard(location));
      });
    }

    function buildChurchCard(location) {
      var card = document.createElement("article");
      card.className = "dc3-church-card";

      var head = document.createElement("header");
      head.className = "dc3-church-card__head";

      var title = document.createElement("h3");
      title.className = "dc3-church-card__name";
      title.textContent = location.name;
      head.appendChild(title);

      if (location.languages && location.languages.length) {
        var tags = document.createElement("div");
        tags.className = "dc3-church-card__tags";
        location.languages.forEach(function (lang) {
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

      if (location.address) {
        body.appendChild(
          buildRow("bi-geo-alt-fill", "Address", location.address, location.city)
        );
      }

      var serviceTimes = buildServiceTimes(location);
      if (serviceTimes) {
        body.appendChild(serviceTimes);
      }

      body.appendChild(buildTeamButton(location));

      card.appendChild(body);

      var socials = location.socials;
      var hasSocials = socials && (socials.facebook || socials.instagram);
      var hasMap = !!location.address;

      if (hasSocials || hasMap) {
        var foot = document.createElement("div");
        foot.className = "dc3-church-card__foot";

        if (hasSocials) {
          foot.appendChild(buildChurchSocials(socials));
        }

        if (hasMap) {
          var mapLink = document.createElement("a");
          mapLink.className = "dc3-church-card__cta";
          mapLink.href =
            "https://www.google.com/maps/search/?api=1&query=" +
            encodeURIComponent(location.address);
          mapLink.target = "_blank";
          mapLink.rel = "noopener noreferrer";
          mapLink.innerHTML =
            'View Map <i class="bi bi-arrow-up-right ms-1"></i>';
          foot.appendChild(mapLink);
        }

        card.appendChild(foot);
      }

      return card;
    }

    function buildTeamButton(location) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "dc3-team-btn";
      btn.innerHTML =
        '<i class="bi bi-people" aria-hidden="true"></i><span>View Pastoral Team</span>';
      btn.setAttribute("aria-label", "View pastoral team for " + location.name);
      btn.addEventListener("click", function () {
        teamModal.open(location);
      });
      return btn;
    }

    /* Service times as one "Language · Time" line per congregation.
       Identical lines are de-duplicated (e.g. the Main Church teams that
       share a service time). Falls back gracefully when times are unset. */
    function buildServiceTimes(location) {
      var teams = (location && location.teams) || [];
      var seen = {};
      var lines = [];

      teams.forEach(function (t) {
        var langText = (t.languages && t.languages.length)
          ? t.languages.join(" / ")
          : "";
        var timeText = (t.serviceTimes && t.serviceTimes.length)
          ? t.serviceTimes.join(" · ")
          : "";
        var key = langText + "||" + timeText;
        if (seen[key]) return;
        seen[key] = true;
        lines.push({ lang: langText, time: timeText });
      });

      if (!lines.length) return null;

      var row = document.createElement("div");
      row.className = "dc3-church-card__row";

      var icon = document.createElement("span");
      icon.className = "dc3-church-card__icon";
      icon.innerHTML = '<i class="bi bi-clock-fill" aria-hidden="true"></i>';
      row.appendChild(icon);

      var content = document.createElement("div");
      content.className = "dc3-church-card__content";

      var labelEl = document.createElement("span");
      labelEl.className = "dc3-church-card__label";
      labelEl.textContent = "Service Times";
      content.appendChild(labelEl);

      var svcWrap = document.createElement("div");
      svcWrap.className = "dc3-svc";

      lines.forEach(function (line) {
        var entry = document.createElement("div");
        entry.className = "dc3-svc__entry";

        var timeEl = document.createElement("span");
        timeEl.className = "dc3-svc__time";
        timeEl.textContent = line.time || "Service times on request";
        entry.appendChild(timeEl);

        if (line.lang) {
          var langEl = document.createElement("span");
          langEl.className = "dc3-svc__lang";
          langEl.textContent = line.lang;
          entry.appendChild(langEl);
        }

        svcWrap.appendChild(entry);
      });

      content.appendChild(svcWrap);

      row.appendChild(content);
      return row;
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

    function regionChurchCount(region) {
      var churches = (region && region.churches) || [];
      return groupChurchesByCouple(churches).length;
    }

    function renderCountryList() {
      listEl.innerHTML = "";

      allowedRegions.forEach(function (key) {
        var region = data.regions[key];
        if (!region) return;

        var count = regionChurchCount(region);
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
        var n = regionChurchCount(region);
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

      var couples = groupChurchesByCouple(churches);
      couples.forEach(function (couple) {
        cardsEl.appendChild(buildCoupleCard(couple));
      });
    }

    /* Groups a region's congregation entries into one entry per pastoral
       couple. A couple who pastors several churches (e.g. a Tamil couple
       across two campuses) collapses into a single card listing all their
       locations. Languages are unioned; the lead flag flows through. */
    function groupChurchesByCouple(churches) {
      var byKey = {};
      var order = [];

      (churches || []).forEach(function (c) {
        var key = (c.pastors || [])
          .map(function (p) { return String(p).trim().toLowerCase(); })
          .join(" & ");
        if (!key) key = String(c.name || "").trim().toLowerCase();

        if (!byKey[key]) {
          byKey[key] = {
            pastors: (c.pastors || []).slice(),
            photo: c.photo || "",
            lead: !!c.lead,
            languages: [],
            locations: []
          };
          order.push(key);
        }

        var couple = byKey[key];
        if (!couple.photo && c.photo) couple.photo = c.photo;
        if (c.lead) couple.lead = true;

        (c.languages || []).forEach(function (lang) {
          if (couple.languages.indexOf(lang) === -1) couple.languages.push(lang);
        });

        var loc = stripBrand(c.name || "");
        if (loc && couple.locations.indexOf(loc) === -1) couple.locations.push(loc);
      });

      return order.map(function (k) { return byKey[k]; });
    }

    /* "Destiny C3 Shah Alam" -> "Shah Alam" for the card's location line. */
    function stripBrand(name) {
      return String(name || "").replace(/^destiny\s+c3\s+/i, "").trim();
    }

    function buildCoupleCard(couple) {
      var card = document.createElement("article");
      card.className = "dc3-team-card";

      var photoWrap = document.createElement("div");
      photoWrap.className = "dc3-team-card__photo";
      if (couple.photo) {
        var img = document.createElement("img");
        img.src = couple.photo;
        img.alt = joinPastors(couple.pastors);
        img.setAttribute("loading", "lazy");
        img.setAttribute("decoding", "async");
        photoWrap.appendChild(img);
      } else {
        photoWrap.classList.add("is-placeholder");
        photoWrap.innerHTML =
          '<i class="bi bi-people-fill" aria-hidden="true"></i>';
      }
      card.appendChild(photoWrap);

      var body = document.createElement("div");
      body.className = "dc3-team-card__body";

      var names = document.createElement("h3");
      names.className = "dc3-team-card__names";
      names.textContent = joinPastors(couple.pastors);
      body.appendChild(names);

      if (couple.locations && couple.locations.length) {
        var meta = document.createElement("span");
        meta.className = "dc3-team-card__meta";
        meta.innerHTML = '<i class="bi bi-geo-alt-fill" aria-hidden="true"></i>';
        var locText = document.createElement("span");
        locText.textContent = couple.locations.join(" · ");
        meta.appendChild(locText);
        body.appendChild(meta);
      }

      if (couple.languages && couple.languages.length) {
        var tags = document.createElement("div");
        tags.className = "dc3-team-card__tags";
        couple.languages.forEach(function (lang) {
          var t = document.createElement("span");
          t.className = "dc3-team-card__tag";
          t.textContent = lang;
          tags.appendChild(t);
        });
        body.appendChild(tags);
      }

      card.appendChild(body);
      return card;
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
