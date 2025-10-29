/**
 * Post Loader
 * Handles loading and parsing markdown posts, and integrates Giscus comments
 */

class PostLoader {
  constructor() {
    this.postBody = document.getElementById('post-body');
    this.postTitle = document.getElementById('post-title');
    this.postTitleDisplay = document.getElementById('post-title-display');
    this.postDate = document.getElementById('post-date');
    this.postTags = document.getElementById('post-tags');
    this.postCategory = document.getElementById('post-category');
    this.postDescription = document.getElementById('post-description');
    this.init();
  }

  init() {
    const urlParams = new URLSearchParams(window.location.search);
    const postFile = urlParams.get('post');

    if (postFile) {
      this.loadPost(postFile);
    } else {
      this.showError('게시글을 찾을 수 없습니다.');
    }
  }

  async loadPost(filename) {
    try {
      const response = await fetch(`pages/${filename}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const markdown = await response.text();
      this.parseAndRenderPost(markdown, filename);
      this.loadGiscus();

      // Update page title
      document.title = `${this.postTitleDisplay.textContent} - wnsqja2209`;

    } catch (error) {
      console.error('Error loading post:', error);
      this.showError('게시글을 불러오는 중 오류가 발생했습니다.');
    }
  }

  parseAndRenderPost(markdown, filename) {
    // Parse front matter
    const frontMatterMatch = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

    let metadata = {};
    let content = markdown;

    if (frontMatterMatch) {
      const frontMatter = frontMatterMatch[1];
      content = frontMatterMatch[2];

      // Parse front matter lines
      const lines = frontMatter.split('\n');
      lines.forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          let value = line.substring(colonIndex + 1).trim();

          // Remove quotes
          if ((value.startsWith('"') && value.endsWith('"')) ||
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }

          // Parse arrays (tags)
          if (key === 'tags') {
            if (value.startsWith('[') && value.endsWith(']')) {
              try {
                value = JSON.parse(value);
              } catch {
                value = value.slice(1, -1).split(',').map(tag => tag.trim().replace(/^['"]|['"]$/g, ''));
              }
            } else {
              value = [value];
            }
          }

          metadata[key] = value;
        }
      });
    }

    // Update page metadata
    if (this.postTitle) {
      this.postTitle.textContent = metadata.title || filename.replace('.md', '');
    }

    if (this.postTitleDisplay) {
      this.postTitleDisplay.textContent = metadata.title || filename.replace('.md', '');
    }

    if (this.postDate && metadata.date) {
      const date = new Date(metadata.date);
      this.postDate.textContent = date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    if (this.postDescription && metadata.description) {
      this.postDescription.content = metadata.description;
    }

    // Render tags
    if (this.postTags && metadata.tags) {
      this.postTags.innerHTML = metadata.tags.map(tag =>
        `<span class="post-tag">${tag}</span>`
      ).join('');
    }

    // Render category
    if (this.postCategory && metadata.category) {
      this.postCategory.textContent = metadata.category;
      this.postCategory.style.display = 'inline-block';
    } else if (this.postCategory) {
      this.postCategory.style.display = 'none';
    }

    // Render content
    if (this.postBody) {
      // Configure marked options
      marked.setOptions({
        breaks: true,
        gfm: true,
        headerIds: true,
        mangle: false
      });

      this.postBody.innerHTML = marked.parse(content);

      // Highlight code blocks after rendering
      setTimeout(() => {
        this.highlightCodeBlocks();
      }, 100);
    }
  }

  highlightCodeBlocks() {
    // Find all code blocks and apply Prism highlighting
    const codeBlocks = this.postBody.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
      Prism.highlightElement(block);
    });

    // Also handle inline code
    const inlineCodes = this.postBody.querySelectorAll('code:not(pre code)');
    inlineCodes.forEach(code => {
      if (!code.classList.contains('language-none')) {
        Prism.highlightElement(code);
      }
    });
  }

  loadGiscus() {
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', 'wnsqja2209/git-blog');
    script.setAttribute('data-repo-id', 'R_kgDONXXXXXX'); // Giscus 설정 후 실제 repo-id로 변경 필요
    script.setAttribute('data-category', 'General');
    script.setAttribute('data-category-id', 'DIC_kwDONXXXXXX'); // Giscus 설정 후 실제 category-id로 변경 필요
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '1');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-theme', 'preferred_color_scheme');
    script.setAttribute('data-lang', 'ko');
    script.crossOrigin = 'anonymous';
    script.async = true;

    const giscusContainer = document.getElementById('giscus');
    if (giscusContainer) {
      // 기존 Giscus 스크립트 제거 (재로딩 방지)
      const existingScript = giscusContainer.querySelector('script[src*="giscus.app"]');
      if (existingScript) {
        existingScript.remove();
      }

      giscusContainer.appendChild(script);
    }
  }

  showError(message) {
    if (this.postBody) {
      this.postBody.innerHTML = `<div class="error">${message}</div>`;
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PostLoader();
});

// Export for potential use in other scripts
window.PostLoader = PostLoader;
