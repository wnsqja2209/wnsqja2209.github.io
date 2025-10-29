/**
 * Theme Toggle Functionality
 * Handles dark/light mode switching and persistence
 */

class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById('theme-toggle');
    this.themeIcon = document.getElementById('theme-icon');
    this.currentTheme = this.getStoredTheme() || 'light';
    this.init();
  }

  init() {
    // Apply initial theme
    this.applyTheme(this.currentTheme);

    // Bind event listeners
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!this.getStoredTheme()) {
        this.applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  getStoredTheme() {
    return localStorage.getItem('theme');
  }

  storeTheme(theme) {
    localStorage.setItem('theme', theme);
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.currentTheme = theme;

    // Update icon
    if (this.themeIcon) {
      this.themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    // Update toggle button title
    if (this.themeToggle) {
      this.themeToggle.title = theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환';
    }
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
    this.storeTheme(newTheme);
  }

  // Get system preference
  getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ThemeManager();
});

// Export for potential use in other scripts
window.ThemeManager = ThemeManager;
