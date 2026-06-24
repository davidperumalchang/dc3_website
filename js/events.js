/* =========================================================
   Destiny C3 — events.js
   ---------------------------------------------------------
   Fetches upcoming events from a public Google Calendar via
   the Calendar API (read-only, API-key access) and renders:
     - the agenda + month calendar on events.html
     - the "What's Happening" teaser on index.html
   ========================================================= */
(function () {
  "use strict";

  var CONFIG = {
    apiKey: "AIzaSyDEFgpk_t3wpLebGt9074ecueK97GAcHQ0",
    calendarId: "cthree.subang@gmail.com",

    // Events are shown in this timezone (church local time, GMT+8).
    timeZone: "Asia/Kuala_Lumpur",
    // Max number of upcoming events to show on the events page.
    maxResults: 12,
    // Only show events starting within this many months from now.
    monthsAhead: 12
  };

  document.addEventListener("DOMContentLoaded", function () {
    initEventsPage();
    initTeaser();
  });

  function isConfigured(config) {
    return !!(config && config.apiKey && config.calendarId);
  }

  /* =========================================================
     EVENTS PAGE (events.html)
     ========================================================= */
  function initEventsPage() {
    var root = document.querySelector("[data-events]");
    if (!root) return;

    var els = {
      grid: root.querySelector("[data-events-grid]"),
      loading: root.querySelector("[data-events-loading]"),
      empty: root.querySelector("[data-events-empty]"),
      error: root.querySelector("[data-events-error]"),
      errorText: root.querySelector("[data-events-error-text]")
    };

    var config = CONFIG;

    if (!isConfigured(config)) {
      showError(
        els,
        "We're having trouble loading events right now. Please try again later."
      );
      return;
    }

    var timeZone = config.timeZone || "Asia/Kuala_Lumpur";
    var maxResults = clampInt(config.maxResults, 1, 50, 12);
    var monthsAhead = clampInt(config.monthsAhead, 1, 60, 12);

    fetchEvents(config, maxResults, monthsAhead)
      .then(function (events) {
        renderEvents(els, events, timeZone);
      })
      .catch(function (err) {
        showError(
          els,
          "We couldn't load events right now. Please try again later."
        );
        if (window.console && console.error) {
          console.error("[DC3 events]", err);
        }
      });
  }

  /* =========================================================
     HOMEPAGE TEASER (index.html)
     - Hidden by default; only revealed once a few upcoming
       events load successfully.
     ========================================================= */
  function initTeaser() {
    var root = document.querySelector("[data-events-teaser]");
    if (!root) return;

    var listEl = root.querySelector("[data-teaser-list]");
    if (!listEl) return;

    var config = CONFIG;
    if (!isConfigured(config)) return;

    var timeZone = config.timeZone || "Asia/Kuala_Lumpur";
    var monthsAhead = clampInt(config.monthsAhead, 1, 60, 12);

    fetchEvents(config, 3, monthsAhead)
      .then(function (events) {
        var parsed = [];
        events.forEach(function (event) {
          var when = parseWhen(event, timeZone);
          if (when) parsed.push({ event: event, when: when });
        });

        if (!parsed.length) return;

        listEl.innerHTML = "";
        parsed.slice(0, 3).forEach(function (item, idx) {
          listEl.appendChild(buildTeaserCard(item.event, item.when, idx === 0));
        });

        root.classList.remove("d-none");
      })
      .catch(function (err) {
        if (window.console && console.error) {
          console.error("[DC3 events teaser]", err);
        }
      });
  }

  function buildTeaserCard(event, when, featured) {
    var card = document.createElement("a");
    card.className = "dc3-teaser-event" + (featured ? " is-featured" : "");
    card.href = "events.html";

    var date = document.createElement("span");
    date.className = "dc3-teaser-event__date";
    date.innerHTML =
      '<span class="dc3-teaser-event__day">' +
      when.badgeDay +
      '</span><span class="dc3-teaser-event__month">' +
      when.badgeMonth +
      "</span>";
    card.appendChild(date);

    var body = document.createElement("span");
    body.className = "dc3-teaser-event__body";

    var title = document.createElement("span");
    title.className = "dc3-teaser-event__title";
    title.textContent = event.summary || "Untitled event";
    body.appendChild(title);

    var meta = document.createElement("span");
    meta.className = "dc3-teaser-event__meta";
    meta.textContent = when.label;
    body.appendChild(meta);

    card.appendChild(body);
    return card;
  }

  function fetchEvents(config, maxResults, monthsAhead) {
    var now = new Date();
    var timeMin = now.toISOString();

    var max = new Date(now.getTime());
    max.setMonth(max.getMonth() + monthsAhead);
    var timeMax = max.toISOString();

    var params = new URLSearchParams({
      key: config.apiKey,
      timeMin: timeMin,
      timeMax: timeMax,
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: String(maxResults)
    });

    var url =
      "https://www.googleapis.com/calendar/v3/calendars/" +
      encodeURIComponent(config.calendarId) +
      "/events?" +
      params.toString();

    return fetch(url, { headers: { Accept: "application/json" } }).then(
      function (res) {
        if (!res.ok) {
          return res
            .json()
            .catch(function () {
              return null;
            })
            .then(function (body) {
              var msg =
                body && body.error && body.error.message
                  ? body.error.message
                  : "HTTP " + res.status;
              throw new Error(msg);
            });
        }
        return res.json();
      }
    ).then(function (data) {
      return (data && data.items) || [];
    });
  }

  function renderEvents(els, events, timeZone) {
    if (els.loading) els.loading.classList.add("d-none");

    var parsed = [];
    events.forEach(function (event) {
      var when = parseWhen(event, timeZone);
      if (when) parsed.push({ event: event, when: when });
    });

    // Maps a date key (YYYY-MM-DD) -> id of the first event row on that day.
    var dateIndex = {};

    if (!parsed.length) {
      if (els.grid) els.grid.classList.add("d-none");
      if (els.empty) els.empty.classList.remove("d-none");
      initCalendar(parsed, dateIndex, timeZone);
      return;
    }

    if (els.empty) els.empty.classList.add("d-none");
    if (els.error) els.error.classList.add("d-none");
    if (!els.grid) {
      initCalendar(parsed, dateIndex, timeZone);
      return;
    }

    els.grid.innerHTML = "";
    els.grid.classList.remove("d-none");

    // Group sequentially by month label (events arrive sorted by start time).
    var currentMonth = null;
    var listEl = null;

    parsed.forEach(function (item, idx) {
      if (item.when.monthLabel !== currentMonth) {
        currentMonth = item.when.monthLabel;

        var section = document.createElement("section");
        section.className = "dc3-events-month";

        var heading = document.createElement("h2");
        heading.className = "dc3-events-month__title";
        heading.textContent = currentMonth;
        section.appendChild(heading);

        listEl = document.createElement("div");
        listEl.className = "dc3-events-list";
        section.appendChild(listEl);

        els.grid.appendChild(section);
      }

      var rowEl = buildEventRow(item.event, item.when, idx === 0);
      rowEl.id = "dc3-evt-" + idx;
      if (item.when.startKey && !dateIndex[item.when.startKey]) {
        dateIndex[item.when.startKey] = rowEl.id;
      }
      listEl.appendChild(rowEl);
    });

    initCalendar(parsed, dateIndex, timeZone);
  }

  /* =========================================================
     MONTH CALENDAR WIDGET (events.html)
     - Mon-first grid. Days with events are filled + clickable
       (scrolls to that day's first event). Prev/next navigate
       months. Defaults to the month of the next upcoming event.
     ========================================================= */
  function initCalendar(parsed, dateIndex, timeZone) {
    var cal = document.querySelector("[data-events-calendar]");
    if (!cal) return;

    var titleEl = cal.querySelector("[data-cal-title]");
    var gridEl = cal.querySelector("[data-cal-grid]");
    var prevBtn = cal.querySelector("[data-cal-prev]");
    var nextBtn = cal.querySelector("[data-cal-next]");
    var toggleBtn = cal.querySelector("[data-cal-toggle]");
    if (!titleEl || !gridEl) return;

    // Mobile-only collapse toggle (hidden on desktop via CSS).
    if (toggleBtn) {
      toggleBtn.addEventListener("click", function () {
        var open = cal.classList.toggle("is-open");
        toggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var todayKey = isoKey(new Date(), timeZone);

    // Default to the first upcoming event's month, else the current month.
    var anchor = parsed.length && parsed[0].when.startKey
      ? parsed[0].when.startKey.split("-")
      : todayKey.split("-");
    var view = { y: parseInt(anchor[0], 10), m: parseInt(anchor[1], 10) - 1 };

    var dows = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    function render() {
      titleEl.textContent = new Date(view.y, view.m, 1).toLocaleDateString(
        "en-US",
        { month: "long", year: "numeric" }
      );

      gridEl.innerHTML = "";

      dows.forEach(function (d, i) {
        var head = document.createElement("span");
        head.className =
          "dc3-events-cal__dow" + (i >= 5 ? " is-weekend" : "");
        head.textContent = d;
        gridEl.appendChild(head);
      });

      var firstOfMonth = new Date(view.y, view.m, 1);
      var startDow = (firstOfMonth.getDay() + 6) % 7; // shift so Monday = 0
      var daysInMonth = new Date(view.y, view.m + 1, 0).getDate();

      for (var b = 0; b < startDow; b++) {
        var blank = document.createElement("span");
        blank.className = "dc3-events-cal__day is-empty";
        gridEl.appendChild(blank);
      }

      for (var day = 1; day <= daysInMonth; day++) {
        var key = view.y + "-" + pad2(view.m + 1) + "-" + pad2(day);
        var targetId = dateIndex[key];
        var cell = document.createElement(targetId ? "button" : "span");
        cell.className = "dc3-events-cal__day";
        cell.textContent = day;

        var dow = new Date(view.y, view.m, day).getDay();
        if (dow === 0 || dow === 6) cell.classList.add("is-weekend");

        if (key === todayKey) cell.classList.add("is-today");

        if (targetId) {
          cell.classList.add("has-event");
          cell.type = "button";
          cell.setAttribute("aria-label", "Jump to events on " + key);
          bindCalendarDay(cell, targetId);
        }

        gridEl.appendChild(cell);
      }
    }

    function bindCalendarDay(cell, targetId) {
      cell.addEventListener("click", function () {
        scrollToRow(targetId);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        view.m -= 1;
        if (view.m < 0) {
          view.m = 11;
          view.y -= 1;
        }
        render();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        view.m += 1;
        if (view.m > 11) {
          view.m = 0;
          view.y += 1;
        }
        render();
      });
    }

    render();
  }

  function scrollToRow(id) {
    var el = document.getElementById(id);
    if (!el) return;

    var nav = document.getElementById("mainNav");
    var offset = (nav ? nav.offsetHeight : 0) + 16;
    var top = el.getBoundingClientRect().top + window.pageYOffset - offset;
    if (top < 0) top = 0;

    var prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    try {
      window.scrollTo({ top: top, behavior: prefersReduced ? "auto" : "smooth" });
    } catch (err) {
      window.scrollTo(0, top);
    }

    el.classList.add("is-highlighted");
    setTimeout(function () {
      el.classList.remove("is-highlighted");
    }, 1600);
  }

  function buildEventRow(event, when, featured) {
    var row = document.createElement("article");
    row.className = "dc3-event-row" + (featured ? " is-featured" : "");

    /* ---- Date badge ---- */
    var date = document.createElement("div");
    date.className = "dc3-event-row__date";

    var day = document.createElement("span");
    day.className = "dc3-event-row__day";
    day.textContent = when.badgeDay;
    date.appendChild(day);

    var weekday = document.createElement("span");
    weekday.className = "dc3-event-row__weekday";
    weekday.textContent = when.badgeWeekday;
    date.appendChild(weekday);

    row.appendChild(date);

    /* ---- Main content ---- */
    var main = document.createElement("div");
    main.className = "dc3-event-row__main";

    var meta = document.createElement("p");
    meta.className = "dc3-event-row__meta";
    meta.textContent = when.label;
    main.appendChild(meta);

    var title = document.createElement("h3");
    title.className = "dc3-event-row__title";
    title.textContent = event.summary || "Untitled event";
    main.appendChild(title);

    if (event.location) {
      var loc = document.createElement("a");
      loc.className = "dc3-event-row__location";
      loc.href =
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(event.location);
      loc.target = "_blank";
      loc.rel = "noopener noreferrer";
      loc.innerHTML = '<i class="bi bi-geo-alt-fill" aria-hidden="true"></i>';
      loc.appendChild(document.createTextNode(" " + event.location));
      main.appendChild(loc);
    }

    if (featured) {
      var desc = cleanDescription(event.description);
      if (desc) {
        var descEl = document.createElement("p");
        descEl.className = "dc3-event-row__desc";
        descEl.textContent = desc;
        main.appendChild(descEl);
      }
    }

    row.appendChild(main);

    /* ---- Actions ---- */
    var actions = document.createElement("div");
    actions.className = "dc3-event-row__actions";

    actions.appendChild(buildAddToCalendar(event, when, featured));

    row.appendChild(actions);

    return row;
  }

  function buildAddToCalendar(event, when, featured) {
    var link = document.createElement("a");
    link.className = featured
      ? "btn btn-dc3 btn-sm dc3-event-row__add"
      : "btn btn-outline-dark btn-sm dc3-event-row__add";
    link.href = googleTemplateUrl(event, when);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.innerHTML =
      '<i class="bi bi-calendar-plus me-1"></i>Add to Calendar';
    return link;
  }

  /* =========================================================
     Date / time helpers
     ========================================================= */

  function parseWhen(event, timeZone) {
    var start = event.start || {};
    var end = event.end || {};

    if (start.date) {
      // All-day event. Dates are plain (no time); end.date is exclusive.
      var startDate = dateFromYmd(start.date);
      if (!startDate) return null;

      var endExclusive = end.date ? dateFromYmd(end.date) : null;
      var lastDay = endExclusive
        ? new Date(endExclusive.getTime() - 24 * 60 * 60 * 1000)
        : startDate;
      var multiDay =
        lastDay && lastDay.getTime() - startDate.getTime() >= 24 * 60 * 60 * 1000;

      var label = fmtDate(startDate, "UTC");
      if (multiDay) {
        label += " – " + fmtDate(lastDay, "UTC");
      }

      return {
        allDay: true,
        multiDay: multiDay,
        badgeDay: fmtPart(startDate, "UTC", { day: "numeric" }),
        badgeMonth: fmtPart(startDate, "UTC", { month: "short" }),
        badgeWeekday: fmtPart(startDate, "UTC", { weekday: "short" }),
        monthLabel: fmtPart(startDate, "UTC", { month: "long", year: "numeric" }),
        startKey: isoKey(startDate, "UTC"),
        label: label,
        gcalStart: ymdCompact(start.date),
        gcalEnd: ymdCompact(end.date || addOneDay(start.date))
      };
    }

    if (start.dateTime) {
      var startDt = new Date(start.dateTime);
      if (isNaN(startDt.getTime())) return null;
      var endDt = end.dateTime ? new Date(end.dateTime) : null;

      var sameDay =
        !endDt ||
        fmtPart(startDt, timeZone, { year: "numeric", month: "2-digit", day: "2-digit" }) ===
          fmtPart(endDt, timeZone, { year: "numeric", month: "2-digit", day: "2-digit" });

      var label = fmtDate(startDt, timeZone) + " · " + fmtTime(startDt, timeZone);
      if (endDt && sameDay) {
        label += " – " + fmtTime(endDt, timeZone);
      } else if (endDt && !sameDay) {
        label +=
          " – " + fmtDate(endDt, timeZone) + " · " + fmtTime(endDt, timeZone);
      }

      return {
        allDay: false,
        multiDay: !!(endDt && !sameDay),
        badgeDay: fmtPart(startDt, timeZone, { day: "numeric" }),
        badgeMonth: fmtPart(startDt, timeZone, { month: "short" }),
        badgeWeekday: fmtPart(startDt, timeZone, { weekday: "short" }),
        monthLabel: fmtPart(startDt, timeZone, { month: "long", year: "numeric" }),
        startKey: isoKey(startDt, timeZone),
        label: label,
        gcalStart: toGcalUtc(startDt),
        gcalEnd: toGcalUtc(endDt || new Date(startDt.getTime() + 60 * 60 * 1000))
      };
    }

    return null;
  }

  function googleTemplateUrl(event, when) {
    var params = new URLSearchParams({
      action: "TEMPLATE",
      text: event.summary || "Event",
      dates: when.gcalStart + "/" + when.gcalEnd
    });
    if (event.location) params.set("location", event.location);
    var desc = cleanDescription(event.description);
    if (desc) params.set("details", desc);
    return "https://calendar.google.com/calendar/render?" + params.toString();
  }

  function dateFromYmd(ymd) {
    var parts = String(ymd).split("-");
    if (parts.length !== 3) return null;
    var y = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10);
    var d = parseInt(parts[2], 10);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
    // Anchor to UTC noon so timezone formatting never rolls to another day.
    return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  }

  function ymdCompact(ymd) {
    return String(ymd).replace(/-/g, "");
  }

  function addOneDay(ymd) {
    var d = dateFromYmd(ymd);
    if (!d) return ymd;
    d.setUTCDate(d.getUTCDate() + 1);
    return (
      d.getUTCFullYear() +
      "-" +
      pad2(d.getUTCMonth() + 1) +
      "-" +
      pad2(d.getUTCDate())
    );
  }

  function toGcalUtc(date) {
    return (
      date.getUTCFullYear() +
      pad2(date.getUTCMonth() + 1) +
      pad2(date.getUTCDate()) +
      "T" +
      pad2(date.getUTCHours()) +
      pad2(date.getUTCMinutes()) +
      pad2(date.getUTCSeconds()) +
      "Z"
    );
  }

  function fmtPart(date, timeZone, options) {
    var opts = Object.assign({ timeZone: timeZone }, options);
    return new Intl.DateTimeFormat("en-US", opts).format(date);
  }

  // Returns a YYYY-MM-DD key for the given date in the given timezone.
  function isoKey(date, timeZone) {
    return new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: timeZone
    }).format(date);
  }

  function fmtDate(date, timeZone) {
    return fmtPart(date, timeZone, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  function fmtTime(date, timeZone) {
    return fmtPart(date, timeZone, {
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function cleanDescription(html) {
    if (!html) return "";
    var text = String(html)
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/\s+/g, " ")
      .trim();
    if (text.length > 180) {
      text = text.slice(0, 177).replace(/\s+\S*$/, "") + "…";
    }
    return text;
  }

  function pad2(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  function clampInt(value, min, max, fallback) {
    var n = parseInt(value, 10);
    if (isNaN(n)) return fallback;
    if (n < min) return min;
    if (n > max) return max;
    return n;
  }

  function showError(els, message) {
    if (els.loading) els.loading.classList.add("d-none");
    if (els.grid) els.grid.classList.add("d-none");
    if (els.empty) els.empty.classList.add("d-none");
    if (els.error) els.error.classList.remove("d-none");
    if (els.errorText) els.errorText.textContent = message;
  }
})();
