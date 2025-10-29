(function () {
  function getQueryParam(key) {
    const params = new URLSearchParams(location.search);
    return params.get(key);
  }

  function parseFrontMatter(raw) {
    const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!m) return { meta: {}, content: raw };
    const meta = {};
    const front = m[1];
    const content = m[2];
    front.split("\n").forEach((line) => {
      const idx = line.indexOf(":");
      if (idx <= 0) return;
      const key = line.substring(0, idx).trim();
      let value = line.substring(idx + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (key === "tags" && value.startsWith("[") && value.endsWith("]")) {
        try {
          value = JSON.parse(value);
        } catch {
          value = value
            .slice(1, -1)
            .split(",")
            .map((v) => v.trim().replace(/^['"]|['"]$/g, ""));
        }
      }
      meta[key] = value;
    });
    return { meta, content };
  }

  async function loadMarkdown(file) {
    const url = `pages/${file}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  }

  function setMeta(meta) {
    const titleEl = document.getElementById("post-title");
    const dateEl = document.getElementById("post-date");
    const tagsEl = document.getElementById("post-tags");

    if (titleEl) titleEl.textContent = meta.title || "Untitled";
    if (dateEl) dateEl.textContent = meta.date || "";

    if (tagsEl) {
      tagsEl.innerHTML = "";
      const tags = Array.isArray(meta.tags) ? meta.tags : [];
      tags.forEach((t) => {
        const chip = document.createElement("span");
        chip.className = "tag-chip";
        chip.textContent = `#${t}`;
        tagsEl.appendChild(chip);
      });
    }

    if (meta.title) document.title = `${meta.title} · Git Blog`;
  }

  function renderContent(html) {
    const el = document.getElementById("post-content");
    if (!el) return;
    el.innerHTML = html;
    if (window.Prism && typeof window.Prism.highlightAll === "function") {
      window.Prism.highlightAll();
    }
  }

  function loadGiscus() {
    const container = document.getElementById("giscus-container");
    if (!container) return;
    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";

    // 아래 값들을 자신의 저장소 설정에 맞게 교체하세요.
    script.setAttribute(
      "data-repo",
      "{your_github_username}/{your_github_username}.github.io"
    );
    script.setAttribute("data-repo-id", "R_kgDOQLHKCg");
    script.setAttribute("data-category", "General");
    script.setAttribute("data-category-id", "DIC_kwDOQLHKCs4CxMZy");

    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "1");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute("data-lang", "ko");
    script.setAttribute("data-theme", "preferred_color_scheme");
    script.setAttribute("crossorigin", "anonymous");
    script.async = true;
    container.innerHTML = "";
    container.appendChild(script);
  }

  async function init() {
    const file = getQueryParam("file");
    if (!file) {
      const el = document.getElementById("post-content");
      if (el)
        el.innerHTML =
          '<p class="muted">file 파라미터가 필요합니다. 예: post.html?file=example.md</p>';
      return;
    }

    try {
      const raw = await loadMarkdown(file);
      const { meta, content } = parseFrontMatter(raw);
      setMeta(meta);
      const html = window.marked ? window.marked.parse(content) : content;
      renderContent(html);
      loadGiscus();
    } catch (e) {
      console.error(e);
      const el = document.getElementById("post-content");
      if (el)
        el.innerHTML = '<p class="muted">포스트를 불러오지 못했습니다.</p>';
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
