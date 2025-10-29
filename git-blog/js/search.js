(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("search-input");
    if (!input) return;
    input.addEventListener("input", () => {
      const q = input.value || "";
      if (window.BlogApp && typeof window.BlogApp.setQuery === "function") {
        window.BlogApp.setQuery(q);
      }
    });
  });
})();
