/**
 * FinCast Tool Finder & Instant Search Component
 * Enables instantaneous client-side searching across all current & upcoming financial calculators.
 */

(function (global) {
  'use strict';

  const ToolFinder = {
    init: function () {
      if (document.getElementById('fincast-search-modal')) return;

      const modalHtml = `
        <div id="fincast-search-modal" class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="search-modal-title">
          <div class="modal-dialog">
            <button class="modal-close-btn" id="btn-close-search-modal" aria-label="Close search">&times;</button>
            <div style="margin-bottom: 1rem;">
              <h3 id="search-modal-title" style="font-size: 1.15rem; margin-bottom: 0.75rem;">🔍 Search Financial Simulators</h3>
              <input type="text" id="tool-search-input" class="form-control" placeholder="Type a keyword (e.g. credit card, retirement, compound interest, debt)..." autofocus autocomplete="off" />
            </div>

            <div id="tool-search-results" style="max-height: 360px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.5rem;">
              <!-- Dynamic search results populated here -->
            </div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', modalHtml);

      // Event listeners
      const modal = document.getElementById('fincast-search-modal');
      const closeBtn = document.getElementById('btn-close-search-modal');
      const searchInput = document.getElementById('tool-search-input');

      closeBtn.addEventListener('click', () => this.close());
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.close();
      });

      searchInput.addEventListener('input', (e) => this.performSearch(e.target.value));

      // Global keyboard shortcut (Ctrl+K / Cmd+K)
      document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          this.open();
        }
        if (e.key === 'Escape' && modal.classList.contains('open')) {
          this.close();
        }
      });

      // Connect trigger buttons on pages
      document.querySelectorAll('.search-trigger-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.open();
        });
      });
    },

    open: function () {
      this.init();
      const modal = document.getElementById('fincast-search-modal');
      const searchInput = document.getElementById('tool-search-input');
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      searchInput.value = '';
      this.performSearch('');
      setTimeout(() => searchInput.focus(), 50);
    },

    close: function () {
      const modal = document.getElementById('fincast-search-modal');
      if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    },

    performSearch: function (query) {
      const resultsContainer = document.getElementById('tool-search-results');
      if (!resultsContainer || !global.FinCastConfig) return;

      const tools = global.FinCastConfig.toolsRegistry || [];
      const cleanQuery = query.toLowerCase().trim();

      const matchedTools = tools.filter(tool => {
        if (!cleanQuery) return true; // Show all when empty
        const inName = tool.name.toLowerCase().includes(cleanQuery);
        const inCategory = tool.category.toLowerCase().includes(cleanQuery);
        const inDesc = tool.description.toLowerCase().includes(cleanQuery);
        const inKeywords = tool.keywords && tool.keywords.some(k => k.toLowerCase().includes(cleanQuery));
        return inName || inCategory || inDesc || inKeywords;
      });

      if (matchedTools.length === 0) {
        resultsContainer.innerHTML = `
          <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
            <p>No simulators found matching "${query}"</p>
            <p style="font-size: 0.8rem; margin-top: 0.5rem;">Try searching for "debt", "invest", "compound", or "health".</p>
          </div>
        `;
        return;
      }

      // Determine path relative to current page
      const isSubpage = window.location.pathname.includes('/pages/');
      const getRelativeUrl = (toolUrl) => {
        if (isSubpage) {
          // If toolUrl starts with 'pages/', strip it
          return toolUrl.replace(/^pages\//, '');
        }
        return toolUrl;
      };

      resultsContainer.innerHTML = matchedTools.map(tool => `
        <a href="${getRelativeUrl(tool.url)}" class="card card-hoverable" style="display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1rem; text-decoration: none; border-radius: var(--radius-md);">
          <div style="display: flex; align-items: center; gap: 0.85rem;">
            <span style="font-size: 1.4rem;">${tool.icon}</span>
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <h4 style="font-size: 0.95rem; color: var(--text-primary); margin: 0;">${tool.name}</h4>
                <span class="badge ${tool.isLive ? 'badge-emerald' : 'badge-amber'}" style="font-size: 0.65rem;">${tool.badge}</span>
              </div>
              <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0; margin-top: 0.2rem;">${tool.description.slice(0, 75)}...</p>
            </div>
          </div>
          <span style="color: var(--brand-primary); font-size: 1.1rem;">&rarr;</span>
        </a>
      `).join('');
    }
  };

  // Auto-init on DOMContentLoaded
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => ToolFinder.init());
  }

  global.FinCastToolFinder = ToolFinder;
})(typeof window !== 'undefined' ? window : this);
