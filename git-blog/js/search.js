/**
 * Search and Filter Functionality
 * Handles post searching and tag filtering
 */

class SearchManager {
  constructor() {
    this.searchInput = document.getElementById('search-input');
    this.tagFilters = document.getElementById('tag-filters');
    this.postsContainer = document.getElementById('posts-container');
    this.posts = [];
    this.filteredPosts = [];
    this.currentPage = 1;
    this.postsPerPage = 10;
    this.activeTag = null;

    this.init();
  }

  init() {
    this.loadPosts();
    this.bindEvents();
  }

  async loadPosts() {
    try {
      const response = await fetch('posts.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.posts = await response.json();
      this.filteredPosts = [...this.posts];
      this.renderTagFilters();
      this.renderPosts();

    } catch (error) {
      console.error('Error loading posts:', error);
      this.showError('게시글 목록을 불러올 수 없습니다.');
    }
  }

  bindEvents() {
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.searchPosts(e.target.value);
      });
    }
  }

  renderTagFilters() {
    if (!this.tagFilters) return;

    // Collect all unique tags
    const allTags = new Set();
    this.posts.forEach(post => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach(tag => allTags.add(tag));
      }
    });

    // Create tag filter buttons
    const tagElements = Array.from(allTags).map(tag => {
      const button = document.createElement('button');
      button.className = 'tag-filter';
      button.textContent = tag;
      button.addEventListener('click', () => this.filterByTag(tag));
      return button;
    });

    // Add "모두" button
    const allButton = document.createElement('button');
    allButton.className = 'tag-filter active';
    allButton.textContent = '모두';
    allButton.addEventListener('click', () => this.filterByTag(null));

    this.tagFilters.innerHTML = '';
    this.tagFilters.appendChild(allButton);
    tagElements.forEach(el => this.tagFilters.appendChild(el));
  }

  searchPosts(query) {
    this.activeTag = null; // Reset tag filter when searching
    this.updateActiveTagFilter();

    if (!query.trim()) {
      this.filteredPosts = [...this.posts];
    } else {
      const searchTerm = query.toLowerCase();
      this.filteredPosts = this.posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm) ||
        post.excerpt.toLowerCase().includes(searchTerm) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm))) ||
        (post.category && post.category.toLowerCase().includes(searchTerm))
      );
    }

    this.currentPage = 1;
    this.renderPosts();
  }

  filterByTag(tag) {
    this.activeTag = tag;
    this.updateActiveTagFilter();

    if (this.searchInput) {
      this.searchInput.value = ''; // Clear search when filtering by tag
    }

    if (!tag) {
      this.filteredPosts = [...this.posts];
    } else {
      this.filteredPosts = this.posts.filter(post =>
        post.tags && post.tags.includes(tag)
      );
    }

    this.currentPage = 1;
    this.renderPosts();
  }

  updateActiveTagFilter() {
    const tagButtons = this.tagFilters.querySelectorAll('.tag-filter');
    tagButtons.forEach(button => {
      if ((this.activeTag === null && button.textContent === '모두') ||
          button.textContent === this.activeTag) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }

  renderPosts() {
    if (!this.postsContainer) return;

    // Calculate pagination
    const totalPages = Math.ceil(this.filteredPosts.length / this.postsPerPage);
    const startIndex = (this.currentPage - 1) * this.postsPerPage;
    const endIndex = startIndex + this.postsPerPage;
    const postsToShow = this.filteredPosts.slice(startIndex, endIndex);

    if (this.filteredPosts.length === 0) {
      this.postsContainer.innerHTML = '<div class="no-results">검색 결과가 없습니다.</div>';
      this.hidePagination();
      return;
    }

    // Render posts
    const postsHtml = postsToShow.map(post => this.createPostCard(post)).join('');
    this.postsContainer.innerHTML = postsHtml;

    // Update pagination
    if (totalPages > 1) {
      this.showPagination(totalPages);
    } else {
      this.hidePagination();
    }
  }

  createPostCard(post) {
    const date = new Date(post.date);
    const formattedDate = date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const tagsHtml = post.tags && post.tags.length > 0
      ? post.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('')
      : '';

    const categoryHtml = post.category
      ? `<div class="post-category">${post.category}</div>`
      : '';

    return `
      <article class="post-card">
        <h2 class="post-title">
          <a href="post.html?post=${post.file}">${post.title}</a>
        </h2>
        <div class="post-meta">
          <time>${formattedDate}</time>
          ${categoryHtml}
        </div>
        <p class="post-excerpt">${post.excerpt}</p>
        <div class="post-tags">${tagsHtml}</div>
      </article>
    `;
  }

  showPagination(totalPages) {
    const pagination = document.getElementById('pagination');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageInfo = document.getElementById('page-info');

    if (!pagination || !prevBtn || !nextBtn || !pageInfo) return;

    pageInfo.textContent = `${this.currentPage} / ${totalPages}`;
    prevBtn.disabled = this.currentPage === 1;
    nextBtn.disabled = this.currentPage === totalPages;

    prevBtn.onclick = () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.renderPosts();
      }
    };

    nextBtn.onclick = () => {
      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.renderPosts();
      }
    };

    pagination.style.display = 'flex';
  }

  hidePagination() {
    const pagination = document.getElementById('pagination');
    if (pagination) {
      pagination.style.display = 'none';
    }
  }

  showError(message) {
    if (this.postsContainer) {
      this.postsContainer.innerHTML = `<div class="error">${message}</div>`;
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SearchManager();
});

// Export for potential use in other scripts
window.SearchManager = SearchManager;
