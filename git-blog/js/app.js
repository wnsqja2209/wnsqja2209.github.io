/**
 * Main Application Logic
 * Handles post listing and overall app initialization
 */

class App {
  constructor() {
    this.postsContainer = document.getElementById('posts-container');
    this.posts = [];
    this.currentPage = 1;
    this.postsPerPage = 10;

    this.init();
  }

  init() {
    this.loadPosts();
  }

  async loadPosts() {
    try {
      const response = await fetch('posts.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.posts = await response.json();
      this.renderPosts();

    } catch (error) {
      console.error('Error loading posts:', error);
      this.showError('게시글 목록을 불러올 수 없습니다. posts.json 파일이 존재하는지 확인해주세요.');
    }
  }

  renderPosts() {
    if (!this.postsContainer) return;

    if (this.posts.length === 0) {
      this.postsContainer.innerHTML = '<div class="no-posts">아직 작성된 게시글이 없습니다.</div>';
      return;
    }

    // Calculate pagination
    const totalPages = Math.ceil(this.posts.length / this.postsPerPage);
    const startIndex = (this.currentPage - 1) * this.postsPerPage;
    const endIndex = startIndex + this.postsPerPage;
    const postsToShow = this.posts.slice(startIndex, endIndex);

    // Render posts
    const postsHtml = postsToShow.map(post => this.createPostCard(post)).join('');
    this.postsContainer.innerHTML = postsHtml;

    // Update pagination if we have pagination controls
    if (totalPages > 1) {
      this.updatePagination(totalPages);
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

  updatePagination(totalPages) {
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
        // Scroll to top of posts
        this.postsContainer.scrollIntoView({ behavior: 'smooth' });
      }
    };

    nextBtn.onclick = () => {
      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.renderPosts();
        // Scroll to top of posts
        this.postsContainer.scrollIntoView({ behavior: 'smooth' });
      }
    };

    pagination.style.display = 'flex';
  }

  showError(message) {
    if (this.postsContainer) {
      this.postsContainer.innerHTML = `<div class="error" style="text-align: center; padding: 2rem; color: var(--text-secondary); background-color: var(--loading-bg); border-radius: 8px; margin: 2rem 0;">${message}</div>`;
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new App();
});

// Export for potential use in other scripts
window.App = App;
