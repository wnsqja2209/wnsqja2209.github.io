(function () {
  const state = {
    posts: [],
    query: "",
    activeTag: null,
  };

  function normalize(str) {
    return (str || "").toString().toLowerCase();
  }

  function filterPosts() {
    const q = normalize(state.query);
    return state.posts.filter((p) => {
      const matchQuery =
        !q ||
        normalize(p.title).includes(q) ||
        normalize(p.description).includes(q) ||
        (Array.isArray(p.tags) && p.tags.some((t) => normalize(t).includes(q)));
      const matchTag =
        !state.activeTag ||
        (Array.isArray(p.tags) && p.tags.includes(state.activeTag));
      return matchQuery && matchTag;
    });
  }

  function renderTags() {
    const el = document.getElementById("tag-filters");
    if (!el) return;
    const allTags = new Set();
    state.posts.forEach((p) => (p.tags || []).forEach((t) => allTags.add(t)));
    const tags = Array.from(allTags).sort((a, b) => a.localeCompare(b));

    el.innerHTML = "";

    const clearBtn = document.createElement("button");
    clearBtn.className = `tag-chip${state.activeTag ? "" : " active"}`;
    clearBtn.textContent = "전체";
    clearBtn.addEventListener("click", () => {
      state.activeTag = null;
      renderTags();
      renderList();
    });
    el.appendChild(clearBtn);

    tags.forEach((tag) => {
      const btn = document.createElement("button");
      btn.className = `tag-chip${state.activeTag === tag ? " active" : ""}`;
      btn.textContent = `#${tag}`;
      btn.addEventListener("click", () => {
        state.activeTag = state.activeTag === tag ? null : tag;
        renderTags();
        renderList();
      });
      el.appendChild(btn);
    });
  }

  function renderList() {
    const el = document.getElementById("posts-list");
    if (!el) return;
    const list = filterPosts();
    el.innerHTML = "";

    if (list.length === 0) {
      el.innerHTML = '<p class="muted">검색 결과가 없습니다.</p>';
      return;
    }

    const frag = document.createDocumentFragment();
    list.forEach((p) => {
      const card = document.createElement("article");
      card.className = "post-card";
      const tags = (p.tags || []).map((t) => `#${t}`).join(" · ");
      card.innerHTML = `
        <a href="post.html?file=${encodeURIComponent(p.file)}">
          <h3>${escapeHtml(p.title)}</h3>
        </a>
        <div class="meta">${escapeHtml(p.date)}${
        tags ? ` · ${escapeHtml(tags)}` : ""
      }</div>
        <p class="excerpt">${escapeHtml(p.excerpt || p.description || "")}</p>
      `;
      frag.appendChild(card);
    });
    el.appendChild(frag);
  }

  function escapeHtml(s) {
    return (s || "")
      .toString()
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  async function loadPosts() {
    try {
      const res = await fetch("posts.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("invalid posts.json");
      state.posts = data;
    } catch (e) {
      console.error("Failed to load posts.json", e);
      state.posts = [];
    }
  }

  function attachSearch() {
    const input = document.getElementById("search-input");
    if (!input) return;
    input.addEventListener("input", () => {
      state.query = input.value || "";
      renderList();
    });
  }

  async function init() {
    await loadPosts();
    renderTags();
    renderList();
    attachSearch();
  }

  document.addEventListener("DOMContentLoaded", init);

  // 공개 API (필요 시 다른 스크립트에서 사용)
  window.BlogApp = {
    setQuery(q) {
      state.query = q || "";
      renderList();
    },
    setTag(tag) {
      state.activeTag = tag || null;
      renderTags();
      renderList();
    },
    get posts() {
      return [...state.posts];
    },
  };
})();
