/* =========================================================
   Destiny C3 — Sermons Page
   - Fetches a YouTube playlist via the YouTube Data API v3
   - Renders a grid of sermon cards (thumbnail + title + date)
   - Pagination: loads BATCH_SIZE at a time via "Load More" button.
     Uses YouTube's nextPageToken for forward-only paging.
   - Clicking a card opens a Bootstrap modal with the YouTube
     player embedded (privacy-friendly nocookie domain)
   ========================================================= */
(function () {
  "use strict";

  var API_KEY = "AIzaSyAxYx0U0mugmc5PmOFeE8TsKYoneLitmpk";
  var PLAYLIST_ID = "PLeTYtFtwOHq7vqyxY1Jh-YRkBDpcO2-Kw";
  var BATCH_SIZE = 12;
  var YT_CHANNEL_URL = "https://www.youtube.com/@destinyc3";

  /* ----- module-scoped state ----- */
  var gridEl = null;
  var loadMoreWrap = null;
  var loadMoreBtn = null;
  var nextPageToken = null;
  var isLoading = false;

  document.addEventListener("DOMContentLoaded", function () {
    initSermonsPage();
  });

  function initSermonsPage() {
    gridEl = document.querySelector("[data-sermons-grid]");
    if (!gridEl) return;

    loadMoreWrap = document.querySelector("[data-sermons-load-more]");
    loadMoreBtn = document.querySelector("[data-sermons-load-more-btn]");

    // Wire the modal + Load More handlers ONCE (event delegation
    // means new cards added by Load More work automatically).
    initModal(gridEl);
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener("click", loadMore);
    }

    renderLoading(gridEl);
    loadInitial();
  }

  function loadInitial() {
    isLoading = true;
    fetchSermons(null)
      .then(function (result) {
        if (!result.videos.length) {
          renderEmpty(gridEl);
          return;
        }
        gridEl.innerHTML = ""; // clear the loading state
        appendSermons(result.videos);
        nextPageToken = result.nextPageToken;
        updateLoadMoreVisibility();
      })
      .catch(function (err) {
        // eslint-disable-next-line no-console
        console.error("[sermons] initial load failed:", err);
        renderError(gridEl);
      })
      .then(function () {
        isLoading = false;
      });
  }

  function loadMore() {
    if (isLoading || !nextPageToken) return;
    isLoading = true;
    setLoadMoreState("loading");

    fetchSermons(nextPageToken)
      .then(function (result) {
        appendSermons(result.videos);
        nextPageToken = result.nextPageToken;
        setLoadMoreState("idle");
        updateLoadMoreVisibility();
      })
      .catch(function (err) {
        // eslint-disable-next-line no-console
        console.error("[sermons] load more failed:", err);
        setLoadMoreState("error");
      })
      .then(function () {
        isLoading = false;
      });
  }

  function updateLoadMoreVisibility() {
    if (!loadMoreWrap) return;
    loadMoreWrap.hidden = !nextPageToken;
  }

  function setLoadMoreState(state) {
    if (!loadMoreBtn) return;
    switch (state) {
      case "loading":
        loadMoreBtn.disabled = true;
        loadMoreBtn.innerHTML =
          '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>' +
          "Loading…";
        break;
      case "error":
        loadMoreBtn.disabled = false;
        loadMoreBtn.innerHTML =
          '<i class="bi bi-arrow-clockwise me-2" aria-hidden="true"></i>' +
          "Couldn't load — try again";
        break;
      case "idle":
      default:
        loadMoreBtn.disabled = false;
        loadMoreBtn.innerHTML = "Load more sermons";
        break;
    }
  }

  /* ---------- Fetch from YouTube Data API ---------- */
  function fetchSermons(pageToken) {
    var url =
      "https://www.googleapis.com/youtube/v3/playlistItems" +
      "?part=snippet,contentDetails" +
      "&playlistId=" + encodeURIComponent(PLAYLIST_ID) +
      "&maxResults=" + BATCH_SIZE +
      "&key=" + encodeURIComponent(API_KEY);
    if (pageToken) {
      url += "&pageToken=" + encodeURIComponent(pageToken);
    }

    return fetch(url)
      .then(function (res) {
        if (!res.ok) {
          return res.json().then(function (errBody) {
            throw new Error(
              "HTTP " + res.status + " — " +
              ((errBody && errBody.error && errBody.error.message) || res.statusText)
            );
          }).catch(function () {
            throw new Error("HTTP " + res.status);
          });
        }
        return res.json();
      })
      .then(function (data) {
        var videos = (data.items || [])
          .filter(function (item) {
            var title = (item.snippet && item.snippet.title) || "";
            return title !== "Private video" && title !== "Deleted video";
          })
          .map(function (item) {
            var snip = item.snippet || {};
            var videoId = (snip.resourceId && snip.resourceId.videoId)
              || (item.contentDetails && item.contentDetails.videoId)
              || "";
            var thumbs = snip.thumbnails || {};
            var thumbnail =
              (thumbs.maxres && thumbs.maxres.url) ||
              (thumbs.standard && thumbs.standard.url) ||
              (thumbs.high && thumbs.high.url) ||
              (thumbs.medium && thumbs.medium.url) ||
              (thumbs.default && thumbs.default.url) ||
              "";
            return {
              id: videoId,
              title: snip.title || "Untitled",
              date: (item.contentDetails && item.contentDetails.videoPublishedAt)
                || snip.publishedAt
                || "",
              thumbnail: thumbnail
            };
          })
          .filter(function (v) { return !!v.id; });
        return {
          videos: videos,
          nextPageToken: data.nextPageToken || null
        };
      });
  }

  /* ---------- Render: cards ---------- */
  function appendSermons(videos) {
    videos.forEach(function (v) {
      gridEl.appendChild(buildSermonCard(v));
    });
  }

  function buildSermonCard(video) {
    var card = document.createElement("article");
    card.className = "dc3-sermon-card";
    card.setAttribute("data-video-id", video.id);
    card.setAttribute("data-video-title", video.title);
    card.setAttribute("data-video-date", video.date);

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "dc3-sermon-card__thumb";
    btn.setAttribute("aria-label", "Watch: " + video.title);

    if (video.thumbnail) {
      var img = document.createElement("img");
      img.src = video.thumbnail;
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      btn.appendChild(img);
    }

    var play = document.createElement("span");
    play.className = "dc3-sermon-card__play";
    play.setAttribute("aria-hidden", "true");
    play.innerHTML = '<i class="bi bi-play-fill"></i>';
    btn.appendChild(play);

    card.appendChild(btn);

    var meta = document.createElement("div");
    meta.className = "dc3-sermon-card__meta";

    var title = document.createElement("h3");
    title.className = "dc3-sermon-card__title";
    title.textContent = video.title;
    meta.appendChild(title);

    if (video.date) {
      var date = document.createElement("p");
      date.className = "dc3-sermon-card__date";
      date.textContent = formatDate(video.date);
      meta.appendChild(date);
    }

    card.appendChild(meta);
    return card;
  }

  function formatDate(iso) {
    try {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch (e) {
      return "";
    }
  }

  /* ---------- Render: states ---------- */
  function renderLoading(el) {
    el.innerHTML =
      '<div class="dc3-sermons-state">' +
      '  <div class="spinner-border" role="status" aria-hidden="true"></div>' +
      '  <p class="dc3-sermons-state__text">Loading sermons…</p>' +
      '</div>';
  }

  function renderEmpty(el) {
    el.innerHTML =
      '<div class="dc3-sermons-state">' +
      '  <i class="bi bi-camera-video" aria-hidden="true"></i>' +
      '  <p class="dc3-sermons-state__text">No sermons available yet. Check back soon!</p>' +
      '</div>';
  }

  function renderError(el) {
    el.innerHTML =
      '<div class="dc3-sermons-state">' +
      '  <i class="bi bi-exclamation-circle" aria-hidden="true"></i>' +
      '  <p class="dc3-sermons-state__text">' +
      "    We couldn't load sermons right now. You can still watch them on YouTube." +
      '  </p>' +
      '  <a class="btn btn-dc3 mt-3 px-4" href="' + YT_CHANNEL_URL + '" target="_blank" rel="noopener noreferrer">' +
      '    <i class="bi bi-youtube me-2"></i>Open YouTube Channel' +
      '  </a>' +
      '</div>';
  }

  /* ---------- Lightbox modal (event-delegated) ---------- */
  function initModal(grid) {
    var modalEl = document.getElementById("sermonModal");
    if (!modalEl || !window.bootstrap || !window.bootstrap.Modal) return;

    var modal = new window.bootstrap.Modal(modalEl);
    var iframeEl = modalEl.querySelector("[data-sermon-iframe]");
    var titleEl = modalEl.querySelector("[data-sermon-title]");
    var dateEl = modalEl.querySelector("[data-sermon-date]");
    var linkEl = modalEl.querySelector("[data-sermon-yt-link]");

    // Delegate clicks from the grid container — works for cards
    // added later via Load More too, no re-binding needed.
    grid.addEventListener("click", function (e) {
      var card = e.target.closest(".dc3-sermon-card");
      if (!card || !grid.contains(card)) return;
      openSermon(card);
    });

    grid.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      var card = e.target.closest(".dc3-sermon-card");
      if (!card || !grid.contains(card)) return;
      // Only intercept when the card or its inner button is the focus target
      if (e.target !== card && !card.contains(e.target)) return;
      e.preventDefault();
      openSermon(card);
    });

    function openSermon(card) {
      var id = card.getAttribute("data-video-id");
      var title = card.getAttribute("data-video-title") || "Sermon";
      var date = card.getAttribute("data-video-date") || "";
      if (!id) return;

      if (iframeEl) {
        iframeEl.src =
          "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) +
          "?autoplay=1&rel=0&modestbranding=1";
      }
      if (titleEl) titleEl.textContent = title;
      if (dateEl) dateEl.textContent = formatDate(date);
      if (linkEl) linkEl.href = "https://www.youtube.com/watch?v=" + encodeURIComponent(id);

      modal.show();
    }

    modalEl.addEventListener("hidden.bs.modal", function () {
      if (iframeEl) iframeEl.src = "";
    });
  }
})();
