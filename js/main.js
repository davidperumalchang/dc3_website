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
    initConnectNavDropdown();
    initFooterYear();
    initSmoothScrollOffset();
    initLocationsExplorer();
    initConnectGroupsExplorer();
  });

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

  function initConnectNavDropdown() {
    var toggle = document.getElementById("connectNavDropdown");
    if (!toggle) return;

    var parent = toggle.closest(".dropdown");
    var menu = parent && parent.querySelector(".dropdown-menu");
    if (!parent || !menu) return;

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
        var li = document.createElement("li");
        li.className = "dc3-country";
        li.setAttribute("data-region", key);
        li.setAttribute("tabindex", "0");
        li.setAttribute("role", "button");
        li.setAttribute("aria-pressed", "false");
        li.setAttribute(
          "aria-label",
          region.label + " — " + count + " " + (count === 1 ? "church" : "churches")
        );

        var head = document.createElement("div");
        head.className = "dc3-country__head";

        var name = document.createElement("h3");
        name.className = "dc3-country__name";
        name.textContent = region.label;

        var badge = document.createElement("span");
        badge.className = "dc3-country__badge";
        badge.textContent = count + " " + (count === 1 ? "church" : "churches");

        head.appendChild(name);
        head.appendChild(badge);
        li.appendChild(head);

        if (region.tagline) {
          var tag = document.createElement("p");
          tag.className = "dc3-country__tagline";
          tag.textContent = region.tagline;
          li.appendChild(tag);
        }

        attachRegionHandlers(li, key);
        listEl.appendChild(li);
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

      var items = listEl.querySelectorAll(".dc3-country");
      items.forEach(function (li) {
        var isActive = li.getAttribute("data-region") === safe;
        li.classList.toggle("is-active", isActive);
        li.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      if (titleEl) titleEl.textContent = region.label;
      if (eyebrowEl) eyebrowEl.textContent = "Churches in";
      if (countEl) {
        var n = (region.churches && region.churches.length) || 0;
        countEl.textContent = n + " " + (n === 1 ? "church" : "churches");
      }

      renderChurches(region.churches || []);

      if (opts.updateHash && window.history && window.history.replaceState) {
        try {
          window.history.replaceState(null, "", "#" + safe);
        } catch (err) { /* no-op */ }
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
        body.appendChild(
          buildRow(
            "bi-people-fill",
            church.pastors.length === 1 ? "Pastor" : "Pastors",
            church.pastors.join(", ")
          )
        );
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

        var count = (region.groups && region.groups.length) || 0;
        var li = document.createElement("li");
        li.className = "dc3-country";
        li.setAttribute("data-region", key);
        li.setAttribute("tabindex", "0");
        li.setAttribute("role", "button");
        li.setAttribute("aria-pressed", "false");
        li.setAttribute(
          "aria-label",
          region.label + " — " + count + " " + (count === 1 ? "group" : "groups")
        );

        var head = document.createElement("div");
        head.className = "dc3-country__head";

        var name = document.createElement("h3");
        name.className = "dc3-country__name";
        name.textContent = region.label;

        var badge = document.createElement("span");
        badge.className = "dc3-country__badge";
        badge.textContent = count + " " + (count === 1 ? "group" : "groups");

        head.appendChild(name);
        head.appendChild(badge);
        li.appendChild(head);

        if (region.tagline) {
          var tag = document.createElement("p");
          tag.className = "dc3-country__tagline";
          tag.textContent = region.tagline;
          li.appendChild(tag);
        }

        attachRegionHandlers(li, key);
        listEl.appendChild(li);
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

      var items = listEl.querySelectorAll(".dc3-country");
      items.forEach(function (li) {
        var isActive = li.getAttribute("data-region") === safe;
        li.classList.toggle("is-active", isActive);
        li.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      if (titleEl) titleEl.textContent = region.label;
      if (eyebrowEl) eyebrowEl.textContent = "Connect groups in";
      if (countEl) {
        var n = (region.groups && region.groups.length) || 0;
        countEl.textContent = n + " " + (n === 1 ? "group" : "groups");
      }

      renderGroups(region.groups || []);

      if (opts.updateHash && window.history && window.history.replaceState) {
        try {
          window.history.replaceState(null, "", "#" + safe);
        } catch (err) { /* no-op */ }
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
