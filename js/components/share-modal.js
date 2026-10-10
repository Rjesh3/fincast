/**
 * FinCast Share Simulator Modal Component
 * Enables clean, privacy-safe text copying and social sharing without leaking private financial balances.
 */

(function (global) {
  'use strict';

  const ShareModal = {
    init: function () {
      if (document.getElementById('fincast-share-modal')) return;

      const modalHtml = `
        <div id="fincast-share-modal" class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="share-modal-title">
          <div class="modal-dialog">
            <button class="modal-close-btn" id="btn-close-share-modal" aria-label="Close modal">&times;</button>
            <h3 id="share-modal-title" style="margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
              <span>🚀</span> Share Your Simulation
            </h3>
            <p style="font-size: 0.9rem; margin-bottom: 1.25rem;">
              Share your financial milestone or decision scenario with friends, family, or your community.
            </p>

            <div style="margin-bottom: 1.25rem;">
              <label class="form-label" for="share-text-box">Simulation Summary</label>
              <textarea id="share-text-box" class="form-control" rows="3" readonly style="font-size: 0.9rem; resize: none;"></textarea>
            </div>

            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
              <button id="btn-copy-share-text" class="btn btn-primary" style="flex: 1;">
                <span>📋</span> Copy Summary
              </button>
              <a id="btn-twitter-share" href="#" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="flex: 1;">
                <span>𝕏</span> Share on X
              </a>
              <a id="btn-linkedin-share" href="#" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="flex: 1;">
                <span>💼</span> LinkedIn
              </a>
            </div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', modalHtml);

      // Event listeners
      const modal = document.getElementById('fincast-share-modal');
      const closeBtn = document.getElementById('btn-close-share-modal');
      const copyBtn = document.getElementById('btn-copy-share-text');

      closeBtn.addEventListener('click', () => this.close());
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.close();
      });

      copyBtn.addEventListener('click', () => {
        const textBox = document.getElementById('share-text-box');
        textBox.select();
        navigator.clipboard.writeText(textBox.value).then(() => {
          copyBtn.innerHTML = '<span>✅</span> Copied to Clipboard!';
          setTimeout(() => {
            copyBtn.innerHTML = '<span>📋</span> Copy Summary';
          }, 2500);
          if (global.FinCastAnalytics) {
            global.FinCastAnalytics.trackShareClicked('modal', 'clipboard');
          }
        });
      });
    },

    /**
     * Opens share modal with custom formatted summary
     */
    open: function (summaryText, toolUrl = window.location.href) {
      this.init();
      const modal = document.getElementById('fincast-share-modal');
      const textBox = document.getElementById('share-text-box');
      const twitterBtn = document.getElementById('btn-twitter-share');
      const linkedinBtn = document.getElementById('btn-linkedin-share');

      const fullShareText = `${summaryText}\n\nSimulate your financial future for free on FinCast: ${toolUrl}`;
      textBox.value = fullShareText;

      // Setup Social Share URLs
      twitterBtn.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(summaryText)}&url=${encodeURIComponent(toolUrl)}`;
      linkedinBtn.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(toolUrl)}`;

      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    },

    close: function () {
      const modal = document.getElementById('fincast-share-modal');
      if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    }
  };

  global.FinCastShare = ShareModal;
})(typeof window !== 'undefined' ? window : this);
